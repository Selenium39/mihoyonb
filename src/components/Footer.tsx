'use client'

import { Mail, Twitter, Heart, Languages } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'
import { alternateLocalePath, getLocaleFromPathname, type Locale } from '@/lib/i18n'
import { OPEN_CONSENT_EVENT } from '@/lib/consent'

type FooterLink = { href: string; label: string }

/** 站点外壳文案：中英各一份；英文页脚不展示中文工具链接 */
const FOOTER_COPY = {
  zh: {
    brand: siteConfig.name,
    tagline: `${siteConfig.slogan}，`,
    taglineSuffix: '助力您的内容创作',
    privacy: '所有工具均在浏览器本地运行，文件不上传服务器，隐私安全，完全免费。',
    quickNavHeading: '快捷导航',
    contactHeading: '联系我们',
    legalHeading: '法律条款',
    cookieSettings: 'Cookie 设置',
    languageSwitch: 'English',
    languageSwitchAria: '切换到英文站',
    links: [
      { href: '/', label: '首页' },
      { href: '/image-combine', label: '图片拼接' },
      { href: '/image-split', label: '长图切割' },
      { href: '/image-watermark', label: '图片加水印' },
      { href: '/social-resize', label: '尺寸适配' },
      { href: '/pindou', label: '拼豆图纸' },
      { href: '/qr-code', label: '二维码生成' },
      { href: '/video-frame', label: '视频截帧' },
      { href: '/markdown-to-image', label: 'Markdown转图片' },
      { href: '/subtitle-tools', label: '字幕工具' },
      { href: '/sensitive-words', label: '敏感词检测' },
    ] as FooterLink[],
    legalLinks: [
      { href: '/terms', label: '服务条款' },
      { href: '/privacy', label: '隐私政策' },
    ] as FooterLink[],
  },
  en: {
    brand: 'mihoyonb',
    tagline: 'Browser-based creative tools,',
    taglineSuffix: 'made for creators',
    privacy:
      'Every tool runs entirely in your browser. Your files are never uploaded, and nothing is sent to a server. Free to use.',
    quickNavHeading: 'Tools',
    contactHeading: 'Contact',
    legalHeading: 'Legal',
    cookieSettings: 'Cookie settings',
    languageSwitch: '中文',
    languageSwitchAria: 'Switch to the Chinese site',
    links: [
      { href: '/en', label: 'Home' },
      { href: '/en/pindou', label: 'Perler Bead Pattern Generator' },
    ] as FooterLink[],
    legalLinks: [
      { href: '/en/terms', label: 'Terms of Use' },
      { href: '/en/privacy', label: 'Privacy Policy' },
    ] as FooterLink[],
  },
} as const

export function Footer({
  locale: initialLocale,
  pathname: initialPathname,
}: {
  locale: Locale
  pathname?: string
}) {
  const currentPathname = usePathname()
  // 根布局是共享布局，客户端切换中英路由时不会重新渲染，
  // 因此以当前路由为准计算语言与切换目标，属性只作为初始值兜底。
  const pathname = currentPathname || initialPathname || '/'
  const locale: Locale = currentPathname ? getLocaleFromPathname(currentPathname) : initialLocale
  const copy = FOOTER_COPY[locale]
  const currentYear = new Date().getFullYear()
  const switchHref = alternateLocalePath(pathname)
  const isEn = locale === 'en'

  return (
    <footer className="w-full border-t bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* 移动端：垂直布局，桌面端：网格布局 */}
        <div className="flex flex-col space-y-8 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-8 lg:gap-12 md:space-y-0">

          {/* 品牌和版权信息 - 移动端置顶 */}
          <div className="text-center md:text-left md:col-span-3 lg:col-span-1">
            <div className="flex flex-col space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center justify-center md:justify-start space-x-2">
                <span>{copy.brand}</span>
                <Heart size={16} className="text-red-500" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {copy.tagline}<br className="hidden sm:inline" />
                {copy.taglineSuffix}
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                {copy.privacy}
              </p>
              <p className="text-xs text-muted-foreground/80">
                © {currentYear} {copy.brand}. All rights reserved.
              </p>
              <Link
                href={switchHref}
                hrefLang={isEn ? 'zh-CN' : 'en'}
                aria-label={copy.languageSwitchAria}
                className="inline-flex items-center justify-center md:justify-start gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Languages size={14} />
                {copy.languageSwitch}
              </Link>
            </div>
          </div>

          {/* 快捷导航 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-semibold text-foreground text-center md:text-left">
              {copy.quickNavHeading}
            </h4>
            {/* 桌面端两列网格，避免链接过多导致该栏过长 */}
            <div className="flex flex-col space-y-3 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-3 md:space-y-0">
              {copy.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 联系方式 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-semibold text-foreground text-center md:text-left">
              {copy.contactHeading}
            </h4>
            <div className="flex flex-col space-y-3">
              <a 
                href={`mailto:${siteConfig.author.email}`}
                className="group text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center md:justify-start space-x-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm">{siteConfig.author.email}</span>
              </a>
              <a 
                href={siteConfig.author.twitterUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="group text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center md:justify-start space-x-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 group-hover:bg-sky-200 dark:group-hover:bg-sky-900/50 transition-colors">
                  <Twitter size={16} className="text-sky-600 dark:text-sky-400" />
                </div>
                <span className="text-sm">{siteConfig.author.twitter}</span>
              </a>
            </div>
          </div>

          {/* 法律链接 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-semibold text-foreground text-center md:text-left">
              {copy.legalHeading}
            </h4>
            <div className="flex flex-col space-y-3">
              {copy.legalLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                {copy.cookieSettings}
              </button>
            </div>
          </div>
        </div>


      </div>
    </footer>
  )
}
