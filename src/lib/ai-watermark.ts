/**
 * 文本隐藏字符检测与清洗。
 *
 * 只处理能在浏览器里用码位判断的字符：零宽字符、特殊空格、弯引号、
 * 破折号、Markdown 记号等。统计型水印（例如 SynthID-Text）藏在用词里，
 * 不在这个模块的范围内。
 *
 * 码位一律用数字保存，源码里不出现真正的不可见字符。
 */

export type RuleAction = 'strip' | 'space' | 'newline' | 'map'

export type MapOption = 'quotes' | 'dashes' | 'ellipsis'

export type CleanOptionKey =
  | 'invisibles'
  | 'spaces'
  | 'quotes'
  | 'dashes'
  | 'ellipsis'
  | 'markdown'
  | 'whitespace'
  | 'homoglyphs'
  | 'emoji'

/** 单个码位，或闭区间 [from, to] */
export type CodeSpan = number | readonly [number, number]

export interface WatermarkRule {
  id: string
  abbr: string
  items: readonly CodeSpan[]
  action: RuleAction
  option?: MapOption
  to?: string
}

export type CleanOptions = Record<CleanOptionKey, boolean>

export const DEFAULT_OPTIONS: CleanOptions = {
  invisibles: true,
  spaces: true,
  quotes: true,
  dashes: true,
  ellipsis: true,
  markdown: true,
  whitespace: true,
  homoglyphs: false,
  emoji: false,
}

export const OPTION_KEYS = Object.keys(DEFAULT_OPTIONS) as CleanOptionKey[]

export const RULES = [
  { id: 'zwsp', abbr: 'ZWSP', items: [0x200b], action: 'strip' },
  { id: 'zwnj', abbr: 'ZWNJ', items: [0x200c], action: 'strip' },
  { id: 'zwj', abbr: 'ZWJ', items: [0x200d], action: 'strip' },
  { id: 'wj', abbr: 'WJ', items: [0x2060], action: 'strip' },
  { id: 'bom', abbr: 'BOM', items: [0xfeff], action: 'strip' },
  { id: 'shy', abbr: 'SHY', items: [0x00ad], action: 'strip' },
  { id: 'cgj', abbr: 'CGJ', items: [0x034f], action: 'strip' },
  {
    id: 'bidi',
    abbr: 'BIDI',
    items: [0x200e, 0x200f, 0x061c, [0x202a, 0x202e], [0x2066, 0x2069]],
    action: 'strip',
  },
  { id: 'mong', abbr: 'MVS', items: [[0x180b, 0x180e]], action: 'strip' },
  { id: 'imath', abbr: 'IMO', items: [[0x2061, 0x2064]], action: 'strip' },
  { id: 'shape', abbr: 'SHAPE', items: [[0x206a, 0x206f]], action: 'strip' },
  { id: 'filler', abbr: 'FILL', items: [0x115f, 0x1160, 0x3164, 0xffa0], action: 'strip' },
  { id: 'khmer', abbr: 'KHMER', items: [0x17b4, 0x17b5], action: 'strip' },
  { id: 'anno', abbr: 'ANNO', items: [[0xfff9, 0xfffc]], action: 'strip' },
  { id: 'vs', abbr: 'VS', items: [[0xfe00, 0xfe0f]], action: 'strip' },
  { id: 'ivs', abbr: 'IVS', items: [[0xe0100, 0xe01ef]], action: 'strip' },
  { id: 'tag', abbr: 'TAG', items: [[0xe0000, 0xe007f]], action: 'strip' },
  {
    id: 'ctrl',
    abbr: 'CTRL',
    items: [[0x0000, 0x0008], 0x000b, 0x000c, [0x000e, 0x001f], 0x007f, [0x0080, 0x0084], [0x0086, 0x009f]],
    action: 'strip',
  },
  { id: 'nnbsp', abbr: 'NNBSP', items: [0x202f], action: 'space' },
  { id: 'nbsp', abbr: 'NBSP', items: [0x00a0], action: 'space' },
  { id: 'tspace', abbr: 'SP', items: [[0x2000, 0x200a]], action: 'space' },
  { id: 'mmsp', abbr: 'MMSP', items: [0x205f], action: 'space' },
  { id: 'ogham', abbr: 'OGSP', items: [0x1680], action: 'space' },
  { id: 'idsp', abbr: 'IDSP', items: [0x3000], action: 'space' },
  { id: 'braille', abbr: 'BRAILLE', items: [0x2800], action: 'space' },
  { id: 'cr', abbr: 'CR', items: [0x000d], action: 'newline' },
  { id: 'nel', abbr: 'NEL', items: [0x0085], action: 'newline' },
  { id: 'lsps', abbr: 'LS', items: [0x2028, 0x2029], action: 'newline' },
  {
    id: 'dquo',
    abbr: 'DQ',
    items: [0x201c, 0x201d, 0x201e, 0x00ab, 0x00bb, 0x2033],
    action: 'map',
    option: 'quotes',
    to: '"',
  },
  {
    id: 'squo',
    abbr: 'SQ',
    items: [0x2018, 0x2019, 0x201a, 0x2039, 0x203a, 0x2032],
    action: 'map',
    option: 'quotes',
    to: "'",
  },
  {
    id: 'dash',
    abbr: 'DASH',
    items: [0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015, 0x2212],
    action: 'map',
    option: 'dashes',
    to: '-',
  },
  { id: 'ellip', abbr: 'ELLIP', items: [0x2026], action: 'map', option: 'ellipsis', to: '...' },
] as const satisfies readonly WatermarkRule[]

