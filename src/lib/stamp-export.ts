/**
 * 印章导出管道：全部在浏览器完成。
 *
 * - SVG：内嵌字体子集后直接下载，矢量可再编辑；
 * - PNG/JPG：SVG → <img>（内嵌字体，静态模式可渲染）→ canvas 光栅化，1x/3x/10x 倍率；
 * - PDF：jsPDF，页面尺寸 = 印章物理 mm，10x 位图铺满，打印物理尺寸准确；
 * - ZIP：jszip 打包以上全部格式。
 * jspdf / jszip 均在导出时动态 import，不进首屏 bundle。
 */

import { renderStampSVG, VIEWBOX, type StampState } from './stamp-maker'
import { buildEmbeddedFontCSS } from './stamp-fonts'

/** 基准边长（viewBox 400）对应的像素倍率 */
export const PNG_SCALES = [1, 3, 10] as const
export type PngScale = (typeof PNG_SCALES)[number]

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/** 生成导出用完整 SVG：内嵌字体子集 + 按目标像素替换 width/height */
async function buildExportSvg(state: StampState, pixelSize?: number): Promise<string> {
  const fontCss = await buildEmbeddedFontCSS(state)
  let svg = renderStampSVG(state, { uid: 'stamp-export' })
  if (fontCss) {
    svg = svg.replace('<defs>', `<defs><style>${fontCss}</style>`)
  }
  if (pixelSize && pixelSize !== VIEWBOX.width) {
    svg = svg.replace(
      `width="${VIEWBOX.width}" height="${VIEWBOX.height}"`,
      `width="${pixelSize}" height="${pixelSize}"`,
    )
  }
  return svg
}

/** SVG 字符串 → 同尺寸 canvas（JPG 时先铺白底） */
async function rasterize(state: StampState, pixelSize: number, mime: 'image/png' | 'image/jpeg'): Promise<Blob> {
  const svg = await buildExportSvg(state, pixelSize)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('rasterize: svg image load failed'))
      img.src = url
    })
    // decode() 等待包括内嵌字体在内的完整解码，避免 swap 回退字体被画进 canvas
    if (typeof img.decode === 'function') {
      try {
        await img.decode()
      } catch {
        // decode 失败不影响已加载的图像
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = pixelSize
    canvas.height = pixelSize
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d context unavailable')
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pixelSize, pixelSize)
    }
    ctx.drawImage(img, 0, 0, pixelSize, pixelSize)
    const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.92))
    if (!out) throw new Error('canvas toBlob failed')
    return out
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function exportSVG(state: StampState) {
  const svg = await buildExportSvg(state)
  saveBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'stamp.svg')
}

export async function exportPNG(state: StampState, scale: PngScale) {
  const size = VIEWBOX.width * scale
  const blob = await rasterize(state, size, 'image/png')
  saveBlob(blob, `stamp-${size}x${size}px.png`)
}

export async function exportJPG(state: StampState) {
  const size = VIEWBOX.width * 3
  const blob = await rasterize(state, size, 'image/jpeg')
  saveBlob(blob, `stamp-${size}x${size}px.jpg`)
}

export async function exportPDF(state: StampState) {
  const { jsPDF } = await import('jspdf')
  const size = VIEWBOX.width * 10
  // PDF 页面直接用物理 mm，addImage 铺满 → 打印尺寸即印章真实尺寸。
  // 嵌入图用 JPEG 二进制（Uint8Array）：jsPDF 4.x 按魔数识别格式，传二进制走 DCTDecode
  // 直嵌；做旧噪声让高分辨率 PNG 几乎不可压缩（raw 会被存成 62MB），JPEG 只有零头。
  const svg = await buildExportSvg(state, size)
  const jpgBytes = await svgToRasterBytes(svg, size, 'image/jpeg')
  const { width: wMm, height: hMm } = state.sizeMm
  const pdf = new jsPDF({
    orientation: wMm >= hMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [wMm, hMm],
  })
  pdf.addImage(jpgBytes, 'JPEG', 0, 0, wMm, hMm)
  pdf.save(`stamp-${wMm}x${hMm}mm.pdf`)
}

async function svgToRasterBytes(svg: string, size: number, mime: 'image/png' | 'image/jpeg'): Promise<Uint8Array> {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('pdf rasterize: svg load failed'))
      img.src = url
    })
    if (typeof img.decode === 'function') {
      try {
        await img.decode()
      } catch {
        // decode 失败不影响已加载的图像
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d context unavailable')
    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
    }
    ctx.drawImage(img, 0, 0, size, size)
    const dataUrl = canvas.toDataURL(mime, 0.92)
    const binary = atob(dataUrl.split(',')[1] ?? '')
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function exportZIP(state: StampState) {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  zip.file('stamp.svg', await buildExportSvg(state))
  for (const scale of PNG_SCALES) {
    const size = VIEWBOX.width * scale
    zip.file(`stamp-${size}x${size}px.png`, await rasterize(state, size, 'image/png'))
  }
  zip.file(`stamp-${VIEWBOX.width * 3}x${VIEWBOX.width * 3}px.jpg`, await rasterize(state, VIEWBOX.width * 3, 'image/jpeg'))

  const { jsPDF } = await import('jspdf')
  const { width: wMm, height: hMm } = state.sizeMm
  const pdf = new jsPDF({ orientation: wMm >= hMm ? 'landscape' : 'portrait', unit: 'mm', format: [wMm, hMm] })
  pdf.addImage(
    await svgToRasterBytes(await buildExportSvg(state, VIEWBOX.width * 10), VIEWBOX.width * 10, 'image/jpeg'),
    'JPEG',
    0,
    0,
    wMm,
    hMm,
  )
  zip.file(`stamp-${wMm}x${hMm}mm.pdf`, pdf.output('arraybuffer'))

  const blob = await zip.generateAsync({ type: 'blob' })
  saveBlob(blob, 'stamp-all-formats.zip')
}
