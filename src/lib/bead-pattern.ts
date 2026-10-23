/**
 * 拼豆图纸：浏览器内把图片采样成方格，并用 CIE Lab 色差映射到参考色板。
 * 不依赖网络，也不读取任何远程色库。
 */

import {
  PALETTE,
  PALETTE_NAME,
  PALETTE_NAME_EN,
  PALETTE_NOTE,
  PALETTE_NOTE_EN,
  deltaE76,
  inkForLab,
  nearestPaletteIndex,
  rgbToLab,
} from './bead-palette'
import type { Locale } from './i18n'

export const MIN_COLS = 16
export const MAX_COLS = 128
export const DEFAULT_COLS = 48
export const MIN_ROWS = 8
export const MAX_ROWS = 192

/** 采样前把长边限制在这个像素内，避免超大图卡住主线程 */
const MAX_WORK_EDGE = 1600

export interface GenerateOptions {
  /** 图纸宽度（格） */
  cols: number
  /** 锁定正方形，并裁切画面中心 */
  square: boolean
  removeBackground: boolean
  /** 背景色差阈值（CIE76），越大去掉越多 */
  backgroundThreshold: number
  /** null 表示不限制颜色数 */
  maxColors: number | null
  /** null 表示不合并相近色；否则为 CIE76 阈值 */
  mergeThreshold: number | null
  /** 界面语言，仅影响抛出的错误文案；默认中文 */
  locale?: Locale
}

export interface BeadPattern {
  cols: number
  rows: number
  /** 行优先，-1 表示空白（透明或被去掉的背景） */
  indices: Int16Array
  usage: Array<{ index: number; count: number }>
  totalBeads: number
  emptyCount: number
  /** 本次背景去除额外清掉的格数 */
  backgroundRemoved: number
  /** 阈值过大、几乎整图都被当成背景时会放弃去除 */
  backgroundReverted: boolean
  /** 原图过高，高度被限制后画面会略压扁 */
  rowsClamped: boolean
}

export interface GridSize {
  cols: number
  rows: number
  rowsClamped: boolean
  sx: number
  sy: number
  sw: number
  sh: number
}