export type RuleId = (typeof RULES)[number]['id']

/** 西里尔 / 希腊字母里，和拉丁字母长得一样的那些 */
const HOMOGLYPHS: Record<number, string> = {
  0x0430: 'a',
  0x0435: 'e',
  0x043e: 'o',
  0x0440: 'p',
  0x0441: 'c',
  0x0443: 'y',
  0x0445: 'x',
  0x0456: 'i',
  0x0455: 's',
  0x0458: 'j',
  0x0410: 'A',
  0x0412: 'B',
  0x0415: 'E',
  0x041a: 'K',
  0x041c: 'M',
  0x041d: 'H',
  0x041e: 'O',
  0x0420: 'P',
  0x0421: 'C',
  0x0422: 'T',
  0x0425: 'X',
  0x0405: 'S',
  0x0406: 'I',
  0x0408: 'J',
  0x04bb: 'h',
  0x0391: 'A',
  0x0392: 'B',
  0x0395: 'E',
  0x0396: 'Z',
  0x0397: 'H',
  0x0399: 'I',
  0x039a: 'K',
  0x039c: 'M',
  0x039d: 'N',
  0x039f: 'O',
  0x03a1: 'P',
  0x03a4: 'T',
  0x03a5: 'Y',
  0x03a7: 'X',
  0x03bf: 'o',
  0x03bd: 'v',
}

const REVEAL_CAP_CHARS = 20000
const REVEAL_CAP_MARKS = 500

export interface Finding {
  id: RuleId
  count: number
  action: RuleAction
  abbr: string
  label: string
}

export type RevealSegment =
  | { type: 'text'; text: string }
  | { type: 'emoji'; text: string }
  | { type: 'mark'; id: RuleId; abbr: string; label: string }
  | { type: 'word'; text: string }

export interface Analysis {
  findings: Finding[]
  hiddenTotal: number
  typographicTotal: number
  newlineTotal: number
  mixedWords: { count: number; examples: string[] }
  reveal: RevealSegment[]
  truncated: boolean
  counts: { chars: number; words: number }
}

export interface CleanResult {
  text: string
  removed: number
  replaced: number
}

interface CompiledRule {
  id: RuleId
  abbr: string
  action: RuleAction
  label: string
  option?: MapOption
  to?: string
}

function hex(cp: number): string {
  return cp.toString(16).toUpperCase().padStart(4, '0')
}

