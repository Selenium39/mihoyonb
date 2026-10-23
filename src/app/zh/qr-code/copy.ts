/**
 * 二维码生成工具的中英文案（/zh/qr-code 与 /qr-code 共用）。
 *
 * 约定：
 * - 中文文案与重构前的实现逐字一致，避免改动已有的排序与收录；
 * - 英文文案按英文市场习惯重写（非直译），围绕 qr code generator /
 *   custom qr code with logo / qr code png；
 * - 动态句式用函数表达，保证两种语言的语序与单位都能本地化；
 * - JSX 里不再出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

/** 二维码容错等级：L / M / Q / H */
export type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrCodeCopy {
  languageSwitch: {
    label: string
    ariaLabel: string
  }
  hero: {
    title: string
    intro: string
  }
  content: {
    cardTitle: string
    label: string
    placeholder: string
    hint: string
  }
  style: {
    cardTitle: string
    sizeLabel: string
    colorLabel: string
    colorPresets: ReadonlyArray<{ label: string; fg: string; bg: string }>
    foreground: string
    background: string
    transparent: string
    transparentBg: string
    marginLabel: string
    marginHint: string
    errorLevelLabel: string
    errorLevels: ReadonlyArray<{ value: ErrorLevel; desc: string }>
    errorLevelTitle: (desc: string) => string
  }
  logo: {
    cardTitle: string
    upload: string
    replace: string
    remove: string
    previewAlt: string
    hint: string
    sizeLabel: string
    sizeValue: (size: number) => string
    round: string
    warn: string
    warnAction: string
  }
  preview: {
    cardTitle: string
    alt: string
    empty: string
    download: (size: number) => string
    hint: (transparentBg: boolean) => string
  }
  sections: {
    features: string
    scenarios: string
    faqs: string
  }
  features: ReadonlyArray<{ title: string; description: string }>
  scenarios: ReadonlyArray<{ title: string; description: string }>
  faqs: ReadonlyArray<{ question: string; answer: string }>
  errors: {
    logoLoadFailed: string
    canvasFailed: string
    unknown: string
    tooLong: string
    generateFailed: (message: string) => string
  }
  downloadFileName: (size: number) => string
}

