/**
 * 字幕（SRT / WebVTT）解析与生成纯函数库
 *
 * 全部为无副作用的纯函数，可在浏览器与 Node 环境中使用。
 * 时间统一用毫秒整数表示，保证 SRT ↔ VTT 往返转换时间码无损。
 */

export type SubtitleFormat = 'srt' | 'vtt'

export interface SubtitleCue {
  /** 开始时间（毫秒） */
  start: number
  /** 结束时间（毫秒） */
  end: number
  /** 字幕文本（多行以 \n 连接） */
  text: string
}

export interface ParseResult {
  cues: SubtitleCue[]
  format: SubtitleFormat
  /** 解析过程中的提示（跳过的块等） */
  warnings: string[]
}

export interface OverlapIssue {
  /** 后一条的序号（从 1 开始） */
  index: number
  /** 前一条结束时间（毫秒） */
  prevEnd: number
  /** 后一条开始时间（毫秒） */
  nextStart: number
}

/** 时间码正则：小时可省略或一位（0:00:01,000），毫秒分隔符 , 与 . 均容忍 */
const TIMESTAMP_RE = /^(?:(\d{1,3}):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/

/** 解析单个时间码为毫秒，失败返回 null */
export function parseTimestamp(raw: string): number | null {
  const m = raw.trim().match(TIMESTAMP_RE)
  if (!m) return null
  const hours = m[1] ? parseInt(m[1], 10) : 0
  const minutes = parseInt(m[2], 10)
  const seconds = parseInt(m[3], 10)
  const millis = parseInt((m[4] ?? '').padEnd(3, '0'), 10)
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + millis
}

/** 毫秒 → 时间码字符串（SRT 用 ,、VTT 用 .；统一输出两位小时、三位毫秒） */
export function formatTimestamp(ms: number, format: SubtitleFormat): string {
  const safe = Math.max(0, Math.round(ms))
  const h = Math.floor(safe / 3600000)
  const m = Math.floor((safe % 3600000) / 60000)
  const s = Math.floor((safe % 60000) / 1000)
  const mil = safe % 1000
  const sep = format === 'srt' ? ',' : '.'
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}${sep}${String(mil).padStart(3, '0')}`
}

/**
 * 识别字幕格式：优先看 WEBVTT 头，其次看首个时间码行的毫秒分隔符（, 为 SRT、. 为 VTT）。
 * 无法识别返回 null。
 */
export function detectFormat(text: string): SubtitleFormat | null {
  const normalized = text.replace(/^\uFEFF/, '').trim()
  if (!normalized) return null
  if (/^WEBVTT/i.test(normalized)) return 'vtt'
  for (const line of normalized.split(/\r\n|\r|\n/)) {
    if (!line.includes('-->')) continue
    const arrow = line.indexOf('-->')
    const before = line.slice(0, arrow)
    // 箭头右侧可能带 VTT cue 设置（align:start 等），只取第一个 token
    const after = line.slice(arrow + 3).trim().split(/\s+/)[0] ?? ''
    if (before.includes(',') || after.includes(',')) return 'srt'
    if (before.includes('.') || after.includes('.')) return 'vtt'
  }
  return null
}

/**
 * 容错解析字幕文本为条目数组。
 * 容忍：CRLF、BOM、缺序号、多余空行、一位小时格式、VTT 的 NOTE / STYLE / REGION 块。
 */
export function parseSubtitle(text: string, format?: SubtitleFormat): ParseResult {
  const warnings: string[] = []
  const normalized = text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')

  const detected = format ?? detectFormat(normalized)
  if (!detected) {
    warnings.push('未能自动识别字幕格式，已按 SRT 尝试解析')
  }
  const fmt: SubtitleFormat = detected ?? 'srt'

  // 按空行分块（空行可含空白字符、可连续多个）
  const blocks = normalized
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  const cues: SubtitleCue[] = []
  let skippedBlocks = 0

  for (const block of blocks) {
    const lines = block.split('\n')
    const first = lines[0].trim()

    // VTT：跳过 WEBVTT 头块与 NOTE / STYLE / REGION 块（转换 SRT 时即被剥离）
    if (/^WEBVTT/i.test(first)) continue
    if (/^(NOTE|STYLE|REGION)\b/i.test(first)) {
      skippedBlocks++
      continue
    }

    const timeIdx = lines.findIndex((line) => line.includes('-->'))
    if (timeIdx === -1) {
      skippedBlocks++
      continue
    }

    const parts = lines[timeIdx].split('-->')
    const endRaw = (parts[1] ?? '').trim().split(/\s+/)[0] ?? ''
    const start = parseTimestamp(parts[0] ?? '')
    const end = parseTimestamp(endRaw)
    if (start === null || end === null) {
      skippedBlocks++
      continue
    }

    // 时间行之前的内容视为序号行（纯数字时），其余杂项一并忽略；序号输出时统一重排
    cues.push({
      start,
      end,
      text: lines.slice(timeIdx + 1).join('\n').trim(),
    })
  }

  if (skippedBlocks > 0) {
    warnings.push(`已跳过 ${skippedBlocks} 个无法识别的块（如 NOTE / STYLE 注释块）`)
  }

  return { cues, format: fmt, warnings }
}

/** 序号统一重排为 1..n，输出 SRT 文本 */
export function toSrt(cues: SubtitleCue[]): string {
  if (cues.length === 0) return ''
  return (
    cues
      .map((cue, i) => {
        const ts = `${formatTimestamp(cue.start, 'srt')} --> ${formatTimestamp(cue.end, 'srt')}`
        return `${i + 1}\n${ts}\n${cue.text}`
      })
      .join('\n\n') + '\n'
  )
}

/** 序号统一重排为 1..n，输出 VTT 文本（带 WEBVTT 头） */
export function toVtt(cues: SubtitleCue[]): string {
  if (cues.length === 0) return 'WEBVTT\n'
  const body = cues
    .map((cue, i) => {
      const ts = `${formatTimestamp(cue.start, 'vtt')} --> ${formatTimestamp(cue.end, 'vtt')}`
      return `${i + 1}\n${ts}\n${cue.text}`
    })
    .join('\n\n')
  return `WEBVTT\n\n${body}\n`
}

/** 按指定格式序列化 */
export function serializeSubtitle(cues: SubtitleCue[], format: SubtitleFormat): string {
  return format === 'vtt' ? toVtt(cues) : toSrt(cues)
}

/** 时间轴整体平移（毫秒）；平移后时间不允许为负，截为 0 */
export function shiftCues(cues: SubtitleCue[], offsetMs: number): SubtitleCue[] {
  return cues.map((cue) => ({
    ...cue,
    start: Math.max(0, cue.start + offsetMs),
    end: Math.max(0, cue.end + offsetMs),
  }))
}

/** 解析「秒[.毫秒]」偏移输入（如 -0.5、1.200），返回毫秒；非法返回 null */
export function parseOffsetSeconds(input: string): number | null {
  const trimmed = input.trim()
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(trimmed)) return null
  const value = parseFloat(trimmed)
  if (!Number.isFinite(value)) return null
  return Math.round(value * 1000)
}

/** 顺序拼接两份字幕并重排序号；可选将第二份整体后移到第一份结束时刻 */
export function mergeCues(
  first: SubtitleCue[],
  second: SubtitleCue[],
  options?: { shiftSecondToEnd?: boolean }
): SubtitleCue[] {
  let shifted = second
  if (options?.shiftSecondToEnd) {
    const offset = first.reduce((max, cue) => Math.max(max, cue.end), 0)
    shifted = shiftCues(second, offset)
  }
  return [...first, ...shifted]
}

/** 检测相邻条目的时间码重叠（上一条结束晚于下一条开始） */
export function detectOverlaps(cues: SubtitleCue[]): OverlapIssue[] {
  const issues: OverlapIssue[] = []
  for (let i = 1; i < cues.length; i++) {
    if (cues[i - 1].end > cues[i].start) {
      issues.push({ index: i + 1, prevEnd: cues[i - 1].end, nextStart: cues[i].start })
    }
  }
  return issues
}

/** 自动修正重叠：上一条结束时间改为下一条开始（顺序衔接），不产生倒挂时长 */
export function fixOverlaps(cues: SubtitleCue[]): { cues: SubtitleCue[]; fixedCount: number } {
  const result = cues.map((cue) => ({ ...cue }))
  let fixedCount = 0
  for (let i = 1; i < result.length; i++) {
    if (result[i - 1].end > result[i].start) {
      result[i - 1].end = Math.max(result[i - 1].start, result[i].start)
      fixedCount++
    }
  }
  return { cues: result, fixedCount }
}
