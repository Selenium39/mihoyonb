/**
 * 浏览器侧的读图、视频采样和画布导出。
 * 条带怎么算在 stitch-band / stitch-pixels，这里只负责把像素送进去、把长图画出来。
 */

import { rgbaToProfile, type RowProfile } from '@/lib/stitch-pixels'
import { planStitch, type StitchPlan } from '@/lib/stitch-plan'
import { MAX_VIDEO_SAMPLES, sampleCountForDuration, sampleTimes } from '@/lib/stitch-video'
import type { Band } from '@/lib/stitch-band'

export const PROFILE_WIDTH = 160
export const PROFILE_ROWS = 180

export interface VideoSample {
  time: number
  profile: RowProfile
}

export interface StitchVisual {
  source: CanvasImageSource
  width: number
  height: number
  caption: string | null
}

export async function profileFromSource(source: CanvasImageSource): Promise<RowProfile> {
  const canvas = document.createElement('canvas')
  canvas.width = PROFILE_WIDTH
  canvas.height = PROFILE_ROWS
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(source, 0, 0, PROFILE_WIDTH, PROFILE_ROWS)
  const image = ctx.getImageData(0, 0, PROFILE_WIDTH, PROFILE_ROWS)
  return rgbaToProfile(image.data, PROFILE_WIDTH, PROFILE_ROWS)
}

export async function loadImageFile(file: File): Promise<{
  bitmap: ImageBitmap
  width: number
  height: number
  profile: RowProfile
}> {
  const bitmap = await createImageBitmap(file)
  try {
    const profile = await profileFromSource(bitmap)
    return { bitmap, width: bitmap.width, height: bitmap.height, profile }
  } catch (error) {
    bitmap.close()
    throw error
  }
}

export function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  const duration = Number.isFinite(video.duration) ? video.duration : time
  const target = Math.min(Math.max(time, 0), Math.max(duration - 0.001, 0))
  if (Math.abs(video.currentTime - target) < 0.03 && video.readyState >= 2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('seek-timeout'))
    }, 8000)
    const onSeeked = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('seek'))
    }
    const cleanup = () => {
      window.clearTimeout(timer)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    try {
      video.currentTime = target
    } catch (error) {
      cleanup()
      reject(error instanceof Error ? error : new Error('seek'))
    }
  })
}

export function openVideo(file: File): Promise<{ video: HTMLVideoElement; url: string }> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'auto'
  video.muted = true
  video.playsInline = true
  video.src = url
  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup()
      resolve({ video, url })
    }
    const onError = () => {
      cleanup()
      URL.revokeObjectURL(url)
      reject(new Error('video'))
    }
    const cleanup = () => {
      video.removeEventListener('loadeddata', onReady)
      video.removeEventListener('error', onError)
    }
    video.addEventListener('loadeddata', onReady)
    video.addEventListener('error', onError)
  })
}

function finiteDuration(value: number): boolean {
  return Number.isFinite(value) && value > 0.05
}

/**
 * 有些 WebM（尤其是边录边存的）在 loadeddata 时 duration 还是 NaN。
 * 寻址到很远的位置后，浏览器会把播放头停在结尾，并补上真实时长。
 */
async function knownDuration(video: HTMLVideoElement): Promise<number> {
  if (finiteDuration(video.duration)) return video.duration
  try {
    video.currentTime = 1e101
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        cleanup()
        reject(new Error('seek-timeout'))
      }, 8000)
      const onSeeked = () => {
        cleanup()
        resolve()
      }
      const cleanup = () => {
        window.clearTimeout(timer)
        video.removeEventListener('seeked', onSeeked)
      }
      video.addEventListener('seeked', onSeeked)
    })
  } catch {
    // 不能寻址时改走播放采样
  }
  const found = finiteDuration(video.duration) ? video.duration : finiteDuration(video.currentTime) ? video.currentTime : 0
  if (found > 0) {
    try {
      await seekTo(video, 0)
    } catch {
      // 回到开头失败时，后面的采样点仍会各自再寻址一次
    }
  }
  return found
}

/** 文件不能寻址时按播放进度抽帧。墙钟设上限，避免一段读不出结尾的片子一直播。 */
async function sampleByPlayback(
  video: HTMLVideoElement,
  onProgress: (done: number, total: number) => void,
  shouldAbort: () => boolean,
): Promise<VideoSample[]> {
  const samples: VideoSample[] = []
  try {
    await video.play()
  } catch {
    return samples
  }
  let settled = false
  await new Promise<void>((resolve) => {
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('ended', finish)
      video.pause()
      resolve()
    }
    const onTime = () => {
      if (settled || shouldAbort() || samples.length >= MAX_VIDEO_SAMPLES) {
        finish()
        return
      }
      const time = video.currentTime
      if (!Number.isFinite(time)) return
      const last = samples.length > 0 ? samples[samples.length - 1].time : -1
      if (time - last < 0.2) return
      void profileFromSource(video)
        .then((profile) => {
          if (settled) return
          samples.push({ time, profile })
          onProgress(samples.length, samples.length)
        })
        .catch(() => undefined)
    }
    const timer = window.setTimeout(finish, 90_000)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('ended', finish)
  })
  return samples
}

