// 图片加水印核心逻辑：canvas 合成、九宫格定位、文字平铺与批量导出（纯浏览器本地处理）

export type ExportFormat = 'png' | 'jpeg' | 'webp'

export const EXPORT_TYPES: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

// 导出文件扩展名跟随导出格式（JPEG 使用常用的 jpg）
export const EXPORT_EXTS: Record<ExportFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
}

// 九宫格位置标识：行（top/middle/bottom）+ 列（left/center/right）
export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

// 按九宫格阅读顺序排列，供 3×3 选择器直接渲染
export const POSITION_OPTIONS: Array<{ value: WatermarkPosition; label: string }> = [
  { value: 'top-left', label: '左上' },
  { value: 'top-center', label: '上中' },
  { value: 'top-right', label: '右上' },
  { value: 'middle-left', label: '左中' },
  { value: 'middle-center', label: '居中' },
  { value: 'middle-right', label: '右中' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-center', label: '下中' },
  { value: 'bottom-right', label: '右下' },
]

// 文字水印设置：字号与平铺间距均以「底图宽度比例」表达，
// 批量处理不同尺寸图片时水印相对大小保持一致
export interface TextWatermarkSettings {
  text: string
  fontScale: number // 字号 = 底图宽度 × fontScale
  color: string
  opacity: number // 0–1
  rotation: number // -90–90 度
  position: WatermarkPosition
  tiled: boolean
  tileGapX: number // 平铺列间距（底图宽度比例）
  tileGapY: number // 平铺行间距（底图宽度比例）
}

export interface ImageWatermarkSettings {
  scale: number // 水印图宽度 = 底图宽度 × scale
  opacity: number // 0–1
  position: WatermarkPosition
}

export interface WatermarkConfig {
  type: 'text' | 'image'
  text: TextWatermarkSettings
  image: ImageWatermarkSettings
}

// 可绘制图像源：预览用 HTMLImageElement，批量导出可用 ImageBitmap
export interface DrawableImage {
  source: CanvasImageSource
  width: number
  height: number
}

// 已解码并接管生命周期的图像源（导出时用完需 dispose）
export interface LoadedImage extends DrawableImage {
  dispose: () => void
}

// 解码本地图片文件：优先 ImageBitmap（不占 DOM），失败时回退 HTMLImageElement + objectURL
export async function loadImageFile(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        dispose: () => bitmap.close(),
      }
    } catch {
      // 落入下方 HTMLImageElement 回退
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImageElement(url)
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      dispose: () => URL.revokeObjectURL(url),
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

// 通过 URL 加载 HTMLImageElement（预览底图 / 水印 logo 通用）
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = src
  })
}

// 按九宫格位置计算水印左上角锚点，margin 为水印与图片边缘的间距
function anchorPoint(
  position: WatermarkPosition,
  canvasWidth: number,
  canvasHeight: number,
  itemWidth: number,
  itemHeight: number,
  margin: number
): { x: number; y: number } {
  let x: number
  let y: number
  if (position.endsWith('left')) x = margin
  else if (position.endsWith('center')) x = (canvasWidth - itemWidth) / 2
  else x = canvasWidth - itemWidth - margin

  if (position.startsWith('top')) y = margin
  else if (position.startsWith('middle')) y = (canvasHeight - itemHeight) / 2
  else y = canvasHeight - itemHeight - margin

  return { x, y }
}

const WATERMARK_FONT_FAMILY = '"PingFang SC", "Microsoft YaHei", sans-serif'
const EDGE_MARGIN_RATIO = 0.03 // 单个水印与边缘的间距（底图宽度比例）