const ZH: QrCodeCopy = {
  languageSwitch: {
    label: 'English',
    ariaLabel: '切换到英文版',
  },
  hero: {
    title: '二维码生成',
    intro:
      '输入文字或链接即时生成二维码，自定义颜色、尺寸、边距与容错等级，支持中央 Logo 贴图与透明背景导出，全程本地处理。',
  },
  content: {
    cardTitle: '二维码内容',
    label: '文字或链接（支持 URL、文本、Wi-Fi 等任意内容）',
    placeholder: '例如：https://example.com',
    hint: '内容越长二维码越密，超出容量上限会提示失败，可精简文本或降低容错等级。',
  },
  style: {
    cardTitle: '样式设置',
    sizeLabel: '尺寸',
    colorLabel: '颜色',
    colorPresets: [
      { label: '经典黑', fg: '#000000', bg: '#FFFFFF' },
      { label: '商务蓝', fg: '#1D4ED8', bg: '#FFFFFF' },
      { label: '清新绿', fg: '#16A34A', bg: '#FFFFFF' },
    ],
    foreground: '前景色（码点）',
    background: '背景色',
    transparent: '透明',
    transparentBg: '透明背景（导出 PNG 底色透明）',
    marginLabel: '外边距（静区）',
    marginHint: '建议保留 2 格以上边距（白色静区），有助于提高扫码成功率。',
    errorLevelLabel: '容错等级（默认 Q）',
    errorLevels: [
      { value: 'L', desc: '约 7%' },
      { value: 'M', desc: '约 15%' },
      { value: 'Q', desc: '约 25%' },
      { value: 'H', desc: '约 30%' },
    ],
    errorLevelTitle: (desc) => `可纠错 ${desc} 的码面损伤`,
  },
  logo: {
    cardTitle: 'Logo 贴图',
    upload: '上传 Logo（建议 PNG）',
    replace: '更换 Logo',
    remove: '移除 Logo',
    previewAlt: 'Logo 预览',
    hint: 'Logo 将合成到二维码中央，建议使用背景透明的 PNG 图片。',
    sizeLabel: 'Logo 大小',
    sizeValue: (size) => `${size}%（占边长）`,
    round: '圆形裁切 Logo',
    warn: '已添加 Logo，建议容错等级切换为 H（约 30%）以保证扫码成功率',
    warnAction: '一键切换',
  },
  preview: {
    cardTitle: '实时预览',
    alt: '二维码预览',
    empty: '请输入二维码内容',
    download: (size) => `下载 PNG（${size} × ${size}）`,
    hint: (transparentBg) =>
      `透明背景时导出的 PNG 底色透明；${transparentBg ? '当前为透明背景模式。' : '当前为实色背景模式。'}`,
  },
  sections: {
    features: '功能特性',
    scenarios: '使用场景',
    faqs: '常见问题',
  },
  features: [
    {
      title: '输入即时生成',
      description: '输入文字或链接，二维码实时刷新，所见即所得，无需点击等待。',
    },
    {
      title: '样式自由定制',
      description: '前景色、背景色自由搭配并提供常用配色预设，尺寸、边距、容错等级均可调节。',
    },
    {
      title: '中央 Logo 贴图',
      description: '上传品牌 Logo 合成到二维码中央，大小可调、支持圆形裁切，宣传物料更专业。',
    },
    {
      title: '本地生成不上传',
      description: '二维码完全在浏览器本地生成与合成，内容不上传服务器，隐私安全，完全免费。',
    },
  ],
  scenarios: [
    {
      title: '名片与宣传单',
      description: '把官网、店铺链接生成二维码印在名片、传单上，扫码即达，比长链接更体面。',
    },
    {
      title: '活动海报引流',
      description: '海报中嵌入带品牌 Logo 的二维码，辨识度更高，公众号、社群转化更顺畅。',
    },
    {
      title: 'Wi-Fi 与文本分享',
      description: '将 Wi-Fi 密码、备注信息编码成二维码，贴在工位、民宿前台，扫码即可查看。',
    },
    {
      title: '电商与支付场景',
      description: '商品详情、售后卡片快速生成码图，打印张贴即扫即用，物料更新零成本。',
    },
  ],
  faqs: [
    {
      question: '生成的二维码扫描不出来怎么办？',
      answer:
        '可从三方面排查：一是前景色与背景色对比度要足够，建议深色前景配浅色背景；二是带 Logo 时建议容错等级切换为 H、Logo 尺寸不超过 25%；三是适当增大导出尺寸与边距，打印场景建议 800px 以上。',
    },
    {
      question: '二维码内容有长度限制吗？',
      answer:
        '有。内容越长二维码模块越密，超过容量上限会提示生成失败，请精简文本或改用短链接。另外容错等级越低（如 L）可容纳的内容越多，对长文本可适当调低容错等级。',
    },
    {
      question: '透明背景的二维码适合用在哪里？',
      answer:
        '开启透明背景后导出的 PNG 底色完全透明，适合叠加到带底色或渐变的海报、PPT、网页上，不会出现突兀的白色方块。注意部分老旧扫描器对无静区（边距为 0）的码识别较差，建议保留一定边距。',
    },
    {
      question: '我输入的内容和上传的 Logo 会被上传到服务器吗？',
      answer:
        '不会。本工具基于浏览器本地 Canvas API 完成二维码生成与 Logo 合成，全程无任何网络请求与数据上传，关闭页面后数据即消失，请放心使用。',
    },
  ],
  errors: {
    logoLoadFailed: 'Logo 图片加载失败',
    canvasFailed: '无法创建画布上下文',
    unknown: '未知错误',
    tooLong: '内容过长，超出二维码容量上限，请精简文本、改用短链接或降低容错等级',
    generateFailed: (message) => `二维码生成失败：${message}`,
  },
  downloadFileName: (size) => `qrcode-${size}px-${Date.now()}.png`,
}

