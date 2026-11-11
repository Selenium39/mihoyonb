/**
 * 截图条带与视频换句的纯计算。
 *
 * 截图：把每张图压成按行的灰度，行与行之间变化大的连续区域就是要留下的条带。
 * 视频：烧在画面里的字幕是稳定、锐利的横向边缘；一句换成下一句时，笔画形状变了，亮度包络未必变。
 * 这里不读字，只比较像素。
 */

export interface Band {
  /** 条带顶部，占画面高度的 0–1 */
  top: number
  /** 条带高度，占画面高度的 0–1 */
  height: number
}

export interface BandDetection {
  band: Band
  /** 条带内外差异有多明显，0–1 */
  confidence: number
}

export interface BandOptions {
  minFraction?: number
  maxFraction?: number
  /** 结果两侧再留出的高度比例，避免切到笔画 */
  padFraction?: number
  /** 两段变化相距不超过这个比例时并成一条，用来跨过行距 */
  gapFraction?: number
}

export interface LineSegment {
  /** 含首尾，对应采样下标 */
  start: number
  end: number
  /** 这一句里对比度最高的采样，用来当代表帧 */
  pick: number
}

export function percentile(values: ArrayLike<number>, p: number): number {
  const n = values.length
  if (n === 0) return 0
  const sorted = Array.from(values).sort((a, b) => a - b)
  const index = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))))
  return sorted[index]
}

/** 每一行在各帧之间的标准差。只有一张图时全是 0。 */
export function varianceScores(profiles: ArrayLike<number>[]): Float64Array {
  if (profiles.length === 0) return new Float64Array()
  const rows = profiles[0].length
  const scores = new Float64Array(rows)
  const count = profiles.length
  if (count < 2 || rows === 0) return scores
  for (let y = 0; y < rows; y++) {
    let sum = 0
    for (let i = 0; i < count; i++) sum += profiles[i][y]
    const mean = sum / count
    let acc = 0
    for (let i = 0; i < count; i++) {
      const delta = profiles[i][y] - mean
      acc += delta * delta
    }
    scores[y] = Math.sqrt(acc / count)
  }
  return scores
}

export function smoothScores(scores: ArrayLike<number>, radius = 2): Float64Array {
  const n = scores.length
  const out = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let sum = 0
    let count = 0
    const from = Math.max(0, i - radius)
    const to = Math.min(n - 1, i + radius)
    for (let j = from; j <= to; j++) {
      sum += scores[j]
      count += 1
    }
    out[i] = count ? sum / count : 0
  }
  return out
}

/** 各帧同一行的中位数。视频里用它压住偶尔闪过的高光。 */
export function medianProfile(profiles: ArrayLike<number>[]): Float64Array {
  if (profiles.length === 0) return new Float64Array()
  const rows = profiles[0].length
  const out = new Float64Array(rows)
  const column = new Array<number>(profiles.length)
  for (let y = 0; y < rows; y++) {
    for (let i = 0; i < profiles.length; i++) column[i] = profiles[i][y]
    column.sort((a, b) => a - b)
    out[y] = column[Math.floor((column.length - 1) / 2)] ?? 0
  }
  return out
}

/**
 * 在一行分数里找变化（或边缘）最集中的连续段。
 * 整幅都差不多、或者高分段几乎铺满画面时返回 null，调用方改走整幅堆叠。
 */
