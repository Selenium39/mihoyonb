/**
 * 敏感词检测工具的中英文案（/sensitive-words 与 /en/sensitive-words 共用）。
 *
 * 约定：
 * - 中文文案与重构前的实现逐字一致（含标点、括号、空格），避免改动已有页面表现；
 * - 英文文案按英文市场习惯重写（非直译），围绕 sensitive word checker /
 *   ad copy checker / risky claims checker / compliance word scanner；
 * - 动态句式用函数表达，保证两种语言的语序、量词与单位都能本地化；
 * - JSX 里不再出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

export interface SensitiveWordsCopy {
  hero: {
    title: string
    intro: string
  }
  disclaimer: string
  input: {
    cardTitle: string
    charCount: (count: number) => string
    placeholder: string
    ariaLabel: string
  }
  actions: {
    detect: string
    mask: string
    sample: string
    clear: string
  }
  results: {
    cardTitle: string
    idle: string
    cleanTitle: string
    cleanHint: string
    tabs: {
      highlight: string
      processed: string
    }
    truncated: (limit: number) => string
    legend: (hasCustomWords: boolean) => string
    markTitle: (category: string, word: string) => string
    processedEmpty: string
    generateMask: (mask: string) => string
    copy: string
    copied: string
    copyFailed: string
  }
  stats: {
    cardTitle: string
    empty: string
    total: string
    unique: string
    libraryCount: (count: number) => string
    hitCount: (count: number) => string
    hitListTitle: string
  }
  settings: {
    cardTitle: string
    maskCharLabel: string
    maskHint: string
    customLabel: string
    customPlaceholder: string
    customHint: (count: number) => string
    builtinTitle: string
    builtinLine: (name: string, count: number, description: string) => string
  }
  customCategory: {
    name: string
    description: string
  }
  sections: {
    features: string
    scenarios: string
    faqs: string
  }
  features: ReadonlyArray<{ title: string; description: string }>
  scenarios: ReadonlyArray<{ title: string; description: string }>
  faqs: ReadonlyArray<{ question: string; answer: string }>
  /** 示例文本：中文用原来的广告法案例，英文用一段典型的夸大广告文案 */
  sampleText: string
}

