/**
 * 轻量 i18n 契约：英文在根路径（默认），中文在 /zh 前缀下。
 *
 * 不引入第三方 i18n 库；页面级文案放在各页面目录的 copy.ts 里，
 * 路由/语言判断统一走这里，避免各页面各写一套。
 */

export type Locale = 'zh' | 'en'

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALES: readonly Locale[] = ['zh', 'en']

/** 已翻译的页面配对（中文路径 <-> 英文路径），语言切换只在这些页面间互跳 */
export const TRANSLATED_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['/zh/pindou', '/pindou'],
  ['/zh/image-split', '/image-split'],
  ['/zh/image-combine', '/image-combine'],
  ['/zh/image-watermark', '/image-watermark'],
  ['/zh/markdown-to-image', '/markdown-to-image'],
  ['/zh/qr-code', '/qr-code'],
  ['/zh/video-frame', '/video-frame'],
  ['/zh/subtitle-tools', '/subtitle-tools'],
  ['/zh/social-resize', '/social-resize'],
  ['/zh/sensitive-words', '/sensitive-words'],
  ['/zh/privacy', '/privacy'],
  ['/zh/terms', '/terms'],
]

export function isChinesePath(pathname: string): boolean {
  return pathname === '/zh' || pathname.startsWith('/zh/')
}

export function getLocaleFromPathname(pathname: string): Locale {
  return isChinesePath(pathname) ? 'zh' : 'en'
}

export function localePrefix(locale: Locale): '' | '/zh' {
  return locale === 'zh' ? '/zh' : ''
}

/** 给站内路径加上语言前缀（英文返回原路径，中文加 /zh） */
export function localizedPath(locale: Locale, path: string): string {
  const normalized = path === '/' || path === '' ? '' : path.startsWith('/') ? path : `/${path}`
  return `${localePrefix(locale)}${normalized}` || '/'
}

/** 语言切换目标：已翻译页面互相跳转，未翻译页面回落到对应语言首页 */
export function alternateLocalePath(pathname: string): string {
  for (const [zhPath, enPath] of TRANSLATED_PAIRS) {
    if (pathname === zhPath) return enPath
    if (pathname === enPath) return zhPath
  }
  if (pathname === '/') return '/zh'
  if (pathname === '/zh') return '/'
  return isChinesePath(pathname) ? '/' : '/zh'
}

/** hreflang / sitemap 用的语言标签 */
export function hreflang(locale: Locale): string {
  return locale === 'en' ? 'en' : 'zh-CN'
}
