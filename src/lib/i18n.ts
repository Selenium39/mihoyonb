/**
 * 轻量 i18n 契约：中文在根路径，英文在 /en 前缀下。
 *
 * 不引入第三方 i18n 库；页面级文案放在各页面目录的 copy.ts 里，
 * 路由/语言判断统一走这里，避免各页面各写一套。
 */

export type Locale = 'zh' | 'en'

export const DEFAULT_LOCALE: Locale = 'zh'
export const LOCALES: readonly Locale[] = ['zh', 'en']

/** 已翻译的页面配对（中文路径 <-> 英文路径），语言切换只在这些页面间互跳 */
export const TRANSLATED_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['/pindou', '/en/pindou'],
  ['/image-split', '/en/image-split'],
  ['/image-combine', '/en/image-combine'],
  ['/image-watermark', '/en/image-watermark'],
  ['/markdown-to-image', '/en/markdown-to-image'],
  ['/qr-code', '/en/qr-code'],
  ['/video-frame', '/en/video-frame'],
  ['/subtitle-tools', '/en/subtitle-tools'],
  ['/social-resize', '/en/social-resize'],
  ['/sensitive-words', '/en/sensitive-words'],
  ['/privacy', '/en/privacy'],
  ['/terms', '/en/terms'],
]

export function isEnglishPath(pathname: string): boolean {
  return pathname === '/en' || pathname.startsWith('/en/')
}

export function getLocaleFromPathname(pathname: string): Locale {
  return isEnglishPath(pathname) ? 'en' : 'zh'
}

export function localePrefix(locale: Locale): '' | '/en' {
  return locale === 'en' ? '/en' : ''
}

/** 给根路径或站内路径加上语言前缀（中文返回原路径） */
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
  if (pathname === '/') return '/en'
  if (pathname === '/en') return '/'
  return isEnglishPath(pathname) ? '/' : '/en'
}

/** hreflang / sitemap 用的语言标签 */
export function hreflang(locale: Locale): string {
  return locale === 'en' ? 'en' : 'zh-CN'
}