// 绘制文字水印：单个模式按九宫格定位；平铺模式以画布中心旋转坐标系后双层循环铺满
function drawTextWatermark(ctx: CanvasRenderingContext2D, settings: TextWatermarkSettings, w: number, h: number) {
  const text = settings.text.trim()
  if (!text) return

  const fontSize = Math.max(8, w * settings.fontScale)
  ctx.save()
  ctx.globalAlpha = settings.opacity
  ctx.fillStyle = settings.color
  ctx.font = `bold ${fontSize}px ${WATERMARK_FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (!settings.tiled) {
    const textWidth = ctx.measureText(text).width
    const { x, y } = anchorPoint(settings.position, w, h, textWidth, fontSize, w * EDGE_MARGIN_RATIO)
    // 以文字中心为轴旋转
    ctx.translate(x + textWidth / 2, y + fontSize / 2)
    ctx.rotate((settings.rotation * Math.PI) / 180)
    ctx.fillText(text, 0, 0)
  } else {
    // 平铺：整体旋转坐标系，覆盖范围取对角线长度保证旋转后无空白
    const textWidth = ctx.measureText(text).width
    const stepX = textWidth + w * settings.tileGapX
    const stepY = fontSize + w * settings.tileGapY
    const diagonal = Math.hypot(w, h)
    ctx.translate(w / 2, h / 2)
    ctx.rotate((settings.rotation * Math.PI) / 180)
    for (let row = -diagonal; row <= diagonal; row += stepY) {
      for (let col = -diagonal; col <= diagonal; col += stepX) {
        ctx.fillText(text, col, row)
      }
    }
  }
  ctx.restore()
}

// 绘制图片水印：按底图宽度比例缩放，保持 logo 原始纵横比
function drawImageWatermark(
  ctx: CanvasRenderingContext2D,
  settings: ImageWatermarkSettings,
  w: number,
  h: number,
  watermark: DrawableImage
) {
  const wmWidth = w * settings.scale
  const wmHeight = (wmWidth / watermark.width) * watermark.height
  const { x, y } = anchorPoint(settings.position, w, h, wmWidth, wmHeight, w * EDGE_MARGIN_RATIO)

  ctx.save()
  ctx.globalAlpha = settings.opacity
  ctx.drawImage(watermark.source, x, y, wmWidth, wmHeight)
  ctx.restore()
}

export interface DrawWatermarkOptions {
  base: DrawableImage
  config: WatermarkConfig
  watermarkImage: DrawableImage | null
  fillWhite: boolean // JPEG/WebP 不支持透明底时先铺白
}

// 核心合成函数：预览与导出共用，把底图与水印绘制到目标 canvas
export function drawWatermarked(canvas: HTMLCanvasElement, options: DrawWatermarkOptions): void {
  const { base, config, watermarkImage, fillWhite } = options
  canvas.width = base.width
  canvas.height = base.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, base.width, base.height)
  if (fillWhite) {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, base.width, base.height)
  }
  ctx.drawImage(base.source, 0, 0, base.width, base.height)

  if (config.type === 'text') {
    drawTextWatermark(ctx, config.text, base.width, base.height)
  } else if (watermarkImage) {
    drawImageWatermark(ctx, config.image, base.width, base.height, watermarkImage)
  }
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('图片导出失败'))),
      mimeType,
      quality
    )
  })
}

// 合成单张图片并导出为 Blob（批量导出的单元操作）
export async function renderWatermarkedBlob(
  file: File,
  config: WatermarkConfig,
  watermarkImage: DrawableImage | null,
  format: ExportFormat,
  quality: number
): Promise<Blob> {
  const base = await loadImageFile(file)
  try {
    const canvas = document.createElement('canvas')
    drawWatermarked(canvas, {
      base,
      config,
      watermarkImage,
      fillWhite: format !== 'png',
    })
    return await canvasToBlob(
      canvas,
      EXPORT_TYPES[format],
      format === 'png' ? undefined : quality
    )
  } finally {
    base.dispose()
  }
}

export function getFileBaseName(name: string): string {
  const dotIndex = name.lastIndexOf('.')
  return dotIndex > 0 ? name.slice(0, dotIndex) : name
}

// ZIP 内文件名：原名_watermarked.ext
export function buildWatermarkedFilename(name: string, format: ExportFormat): string {
  return `${getFileBaseName(name)}_watermarked.${EXPORT_EXTS[format]}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