export interface RenderPatternOptions {
  cellSize: number
  showCodes: boolean
  showLegend: boolean
  showCoords: boolean
  showHeader: boolean
  /** 设备像素比，预览用，导出保持 1 */
  pixelRatio?: number
  /** 高亮某个色号；其余格子变淡 */
  highlightCode?: string | null
  /** 图纸文字语言，默认中文 */
  locale?: Locale
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function computeGridSize(
  srcW: number,
  srcH: number,
  cols: number,
  square: boolean,
): GridSize {
  const safeCols = clamp(Math.round(cols) || DEFAULT_COLS, MIN_COLS, MAX_COLS)
  if (square) {
    const side = Math.min(srcW, srcH)
    return {
      cols: safeCols,
      rows: safeCols,
      rowsClamped: false,
      sx: Math.floor((srcW - side) / 2),
      sy: Math.floor((srcH - side) / 2),
      sw: side,
      sh: side,
    }
  }
  let rows = Math.round(safeCols * (srcH / Math.max(1, srcW)))
  let rowsClamped = false
  if (rows > MAX_ROWS) {
    rows = MAX_ROWS
    rowsClamped = true
  } else if (rows < MIN_ROWS) {
    rows = MIN_ROWS
    rowsClamped = true
  }
  return { cols: safeCols, rows, rowsClamped, sx: 0, sy: 0, sw: srcW, sh: srcH }
}

function countIndices(indices: Int16Array, empty: Uint8Array): Map<number, number> {
  const counts = new Map<number, number>()
  for (let i = 0; i < indices.length; i++) {
    if (empty[i] || indices[i] < 0) continue
    const key = indices[i]
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

function mapKeys(counts: Map<number, number>): number[] {
  const keys: number[] = []
  counts.forEach((_count, key) => {
    keys.push(key)
  })
  return keys
}

function mapEntries(counts: Map<number, number>): Array<[number, number]> {
  const entries: Array<[number, number]> = []
  counts.forEach((count, key) => {
    entries.push([key, count])
  })
  return entries
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/** 从四周向内去掉与边缘主色相近、且连成一片的格子 */
function removeBackground(
  L: Float32Array,
  a: Float32Array,
  b: Float32Array,
  empty: Uint8Array,
  cols: number,
  rows: number,
  threshold: number,
): { removed: number; reverted: boolean } {
  const total = cols * rows
  const border: number[] = []
  for (let x = 0; x < cols; x++) {
    border.push(x)
    if (rows > 1) border.push((rows - 1) * cols + x)
  }
  for (let y = 1; y < rows - 1; y++) {
    border.push(y * cols)
    if (cols > 1) border.push(y * cols + cols - 1)
  }

  const samplesL: number[] = []
  const samplesA: number[] = []
  const samplesB: number[] = []
  for (const index of border) {
    if (empty[index]) continue
    samplesL.push(L[index])
    samplesA.push(a[index])
    samplesB.push(b[index])
  }
  if (samplesL.length === 0) return { removed: 0, reverted: false }

  const refL = median(samplesL)
  const refA = median(samplesA)
  const refB = median(samplesB)
  const thr2 = threshold * threshold
  const close = (index: number) => {
    const dL = L[index] - refL
    const dA = a[index] - refA
    const dB = b[index] - refB
    return dL * dL + dA * dA + dB * dB <= thr2
  }

  const snapshot = empty.slice()
  const seen = new Uint8Array(total)
  const queue: number[] = []
  for (const index of border) {
    if (empty[index] || seen[index] || !close(index)) continue
    seen[index] = 1
    queue.push(index)
  }

  let head = 0
  while (head < queue.length) {
    const index = queue[head++]
    empty[index] = 1
    const x = index % cols
    const y = (index - x) / cols
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
        const next = ny * cols + nx
        if (seen[next] || empty[next] || !close(next)) continue
        seen[next] = 1
        queue.push(next)
      }
    }
  }

  let removed = 0
  let remain = 0
  for (let i = 0; i < total; i++) {
    if (empty[i] && !snapshot[i]) removed++
    else if (!empty[i]) remain++
  }
  if (remain === 0) {
    empty.set(snapshot)
    return { removed: 0, reverted: true }
  }
  return { removed, reverted: false }
}

function mergeSimilarColors(indices: Int16Array, empty: Uint8Array, threshold: number) {
  let guard = 0
  while (guard++ < PALETTE.length) {
    const counts = countIndices(indices, empty)
    const keys = mapKeys(counts)
    if (keys.length < 2) return
    let best = Number.POSITIVE_INFINITY
    let left = -1
    let right = -1
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const dist = deltaE76(PALETTE[keys[i]].lab, PALETTE[keys[j]].lab)
        if (dist < best) {
          best = dist
          left = keys[i]
          right = keys[j]
        }
      }
    }
    if (left < 0 || best > threshold) return
    const countLeft = counts.get(left) || 0
    const countRight = counts.get(right) || 0
    const keep = countLeft > countRight || (countLeft === countRight && left < right) ? left : right
    const drop = keep === left ? right : left
    for (let i = 0; i < indices.length; i++) {
      if (indices[i] === drop) indices[i] = keep
    }
  }
}

function limitColors(
  indices: Int16Array,
  empty: Uint8Array,
  L: Float32Array,
  a: Float32Array,
  b: Float32Array,
  maxColors: number,
) {
  const counts = countIndices(indices, empty)
  if (counts.size <= maxColors) return
  const ranked = mapEntries(counts).sort((p, q) => q[1] - p[1] || p[0] - q[0])
  const keep = ranked.slice(0, maxColors).map(([index]) => index)
  const keepSet = new Set(keep)
  for (let i = 0; i < indices.length; i++) {
    if (empty[i] || indices[i] < 0 || keepSet.has(indices[i])) continue
    indices[i] = nearestPaletteIndex(L[i], a[i], b[i], keep)
  }
}

function buildUsage(indices: Int16Array, empty: Uint8Array) {
  return mapEntries(countIndices(indices, empty))
    .map(([index, count]) => ({ index, count }))
    .sort((p, q) => q.count - p.count || p.index - q.index)
}

/**
 * 把已经裁好的 RGBA 缓冲按格子取平均色，再映射到色板。
 * 供页面调用，也便于不依赖 Canvas 做校验。
 */
