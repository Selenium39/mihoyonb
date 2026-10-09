// Markdown 海报共享配置：画布尺寸预设、排版主题、样式计算与 Markdown 渲染器
// 供 markdown-to-image 页面的预览组件（ImagePreview）、设置对话框（CustomizeDialog）
// 与导出逻辑（page.tsx）共用，保证预览与导出一致
import type { CSSProperties } from 'react'
import { Marked } from 'marked'

export type SizePreset = 'custom' | 'xhs34' | 'xhs916'
export type PosterTheme = 'classic' | 'xhsVivid' | 'xhsMint'

export interface PosterSettings {
  background: string
  customGradient: {
    startColor: string
    endColor: string
    direction: string
  }
  fontSize: number
  padding: number
  width: number
  /** 画布尺寸预设，默认 custom（沿用 width 滑块） */
  sizePreset?: SizePreset
  /** 排版主题，默认 classic（现有白卡片风格） */
  theme?: PosterTheme
  /** 小红书主题标题放大倍数，默认 1 */
  titleScale?: number
}

// 预设背景渐变（与页面原 backgroundPresets 保持一致）
export const posterBackgrounds: Record<string, string> = {
  gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  gradient3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  gradient4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  gradient5: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  gradient6: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  gradient7: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  gradient8: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
}

export interface SizePresetOption {
  value: SizePreset
  label: string
  hint: string
  width?: number
  height?: number
}

// 画布尺寸预设：自由宽度（原有）+ 小红书 3:4 / 9:16 竖屏
export const sizePresetOptions: SizePresetOption[] = [
  { value: 'custom', label: '自由宽度', hint: '480–800px · 高度自适应' },
  { value: 'xhs34', label: '3:4 小红书', hint: '1080×1440', width: 1080, height: 1440 },
  { value: 'xhs916', label: '9:16 竖屏', hint: '1080×1920', width: 1080, height: 1920 }
]

export function getSizePreset(preset?: SizePreset): SizePresetOption {
  return sizePresetOptions.find((o) => o.value === (preset ?? 'custom')) ?? sizePresetOptions[0]
}

export interface PosterThemeOption {
  value: PosterTheme
  label: string
  desc: string
  /** 切换主题时若背景仍为上一主题的推荐背景，则自动跟随切换 */
  defaultBackground: string
}

// 排版主题：经典白卡（原有）+ 小红书风 × 2
export const posterThemeOptions: PosterThemeOption[] = [
  {
    value: 'classic',
    label: '经典白卡',
    desc: '玻璃拟态白卡片，原有风格',
    defaultBackground: 'gradient1'
  },
  {
    value: 'xhsVivid',
    label: '小红书·活力派',
    desc: '大号加粗标题 + 荧光笔高亮',
    defaultBackground: 'gradient5'
  },
  {
    value: 'xhsMint',
    label: '小红书·清新派',
    desc: '柔和绿调圆角卡片，适合清单',
    defaultBackground: 'gradient4'
  }
]

export function getThemeClass(theme?: PosterTheme): string {
  if (theme === 'xhsVivid') return 'markdown-rendered theme-xhs-vivid'
  if (theme === 'xhsMint') return 'markdown-rendered theme-xhs-mint'
  return 'markdown-rendered'
}

export function resolvePosterBackground(settings: PosterSettings): string {
  if (settings.background === 'custom') {
    return `linear-gradient(${settings.customGradient.direction}, ${settings.customGradient.startColor} 0%, ${settings.customGradient.endColor} 100%)`
  }
  return posterBackgrounds[settings.background] || posterBackgrounds.gradient1
}

// 动态字号 CSS 变量（与原 ImagePreview 逻辑保持一致，含移动端缩减）
export function getFontVars(settings: PosterSettings, isMobile: boolean): Record<string, string> {
  const base = isMobile ? Math.max(14, settings.fontSize - 2) : settings.fontSize
  return {
    '--dynamic-font-size': `${base}px`,
    '--dynamic-h1-size': `${Math.round(base * 1.75)}px`,
    '--dynamic-h2-size': `${Math.round(base * 1.375)}px`,
    '--dynamic-h3-size': `${Math.round(base * 1.125)}px`,
    '--dynamic-code-size': `${Math.round(base * 0.875)}px`,
    '--dynamic-quote-size': `${Math.round(base * 0.95)}px`,
    '--title-scale': String(settings.titleScale ?? 1)
  }
}

// 海报外框内联样式：预览与导出共用（zoom=100 时即为导出样式）
export function getPosterStyle(
  settings: PosterSettings,
  opts: { isMobile: boolean; zoom: number }
): CSSProperties {
  const preset = getSizePreset(settings.sizePreset)
  const width = preset.width ?? settings.width
  const minHeight = preset.height
    ? opts.isMobile
      ? Math.round(preset.height * 0.42)
      : preset.height
    : opts.isMobile
      ? 300
      : 400

  return {
    width: opts.isMobile ? '100%' : `${width}px`,
    maxWidth: opts.isMobile ? '100%' : 'none',
    padding: opts.isMobile ? `${settings.padding / 2}px` : `${settings.padding}px`,
    background: resolvePosterBackground(settings),
    borderRadius: '12px',
    minHeight: `${minHeight}px`,
    position: 'relative',
    overflow: 'hidden',
    transform: `scale(${opts.zoom / 100})`,
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease',
    margin: '0 auto'
  }
}

// 内容卡片内联样式：随排版主题变化（小红书主题大圆角大内边距）
export function getContentStyle(settings: PosterSettings, isMobile: boolean): CSSProperties {
  const theme = settings.theme ?? 'classic'
  const base: CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: isMobile ? '20px' : '40px',
    minHeight: isMobile ? '300px' : '400px',
    fontSize: isMobile ? `${Math.max(14, settings.fontSize - 2)}px` : `${settings.fontSize}px`,
    lineHeight: '1.7',
    color: '#475569',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  }

  if (theme === 'xhsVivid') {
    return {
      ...base,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      borderRadius: '28px',
      padding: isMobile ? '24px' : '56px',
      color: '#53241c',
      boxShadow: '0 16px 48px rgba(190, 24, 93, 0.18)'
    }
  }

  if (theme === 'xhsMint') {
    return {
      ...base,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '24px',
      padding: isMobile ? '24px' : '52px',
      color: '#3f4f44',
      boxShadow: '0 16px 44px rgba(6, 95, 70, 0.16)'
    }
  }

  return base
}

// ─── Markdown 渲染器（独立实例，支持 ==高亮== 标记语法） ───

const highlightMarkExtension = {
  name: 'highlightMark',
  level: 'inline' as const,
  start(src: string) {
    return src.indexOf('==')
  },
  // marked 扩展的 this 为 lexer/parser 上下文，官方类型较为繁琐，此处用 any
  tokenizer(this: any, src: string) {
    const match = /^==(?=\S)([\s\S]*?\S)==/.exec(src)
    if (match) {
      return {
        type: 'highlightMark',
        raw: match[0],
        tokens: this.lexer.inlineTokens(match[1])
      }
    }
    return undefined
  },
  renderer(this: any, token: any) {
    return `<mark>${this.parser.parseInline(token.tokens)}</mark>`
  }
}

export const markdownRenderer = new Marked({
  breaks: true,
  gfm: true
})

markdownRenderer.use({ extensions: [highlightMarkExtension as any] })

export async function renderMarkdown(md: string): Promise<string> {
  return (await markdownRenderer.parse(md || '')) as string
}
