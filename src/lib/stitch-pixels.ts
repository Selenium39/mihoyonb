/**
 * 把一块 RGBA 压成按行的灰度、横向边缘，以及字幕条带上的笔画签名。
 * 不依赖 DOM，测试可以直接喂像素。
 */

import type { Band } from './stitch-band'

export interface RowProfile {
  mean: Float64Array
  edge: Float64Array
  gray: Uint8Array
}

export interface BandSignature {
  /** 零均值、单位长度的横向梯度，用来比较「这一句长得像不像」 */
  vector: Float64Array
  /** 归一化之前的平均梯度强度，字越清楚越高 */
  contrast: number
}

const SIG_WIDTH = 32
const SIG_HEIGHT = 8

export function rgbaToProfile(data: Uint8ClampedArray, width: number, height: number): RowProfile {
  const gray = new Uint8Array(width * height)
  const mean = new Float64Array(height)
  const edge = new Float64Array(height)
  if (width <= 0 || height <= 0) return { mean, edge, gray }

  for (let y = 0; y < height; y++) {
    let sum = 0
    let edgeSum = 0
    const row = y * width
    for (let x = 0; x < width; x++) {
      const offset = (row + x) * 4
      const value = (data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114) | 0
      gray[row + x] = value
      sum += value
      if (x > 0) edgeSum += Math.abs(value - gray[row + x - 1])
    }
    mean[y] = sum / width
    edge[y] = width > 1 ? edgeSum / (width - 1) : 0
  }

  return { mean, edge, gray }
}

function sampleGray(gray: ArrayLike<number>, width: number, height: number, x: number, y: number): number {
  const sx = Math.min(width - 1, Math.max(0, x))
  const sy = Math.min(height - 1, Math.max(0, y))
  return gray[sy * width + sx] ?? 0
}

/** 从条带里抽出笔画形状。条带用画面高度的比例表示，和原图像素尺寸无关。 */
export function bandSignature(
  gray: ArrayLike<number>,
  width: number,
  height: number,
  band: Band,
): BandSignature {
  const vector = new Float64Array(SIG_WIDTH * SIG_HEIGHT)
  if (width < 2 || height < 1) return { vector, contrast: 0 }

  const y0 = Math.min(height - 1, Math.max(0, Math.floor(band.top * height)))
  const y1 = Math.min(height, Math.max(y0 + 1, Math.ceil((band.top + band.height) * height)))
  const bandHeight = Math.max(1, y1 - y0)

  for (let sy = 0; sy < SIG_HEIGHT; sy++) {
    const gy = y0 + ((sy + 0.5) / SIG_HEIGHT) * bandHeight
    for (let sx = 0; sx < SIG_WIDTH; sx++) {
      const gx = ((sx + 0.5) / SIG_WIDTH) * (width - 1)
      const left = sampleGray(gray, width, height, Math.floor(gx), Math.floor(gy))
      const right = sampleGray(gray, width, height, Math.min(width - 1, Math.floor(gx) + 1), Math.floor(gy))
      vector[sy * SIG_WIDTH + sx] = right - left
    }
  }

  let contrast = 0
  for (let i = 0; i < vector.length; i++) contrast += Math.abs(vector[i])
  contrast /= vector.length

  let mean = 0
  for (let i = 0; i < vector.length; i++) mean += vector[i]
  mean /= vector.length
  let norm = 0
  for (let i = 0; i < vector.length; i++) {
    vector[i] -= mean
    norm += vector[i] * vector[i]
  }
  norm = Math.sqrt(norm)
  if (norm < 1e-8) return { vector, contrast }
  for (let i = 0; i < vector.length; i++) vector[i] /= norm
  return { vector, contrast }
}