export async function sampleVideo(
  video: HTMLVideoElement,
  onProgress: (done: number, total: number) => void,
  shouldAbort: () => boolean,
): Promise<VideoSample[]> {
  const duration = await knownDuration(video)
  const times = sampleTimes(duration, sampleCountForDuration(duration))
  const samples: VideoSample[] = []
  let missed = 0
  for (let i = 0; i < times.length; i++) {
    if (shouldAbort()) break
    try {
      await seekTo(video, times[i])
      const profile = await profileFromSource(video)
      samples.push({ time: times[i], profile })
    } catch {
      missed += 1
      // 开头连续寻址失败，多半是整段都不能跳，不必再空等
      if (samples.length === 0 && missed >= 2) break
    }
    onProgress(i + 1, times.length)
  }
  if (samples.length > 0 || shouldAbort()) return samples
  return sampleByPlayback(video, onProgress, shouldAbort)
}

export async function snapshotVideo(
  video: HTMLVideoElement,
  time: number,
  maxWidth: number,
): Promise<{ bitmap: ImageBitmap; width: number; height: number }> {
  await seekTo(video, time)
  const sourceWidth = video.videoWidth || 1
  const sourceHeight = video.videoHeight || 1
  const scale = Math.min(1, maxWidth / sourceWidth)
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(video, 0, 0, width, height)
  const bitmap = await createImageBitmap(canvas)
  return { bitmap, width, height }
}

export function grayThumb(gray: Uint8Array, width: number, height: number): string {
  const src = document.createElement('canvas')
  src.width = width
  src.height = height
  const srcCtx = src.getContext('2d')
  if (!srcCtx) return ''
  const image = srcCtx.createImageData(width, height)
  for (let i = 0; i < gray.length; i++) {
    const offset = i * 4
    const value = gray[i]
    image.data[offset] = value
    image.data[offset + 1] = value
    image.data[offset + 2] = value
    image.data[offset + 3] = 255
  }
  srcCtx.putImageData(image, 0, 0)
  const thumb = document.createElement('canvas')
  thumb.width = 96
  thumb.height = Math.max(1, Math.round((height * 96) / Math.max(1, width)))
  const ctx = thumb.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(src, 0, 0, thumb.width, thumb.height)
  return thumb.toDataURL('image/jpeg', 0.7)
}

export function releaseVideo(video: HTMLVideoElement, url: string) {
  video.pause()
  video.removeAttribute('src')
  video.load()
  URL.revokeObjectURL(url)
}

export function drawStitch(
  visuals: StitchVisual[],
  options: {
    mode: 'full' | 'band'
    band: Band
    targetWidth: number
    scale: number
    keepFirstFull: boolean
    maxEdge?: number
    maxPixels?: number
  },
): { canvas: HTMLCanvasElement; plan: StitchPlan } {
  const plan = planStitch({
    frames: visuals.map((visual) => ({
      width: visual.width,
      height: visual.height,
      caption: Boolean(visual.caption),
    })),
    mode: options.mode,
    band: options.band,
    targetWidth: options.targetWidth,
    scale: options.scale,
    keepFirstFull: options.keepFirstFull,
    maxEdge: options.maxEdge,
    maxPixels: options.maxPixels,
  })
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, plan.width)
  canvas.height = Math.max(1, plan.height)
  const ctx = canvas.getContext('2d')
  if (!ctx || plan.rows.length === 0) return { canvas, plan }

  ctx.fillStyle = '#111111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (const row of plan.rows) {
    const visual = visuals[row.index]
    if (!visual) continue
    ctx.drawImage(
      visual.source,
      0,
      row.cropY,
      visual.width,
      row.cropHeight,
      0,
      row.destY,
      plan.width,
      row.destHeight,
    )
    if (row.captionHeight > 0 && visual.caption) {
      ctx.fillStyle = '#111111'
      ctx.fillRect(0, row.captionY, plan.width, row.captionHeight)
      ctx.fillStyle = '#f4f4f5'
      const fontSize = Math.max(12, Math.round(row.captionHeight * 0.55))
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textBaseline = 'middle'
      ctx.fillText(visual.caption, Math.round(plan.width * 0.02), row.captionY + row.captionHeight / 2)
    }
  }
  return { canvas, plan }
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('png'))
    }, 'image/png')
  })
}
