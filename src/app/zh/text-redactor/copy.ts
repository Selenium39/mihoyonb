/**
 * 文本脱敏工具的中英文案（/zh/text-redactor 与 /text-redactor 共用）。
 *
 * 约定（照 sensitive-words 的 copy.ts 模式）：
 * - 全部 UI 文案集中在此，JSX 里不出现硬编码中英文；
 * - 英文面向主攻市场按英文习惯撰写（非直译），围绕 text redaction /
 *   PII redactor / redact text online / AI privacy；中文瞄准 文本脱敏 /
 *   个人信息脱敏 / 脱敏工具；
 * - 动态句式（计数、错误详情等）用函数表达，两种语言的语序与单位都能本地化；
 * - 诚实原则：任何文案不得声称 100% / 完全检出；官方基准（中风险 F2：
 *   中文 87.1 / 英文 93.1 / 混合 97.3）如实呈现，并提示人工复核。
 */

import type { Locale } from '@/lib/i18n'

export interface TextRedactorCopy {
  hero: {
    title: string
    intro: string
  }
  /** 显著位置的诚实提示：漏检可能发生 + 官方 F2 基准 + 人工复核 */
  honestNotice: string
  input: {
    cardTitle: string
    charCount: (count: number) => string
    placeholder: string
    ariaLabel: string
    overLimit: (max: number) => string
  }
  actions: {
    redact: string
    redacting: string
    sampleZh: string
    sampleEn: string
    clear: string
  }
  model: {
    loading: string
    /** 加载失败：显式报错，绝不静默降级成纯规则检测 */
    loadError: (detail: string) => string
  }
  results: {
    cardTitle: string
    idle: string
    errorTitle: (detail: string) => string
    summary: (count: number) => string
    copy: string
    copied: string
  }
  entities: {
    cardTitle: string
    idle: string
    empty: string
    emptyHint: string
    count: (count: number) => string
    /** 实体不在映射表（未替换）时的展示 */
    noPlaceholder: string
    riskLabel: Record<string, string>
    sourceLabel: Record<string, string>
    types: Record<string, string>
  }
  mapping: {
    cardTitle: string
    idle: string
    intro: string
    columns: {
      placeholder: string
      original: string
    }
    copy: string
    copied: string
  }
  restore: {
    cardTitle: string
    intro: string
    placeholder: string
    ariaLabel: string
    button: string
    busy: string
    /** 尚未脱敏（无映射表）时的禁用提示 */
    needRedact: string
    outputLabel: string
    errorTitle: (detail: string) => string
    copy: string
    copied: string
  }
  /** 三个复制按钮共用的失败提示 */
  copyFailed: string
  attribution: {
    title: string
    poweredByPrefix: string
    edgeRedactLabel: string
    edgeRedactUrl: string
    poweredBySuffix: string
    trainingData: string
  }
  sections: {
    features: string
    scenarios: string
    faqs: string
  }
  features: ReadonlyArray<{ title: string; description: string }>
  scenarios: ReadonlyArray<{ title: string; description: string }>
  faqs: ReadonlyArray<{ question: string; answer: string }>
  /** 示例文本：中文、英文各一，两条都可在两个语言页使用（工具本身支持中英混检） */
  samples: {
    zh: string
    en: string
  }
}

