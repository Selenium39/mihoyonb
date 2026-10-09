// 微信公众号排版主题：所有样式逐元素内联（写在每个元素的 style 属性上）
// 微信编辑器粘贴时会剥离 class 与 <style> 标签，只有内联样式能保留
import { renderMarkdown } from '@/lib/markdown-poster'

export type WechatThemeId = 'classicBlue' | 'warmOrange' | 'minimalGray'

export interface WechatTheme {
  id: WechatThemeId
  label: string
  desc: string
  /** 主题选择按钮上的色带 */
  swatch: string
  /** 包裹 section 的整体兜底样式 */
  root: string
  /** 选择器 -> 已序列化的内联样式（普通标签在前，嵌套修正在后） */
  styles: Record<string, string>
}

const MONO_FONT = "Menlo,Consolas,'Courier New',monospace"

function decls(o: Record<string, string>): string {
  return Object.entries(o)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')
}

interface ThemeColors {
  text: string
  h1: string
  h2: string
  h3: string
  h4: string
  link: string
  strong: string
  emColor: string
  quoteBorder: string
  quoteBg: string
  quoteText: string
  inlineCodeBg: string
  inlineCodeColor: string
  preBg: string
  preColor: string
  preBorder: string
  markBg: string
  markColor: string
  thBg: string
  thColor: string
  tableBorder: string
  hrColor: string
}

interface HeadingDecor {
  /** 追加到 h1 的装饰（如左侧竖条），随主题风格变化 */
  h1?: Record<string, string>
  h2?: Record<string, string>
}