const ZH: SensitiveWordsCopy = {
  hero: {
    title: '敏感词检测',
    intro:
      '自媒体发文前自检工具：内置广告法极限词与平台违规词词库，支持自定义词、命中高亮与一键遮罩，全部在浏览器本地完成。',
  },
  disclaimer:
    '免责声明：词库仅供发布前自检参考，检测存在误报与漏报的可能，不构成法律 / 合规意见。正式发布请以各平台规则与专业审核为准。',
  input: {
    cardTitle: '待检测文本',
    charCount: (count) => `${count} 字`,
    placeholder: '粘贴或输入文章、标题、直播话术、商品详情等文案，然后点击「开始检测」…',
    ariaLabel: '待检测文本输入框',
  },
  actions: {
    detect: '开始检测',
    mask: '一键遮罩替换',
    sample: '填入示例',
    clear: '清空',
  },
  results: {
    cardTitle: '检测结果',
    idle: '点击「开始检测」后，这里会高亮显示命中的敏感词',
    cleanTitle: '未检测到命中词',
    cleanHint: '词库无法穷尽所有违规表述，结果仅供参考',
    tabs: {
      highlight: '高亮原文',
      processed: '处理后文本',
    },
    truncated: (limit) =>
      `文本超过 ${limit} 字，预览已截断，统计与替换仍基于全文。`,
    legend: (hasCustomWords) =>
      `红色为广告法极限词，橙色为平台违规词${hasCustomWords ? '，蓝色为自定义词' : ''}，悬停可查看所属分类。`,
    markTitle: (category, word) => `${category}：${word}`,
    processedEmpty: '还没有生成处理后文本',
    generateMask: (mask) => `生成遮罩文本（${mask} 等长替换）`,
    copy: '一键复制',
    copied: '已复制',
    copyFailed: '复制失败，请手动选择文本复制',
  },
  stats: {
    cardTitle: '统计面板',
    empty: '开始检测后显示统计',
    total: '命中总数',
    unique: '命中词种数',
    libraryCount: (count) => `词库 ${count} 词`,
    hitCount: (count) => `命中 ${count}`,
    hitListTitle: '命中词列表（按出现次数排序）',
  },
  settings: {
    cardTitle: '词库设置',
    maskCharLabel: '遮罩字符',
    maskHint: '一键遮罩时按原词字数等长替换，默认 *',
    customLabel: '自定义词库',
    customPlaceholder: '用逗号或换行分隔，例如：\n内部价, 独家渠道\n老板特批',
    customHint: (count) =>
      `已识别 ${count} 个自定义词，与内置词库合并检测（自动保存在本浏览器）`,
    builtinTitle: '内置词库',
    builtinLine: (name, count, description) => `${name}（${count} 词）：${description}`,
  },
  customCategory: {
    name: '自定义',
    description: '自行追加的词，与内置词库合并检测',
  },
  sections: {
    features: '功能特性',
    scenarios: '使用场景',
    faqs: '常见问题',
  },
  features: [
    {
      title: '纯本地检测',
      description: '文本不出浏览器，无上传、无联网请求，隐私安全',
    },
    {
      title: '双内置词库',
      description: '广告法极限词与平台违规词两大类，覆盖常见雷区',
    },
    {
      title: '自定义词库',
      description: '按行业与场景追加自己的词，与内置词合并检测',
    },
    {
      title: '一键遮罩替换',
      description: '命中词按字数等长替换为遮罩字符，一键复制带走',
    },
  ],
  scenarios: [
    {
      title: '图文发布前自检',
      description:
        '公众号、小红书、知乎、微博等平台发文前，快速排查极限词与违规表述，降低限流与封禁风险',
    },
    {
      title: '电商文案自查',
      description:
        '商品标题、详情页、直播话术中的「最」「第一」等广告法禁用语，发布前逐一排查',
    },
    {
      title: '私域与社群文案',
      description: '社群通知、朋友圈文案、私信话术检查敏感词，避免账号被平台处罚',
    },
    {
      title: '对外文本初筛',
      description: '招聘启事、公告声明、营销物料等对外内容的敏感词初筛，减少返工',
    },
  ],
  faqs: [
    {
      question: '检测结果准确吗，会误报吗？',
      answer:
        '本工具采用逐词匹配：命中只代表「文本包含词库中的词」，存在误报（如正常语境使用）与漏报（变体、谐音、拼音缩写等）的可能。词库仅供自检参考，不构成法律或合规意见。',
    },
    {
      question: '我的文本会被上传或保存吗？',
      answer:
        '不会。检测、高亮、替换全部在你的浏览器本地完成，没有任何网络请求，关闭页面后即无残留（自定义词库仅保存在你自己的浏览器中）。',
    },
    {
      question: '可以添加自己的敏感词吗？',
      answer:
        '可以。在右侧「词库设置」中用逗号或换行分隔输入自定义词，检测时会与内置词库合并生效，并自动保存在本地浏览器。',
    },
    {
      question: '词库能覆盖所有违规词吗？',
      answer:
        '不能。违规词没有官方完整清单，各平台规则也在动态变化。本工具内置的是广告法与新广告法处罚案例、各平台社区规范中较常见的词，用于发布前快速自检。',
    },
    {
      question: '「一键遮罩替换」是怎么替换的？',
      answer:
        '命中词会按原词字数等长替换为你设置的遮罩字符（默认 *），例如「第一名」替换为「***」，替换后可一键复制完整文本。',
    },
  ],
  sampleText:
    '这款面膜是全网销量第一的国家级爆款，配方纯天然无副作用，坚持使用可根治痘痘，错过今天再等一年！加微信领取内部渠道专属优惠，还有稳赚不赔的带货项目等你来。',
}