export function generateFromRgba(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  cols: number,
  rows: number,
  options: GenerateOptions,
  rowsClamped = false,
): BeadPattern {
  const total = cols * rows
  const L = new Float32Array(total)
  const a = new Float32Array(total)
  const b = new Float32Array(total)
  const empty = new Uint8Array(total)

  for (let row = 0; row < rows; row++) {
    const y0 = Math.floor((row * height) / rows)
    let y1 = Math.floor(((row + 1) * height) / rows)
    if (y1 <= y0) y1 = Math.min(height, y0 + 1)
    for (let col = 0; col < cols; col++) {
      const x0 = Math.floor((col * width) / cols)
      let x1 = Math.floor(((col + 1) * width) / cols)
      if (x1 <= x0) x1 = Math.min(width, x0 + 1)
      let sumR = 0
      let sumG = 0
      let sumB = 0
      let count = 0
      for (let y = y0; y < y1; y++) {
        let offset = (y * width + x0) * 4
        for (let x = x0; x < x1; x++) {
          if (rgba[offset + 3] >= 128) {
            sumR += rgba[offset]
            sumG += rgba[offset + 1]
            sumB += rgba[offset + 2]
            count++
          }
          offset += 4
        }
      }
      const index = row * cols + col
      if (count === 0) {
        empty[index] = 1
      } else {
        const lab = rgbToLab(sumR / count, sumG / count, sumB / count)
        L[index] = lab.L
        a[index] = lab.a
        b[index] = lab.b
      }
    }
  }

  let backgroundRemoved = 0
  let backgroundReverted = false
  if (options.removeBackground) {
    const threshold = clamp(options.backgroundThreshold, 6, 48)
    const result = removeBackground(L, a, b, empty, cols, rows, threshold)
    backgroundRemoved = result.removed
    backgroundReverted = result.reverted
  }

  const indices = new Int16Array(total)
  indices.fill(-1)
  for (let i = 0; i < total; i++) {
    if (empty[i]) continue
    indices[i] = nearestPaletteIndex(L[i], a[i], b[i])
  }

  if (options.mergeThreshold != null) {
    mergeSimilarColors(indices, empty, clamp(options.mergeThreshold, 4, 40))
  }
  if (options.maxColors != null) {
    const cap = clamp(Math.round(options.maxColors), 2, PALETTE.length)
    limitColors(indices, empty, L, a, b, cap)
  }

  const usage = buildUsage(indices, empty)
  let totalBeads = 0
  let emptyCount = 0
  for (const item of usage) totalBeads += item.count
  for (let i = 0; i < total; i++) if (empty[i]) emptyCount++

  return {
    cols,
    rows,
    indices,
    usage,
    totalBeads,
    emptyCount,
    backgroundRemoved,
    backgroundReverted,
    rowsClamped,
  }
}

/** 从已解码的图片元素生成图纸。仅能在浏览器里调用。 */
export function generateBeadPattern(image: HTMLImageElement, options: GenerateOptions): BeadPattern {
  const en = (options.locale ?? 'zh') === 'en'
  const srcW = image.naturalWidth || image.width
  const srcH = image.naturalHeight || image.height
  if (!srcW || !srcH) throw new Error(en ? 'Could not read the image dimensions.' : '无法读取图片尺寸')

  const grid = computeGridSize(srcW, srcH, options.cols, options.square)
  const scale = Math.min(1, MAX_WORK_EDGE / Math.max(grid.sw, grid.sh))
  const workW = Math.max(grid.cols, Math.round(grid.sw * scale))
  const workH = Math.max(grid.rows, Math.round(grid.sh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = workW
  canvas.height = workH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx)
    throw new Error(
      en
        ? 'This browser does not support Canvas, so the image cannot be processed.'
        : '当前浏览器不支持 Canvas，无法处理图片',
    )
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, grid.sx, grid.sy, grid.sw, grid.sh, 0, 0, workW, workH)
  const imageData = ctx.getImageData(0, 0, workW, workH)
  return generateFromRgba(
    imageData.data,
    workW,
    workH,
    grid.cols,
    grid.rows,
    options,
    grid.rowsClamped,
  )
}

