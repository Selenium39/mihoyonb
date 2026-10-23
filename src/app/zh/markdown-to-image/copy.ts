/**
 * Markdown 转图片工具的中英文案（/zh/markdown-to-image 与 /markdown-to-image 共用）。
 *
 * 约定：
 * - 中文文案与重构前的 page.tsx 逐字一致，避免影响已有页面与收录；
 * - 英文文案按英文市场习惯撰写（非直译），围绕 markdown to image / markdown
 *   screenshot / convert markdown to png / code snippet image 等搜索词；
 * - 动态句式用函数表达（示例内容、导出文件名），两种语言各自决定字面量；
 * - 组件 JSX 里不再出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

export interface MarkdownToImageCopy {
  languageSwitch: {
    label: string
    ariaLabel: string
  }
  hero: {
    title: string
    description: string
  }
  toolbar: {
    settings: string
    wechatFormatting: string
    export: string
    exporting: string
    fullscreen: string
  }
  fullscreen: {
    title: string
    exit: string
    editorTitle: string
    previewTitle: string
  }
  mobileTabs: {
    editor: string
    preview: string
  }
  cards: {
    editorTitle: string
    previewTitle: string
  }
  export: {
    /** 下载文件名：保持原有时间戳命名，两种语言都用英文文件名 */
    fileName: (timestamp: number) => string
    /** 仅写入控制台的导出失败前缀，不展示给用户 */
    failedLog: string
  }
  /** 编辑器里的初始示例内容；中文沿用站点名与 slogan，英文用固定英文示例 */
  sampleMarkdown: (siteName: string, slogan: string) => string
}

const ZH: MarkdownToImageCopy = {
  languageSwitch: {
    label: 'English',
    ariaLabel: '切换到英文版',
  },
  hero: {
    title: 'Markdown 转图片',
    description: '将 Markdown 文本转换为精美的图片海报',
  },
  toolbar: {
    settings: '设置',
    wechatFormatting: '公众号排版',
    export: '导出',
    exporting: '导出中...',
    fullscreen: '全屏编辑',
  },
  fullscreen: {
    title: 'Markdown 转图片 - 全屏编辑模式',
    exit: '退出全屏',
    editorTitle: 'Markdown 编辑器',
    previewTitle: '实时预览',
  },
  mobileTabs: {
    editor: '编辑器',
    preview: '预览',
  },
  cards: {
    editorTitle: 'Markdown 编辑器',
    previewTitle: '实时预览',
  },
  export: {
    fileName: (timestamp) => `markdown-image-${timestamp}.png`,
    failedLog: '导出失败:',
  },
  sampleMarkdown: (siteName, slogan) => `# ${siteName}

> ${slogan} ✨

所有处理均在浏览器本地完成，文件不上传服务器，隐私安全，完全免费。

## ✨ 为什么选择我们

- **隐私安全** — 文件全程本地处理，不上传服务器
- **完全免费** — 无需注册，不限次数
- **简单易用** — 打开即用，一键导出精美图片

---

开始编辑你的 Markdown，右侧实时预览，随时导出分享 🎉
`,
}

const EN: MarkdownToImageCopy = {
  languageSwitch: {
    label: '中文',
    ariaLabel: 'Switch to Chinese',
  },
  hero: {
    title: 'Markdown to Image Converter',
    description:
      'Convert Markdown into a clean, shareable PNG image — ideal for docs, code snippets and social posts. Live preview, custom themes and high-resolution export, all in your browser. Free, no signup, nothing uploaded.',
  },
  toolbar: {
    settings: 'Settings',
    wechatFormatting: 'WeChat formatting',
    export: 'Export PNG',
    exporting: 'Exporting…',
    fullscreen: 'Fullscreen editor',
  },
  fullscreen: {
    title: 'Markdown to Image — Fullscreen Editor',
    exit: 'Exit fullscreen',
    editorTitle: 'Markdown Editor',
    previewTitle: 'Live Preview',
  },
  mobileTabs: {
    editor: 'Editor',
    preview: 'Preview',
  },
  cards: {
    editorTitle: 'Markdown Editor',
    previewTitle: 'Live Preview',
  },
  export: {
    fileName: (timestamp) => `markdown-image-${timestamp}.png`,
    failedLog: 'Export failed:',
  },
  sampleMarkdown: () => `# Markdown to Image

> Turn Markdown into a shareable image ✨

Everything runs in your browser — nothing is uploaded, no signup, completely free.

## ✨ Why use this converter

- **Private by design** — your text never leaves your device
- **Free forever** — no account, no usage limits
- **Instant export** — live preview and one-click high-resolution PNG

---

Start typing Markdown on the left, check the live preview on the right, then export and share 🎉
`,
}

export const MARKDOWN_TO_IMAGE_COPY: Record<Locale, MarkdownToImageCopy> = {
  zh: ZH,
  en: EN,
}

export function getMarkdownToImageCopy(locale: Locale): MarkdownToImageCopy {
  return MARKDOWN_TO_IMAGE_COPY[locale] ?? ZH
}