export function codePointLabel(items: readonly CodeSpan[]): string {
  return items
    .map((item) =>
      typeof item === 'number' ? `U+${hex(item)}` : `U+${hex(item[0])}–U+${hex(item[1])}`,
    )
    .join(', ')
}

function escapeCp(cp: number): string {
  return `\\u{${cp.toString(16).toUpperCase()}}`
}

function classBody(items: readonly CodeSpan[]): string {
  return items
    .map((item) =>
      typeof item === 'number' ? escapeCp(item) : `${escapeCp(item[0])}-${escapeCp(item[1])}`,
    )
    .join('')
}

function forEachSpan(items: readonly CodeSpan[], visit: (cp: number) => void) {
  for (const item of items) {
    if (typeof item === 'number') visit(item)
    else {
      for (let cp = item[0]; cp <= item[1]; cp++) visit(cp)
    }
  }
}

const EMOJI_UNIT =
  '\\p{Extended_Pictographic}(?:[\\uFE0E\\uFE0F\\u{1F3FB}-\\u{1F3FF}])?(?:[\\u{E0020}-\\u{E007E}]*\\u{E007F})?'

const EMOJI_CLUSTER =
  `\\p{Regional_Indicator}\\p{Regional_Indicator}|[0-9#*]\\uFE0F?\\u20E3|\\p{Ideographic}[\\u{E0100}-\\u{E01EF}]|(?:${EMOJI_UNIT})(?:\\u200D(?:${EMOJI_UNIT}))*`

interface Compiled {
  byId: Map<RuleId, CompiledRule>
  byCp: Map<number, CompiledRule>
  stripRe: RegExp
  hasStrip: RegExp
  spaceRe: RegExp
  newlineRe: RegExp
  findingRe: RegExp
  mapRes: Record<MapOption, { re: RegExp; tab: Record<number, string> }>
  clusterRe: RegExp
  emojiPres: RegExp
  latinRe: RegExp
  cgAny: RegExp
  wordRe: RegExp
}

function compile(): Compiled {
  const byAction: Record<RuleAction, CodeSpan[]> = { strip: [], space: [], newline: [], map: [] }
  const byId = new Map<RuleId, CompiledRule>()
  const byCp = new Map<number, CompiledRule>()
  const mapItems: Record<MapOption, CodeSpan[]> = { quotes: [], dashes: [], ellipsis: [] }
  const mapTab: Record<MapOption, Record<number, string>> = { quotes: {}, dashes: {}, ellipsis: {} }

  for (const rule of RULES) {
    const option = 'option' in rule ? rule.option : undefined
    const to = 'to' in rule ? rule.to : undefined
    const compiled: CompiledRule = {
      id: rule.id,
      abbr: rule.abbr,
      action: rule.action,
      label: codePointLabel(rule.items),
      option,
      to,
    }
    byId.set(rule.id, compiled)
    byAction[rule.action].push(...rule.items)
    forEachSpan(rule.items, (cp) => byCp.set(cp, compiled))
    if (rule.action === 'map') {
      if (!option || to == null) {
        throw new Error(`Map rule ${rule.id} is missing a replacement`)
      }
      mapItems[option].push(...rule.items)
      forEachSpan(rule.items, (cp) => {
        mapTab[option][cp] = to
      })
    }
  }

  const mapRes = {
    quotes: { re: new RegExp(`[${classBody(mapItems.quotes)}]`, 'gu'), tab: mapTab.quotes },
    dashes: { re: new RegExp(`[${classBody(mapItems.dashes)}]`, 'gu'), tab: mapTab.dashes },
    ellipsis: { re: new RegExp(`[${classBody(mapItems.ellipsis)}]`, 'gu'), tab: mapTab.ellipsis },
  }

  return {
    byId,
    byCp,
    stripRe: new RegExp(`[${classBody(byAction.strip)}]`, 'gu'),
    hasStrip: new RegExp(`[${classBody(byAction.strip)}]`, 'u'),
    spaceRe: new RegExp(`[${classBody(byAction.space)}]`, 'gu'),
    newlineRe: new RegExp(`[${classBody(byAction.newline)}]`, 'gu'),
    findingRe: new RegExp(
      `[${classBody([...byAction.strip, ...byAction.space, ...byAction.newline, ...byAction.map])}]`,
      'gu',
    ),
    mapRes,
    clusterRe: new RegExp(EMOJI_CLUSTER, 'gu'),
    emojiPres: new RegExp('\\p{Emoji_Presentation}', 'u'),
    latinRe: new RegExp('\\p{Script=Latin}', 'u'),
    cgAny: /[Ͱ-ϿЀ-ӿ]/,
    wordRe: new RegExp('[\\p{L}\\p{M}\\p{N}]+', 'gu'),
  }
}