export function patternToCsv(pattern: BeadPattern, locale: Locale = 'zh'): string {
  if (locale === 'en') {
    const lines = [
      `Pattern size,${pattern.cols}x${pattern.rows}`,
      `Total beads,${pattern.totalBeads}`,
      `Colors,${pattern.usage.length}`,
      `Palette,${PALETTE_NAME_EN}`,
      '',
      'Code,Family,Name,HEX,Count,Share',
    ]
    for (const item of pattern.usage) {
      const color = PALETTE[item.index]
      const pct = pattern.totalBeads ? ((item.count / pattern.totalBeads) * 100).toFixed(1) : '0.0'
      lines.push(`${color.code},${color.familyEn},${color.nameEn},${color.hex},${item.count},${pct}%`)
    }
    return `\uFEFF${lines.join('\r\n')}`
  }

  const lines = [
    `图纸尺寸,${pattern.cols}x${pattern.rows}`,
    `总颗数,${pattern.totalBeads}`,
    `色号数,${pattern.usage.length}`,
    `色板,${PALETTE_NAME}`,
    '',
    '色号,色系,名称,HEX,颗数,占比',
  ]
  for (const item of pattern.usage) {
    const color = PALETTE[item.index]
    const pct = pattern.totalBeads ? ((item.count / pattern.totalBeads) * 100).toFixed(1) : '0.0'
    lines.push(`${color.code},${color.family},${color.name},${color.hex},${item.count},${pct}%`)
  }
  return `\uFEFF${lines.join('\r\n')}`
}

export function patternToText(pattern: BeadPattern, locale: Locale = 'zh'): string {
  if (locale === 'en') {
    const lines = [
      `Bead pattern ${pattern.cols}×${pattern.rows}`,
      `${pattern.totalBeads} beads, ${pattern.usage.length} colors`,
      PALETTE_NOTE_EN,
      '',
      'Code\tFamily\tName\tHEX\tCount',
    ]
    for (const item of pattern.usage) {
      const color = PALETTE[item.index]
      lines.push(`${color.code}\t${color.familyEn}\t${color.nameEn}\t${color.hex}\t${item.count}`)
    }
    return lines.join('\n')
  }

  const lines = [
    `拼豆图纸 ${pattern.cols}×${pattern.rows}`,
    `共 ${pattern.totalBeads} 颗，${pattern.usage.length} 个色号`,
    PALETTE_NOTE,
    '',
    '色号\t色系\t名称\tHEX\t颗数',
  ]
  for (const item of pattern.usage) {
    const color = PALETTE[item.index]
    lines.push(`${color.code}\t${color.family}\t${color.name}\t${color.hex}\t${item.count}`)
  }
  return lines.join('\n')
}

const FONT_STACK =
  '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC",sans-serif'
const FONT_STACK_EN = 'Inter,"Helvetica Neue",Helvetica,Arial,sans-serif'

/** 中文按字断行，避免单词被拆开 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i)
    const next = line + ch
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = ch
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

/** 英文按单词断行 */
function wrapWords(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function coordMarks(max: number, cell: number): number[] {
  const step = max > 80 ? 10 : 5
  const raw = [1]
  for (let n = step; n < max; n += step) raw.push(n)
  if (max !== 1) raw.push(max)
  const kept: number[] = []
  for (const n of raw) {
    const prev = kept[kept.length - 1]
    if (prev === undefined) {
      kept.push(n)
      continue
    }
    const gap = (n - prev) * cell
    if (gap < 18 && n !== max) continue
    if (gap < 18 && n === max && kept.length > 1) kept.pop()
    kept.push(n)
  }
  return kept
}

function fillEmptyCell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = '#f8f8f8'
  ctx.fillRect(x, y, size, size)
  ctx.fillStyle = '#e6e6e6'
  const half = size / 2
  ctx.fillRect(x, y, half, half)
  ctx.fillRect(x + half, y + half, half, half)
}

function strokeGrid(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  cell: number,
  pixelRatio: number,
) {
  const width = Math.max(1, pixelRatio)
  const draw = (major: boolean) => {
    ctx.beginPath()
    for (let c = 0; c <= cols; c++) {
      const isMajor = c === 0 || c === cols || c % 10 === 0
      if (isMajor !== major) continue
      const x = c * cell
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rows * cell)
    }
    for (let r = 0; r <= rows; r++) {
      const isMajor = r === 0 || r === rows || r % 10 === 0
      if (isMajor !== major) continue
      const y = r * cell
      ctx.moveTo(0, y)
      ctx.lineTo(cols * cell, y)
    }
    ctx.lineWidth = major ? width * 2 : width
    ctx.strokeStyle = major ? 'rgba(20,20,20,0.8)' : 'rgba(40,40,40,0.45)'
    ctx.stroke()
  }
  draw(false)
  draw(true)
}

