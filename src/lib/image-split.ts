// 长图切割核心逻辑：切片计算、canvas 裁切与导出（纯浏览器本地处理）

export type SplitMode = 'grid' | 'vertical' | 'horizontal'

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

// 单个切片在原图中的矩形区域，index 从 1 开始
export interface SliceRect {
  index: number
  sx: number
  sy: number
  sw: number
  sh: number
}

export interface SplitOptions {
  grid: { rows: number; cols: number }
  vertical: { mode: 'count' | 'height'; count: number; sliceHeight: number }
  horizontalCount: number
}

// 已解码的图像源：优先 ImageBitmap（不占 DOM、可 close 释放），失败时回退 HTMLImageElement
export interface LoadedImage {
  source: CanvasImageSource
  width: number
  height: number
  dispose: () => void
}

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
      // 部分格式不支持 createImageBitmap，回退到 Image
    }
  }

  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('图片加载失败，请检查文件格式'))
      img.src = url
    })
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      dispose: () => URL.revokeObjectURL(url),
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

// 把 total 均分为 parts 段：用 round 累积边界，保证各段无缝拼接且总长等于 total
function divideRange(total: number, parts: number): Array<{ start: number; size: number }> {
  const segments: Array<{ start: number; size: number }> = []
  for (let i = 0; i < parts; i++) {
    const start = Math.round((total * i) / parts)
    const end = Math.round((total * (i + 1)) / parts)
    segments.push({ start, size: end - start })
  }
  return segments
}

// 按当前模式计算全部切片；过滤掉取整后尺寸为 0 的切片
export function computeSlices(
  mode: SplitMode,
  width: number,
  height: number,
  options: SplitOptions
): SliceRect[] {
  const rects: SliceRect[] = []
  let index = 1

  if (mode === 'grid') {
    const rows = clampInt(options.grid.rows, 1, 10)
    const cols = clampInt(options.grid.cols, 1, 10)
    for (const y of divideRange(height, rows)) {
      for (const x of divideRange(width, cols)) {
        rects.push({ index: index++, sx: x.start, sy: y.start, sw: x.size, sh: y.size })
      }
    }
  } else if (mode === 'vertical') {
    const vertical = options.vertical
    if (vertical.mode === 'count') {
      const count = clampInt(vertical.count, 1, 100)
      for (const y of divideRange(height, count)) {
        rects.push({ index: index++, sx: 0, sy: y.start, sw: width, sh: y.size })
      }
    } else {
      const sliceHeight = clampInt(vertical.sliceHeight, 1, height)
      for (let y = 0; y < height; y += sliceHeight) {
        // 最后一片取剩余部分
        rects.push({ index: index++, sx: 0, sy: y, sw: width, sh: Math.min(sliceHeight, height - y) })
      }
    }
  } else {
    const count = clampInt(options.horizontalCount, 1, 100)
    for (const x of divideRange(width, count)) {
      rects.push({ index: index++, sx: x.start, sy: 0, sw: x.size, sh: height })
    }
  }

  return rects.filter((rect) => rect.sw > 0 && rect.sh > 0)
}

// 从原图裁出单个切片；JPEG 不支持透明，导出前填充背景色
export function sliceToCanvas(
  source: CanvasImageSource,
  rect: SliceRect,
  options: { fillBackground?: string } = {}
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = rect.sw
  canvas.height = rect.sh
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建画布上下文，请更换浏览器重试')
  }
  if (options.fillBackground) {
    ctx.fillStyle = options.fillBackground
    ctx.fillRect(0, 0, rect.sw, rect.sh)
  }
  ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, rect.sw, rect.sh)
  return canvas
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('图片导出失败，请重试'))),
      type,
      quality
    )
  })
}

// 生成单个切片的缩略预览（限制最长边，避免大图预览占用过多内存）
export async function makeSlicePreviewUrl(
  source: CanvasImageSource,
  rect: SliceRect,
  maxSize = 240
): Promise<string> {
  const scale = Math.min(1, maxSize / Math.max(rect.sw, rect.sh))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(rect.sw * scale))
  canvas.height = Math.max(1, Math.round(rect.sh * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建画布上下文，请更换浏览器重试')
  }
  ctx.drawImage(source, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, canvas.width, canvas.height)
  return canvasToBlob(canvas, 'image/png')
    .then((blob) => URL.createObjectURL(blob))
    .catch(() => canvas.toDataURL('image/png')) // toBlob 不可用时回退 dataURL
}

// 按导出设置生成切片 Blob（全尺寸、按需调用）
export async function renderSliceBlob(
  source: CanvasImageSource,
  rect: SliceRect,
  format: ExportFormat,
  quality: number
): Promise<Blob> {
  const canvas = sliceToCanvas(source, rect, {
    fillBackground: format === 'jpeg' ? '#FFFFFF' : undefined,
  })
  const blob = await canvasToBlob(canvas, EXPORT_TYPES[format], format === 'png' ? undefined : quality)
  canvas.width = 0
  canvas.height = 0
  return blob
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function getFileBaseName(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(0, dot) : name
}

// 切片文件名：原文件名_01、_02…（不足两位补零，扩展名跟随导出格式）
export function buildSliceFilename(base: string, index: number, format: ExportFormat): string {
  return `${base}_${String(index).padStart(2, '0')}.${EXPORT_EXTS[format]}`
}

// 触发浏览器下载一个 Blob
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // 延迟释放，确保下载已开始
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