const ZH: TextRedactorCopy = {
  hero: {
    title: '文本脱敏',
    intro:
      '把要发给 AI 的文本先脱敏：规则、校验和与小型字符模型三层检测姓名、电话、证件号、卡号、邮箱、地址与密钥，替换为 [PERSON_1] 式占位符并生成映射表；AI 回复粘回来可一键还原。全部在浏览器本地完成，文本不上传。',
  },
  honestNotice:
    '诚实提示：自动脱敏存在漏检与误报，请把结果当初筛，发给 AI 前务必人工复核。官方基准（中风险 F2）下引擎召回率为中文 87.1%、英文 93.1%、中英混合 97.3%，漏检始终可能发生。',
  input: {
    cardTitle: '待脱敏文本',
    charCount: (count) => `${count} 字`,
    placeholder: '粘贴或输入要发给 AI 的草稿、工单、案例等文本，然后点击「开始脱敏」…',
    ariaLabel: '待脱敏文本输入框',
    overLimit: (max) => `文本超过 ${max.toLocaleString('zh-CN')} 字上限，请分段处理。`,
  },
  actions: {
    redact: '开始脱敏',
    redacting: '脱敏中…',
    sampleZh: '中文示例',
    sampleEn: '英文示例',
    clear: '清空',
  },
  model: {
    loading: '首次使用，正在加载检测模型（约 1.4 MB，之后由浏览器缓存）…',
    loadError: (detail) =>
      `模型加载失败，无法降级为不带模型的纯规则检测（会显著提高漏检率）。请检查网络后重试。${detail}`,
  },
  results: {
    cardTitle: '脱敏结果',
    idle: '点击「开始脱敏」后，这里显示替换为占位符后的文本',
    errorTitle: (detail) => `脱敏出错，本次未返回结果（库按“失败即封闭”处理，不会把原文当作安全文本）。${detail}`,
    summary: (count) => `共检出 ${count} 处`,
    copy: '复制脱敏文本',
    copied: '已复制',
  },
  entities: {
    cardTitle: '检出实体',
    idle: '脱敏后这里列出每一处命中的类型、原值、占位符与风险等级',
    empty: '未检出可脱敏内容',
    emptyHint: '自动检测无法穷尽所有个人信息，发送前请人工复核',
    count: (count) => `检出 ${count} 处`,
    noPlaceholder: '—（未替换）',
    riskLabel: {
      high: '高风险',
      medium: '中风险',
      low: '低风险',
    },
    sourceLabel: {
      rule: '规则',
      heuristic: '启发式',
      model: '模型',
    },
    types: {
      CN_ID: '身份证号',
      JP_MYNUMBER: '日本个人编号',
      CREDIT_CARD: '银行卡 / 信用卡',
      BANK_ACCOUNT: '银行账号',
      NATIONAL_ID: '证件号',
      SECRET: '密钥 / API key',
      PERSON: '人名',
      ADDRESS: '地址',
      PHONE: '电话',
      EMAIL: '邮箱',
      IP: 'IP 地址',
      OTHER_ID: '其他编号',
      ORG: '机构名',
      PROJECT: '项目名',
    },
  },
  mapping: {
    cardTitle: '映射表',
    idle: '脱敏后这里显示「占位符 → 原值」对照表',
    intro: '复制映射表（JSON）存档，即可日后人工对照或离线还原。',
    columns: {
      placeholder: '占位符',
      original: '原值',
    },
    copy: '复制映射表（JSON）',
    copied: '已复制',
  },
  restore: {
    cardTitle: '还原',
    intro: '把 AI 的回复粘贴到下方，用本次脱敏的映射表把占位符换回原值（刷新页面或重新脱敏后映射表会更新）。',
    placeholder: '粘贴 AI 的回复（含 [PERSON_1] 等占位符）…',
    ariaLabel: '待还原文本输入框',
    button: '还原',
    busy: '还原中…',
    needRedact: '请先完成一次脱敏，再粘贴回复还原',
    outputLabel: '还原后的文本',
    errorTitle: (detail) => `还原出错。${detail}`,
    copy: '复制还原文本',
    copied: '已复制',
  },
  copyFailed: '复制失败，请手动选择文本复制',
  attribution: {
    title: '技术来源与署名',
    poweredByPrefix: '本工具基于 ',
    edgeRedactLabel: 'edge-redact（MIT License）',
    edgeRedactUrl: 'https://github.com/kokoro-ele/edge-redact',
    poweredBySuffix: '构建，检测与还原均在本地执行。',
    trainingData:
      '内置模型的训练与基准数据（CC BY 4.0）：“Nemotron-PII” by NVIDIA、“OpenPII-1.5M” by Ai Suisse SA (ai4privacy)、“RedactionBench” by the RedactionBench authors。',
  },
  sections: {
    features: '功能特性',
    scenarios: '使用场景',
    faqs: '常见问题',
  },
  features: [
    {
      title: '全程本地运行',
      description: '文本不上传；除首次下载约 1.4 MB 模型文件外，检测与还原全部在你的浏览器内完成。',
    },
    {
      title: '三层检测引擎',
      description: '规则、校验和与 1.35 MB 字符级小模型三层结合，识别中英混排文本中的个人信息。',
    },
    {
      title: '占位符与映射表',
      description: '每处命中替换为 [PERSON_1] 式占位符，附「占位符 → 原值」映射表，可复制 JSON 存档。',
    },
    {
      title: '一键还原',
      description: '把 AI 的回复粘回还原区，占位符自动换回原值——脱敏使用两不误。',
    },
  ],
  scenarios: [
    {
      title: '发给 AI 前脱敏',
      description: '把带个人信息的草稿先替换成占位符再粘贴给 ChatGPT 等 AI，拿到回复后粘回来一键还原。',
    },
    {
      title: '团队与外包协作',
      description: '向同事或自由职业者共享工单、用户反馈与案例时，隐去姓名、电话、邮箱等字段。',
    },
    {
      title: '内容发布与存档',
      description: '教程、复盘、截图配文要引用真实对话时，先脱敏再公开，映射表只留在你本地。',
    },
    {
      title: '隐私初筛',
      description: '处理客户资料前的去标识化初筛，降低误发风险（不替代正式的合规流程）。',
    },
  ],
  faqs: [
    {
      question: '自动脱敏可靠吗？能把个人信息都找出来吗？',
      answer:
        '不能保证。检测分规则、校验和与模型三层，但任何自动方案都可能漏检或误报——官方基准（中风险 F2）下引擎召回率为中文 87.1%、英文 93.1%、中英混合 97.3%。请把结果当初筛，发送前人工复核。',
    },
    {
      question: '我的文本会被上传吗？',
      answer:
        '不会。检测与还原都在浏览器本地完成，文本不发给任何服务器。首次使用会从本站静态资源下载约 1.4 MB 的模型文件，之后由浏览器缓存；下载的是模型，不是你的文本。',
    },
    {
      question: '占位符是什么？怎么还原？',
      answer:
        '每处命中会替换成形如 [PERSON_1] 的占位符，同时生成「占位符 → 原值」映射表。把 AI 的回复粘进还原区即可换回原值；也可以复制映射表 JSON 存档，日后手动对照。',
    },
    {
      question: '能检出哪些类型的个人信息？',
      answer:
        '共 14 类：姓名、电话、邮箱、地址、身份证号、银行卡号、其他证件号、密钥 / API key、IP 地址、机构名、项目名等，纯中文、纯英文与混排文本均可。',
    },
    {
      question: '模型加载失败怎么办？',
      answer:
        '页面会明确提示加载失败，不会静默降级成不带模型的纯规则检测（那会显著提高漏检率）。检查网络后再次点击「开始脱敏」即可重试。',
    },
    {
      question: '和「敏感词检测」工具有什么区别？',
      answer:
        '敏感词检测查的是广告法极限词与平台违规词，服务发布合规；本工具查的是个人信息（PII），服务隐私保护。两个工具可以先后配合使用。',
    },
  ],
  samples: {
    zh: '客户王建国，电话 138 0013 8000，收货地址：上海市浦东新区世纪大道 100 号，邮箱 wangjianguo@example.com。请确认订单后尽快发货。',
    en: 'Hi, this is John Doe from Acme Corp. Reach me at john.doe@example.com or +1 (415) 555-0100. The card on file is 4242 4242 4242 4242, and the API key is sk-live-a1b2c3d4e5f6g7h8i9j0. Ship to 221B Baker Street, London.',
  },
}