export function bandFromScores(scores: ArrayLike<number>, options: BandOptions = {}): BandDetection | null {
  const n = scores.length
  if (n === 0) return null
  const minFraction = options.minFraction ?? 0.04
  const maxFraction = options.maxFraction ?? 0.9
  const padFraction = options.padFraction ?? 0.012
  const gapFraction = options.gapFraction ?? 0.02
  // 噪声取偏低的分位，而不是中位数。聊天记录里会变化的是大半个画面，
  // 中位数会落在内容区里，阈值就被抬得太高，条带反而消失。
  const noise = percentile(scores, 0.15)
  const upper = percentile(scores, 0.98)
  const span = upper - noise
  if (span <= 1e-4) return null
  const threshold = noise + 0.45 * span

  const active = new Uint8Array(n)
  for (let i = 0; i < n; i++) active[i] = scores[i] >= threshold ? 1 : 0

  const gap = Math.max(1, Math.round(n * gapFraction))
  let lastActive = -1
  for (let i = 0; i < n; i++) {
    if (!active[i]) continue
    if (lastActive >= 0 && i - lastActive > 1 && i - lastActive <= gap) {
      for (let j = lastActive; j <= i; j++) active[j] = 1
    }
    lastActive = i
  }

  let bestStart = -1
  let bestEnd = -1
  let bestSum = -Infinity
  let cursor = 0
  while (cursor < n) {
    if (!active[cursor]) {
      cursor += 1
      continue
    }
    let end = cursor
    while (end < n && active[end]) end += 1
    const fraction = (end - cursor) / n
    if (fraction >= minFraction && fraction <= maxFraction) {
      let sum = 0
      for (let k = cursor; k < end; k++) sum += scores[k] - threshold
      if (sum > bestSum) {
        bestSum = sum
        bestStart = cursor
        bestEnd = end
      }
    }
    cursor = end
  }
  if (bestStart < 0) return null

  const pad = Math.round(n * padFraction)
  const start = Math.max(0, bestStart - pad)
  const end = Math.min(n, bestEnd + pad)
  let inside = 0
  let outside = 0
  let outsideCount = 0
  for (let k = 0; k < n; k++) {
    if (k >= start && k < end) inside += scores[k]
    else {
      outside += scores[k]
      outsideCount += 1
    }
  }
  const insideMean = inside / Math.max(1, end - start)
  const outsideMean = outsideCount ? outside / outsideCount : 0
  const confidence = Math.max(0, Math.min(1, (insideMean - outsideMean) / (insideMean + 1e-6)))

  return {
    band: { top: start / n, height: (end - start) / n },
    confidence,
  }
}

export function detectChangeBand(profiles: ArrayLike<number>[], options?: BandOptions): BandDetection | null {
  if (profiles.length < 2) return null
  const rows = profiles[0]?.length ?? 0
  if (rows === 0 || profiles.some((profile) => profile.length !== rows)) return null
  // 聊天截图里常常只有字在变，气泡框不动。字被压成很少几行，
  // 行距会把它们拆开；并上这段空白，再向两侧垫一点，才能留下整段对话而不是切到字。
  return bandFromScores(smoothScores(varianceScores(profiles)), {
    minFraction: 0.012,
    gapFraction: 0.12,
    padFraction: 0.035,
    ...options,
  })
}

/** 视频字幕带：各采样行边缘能量的中位数，取最集中的一段。字幕通常是窄条，所以高度上限更紧。 */
export function detectEdgeBand(edgeProfiles: ArrayLike<number>[]): BandDetection | null {
  if (edgeProfiles.length === 0) return null
  const rows = edgeProfiles[0]?.length ?? 0
  if (rows === 0 || edgeProfiles.some((profile) => profile.length !== rows)) return null
  const smoothed = smoothScores(medianProfile(edgeProfiles), 1)
  return (
    bandFromScores(smoothed, { minFraction: 0.025, maxFraction: 0.42, padFraction: 0.01 }) ??
    bandFromScores(smoothed, { minFraction: 0.025, maxFraction: 0.6, padFraction: 0.01 })
  )
}

/** 已归一化向量的余弦距离。相同为 0，正交约为 1。 */
export function cosineDistance(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const n = Math.min(a.length, b.length)
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom < 1e-8) return 0
  return 1 - dot / denom
}

/**
 * 相邻采样的字形距离出现局部高峰时切开。
 * 高峰至少要离开中位数一段，并且两句之间至少隔一个采样，避免过渡帧被当成新的一句。
 */
export function segmentBySignature(
  signatures: ArrayLike<number>[],
  contrasts: ArrayLike<number>,
  threshold = 0.18,
): LineSegment[] {
  const count = signatures.length
  if (count === 0) return []
  if (count === 1) return [{ start: 0, end: 0, pick: 0 }]

  const distances: number[] = []
  for (let i = 1; i < count; i++) distances.push(cosineDistance(signatures[i - 1], signatures[i]))
  const median = percentile(distances, 0.5)
  const cut = Math.max(threshold, median + 0.12)
  const starts = [0]
  for (let i = 0; i < distances.length; i++) {
    const prev = i > 0 ? distances[i - 1] : -1
    const next = i + 1 < distances.length ? distances[i + 1] : -1
    if (distances[i] >= cut && distances[i] >= prev && distances[i] >= next) {
      const at = i + 1
      if (at - starts[starts.length - 1] >= 2) starts.push(at)
    }
  }

  const segments: LineSegment[] = []
  for (let s = 0; s < starts.length; s++) {
    const start = starts[s]
    const end = (s + 1 < starts.length ? starts[s + 1] : count) - 1
    let pick = start
    let best = -Infinity
    for (let i = start; i <= end; i++) {
      const contrast = contrasts[i] ?? 0
      if (contrast > best) {
        best = contrast
        pick = i
      }
    }
    segments.push({ start, end, pick })
  }
  return segments
}
