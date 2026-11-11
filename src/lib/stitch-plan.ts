/**
 * 长图排版：第一张可以留整幅，后面只留条带；视频行可以在下面加一条时间。
 * 超出浏览器画布安全尺寸时按比例缩小，并标记 capped。
 */

import type { Band } from './stitch-band'

export const MAX_CANVAS_EDGE = 16384
export const MAX_CANVAS_PIXELS = 16_000_000

export interface PlanFrame {
  width: number
  height: number
  caption: boolean
}

export interface PlanRow {
  index: number
  cropY: number
  cropHeight: number
  destY: number
  destHeight: number
  captionY: number
  captionHeight: number
}

export interface StitchPlan {
  width: number
  height: number
  /** 调用方请求的倍率。实际像素以 width/height 为准，被压过就是 capped。 */
  scale: number
  rows: PlanRow[]
  capped: boolean
}

export interface PlanInput {
  frames: PlanFrame[]
  mode: 'full' | 'band'
  band: Band
  /** 输出基准宽度。0 表示用第一张的宽度。 */
  targetWidth: number
  scale: number
  /** 条带模式下第一张仍输出整幅 */
  keepFirstFull?: boolean
  maxEdge?: number
  maxPixels?: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function clampBand(topPercent: number, heightPercent: number): Band {
  const height = clamp(heightPercent, 2, 100) / 100
  const top = clamp(topPercent / 100, 0, 1 - height)
  return { top, height }
}

function build(frames: PlanFrame[], outWidth: number, input: PlanInput): { width: number; height: number; rows: PlanRow[] } {
  const rows: PlanRow[] = []
  let y = 0
  const keepFirst = input.keepFirstFull !== false
  frames.forEach((frame, index) => {
    const useFull = input.mode === 'full' || (keepFirst && index === 0)
    const top = useFull ? 0 : clamp(input.band.top, 0, 0.98)
    const fraction = useFull ? 1 : clamp(input.band.height, 0.02, 1 - top)
    const safeHeight = Math.max(1, frame.height)
    const safeWidth = Math.max(1, frame.width)
    let cropY = Math.round(top * safeHeight)
    let cropHeight = Math.max(1, Math.round(fraction * safeHeight))
    if (cropY >= safeHeight) cropY = safeHeight - 1
    if (cropY + cropHeight > safeHeight) cropHeight = safeHeight - cropY
    const destHeight = Math.max(1, Math.round((cropHeight * outWidth) / safeWidth))
    const captionHeight = frame.caption ? Math.max(18, Math.round(outWidth * 0.04)) : 0
    rows.push({
      index,
      cropY,
      cropHeight,
      destY: y,
      destHeight,
      captionY: y + destHeight,
      captionHeight,
    })
    y += destHeight + captionHeight
  })
  return { width: outWidth, height: y, rows }
}

export function planStitch(input: PlanInput): StitchPlan {
  const maxEdge = input.maxEdge ?? MAX_CANVAS_EDGE
  const maxPixels = input.maxPixels ?? MAX_CANVAS_PIXELS
  if (input.frames.length === 0) {
    return { width: 0, height: 0, scale: input.scale, rows: [], capped: false }
  }

  const base = input.targetWidth > 0 ? input.targetWidth : input.frames[0].width
  const requestedWidth = Math.max(1, Math.round(base * (input.scale > 0 ? input.scale : 1)))
  let plan = build(input.frames, requestedWidth, input)
  const overflows = () => plan.width > maxEdge || plan.height > maxEdge || plan.width * plan.height > maxPixels
  if (!overflows()) {
    return { ...plan, scale: input.scale, capped: false }
  }

  const edgeFit = Math.min(maxEdge / plan.width, maxEdge / Math.max(1, plan.height))
  const pixelFit = Math.sqrt(maxPixels / Math.max(1, plan.width * plan.height))
  let outWidth = Math.max(1, Math.floor(plan.width * Math.min(edgeFit, pixelFit) * 0.98))
  plan = build(input.frames, outWidth, input)
  if (overflows()) {
    outWidth = Math.max(1, Math.floor(outWidth * 0.9))
    plan = build(input.frames, outWidth, input)
  }
  return { ...plan, scale: input.scale, capped: true }
}

export function formatTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00.00'
  const minutes = Math.floor(seconds / 60)
  const remain = seconds - minutes * 60
  return `${minutes}:${remain.toFixed(2).padStart(5, '0')}`
}

/** 文件名自然排序：shot-2 在 shot-10 前面。 */
export function compareFileNames(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}
