/**
 * 英文敏感词词库与英文词边界检测
 *
 * 与 `sensitive-words.ts`（中文词库 + 子串匹配）分开维护的原因：
 * - 中文没有词边界，`indexOf` 子串匹配就是正确行为，且必须保持逐字节不变；
 * - 英文必须按「词」匹配，否则 `best` 会命中 `bestowed`、`ass` 会命中 `class`；
 * - 英文还要大小写不敏感、支持多词短语与连字符/空白变体，逻辑与中文不同。
 *
 * 词库只是发布前自检的辅助清单：不是法律意见，也无法穷尽所有违规表述。
 */

import type {
  DetectResult,
  MatchRange,
  SensitiveWordCategory,
  WordHit,
} from './sensitive-words'

/** 广告极限词 / 绝对化承诺（英文常见广告审核雷区） */
const AD_CLAIMS_WORDS: string[] = [
  'best',
  'number one',
  'number 1',
  'no.1',
  'no 1',
  '#1',
  'top rated',
  'world class',
  'unbeatable',
  'guaranteed',
  'guarantee',
  'guarantees',
  '100%',
  'risk-free',
  'miracle',
  'cure',
  'cures',
  'cured',
  'instant results',
  'doctor recommended',
  'clinically proven',
  'permanent',
  'lifetime',
  'free money',
  'get rich quick',
  'passive income',
]

/** 违禁 / 高风险类（仿品、赌博、毒品、武器、色情、洗钱等） */
const PROHIBITED_WORDS: string[] = [
  'counterfeit',
  'pirated',
  'hack',
  'hacking',
  'cheat',
  'gambling',
  'betting',
  'casino',
  'drugs',
  'cocaine',
  'heroin',
  'methamphetamine',
  'weapon',
  'weapons',
  'firearm',
  'firearms',
  'suicide',
  'escort',
  'escorts',
  'adult content',
  'porn',
  'pornography',
  'crypto giveaway',
  'money laundering',
  'ponzi scheme',
  'fake id',
  'stolen credit card',
]

/** 内置英文词库分类 */
export const ENGLISH_SENSITIVE_WORD_CATEGORIES: SensitiveWordCategory[] = [
  {
    id: 'ad-claims',
    name: 'Ad claims & absolute claims',
    description:
      'Absolute, guaranteed and outcome-based wording that ad reviewers commonly flag',
    words: AD_CLAIMS_WORDS,
  },
  {
    id: 'prohibited',
    name: 'Prohibited & high-risk',
    description:
      'Terms tied to counterfeit goods, gambling, drugs, weapons and other restricted content',
    words: PROHIBITED_WORDS,
  },
]

/**
 * 词边界判断用的字符：Unicode 字母或数字。
 * 用字符串构造，避免 tsconfig target 为 es5 时正则字面量被 TS 语法检查拦截。
 */
const WORD_CHAR = new RegExp('[\\p{L}\\p{N}]', 'u')

/** 多词短语中词与词之间允许的分隔符 */
const PHRASE_SEPARATOR = '[\\s\\-–—_/]+'

/** 短语拆分用：空白、连字符、斜线都视为可互换的词间隔 */
const PHRASE_SPLITTER = /[\s\-–—_/]+/

function isWordChar(char: string | undefined): boolean {
  if (!char) return false
  return WORD_CHAR.test(char)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 把词库词转成大小写不敏感、词间隔宽松的短语正则。
 * 例如 `get rich quick` 可命中 `get  rich quick` / `get-rich-quick`。
 */
function buildPhrasePattern(word: string): RegExp | null {
  const parts = word
    .trim()
    .split(PHRASE_SPLITTER)
    .filter(Boolean)
    .map(escapeRegExp)

  if (parts.length === 0) return null
  return new RegExp(parts.join(PHRASE_SEPARATOR), 'giu')
}

/**
 * 收集单个词在全文中的命中区间。
 *
 * 正则本身只负责定位，边界用前后字符判断：
 * - `best` 不会命中 `bestowed`，`ass` 不会命中 `class`；
 * - 标点、括号、引号、空白都算合法边界，`guaranteed!`、`(best)` 正常命中；
 * - 大小写不敏感，但区间始终指向原文，保留原始大小写。
 */
function collectPhraseMatches(
  text: string,
  word: string,
  categoryId: string,
  out: MatchRange[]
): void {
  const pattern = buildPhrasePattern(word)
  if (!pattern) return

  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const start = match.index
    const end = start + match[0].length

    if (!isWordChar(text[start - 1]) && !isWordChar(text[end])) {
      out.push({ start, end, word, categoryId })
    } else {
      // 边界不成立时从下一个字符继续，避免跳过后面真正的独立单词
      pattern.lastIndex = start + 1
    }

    // 防御零长度匹配导致死循环（正常词库不会出现）
    if (pattern.lastIndex === start) pattern.lastIndex += 1
  }
}

/**
 * 解析英文自定义词：只按逗号 / 分号 / 换行分隔，保留空格，支持多词短语
 * （中文版 `parseCustomWords` 会按空白拆分，直接复用会把短语拆散）。
 * 去重不区分大小写，保留首次输入的大小写。
 */
export function parseEnglishCustomWords(input: string): string[] {
  const seen = new Set<string>()
  const words: string[] = []
  for (const raw of input.split(/[,，;；、\n\r]+/)) {
    const word = raw.trim().replace(/\s+/g, ' ')
    const key = word.toLowerCase()
    if (word && word.length <= 60 && !seen.has(key)) {
      seen.add(key)
      words.push(word)
    }
  }
  return words
}

/**
 * 英文敏感词检测：Unicode 词边界 + 大小写不敏感，重叠区间长词优先保留。
 *
 * 与中文版 `detectSensitiveWords` 返回同样的 `DetectResult` 结构，
 * 因此高亮、遮罩、统计等 UI 逻辑可以完全复用。
 */
export function detectEnglishSensitiveWords(
  text: string,
  categories: SensitiveWordCategory[] = ENGLISH_SENSITIVE_WORD_CATEGORIES
): DetectResult {
  if (!text) {
    return { ranges: [], total: 0, byCategory: {}, wordHits: [] }
  }

  // 词 -> 分类（同词多库时先出现的分类优先，与中文版一致）
  const wordMap = new Map<string, string>()
  for (const category of categories) {
    for (const word of category.words) {
      if (!wordMap.has(word)) wordMap.set(word, category.id)
    }
  }

  // 收集所有出现位置
  const all: MatchRange[] = []
  wordMap.forEach((categoryId, word) => {
    collectPhraseMatches(text, word, categoryId, all)
  })

  // start 升序、end 降序（同起点长词优先），贪心去重叠
  all.sort((a, b) => a.start - b.start || b.end - a.end)
  const ranges: MatchRange[] = []
  let lastEnd = -1
  for (const range of all) {
    if (range.start >= lastEnd) {
      ranges.push(range)
      lastEnd = range.end
    }
  }

  // 统计
  const byCategory: Record<string, number> = {}
  const hitMap = new Map<string, WordHit>()
  for (const range of ranges) {
    byCategory[range.categoryId] = (byCategory[range.categoryId] || 0) + 1
    const key = `${range.categoryId}\u0000${range.word}`
    const existing = hitMap.get(key)
    if (existing) {
      existing.count++
    } else {
      hitMap.set(key, { word: range.word, categoryId: range.categoryId, count: 1 })
    }
  }
  const wordHits = Array.from(hitMap.values()).sort(
    (a, b) => b.count - a.count || a.word.localeCompare(b.word, 'en')
  )

  return { ranges, total: ranges.length, byCategory, wordHits }
}