const EN: TextRedactorCopy = {
  hero: {
    title: 'Text Redactor',
    intro:
      'Redact text before you paste it into an AI: rules, checksums and a compact character-level model detect names, phones, IDs, cards, emails, addresses and API keys in English or Chinese, replace them with placeholders like [PERSON_1], and keep a mapping table so you can restore the AI’s reply afterwards. Everything runs in your browser.',
  },
  honestNotice:
    'Honest limits: automatic redaction misses things and can flag innocent text. Treat it as a first pass and review the result yourself before sending anything to an AI. On the official benchmark (mid-risk F2) the engine recalls 87.1% on Chinese, 93.1% on English and 97.3% on mixed text — misses remain possible.',
  input: {
    cardTitle: 'Text to redact',
    charCount: (count) => `${count} ${count === 1 ? 'character' : 'characters'}`,
    placeholder:
      'Paste or type the draft, ticket or case study you plan to send to an AI, then click Redact text…',
    ariaLabel: 'Text to redact',
    overLimit: (max) =>
      `The text is longer than the ${max.toLocaleString('en-US')} character limit. Please split it into parts.`,
  },
  actions: {
    redact: 'Redact text',
    redacting: 'Redacting…',
    sampleZh: 'Chinese sample',
    sampleEn: 'English sample',
    clear: 'Clear',
  },
  model: {
    loading: 'First use — loading the detection model (about 1.4 MB, then cached by your browser)…',
    loadError: (detail) =>
      `The detection model failed to load, and the tool will not silently fall back to rules-only detection (that would miss far more). Check your connection and try again.${detail}`,
  },
  results: {
    cardTitle: 'Redacted text',
    idle: 'Click Redact text and the placeholder version will appear here.',
    errorTitle: (detail) =>
      `Redaction failed and no result was returned (the library fails closed rather than treating your text as safe).${detail}`,
    summary: (count) =>
      `${count} ${count === 1 ? 'detection' : 'detections'}`,
    copy: 'Copy redacted text',
    copied: 'Copied',
  },
  entities: {
    cardTitle: 'Detections',
    idle: 'After redaction, every hit is listed here with its type, original value, placeholder and risk level.',
    empty: 'Nothing detected',
    emptyHint: 'Automatic detection cannot catch every personal detail — review the text yourself before sending it.',
    count: (count) => `${count} ${count === 1 ? 'hit' : 'hits'}`,
    noPlaceholder: '— (not replaced)',
    riskLabel: {
      high: 'High risk',
      medium: 'Medium risk',
      low: 'Low risk',
    },
    sourceLabel: {
      rule: 'Rule',
      heuristic: 'Heuristic',
      model: 'Model',
    },
    types: {
      CN_ID: 'Chinese ID',
      JP_MYNUMBER: 'Japan My Number',
      CREDIT_CARD: 'Credit card',
      BANK_ACCOUNT: 'Bank account',
      NATIONAL_ID: 'National ID',
      SECRET: 'Secret / API key',
      PERSON: 'Person name',
      ADDRESS: 'Address',
      PHONE: 'Phone',
      EMAIL: 'Email',
      IP: 'IP address',
      OTHER_ID: 'Other ID',
      ORG: 'Organization',
      PROJECT: 'Project',
    },
  },
  mapping: {
    cardTitle: 'Mapping table',
    idle: 'After redaction, the placeholder-to-original table appears here.',
    intro: 'Copy the mapping as JSON to keep an archive for later manual lookup or offline restore.',
    columns: {
      placeholder: 'Placeholder',
      original: 'Original',
    },
    copy: 'Copy mapping (JSON)',
    copied: 'Copied',
  },
  restore: {
    cardTitle: 'Restore',
    intro: 'Paste the AI’s reply below and the placeholders are swapped back using the mapping from your latest redaction (reloading the page or redacting again updates the mapping).',
    placeholder: 'Paste the AI’s reply (with placeholders like [PERSON_1])…',
    ariaLabel: 'Text to restore',
    button: 'Restore',
    busy: 'Restoring…',
    needRedact: 'Run a redaction first, then paste the reply to restore it.',
    outputLabel: 'Restored text',
    errorTitle: (detail) => `Restore failed.${detail}`,
    copy: 'Copy restored text',
    copied: 'Copied',
  },
  copyFailed: 'Copy failed — select the text and copy it manually.',
  attribution: {
    title: 'Credits',
    poweredByPrefix: 'Powered by ',
    edgeRedactLabel: 'edge-redact (MIT License)',
    edgeRedactUrl: 'https://github.com/kokoro-ele/edge-redact',
    poweredBySuffix: ' — detection and restore run locally.',
    trainingData:
      'The built-in model was trained and benchmarked on datasets released under CC BY 4.0: “Nemotron-PII” by NVIDIA, “OpenPII-1.5M” by Ai Suisse SA (ai4privacy), and “RedactionBench” by the RedactionBench authors.',
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
        'Your text never leaves the tab. Apart from a one-time 1.4 MB model download, detection and restore are all local.',
    },
    {
      title: 'Three detection layers',
      description:
        'Rules, checksums and a compact 1.35 MB character-level model work together on pure Chinese, pure English and mixed text.',
    },
    {
      title: 'Placeholders and a mapping table',
      description:
        'Each detection becomes a placeholder like [PERSON_1], with a placeholder-to-original table you can export as JSON.',
    },
    {
      title: 'Restore in one click',
      description:
        'Paste the AI’s reply back and every placeholder is swapped for the original value — redact and work without friction.',
    },
  ],
  scenarios: [
    {
      title: 'Redact before you paste into AI',
      description:
        'Swap personal details for placeholders before pasting a draft into ChatGPT or another assistant, then paste the reply back to restore.',
    },
    {
      title: 'Teams and contractors',
      description:
        'Share tickets, user feedback and case studies with colleagues or freelancers without exposing names, phone numbers or emails.',
    },
    {
      title: 'Publishing and archiving',
      description:
        'Quote real conversations in tutorials and postmortems — redact first and keep the mapping table to yourself.',
    },
    {
      title: 'A privacy first pass',
      description:
        'A quick de-identification pass before handling customer material. It lowers the risk of accidental leaks; it is not a compliance process.',
    },
  ],
  faqs: [
    {
      question: 'Is automatic redaction reliable? Will it catch everything?',
      answer:
        'No automated approach guarantees that. Detection combines rules, checksums and a model, but misses and false positives remain possible — on the official benchmark (mid-risk F2) the engine recalls 87.1% on Chinese, 93.1% on English and 97.3% on mixed text. Treat the result as a first pass and review it yourself before sending.',
    },
    {
      question: 'Is my text uploaded anywhere?',
      answer:
        'No. Detection and restore run locally in your browser and your text is never sent to a server. The first redaction downloads the model file (about 1.4 MB) from this site’s static assets and your browser caches it afterwards — the download is the model, not your text.',
    },
    {
      question: 'What are the placeholders and how do I restore?',
      answer:
        'Each detection is replaced with a placeholder such as [PERSON_1], and a placeholder-to-original mapping table is generated alongside. Paste the AI’s reply into the restore box to swap the placeholders back, or copy the mapping as JSON to keep an archive for manual lookup.',
    },
    {
      question: 'Which kinds of personal information are detected?',
      answer:
        '14 categories: person names, phone numbers, emails, addresses, Chinese ID numbers, credit and bank card numbers, other ID numbers, secrets and API keys, IP addresses, organizations and project names — in pure Chinese, pure English, or mixed text.',
    },
    {
      question: 'What happens if the model fails to load?',
      answer:
        'The page shows an explicit error and does not silently fall back to rules-only detection, which would miss far more. Check your connection and click Redact text again to retry the download.',
    },
    {
      question: 'How is this different from the Sensitive Word Checker?',
      answer:
        'The Sensitive Word Checker looks for advertising-law absolute claims and platform-prohibited wording — a compliance tool. This tool looks for personal information (PII) — a privacy tool. You can use them one after the other.',
    },
  ],
  samples: {
    zh: '客户王建国，电话 138 0013 8000，收货地址：上海市浦东新区世纪大道 100 号，邮箱 wangjianguo@example.com。请确认订单后尽快发货。',
    en: 'Hi, this is John Doe from Acme Corp. Reach me at john.doe@example.com or +1 (415) 555-0100. The card on file is 4242 4242 4242 4242, and the API key is sk-live-a1b2c3d4e5f6g7h8i9j0. Ship to 221B Baker Street, London.',
  },
}

export const TEXT_REDACTOR_COPY: Record<Locale, TextRedactorCopy> = {
  zh: ZH,
  en: EN,
}

export function getTextRedactorCopy(locale: Locale): TextRedactorCopy {
  return TEXT_REDACTOR_COPY[locale] ?? ZH
}