const EN: QrCodeCopy = {
  languageSwitch: {
    label: '中文',
    ariaLabel: 'Switch to Chinese',
  },
  hero: {
    title: 'Custom QR Code Generator',
    intro:
      'Type or paste any text or link and the QR code appears instantly. Customize the colors, size, quiet-zone margin and error correction, drop your logo into the center, and download a crisp PNG — all generated locally in your browser, with nothing uploaded.',
  },
  content: {
    cardTitle: 'QR code content',
    label: 'Text or URL (a link, plain text, Wi-Fi details — anything encodable)',
    placeholder: 'e.g. https://example.com',
    hint: 'Longer content packs more modules into the same square. If it goes past the capacity limit you will see an error — shorten the text or lower the error correction level.',
  },
  style: {
    cardTitle: 'Design settings',
    sizeLabel: 'Size',
    colorLabel: 'Colors',
    colorPresets: [
      { label: 'Classic black', fg: '#000000', bg: '#FFFFFF' },
      { label: 'Business blue', fg: '#1D4ED8', bg: '#FFFFFF' },
      { label: 'Fresh green', fg: '#16A34A', bg: '#FFFFFF' },
    ],
    foreground: 'Foreground (modules)',
    background: 'Background',
    transparent: 'Transparent',
    transparentBg: 'Transparent background (PNG exports with no fill)',
    marginLabel: 'Quiet zone margin',
    marginHint:
      'Keep at least 2 modules of margin — the white quiet zone around the code makes it noticeably easier to scan.',
    errorLevelLabel: 'Error correction (default Q)',
    errorLevels: [
      { value: 'L', desc: '~7%' },
      { value: 'M', desc: '~15%' },
      { value: 'Q', desc: '~25%' },
      { value: 'H', desc: '~30%' },
    ],
    errorLevelTitle: (desc) => `Recovers up to ${desc} of a damaged code`,
  },
  logo: {
    cardTitle: 'Center logo',
    upload: 'Upload logo (PNG recommended)',
    replace: 'Replace logo',
    remove: 'Remove logo',
    previewAlt: 'Logo preview',
    hint: 'The logo is composited into the middle of the QR code. A PNG with a transparent background looks best.',
    sizeLabel: 'Logo size',
    sizeValue: (size) => `${size}% of the width`,
    round: 'Round-crop the logo',
    warn: 'Logo added — set error correction to H (~30%) so it still scans reliably',
    warnAction: 'Set to H',
  },
  preview: {
    cardTitle: 'Live preview',
    alt: 'QR code preview',
    empty: 'Enter some content to generate a QR code',
    download: (size) => `Download PNG (${size} × ${size})`,
    hint: (transparentBg) =>
      transparentBg
        ? 'Transparent mode is on, so the exported PNG has no background fill.'
        : 'Solid background mode is on. Turn on transparency to export a PNG with no background fill.',
  },
  sections: {
    features: 'Features',
    scenarios: 'What you can use it for',
    faqs: 'Frequently asked questions',
  },
  features: [
    {
      title: 'Generates as you type',
      description:
        'Paste a link or type your text and the code redraws instantly — what you see in the preview is exactly what you download.',
    },
    {
      title: 'Fully customizable style',
      description:
        'Pick foreground and background colors or start from a preset, then fine-tune size, quiet-zone margin and error correction.',
    },
    {
      title: 'Logo in the center',
      description:
        'Upload a brand logo and composite it into the middle of the code. Resize it, round-crop it, and raise error correction so it still scans.',
    },
    {
      title: 'Runs in your browser',
      description:
        'Encoding and logo compositing happen locally with Canvas. Your text and logo never reach a server — private, offline-capable and free.',
    },
  ],
  scenarios: [
    {
      title: 'Business cards and flyers',
      description:
        'Print a QR code for your website or store on a business card or flyer. One scan beats typing a long URL.',
    },
    {
      title: 'Posters and campaigns',
      description:
        'Drop a branded, logo-centered code onto posters and packaging so people can follow, join or buy in a single scan.',
    },
    {
      title: 'Wi-Fi and quick notes',
      description:
        'Encode Wi-Fi credentials, desk notes or event details and stick the code where people actually need it.',
    },
    {
      title: 'E-commerce and payments',
      description:
        'Generate codes for product pages, review cards and payment links, print them once, and reuse the same artwork everywhere.',
    },
  ],
  faqs: [
    {
      question: 'Why won\'t my QR code scan?',
      answer:
        'Check three things. First, contrast: a dark foreground on a light background is the safest combination. Second, if you added a logo, set error correction to H and keep the logo at or below 25% of the width. Third, export larger: 800 px or more for print, with a real quiet-zone margin around the code.',
    },
    {
      question: 'Is there a limit to how much content I can encode?',
      answer:
        'Yes. The more text you encode, the denser the modules become, and past the capacity limit generation fails. Shorten the text or use a short link. Lower error correction levels such as L hold more data, so drop from Q to L for very long content.',
    },
    {
      question: 'Where should I use a transparent QR code?',
      answer:
        'A transparent export has no background at all, so it sits cleanly on colored or gradient posters, slide decks and web pages instead of showing a white square. Keep a little quiet-zone margin: some older scanners struggle with a code that has no border at all.',
    },
    {
      question: 'Are my text and logo uploaded to a server?',
      answer:
        'No. Encoding and the logo composite run on a local canvas inside your browser, with no network requests and no uploads. Close the tab and the data is gone.',
    },
  ],
  errors: {
    logoLoadFailed: 'Could not load the logo image',
    canvasFailed: 'Could not create a canvas context',
    unknown: 'Unknown error',
    tooLong:
      'The content is too long for a QR code. Shorten the text, use a short link, or lower the error correction level.',
    generateFailed: (message) => `QR code generation failed: ${message}`,
  },
  downloadFileName: (size) => `qr-code-${size}px-${Date.now()}.png`,
}

export const QR_CODE_COPY: Record<Locale, QrCodeCopy> = {
  zh: ZH,
  en: EN,
}

export function getQrCodeCopy(locale: Locale): QrCodeCopy {
  return QR_CODE_COPY[locale] ?? ZH
}