/** 画到离屏画布：预览与高清 PNG 共用 */
export function renderBeadPattern(
  pattern: BeadPattern,
  options: RenderPatternOptions,
): HTMLCanvasElement {
  const locale = options.locale ?? 'zh'
  const en = locale === 'en'
  const fontStack = en ? FONT_STACK_EN : FONT_STACK
  if (typeof document === 'undefined') {
    throw new Error(en ? 'The pattern can only be rendered in a browser.' : '图纸只能在浏览器中绘制')
  }
  const pixelRatio = options.pixelRatio ?? 1
  const cell = Math.max(4, options.cellSize)
  const { cols, rows } = pattern
  const gutterX = options.showCoords ? Math.max(28 * pixelRatio, Math.round(cell * 0.9)) : 0
  const gutterY = options.showCoords ? Math.max(22 * pixelRatio, Math.round(cell * 0.75)) : 0
  const gridW = cols * cell
  const gridH = rows * cell
  const pad = Math.round(28 * pixelRatio)
  const minContent = options.showHeader ? Math.round(680 * pixelRatio) : 0
  const contentW = Math.max(gridW + gutterX, minContent)

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error(en ? 'This browser does not support Canvas.' : '当前浏览器不支持 Canvas')

  ctx.font = `${Math.round(13 * pixelRatio)}px ${fontStack}`
  const note = options.showHeader ? (en ? PALETTE_NOTE_EN : PALETTE_NOTE) : ''
  const noteLines = note ? (en ? wrapWords(ctx, note, contentW) : wrapText(ctx, note, contentW)) : []
  const headerH = options.showHeader
    ? Math.round(26 * pixelRatio) + Math.round(22 * pixelRatio) + noteLines.length * Math.round(18 * pixelRatio) + Math.round(12 * pixelRatio)
    : 0

  const legendCols = options.showLegend
    ? Math.min(
        3,
        Math.max(1, Math.floor(contentW / Math.round(230 * pixelRatio))),
        Math.max(1, pattern.usage.length),
      )
    : 1
  const legendRowH = Math.round(26 * pixelRatio)
  const legendRows = options.showLegend ? Math.ceil(pattern.usage.length / legendCols) : 0
  const legendTitleH = options.showLegend ? Math.round(28 * pixelRatio) : 0
  const legendH = options.showLegend ? legendTitleH + legendRows * legendRowH + Math.round(8 * pixelRatio) : 0
  const footerH = options.showHeader ? Math.round(32 * pixelRatio) : 0
  const emptyNoteH = options.showHeader && pattern.emptyCount > 0 ? Math.round(22 * pixelRatio) : 0

  canvas.width = pad * 2 + contentW
  canvas.height = pad + headerH + gutterY + gridH + emptyNoteH + legendH + footerH + pad

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#111111'
  ctx.textBaseline = 'top'

  let cursorY = pad
  if (options.showHeader) {
    ctx.font = `700 ${Math.round(22 * pixelRatio)}px ${fontStack}`
    ctx.fillText(en ? 'Bead Pattern' : '拼豆图纸', pad, cursorY)
    cursorY += Math.round(28 * pixelRatio)
    ctx.font = `${Math.round(14 * pixelRatio)}px ${fontStack}`
    ctx.fillStyle = '#444444'
    ctx.fillText(
      en
        ? `${cols} × ${rows} cells · ${pattern.totalBeads} beads · ${pattern.usage.length} colors · ${PALETTE_NAME_EN}`
        : `${cols} × ${rows} 格 · ${pattern.totalBeads} 颗 · ${pattern.usage.length} 色 · ${PALETTE_NAME}`,
      pad,
      cursorY,
    )
    cursorY += Math.round(22 * pixelRatio)
    ctx.font = `${Math.round(12 * pixelRatio)}px ${fontStack}`
    ctx.fillStyle = '#666666'
    for (const line of noteLines) {
      ctx.fillText(line, pad, cursorY)
      cursorY += Math.round(18 * pixelRatio)
    }
    cursorY += Math.round(8 * pixelRatio)
  }

  const originX = pad + gutterX + Math.max(0, Math.floor((contentW - gridW - gutterX) / 2))
  const originY = cursorY + gutterY

  const highlightIndex =
    options.highlightCode != null
      ? PALETTE.findIndex((color) => color.code === options.highlightCode)
      : -1
  const dimming = highlightIndex >= 0

  let fontSize = Math.floor(cell * 0.4)
  ctx.font = `700 ${fontSize}px ${fontStack}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  while (fontSize > 7 && ctx.measureText('G10').width > cell - 4 * pixelRatio) {
    fontSize -= 1
    ctx.font = `700 ${fontSize}px ${fontStack}`
  }
  const canDrawCodes = options.showCodes && fontSize >= 7 && ctx.measureText('G10').width <= cell - 2

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = pattern.indices[row * cols + col]
      const x = originX + col * cell
      const y = originY + row * cell
      if (index < 0) {
        fillEmptyCell(ctx, x, y, cell)
        continue
      }
      const color = PALETTE[index]
      const dimmed = dimming && index !== highlightIndex
      ctx.globalAlpha = dimmed ? 0.22 : 1
      ctx.fillStyle = color.hex
      ctx.fillRect(x, y, cell, cell)
      ctx.globalAlpha = 1
      if (canDrawCodes && !dimmed) {
        ctx.fillStyle = inkForLab(color.lab)
        ctx.font = `700 ${fontSize}px ${fontStack}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(color.code, x + cell / 2, y + cell / 2 + pixelRatio * 0.5)
      }
      if (dimming && index === highlightIndex) {
        ctx.strokeStyle = '#d97706'
        ctx.lineWidth = Math.max(2, pixelRatio * 2)
        ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2)
      }
    }
  }

  ctx.save()
  ctx.translate(originX, originY)
  strokeGrid(ctx, cols, rows, cell, pixelRatio)
  ctx.restore()

  if (options.showCoords) {
    ctx.fillStyle = '#6b7280'
    ctx.font = `${Math.max(10, Math.round(11 * pixelRatio))}px ${fontStack}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const mark of coordMarks(cols, cell)) {
      ctx.fillText(String(mark), originX + (mark - 0.5) * cell, originY - gutterY / 2)
    }
    ctx.textAlign = 'right'
    for (const mark of coordMarks(rows, cell)) {
      ctx.fillText(String(mark), originX - Math.round(6 * pixelRatio), originY + (mark - 0.5) * cell)
    }
  }

  cursorY = originY + gridH + Math.round(8 * pixelRatio)
  if (options.showHeader && pattern.emptyCount > 0) {
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.font = `${Math.round(12 * pixelRatio)}px ${fontStack}`
    ctx.fillStyle = '#666666'
    ctx.fillText(
      en
        ? `Checkerboard cells are empty: ${pattern.emptyCount} cells, not counted in bead usage.`
        : `棋盘格为空白，共 ${pattern.emptyCount} 格，不计入用量。`,
      pad,
      cursorY,
    )
    cursorY += emptyNoteH
  }

  if (options.showLegend && pattern.usage.length > 0) {
    cursorY += Math.round(8 * pixelRatio)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#111111'
    ctx.font = `700 ${Math.round(14 * pixelRatio)}px ${fontStack}`
    ctx.fillText(en ? 'Bead usage (most used first)' : '用量图例（按颗数从多到少）', pad, cursorY)
    cursorY += legendTitleH
    const colW = contentW / legendCols
    pattern.usage.forEach((item, order) => {
      const color = PALETTE[item.index]
      const col = order % legendCols
      const row = Math.floor(order / legendCols)
      const x = pad + col * colW
      const y = cursorY + row * legendRowH
      const swatch = Math.round(14 * pixelRatio)
      ctx.fillStyle = color.hex
      ctx.fillRect(x, y + Math.round(4 * pixelRatio), swatch, swatch)
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.lineWidth = Math.max(1, pixelRatio)
      ctx.strokeRect(x, y + Math.round(4 * pixelRatio), swatch, swatch)
      ctx.fillStyle = '#222222'
      ctx.font = `${Math.round(12 * pixelRatio)}px ${fontStack}`
      const pct = pattern.totalBeads ? Math.round((item.count / pattern.totalBeads) * 1000) / 10 : 0
      ctx.fillText(
        en
          ? `${color.code}  ${color.nameEn}  ${color.hex}  ${item.count} beads  ${pct}%`
          : `${color.code}  ${color.name}  ${color.hex}  ${item.count} 颗  ${pct}%`,
        x + swatch + Math.round(8 * pixelRatio),
        y + Math.round(4 * pixelRatio),
      )
    })
    cursorY += legendRows * legendRowH
  }

  if (options.showHeader) {
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.font = `${Math.round(12 * pixelRatio)}px ${fontStack}`
    ctx.fillStyle = '#888888'
    ctx.fillText(
      en
        ? 'mihoyonb.com/pindou · Free · Generated locally in your browser · Image never uploaded'
        : '原牛 mihoyonb.com/zh/pindou · 免费 · 浏览器本地生成 · 图片不上传',
      pad,
      canvas.height - pad - Math.round(4 * pixelRatio),
    )
  }

  return canvas
}