const C = compile()

function resetGlobalIndexes() {
  C.stripRe.lastIndex = 0
  C.spaceRe.lastIndex = 0
  C.newlineRe.lastIndex = 0
  C.findingRe.lastIndex = 0
  C.clusterRe.lastIndex = 0
  C.wordRe.lastIndex = 0
  C.mapRes.quotes.re.lastIndex = 0
  C.mapRes.dashes.re.lastIndex = 0
  C.mapRes.ellipsis.re.lastIndex = 0
}

export function ruleToggle(rule: Pick<WatermarkRule, 'action' | 'option'>): CleanOptionKey | 'always' {
  if (rule.action === 'strip') return 'invisibles'
  if (rule.action === 'space') return 'spaces'
  if (rule.action === 'newline') return 'always'
  return rule.option ?? 'always'
}

function stripMarkdown(input: string): string {
  const lines = input.split('\n')
  const segs: { code: boolean; s: string }[] = []
  let buf: string[] = []
  let fence: string | null = null
  const flush = (code: boolean) => {
    if (buf.length) segs.push({ code, s: buf.join('\n') })
    buf = []
  }
  for (const line of lines) {
    const fenceMatch = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/)
    if (!fence && fenceMatch) {
      flush(false)
      fence = fenceMatch[1]
    } else if (fence && fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) {
      flush(true)
      fence = null
    } else {
      buf.push(line)
    }
  }
  flush(fence !== null)

  return segs
    .map((seg) => {
      if (seg.code) return seg.s
      let s = seg.s
      s = s.replace(/^[ \t]{0,3}=+[ \t]*$\n?/gm, '')
      s = s.replace(/^[ \t]{0,3}#{1,6}[ \t]+(.*?)[ \t]*#*[ \t]*$/gm, '$1')
      s = s.replace(/^[ \t]{0,3}#{1,6}[ \t]*$/gm, '')
      s = s.replace(/^[ \t]{0,3}(?:>[ \t]?)+/gm, '')
      s = s.replace(/^[ \t]{0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$\n?/gm, '')
      s = s.replace(/^([ \t]*)[*+][ \t]+/gm, '$1- ')
      let out = ''
      let last = 0
      const codeRe = /(`+)([\s\S]*?)\1/g
      let match: RegExpExecArray | null
      while ((match = codeRe.exec(s)) !== null) {
        out += inlineMarkdown(s.slice(last, match.index)) + match[2]
        last = match.index + match[0].length
      }
      return out + inlineMarkdown(s.slice(last))
    })
    .join('\n')
}

function inlineMarkdown(input: string): string {
  let text = input.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '$1')
  text = text.replace(/\[([^\]]+)\]\(([^)]*)\)/g, '$1')
  let prev = ''
  for (let i = 0; i < 3 && text !== prev; i++) {
    prev = text
    text = text.replace(/~~([^\s~](?:[\s\S]*?[^\s~])?)~~/g, '$1')
    text = text.replace(/\*\*\*([^\s*](?:[\s\S]*?[^\s*])?)\*\*\*/g, '$1')
    text = text.replace(/___([^\s_](?:[\s\S]*?[^\s_])?)___/g, '$1')
    text = text.replace(/\*\*([^\s*](?:[\s\S]*?[^\s*])?)\*\*/g, '$1')
    text = text.replace(/(^|[^\w])__([^\s_](?:[\s\S]*?[^\s_])?)__(?=[^\w]|$)/gm, '$1$2')
    text = text.replace(
      /(^|[\s(“‘"'])\*([^\s*][^*\n]*?[^\s*]|[^\s*])\*(?=[\s).,;:!?'"”’]|$)/gm,
      '$1$2',
    )
    text = text.replace(/(^|[^\w])_([^\s_][^_\n]*?[^\s_]|[^\s_])_(?=[^\w]|$)/gm, '$1$2')
  }
  return text
}

export function clean(text: string, options?: Partial<CleanOptions>): CleanResult {
  const opts: CleanOptions = { ...DEFAULT_OPTIONS, ...options }
  resetGlobalIndexes()
  let removed = 0
  let replaced = 0
  let current = String(text)

  current = current.replace(/\r\n/g, () => {
    removed++
    return '\n'
  })
  current = current.replace(C.newlineRe, () => {
    removed++
    return '\n'
  })

  if (opts.invisibles || opts.emoji) {
    if (opts.emoji || C.hasStrip.test(current)) {
      let out = ''
      let last = 0
      C.clusterRe.lastIndex = 0
      const takeGap = (gap: string) => {
        if (!gap) return
        out += opts.invisibles
          ? gap.replace(C.stripRe, () => {
              removed++
              return ''
            })
          : gap
      }
      let match: RegExpExecArray | null
      while ((match = C.clusterRe.exec(current)) !== null) {
        takeGap(current.slice(last, match.index))
        const cluster = match[0]
        if (opts.emoji && (cluster.length > 1 || C.emojiPres.test(cluster))) {
          removed += Array.from(cluster).length
        } else {
          out += cluster
        }
        last = match.index + cluster.length
        if (cluster.length === 0) C.clusterRe.lastIndex++
      }
      takeGap(current.slice(last))
      current = out
    }
  }

  if (opts.spaces) {
    current = current.replace(C.spaceRe, () => {
      replaced++
      return ' '
    })
  }

  if (opts.markdown) current = stripMarkdown(current)

  if (opts.homoglyphs && C.cgAny.test(current)) {
    C.wordRe.lastIndex = 0
    current = current.replace(C.wordRe, (word) => {
      let latin = 0
      let other = 0
      let mapped = 0
      for (const ch of word) {
        const cp = ch.codePointAt(0)!
        if (HOMOGLYPHS[cp]) {
          mapped++
          other++
        } else if (C.latinRe.test(ch)) latin++
        else if (C.cgAny.test(ch)) other++
      }
      if (!mapped || !latin || latin <= other) return word
      replaced += mapped
      return Array.from(word, (ch) => HOMOGLYPHS[ch.codePointAt(0)!] ?? ch).join('')
    })
  }

  const mapKeys: MapOption[] = ['quotes', 'dashes', 'ellipsis']
  for (const key of mapKeys) {
    if (!opts[key]) continue
    const group = C.mapRes[key]
    current = current.replace(group.re, (ch) => {
      replaced++
      return group.tab[ch.codePointAt(0)!] ?? ch
    })
  }

  if (opts.whitespace) {
    current = current.replace(/[ \t]+$/gm, '')
    current = current.replace(/\n{3,}/g, '\n\n')
    current = current.replace(/(\S) {2,}/g, '$1 ')
    current = current.replace(/^\n+/, '').replace(/\n+$/, '')
  }

  return { text: current, removed, replaced }
}

export function analyze(text: string): Analysis {
  resetGlobalIndexes()
  const source = String(text)
  const tallies = new Map<RuleId, number>()
  let hiddenTotal = 0
  let typographicTotal = 0
  let newlineTotal = 0
  const reveal: RevealSegment[] = []
  let revealChars = 0
  let marks = 0
  let truncated = false

  const addText = (value: string) => {
    if (!value || truncated) return
    let slice = value
    if (revealChars + slice.length > REVEAL_CAP_CHARS) {
      slice = slice.slice(0, REVEAL_CAP_CHARS - revealChars)
      truncated = true
    }
    if (!slice) return
    const prev = reveal[reveal.length - 1]
    if (prev && prev.type === 'text') prev.text += slice
    else reveal.push({ type: 'text', text: slice })
    revealChars += slice.length
  }

  const addMark = (rule: CompiledRule) => {
    if (truncated) return
    if (marks >= REVEAL_CAP_MARKS) {
      truncated = true
      return
    }
    reveal.push({ type: 'mark', id: rule.id, abbr: rule.abbr, label: rule.label })
    marks++
  }

  const scanGap = (gap: string) => {
    if (!gap) return
    let cursor = 0
    C.findingRe.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = C.findingRe.exec(gap)) !== null) {
      addText(gap.slice(cursor, match.index))
      const cp = match[0].codePointAt(0)!
      const rule = C.byCp.get(cp)
      if (rule) {
        tallies.set(rule.id, (tallies.get(rule.id) ?? 0) + 1)
        if (rule.action === 'strip' || rule.action === 'space') {
          hiddenTotal++
          addMark(rule)
        } else if (rule.action === 'newline') {
          newlineTotal++
          addMark(rule)
          if (gap.charCodeAt(match.index + match[0].length) !== 0x0a) addText('\n')
        } else {
          typographicTotal++
          addText(match[0])
        }
      } else {
        addText(match[0])
      }
      cursor = match.index + match[0].length
    }
    addText(gap.slice(cursor))
  }

  let last = 0
  C.clusterRe.lastIndex = 0
  let cluster: RegExpExecArray | null
  while ((cluster = C.clusterRe.exec(source)) !== null) {
    scanGap(source.slice(last, cluster.index))
    if (!truncated && revealChars + cluster[0].length <= REVEAL_CAP_CHARS) {
      reveal.push({ type: 'emoji', text: cluster[0] })
      revealChars += cluster[0].length
    } else {
      truncated = true
    }
    last = cluster.index + cluster[0].length
    if (cluster[0].length === 0) C.clusterRe.lastIndex++
  }
  scanGap(source.slice(last))

  const mixed = { count: 0, examples: [] as string[] }
  if (C.cgAny.test(source)) {
    C.wordRe.lastIndex = 0
    let wordMatch: RegExpExecArray | null
    while ((wordMatch = C.wordRe.exec(source)) !== null) {
      const word = wordMatch[0]
      if (C.latinRe.test(word) && C.cgAny.test(word)) {
        mixed.count++
        if (mixed.examples.length < 5) mixed.examples.push(word)
      }
    }
    if (mixed.count) highlightMixed(reveal)
  }

  const findings: Finding[] = Array.from(tallies.entries())
    .map(([id, count]) => {
      const rule = C.byId.get(id)!
      return { id, count, action: rule.action, abbr: rule.abbr, label: rule.label }
    })
    .sort((a, b) => b.count - a.count)

  return {
    findings,
    hiddenTotal,
    typographicTotal,
    newlineTotal,
    mixedWords: mixed,
    reveal,
    truncated,
    counts: {
      chars: Array.from(source).length,
      words: (source.match(/\S+/g) || []).length,
    },
  }
}

function highlightMixed(segments: RevealSegment[]) {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.type !== 'text' || !C.cgAny.test(seg.text) || !C.latinRe.test(seg.text)) continue
    const parts: RevealSegment[] = []
    let cursor = 0
    C.wordRe.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = C.wordRe.exec(seg.text)) !== null) {
      const word = match[0]
      if (C.latinRe.test(word) && C.cgAny.test(word)) {
        if (match.index > cursor) parts.push({ type: 'text', text: seg.text.slice(cursor, match.index) })
        parts.push({ type: 'word', text: word })
        cursor = match.index + word.length
      }
    }
    if (!cursor) continue
    if (cursor < seg.text.length) parts.push({ type: 'text', text: seg.text.slice(cursor) })
    segments.splice(i, 1, ...parts)
    i += parts.length - 1
  }
}
