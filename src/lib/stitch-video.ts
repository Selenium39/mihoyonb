/** 视频采样点。上限用来卡住寻址时间，很短的一句仍可能落在两个点之间。 */

export const MAX_VIDEO_SAMPLES = 320

export function sampleCountForDuration(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0.05) return 0
  const byRate = Math.ceil(duration * 4)
  return Math.max(4, Math.min(MAX_VIDEO_SAMPLES, byRate))
}

/** 采样落在每段中点，避开片头片尾正好卡在 duration 上的空帧。 */
export function sampleTimes(duration: number, count: number): number[] {
  if (count <= 0 || !Number.isFinite(duration) || duration <= 0) return []
  const end = Math.max(0, duration - 0.04)
  const times: number[] = []
  for (let i = 0; i < count; i++) {
    times.push(Math.min(end, ((i + 0.5) / count) * duration))
  }
  return times
}