const EN: SensitiveWordsCopy = {
  hero: {
    title: 'Sensitive Word Checker',
    intro:
      'Paste ad copy, a product page or a social post and instantly see absolute claims, banned words and high-risk terms highlighted — with counts by category and one-click masking, all in your browser.',
  },
  disclaimer:
    'Disclaimer: this checker is a pre-publish helper, not legal advice. Word lists cannot judge context and are not exhaustive, so legitimate wording may be flagged while new slang, misspellings or spaced-out variants slip through. Always confirm against the current platform policies and have compliance-sensitive copy reviewed by a professional.',
  input: {
    cardTitle: 'Text to check',
    charCount: (count) => `${count} ${count === 1 ? 'character' : 'characters'}`,
    placeholder:
      'Paste or type a headline, ad, product description or social post, then click Check text…',
    ariaLabel: 'Text to check',
  },
  actions: {
    detect: 'Check text',
    mask: 'Mask matches',
    sample: 'Load sample',
    clear: 'Clear',
  },
  results: {
    cardTitle: 'Results',
    idle: 'Run a check and every match will be highlighted here.',
    cleanTitle: 'No matches found',
    cleanHint:
      'A word list can never cover every risky phrase — treat this as a first pass, not a guarantee.',
    tabs: {
      highlight: 'Highlighted text',
      processed: 'Masked text',
    },
    truncated: (limit) =>
      `The text is longer than ${limit.toLocaleString('en-US')} characters, so the preview is truncated. Counts and masking still use the full text.`,
    legend: (hasCustomWords) =>
      `Red marks ad claims and absolute wording, orange marks prohibited or high-risk terms${hasCustomWords ? ', and blue marks your custom words' : ''}. Hover a highlight to see its category.`,
    markTitle: (category, word) => `${category}: ${word}`,
    processedEmpty: 'No masked text yet',
    generateMask: (mask) => `Generate masked text (${mask} for each character)`,
    copy: 'Copy text',
    copied: 'Copied',
    copyFailed: 'Copy failed — select the text and copy it manually.',
  },
  stats: {
    cardTitle: 'Summary',
    empty: 'Run a check to see the summary.',
    total: 'Total matches',
    unique: 'Unique terms',
    libraryCount: (count) => `${count} ${count === 1 ? 'term' : 'terms'}`,
    hitCount: (count) => `${count} ${count === 1 ? 'match' : 'matches'}`,
    hitListTitle: 'Matched terms (most frequent first)',
  },
  settings: {
    cardTitle: 'Word list settings',
    maskCharLabel: 'Mask character',
    maskHint:
      'Masked matches are replaced with the same number of characters. Default is *.',
    customLabel: 'Custom words',
    customPlaceholder:
      'Separate with commas or new lines, e.g.\ninternal price, VIP channel\nmanager approval',
    customHint: (count) =>
      `${count} custom ${count === 1 ? 'term' : 'terms'} recognized. They are checked alongside the built-in lists and saved in this browser.`,
    builtinTitle: 'Built-in lists',
    builtinLine: (name, count, description) => `${name} (${count} terms): ${description}`,
  },
  customCategory: {
    name: 'Custom',
    description: 'Your own terms, checked alongside the built-in lists',
  },
  sections: {
    features: 'Features',
    scenarios: 'Use cases',
    faqs: 'Frequently asked questions',
  },
  features: [
    {
      title: 'Runs entirely in your browser',
      description:
        'Your copy never leaves the tab — no uploads, no network requests and no account needed.',
    },
    {
      title: 'Two built-in word lists',
      description:
        'Absolute and advertising claims plus prohibited and high-risk terms, covering the wording reviewers look for first.',
    },
    {
      title: 'Your own custom words',
      description:
        'Add brand, industry or campaign-specific terms. They are checked with the built-in lists and saved locally.',
    },
    {
      title: 'One-click masking',
      description:
        'Replace every match with a mask character of the same length, then copy the cleaned text in one click.',
    },
  ],
  scenarios: [
    {
      title: 'Ad and landing page review',
      description:
        'Scan headlines, paid social and search ad copy, and landing pages for absolute claims before you submit them for review.',
    },
    {
      title: 'E-commerce product listings',
      description:
        'Check titles, bullets and descriptions for guarantee, cure and “number one” style claims that marketplaces reject.',
    },
    {
      title: 'Social and email campaigns',
      description:
        'Pre-flight posts, newsletters and influencer briefs for prohibited or high-risk wording before they go live.',
    },
    {
      title: 'Client and agency handoff',
      description:
        'Run a quick first pass on copy you receive so obvious compliance issues are fixed before legal or platform review.',
    },
  ],
  faqs: [
    {
      question: 'How accurate is the checker?',
      answer:
        'It matches whole words case-insensitively, so “best” will not fire inside “bestowed” and “ass” will not fire inside “class”. It still cannot understand context: legitimate uses may be flagged, and new slang, deliberate misspellings or spaced-out variants may be missed. Treat the result as a first pass, not a legal opinion.',
    },
    {
      question: 'Is my text uploaded or stored?',
      answer:
        'No. Checking, highlighting and masking all run locally in your browser with no network requests. Close the tab and the text is gone; only your custom word list is saved in this browser’s local storage.',
    },
    {
      question: 'Can I add my own terms?',
      answer:
        'Yes. Add them under Word list settings, separated by commas or new lines. They are merged with the built-in lists for the current check and saved locally for next time.',
    },
    {
      question: 'Does it cover every banned word?',
      answer:
        'No. There is no complete official list, and platform rules change constantly. The built-in lists cover common absolute claims and high-risk categories; always confirm against the current ad policy or marketplace rules.',
    },
    {
      question: 'How does masking work?',
      answer:
        'Each match is replaced with the mask character repeated to the same length, so “guaranteed” becomes “**********” while capitalisation, punctuation and the rest of the text stay untouched.',
    },
  ],
  sampleText:
    'Clinically proven, doctor recommended formula — the best choice for a lifetime of younger-looking skin. 100% risk-free and guaranteed to cure acne fast. Our #1 bestseller delivers instant results; order today and get rich quick with our passive income bonus!',
}

export const SENSITIVE_WORDS_COPY: Record<Locale, SensitiveWordsCopy> = {
  zh: ZH,
  en: EN,
}

export function getSensitiveWordsCopy(locale: Locale): SensitiveWordsCopy {
  return SENSITIVE_WORDS_COPY[locale] ?? ZH
}