function makeWechatTheme(
  id: WechatThemeId,
  label: string,
  desc: string,
  swatch: string,
  c: ThemeColors,
  decor: HeadingDecor = {}
): WechatTheme {
  const root = decls({
    'font-size': '15.5px',
    color: c.text,
    'line-height': '1.75',
    'word-break': 'break-word',
    'text-align': 'left'
  })

  const styles: Record<string, string> = {
    h1: decls({
      'font-size': '20px',
      'font-weight': '700',
      color: c.h1,
      margin: '24px 0 16px',
      'line-height': '1.4',
      ...(decor.h1 ?? {})
    }),
    h2: decls({
      'font-size': '18px',
      'font-weight': '600',
      color: c.h2,
      margin: '22px 0 14px',
      'line-height': '1.4',
      ...(decor.h2 ?? {})
    }),
    h3: decls({
      'font-size': '16.5px',
      'font-weight': '600',
      color: c.h3,
      margin: '20px 0 12px',
      'line-height': '1.5'
    }),
    h4: decls({
      'font-size': '15.5px',
      'font-weight': '600',
      color: c.h4,
      margin: '18px 0 10px'
    }),
    h5: decls({
      'font-size': '15px',
      'font-weight': '600',
      color: c.h4,
      margin: '16px 0 8px'
    }),
    h6: decls({
      'font-size': '15px',
      'font-weight': '600',
      color: c.emColor,
      margin: '16px 0 8px'
    }),
    // 正文 15.5px / 1.75 行距
    p: decls({
      'font-size': '15.5px',
      color: c.text,
      'line-height': '1.75',
      margin: '0 0 14px',
      'letter-spacing': '0.3px'
    }),
    strong: decls({ 'font-weight': '700', color: c.strong }),
    em: decls({ 'font-style': 'italic', color: c.emColor }),
    a: decls({
      color: c.link,
      'text-decoration': 'none',
      'border-bottom': `1px solid ${c.link}`
    }),
    // ==高亮== 标记
    mark: decls({
      background: c.markBg,
      color: c.markColor,
      padding: '1px 4px',
      'border-radius': '3px'
    }),
    ul: decls({ 'padding-left': '1.5em', margin: '0 0 14px' }),
    ol: decls({ 'padding-left': '1.5em', margin: '0 0 14px' }),
    li: decls({
      'font-size': '15.5px',
      color: c.text,
      'line-height': '1.75',
      margin: '0 0 8px'
    }),
    // 引用块：左边框 + 浅底色
    blockquote: decls({
      margin: '16px 0',
      padding: '12px 16px',
      'border-left': `3px solid ${c.quoteBorder}`,
      background: c.quoteBg,
      color: c.quoteText,
      'border-radius': '0 6px 6px 0',
      'font-size': '15px'
    }),
    // 代码块：等宽字体 + 浅底色，pre-wrap 防止横向溢出
    pre: decls({
      background: c.preBg,
      color: c.preColor,
      'font-family': MONO_FONT,
      'font-size': '13.5px',
      'line-height': '1.6',
      padding: '14px 16px',
      'border-radius': '8px',
      border: `1px solid ${c.preBorder}`,
      'white-space': 'pre-wrap',
      'word-break': 'break-word',
      margin: '16px 0'
    }),
    code: decls({
      'font-family': MONO_FONT,
      'font-size': '13.5px',
      background: c.inlineCodeBg,
      color: c.inlineCodeColor,
      padding: '2px 6px',
      'border-radius': '4px'
    }),
    table: decls({
      width: '100%',
      'border-collapse': 'collapse',
      margin: '16px 0',
      'font-size': '14px'
    }),
    th: decls({
      padding: '8px 12px',
      border: `1px solid ${c.tableBorder}`,
      background: c.thBg,
      color: c.thColor,
      'font-weight': '600',
      'text-align': 'left'
    }),
    td: decls({
      padding: '8px 12px',
      border: `1px solid ${c.tableBorder}`,
      color: c.text
    }),
    img: decls({
      'max-width': '100%',
      height: 'auto',
      'border-radius': '8px',
      display: 'block',
      margin: '12px auto'
    }),
    hr: decls({
      border: 'none',
      'border-top': `1px solid ${c.hrColor}`,
      margin: '20px 0'
    }),
    // 嵌套修正：放在普通标签之后，覆盖上方设置的通用样式
    'blockquote p': decls({
      margin: '0',
      'font-size': '15px',
      color: c.quoteText
    }),
    'li p': decls({ margin: '0 0 6px', 'font-size': '15.5px' }),
    'pre code': decls({
      background: 'transparent',
      color: 'inherit',
      padding: '0',
      'border-radius': '0',
      'font-size': '13.5px'
    })
  }

  return { id, label, desc, swatch, root, styles }
}

// 经典蓝：标题带左侧蓝色竖条，整体商务清爽
const classicBlue = makeWechatTheme(
  'classicBlue',
  '经典蓝',
  '蓝色竖条标题 · 商务清爽',
  'linear-gradient(135deg, #2563eb, #93c5fd)',
  {
    text: '#3f4a5a',
    h1: '#1e3a8a',
    h2: '#1d4ed8',
    h3: '#334155',
    h4: '#334155',
    link: '#2563eb',
    strong: '#1e40af',
    emColor: '#4f46e5',
    quoteBorder: '#93c5fd',
    quoteBg: '#eff6ff',
    quoteText: '#52627a',
    inlineCodeBg: '#eff6ff',
    inlineCodeColor: '#1d4ed8',
    preBg: '#f0f4f9',
    preColor: '#33415a',
    preBorder: '#dbeafe',
    markBg: '#dbeafe',
    markColor: '#1e3a8a',
    thBg: '#eff6ff',
    thColor: '#1e3a8a',
    tableBorder: '#dbe3ef',
    hrColor: '#dbe3ef'
  },
  {
    h1: { 'border-left': '4px solid #2563eb', 'padding-left': '14px' },
    h2: { 'border-left': '3px solid #60a5fa', 'padding-left': '12px' }
  }
)

// 暖橙：标题带下划线橙条，温暖活泼
const warmOrange = makeWechatTheme(
  'warmOrange',
  '暖橙',
  '橙色标题下划线 · 温暖活泼',
  'linear-gradient(135deg, #ea580c, #fde68a)',
  {
    text: '#4b4340',
    h1: '#c2410c',
    h2: '#ea580c',
    h3: '#b45309',
    h4: '#92400e',
    link: '#ea580c',
    strong: '#c2410c',
    emColor: '#d97706',
    quoteBorder: '#fdba74',
    quoteBg: '#fff7ed',
    quoteText: '#7c5343',
    inlineCodeBg: '#fff1e6',
    inlineCodeColor: '#c2410c',
    preBg: '#faf3ec',
    preColor: '#5b4636',
    preBorder: '#f7dcc4',
    markBg: '#fde68a',
    markColor: '#92400e',
    thBg: '#fff1e6',
    thColor: '#9a3412',
    tableBorder: '#f3ddc9',
    hrColor: '#f0ddc9'
  },
  {
    h1: { 'border-bottom': '2px solid #fb923c', 'padding-bottom': '8px' },
    h2: { 'border-bottom': '1px dashed #fdba74', 'padding-bottom': '6px' }
  }
)

// 极简灰：无装饰纯加粗，安静耐看
const minimalGray = makeWechatTheme(
  'minimalGray',
  '极简灰',
  '无装饰纯排版 · 安静耐看',
  'linear-gradient(135deg, #52525b, #e4e4e7)',
  {
    text: '#404040',
    h1: '#171717',
    h2: '#262626',
    h3: '#404040',
    h4: '#404040',
    link: '#52525b',
    strong: '#171717',
    emColor: '#71717a',
    quoteBorder: '#d4d4d8',
    quoteBg: '#f4f4f5',
    quoteText: '#52525b',
    inlineCodeBg: '#f4f4f5',
    inlineCodeColor: '#3f3f46',
    preBg: '#f4f4f5',
    preColor: '#27272a',
    preBorder: '#e4e4e7',
    markBg: '#e4e4e7',
    markColor: '#18181b',
    thBg: '#f4f4f5',
    thColor: '#262626',
    tableBorder: '#e4e4e7',
    hrColor: '#e4e4e7'
  }
)

export const wechatThemes: WechatTheme[] = [classicBlue, warmOrange, minimalGray]

export function getWechatTheme(id: WechatThemeId): WechatTheme {
  return wechatThemes.find((t) => t.id === id) ?? classicBlue
}

/**
 * 将 marked 渲染出的 HTML 片段套上公众号主题：
 * 在离屏容器中遍历 DOM，按主题映射逐节点写入 style 属性，再取 innerHTML。
 */
export function buildWechatInlineHtml(html: string, themeId: WechatThemeId): string {
  const theme = getWechatTheme(themeId)
  const container = document.createElement('div')
  container.innerHTML = html

  // 保险：markdown 理论上不会产出 script/style，但输入可能来自粘贴
  container.querySelectorAll('script,style').forEach((n) => n.remove())

  for (const [selector, style] of Object.entries(theme.styles)) {
    container.querySelectorAll(selector).forEach((el) => {
      el.setAttribute('style', style)
    })
  }

  return `<section style="${theme.root}">${container.innerHTML}</section>`
}

/** 从已渲染的 HTML 提取纯文本（作为 text/plain 剪辑板回退内容） */
export function wechatPlainText(html: string): string {
  const container = document.createElement('div')
  container.innerHTML = html
  container
    .querySelectorAll('p,h1,h2,h3,h4,h5,h6,li,blockquote,pre,hr,tr')
    .forEach((el) => el.after(document.createTextNode('\n')))
  return (container.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}

/** 一步到位：markdown 文本 -> 公众号内联样式 HTML */
export async function renderWechatHtml(markdown: string, themeId: WechatThemeId): Promise<string> {
  const html = await renderMarkdown(markdown)
  return buildWechatInlineHtml(html, themeId)
}
