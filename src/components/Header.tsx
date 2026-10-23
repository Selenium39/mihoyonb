'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronDown, Github, Languages } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { NAV_GROUPS, isGroupActive } from '@/config/navigation'
import { alternateLocalePath, getLocaleFromPathname, type Locale } from '@/lib/i18n'

/**
 * 站点外壳文案：中英各一份。
 * 英文版只保留已可访问的英文页面（/en、/en/pindou），不展示中文工具链接。
 */
const HEADER_COPY = {
  zh: {
    brand: siteConfig.name,
    tagline: siteConfig.slogan,
    home: '首页',
    githubAria: 'GitHub 源码仓库',
    githubLabel: 'GitHub 源码',
    toggleMenu: '切换菜单',
    languageSwitch: 'English',
    languageSwitchAria: '切换到英文站',
  },
  en: {
    brand: 'mihoyonb',
    tagline: 'Browser-based creative tools',
    home: 'Home',
    githubAria: 'GitHub source repository',
    githubLabel: 'GitHub source',
    toggleMenu: 'Toggle menu',
    languageSwitch: '中文',
    languageSwitchAria: 'Switch to the Chinese site',
  },
} as const

export function Header({ locale: initialLocale }: { locale: Locale }) {
  const pathname = usePathname()
  // 根布局是共享布局，客户端在中英文之间跳转时不会重新渲染，
  // 所以以当前路由推导的语言为准，locale 属性只作为初始值兜底。
  const locale: Locale = pathname ? getLocaleFromPathname(pathname) : initialLocale
  const copy = HEADER_COPY[locale]
  const isEn = locale === 'en'

  const homeHref = isEn ? '/en' : '/'
  const switchHref = alternateLocalePath(pathname || homeHref)

  // 英文站导航（只列已上线页面）
  const enLinks: { href: string; label: string }[] = [
    { href: '/en', label: copy.home },
    { href: '/en/pindou', label: 'Bead Patterns' },
  ]

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // 当前展开的分组下拉（label），同一时刻至多一组
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // 当前路由是否激活（首页需精确匹配，工具页按前缀匹配）
  const isActive = (href: string) =>
    href === '/' || href === '/en' ? pathname === href : pathname.startsWith(href)

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`

  // 控制body滚动 - 仅在移动端菜单打开时禁用滚动
  useEffect(() => {
    if (isMenuOpen) {
      // 保存原始的overflow值
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // 清理函数：恢复原始的overflow值
      return () => {
        document.body.style.overflow = originalOverflow || ''
      }
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* 桌面端和移动端头部 */}
        <div className="relative flex h-16 items-center justify-between gap-6">
          {/* Logo、标题与口号 */}
          <Link href={homeHref} className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src={siteConfig.logo.src}
              alt={`${copy.brand} Logo`}
              width={32}
              height={32}
              className="rounded flex-shrink-0"
            />
            <span className="ml-2 text-xl font-bold text-foreground whitespace-nowrap">
              {copy.brand}
            </span>
            <span className="hidden lg:block ml-3 pl-3 border-l text-xs text-muted-foreground whitespace-nowrap">
              {copy.tagline}
            </span>
          </Link>

          {/* 桌面端导航：中文为分组下拉，英文只列已上线页面；绝对定位精确居中 */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-6">
            {isEn ? (
              enLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass(isActive(link.href))}>
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <Link href="/" className={navLinkClass(isActive('/'))}>
                  {copy.home}
                </Link>
                {NAV_GROUPS.map((group) => {
                  const groupActive = isGroupActive(group, pathname)
                  const isOpen = openGroup === group.label
                  return (
                    <div
                      key={group.label}
                      className="relative"
                      onMouseEnter={() => setOpenGroup(group.label)}
                      onMouseLeave={() => setOpenGroup(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setOpenGroup(null)
                      }}
                    >
                      <button
                        type="button"
                        className={`flex items-center gap-1 ${navLinkClass(groupActive)}`}
                        onClick={() => setOpenGroup(isOpen ? null : group.label)}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                      >
                        {group.label}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2">
                          <div className="w-60 rounded-lg border bg-popover shadow-lg py-2">
                            {group.tools.map((tool) => {
                              const Icon = tool.icon
                              return (
                                <Link
                                  key={tool.href}
                                  href={tool.href}
                                  onClick={() => setOpenGroup(null)}
                                  className={`flex items-start gap-2.5 px-4 py-2 transition-colors ${
                                    isActive(tool.href)
                                      ? 'bg-accent text-foreground'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                  }`}
                                >
                                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>
                                    <span className="block text-sm font-medium">{tool.name}</span>
                                    <span className="block text-xs text-muted-foreground/80">
                                      {tool.description}
                                    </span>
                                  </span>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </nav>

          {/* 右侧：语言切换、GitHub 源码入口（桌面）与汉堡菜单按钮（移动） */}
          <div className="flex items-center gap-2">
            <Link
              href={switchHref}
              hrefLang={isEn ? 'zh-CN' : 'en'}
              aria-label={copy.languageSwitchAria}
              className="hidden md:flex items-center gap-1.5 h-8 px-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Languages className="w-4 h-4" />
              {copy.languageSwitch}
            </Link>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.githubAria}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <button
              className="md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
              onClick={toggleMenu}
              aria-label={copy.toggleMenu}
            >
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* 移动端透明点击区域 - 用于关闭菜单 */}
        {isMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/20"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
            style={{ top: '64px' }} // 从header下方开始，避免覆盖整个页面
          />
        )}

        {/* 移动端导航菜单 - 全屏滑出式（中文按图片/视频/文案分组；英文只列已上线页面） */}
        <div className={`md:hidden fixed inset-x-0 top-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 border-b transition-all duration-300 ease-in-out z-40 ${
          isMenuOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: 'calc(100vh - 64px)' }} // 限制最大高度，避免影响页面滚动
        >
          <nav className="container mx-auto px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {isEn ? (
              <div className="flex flex-col space-y-1">
                {enLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center text-sm font-medium rounded-md px-3 py-2.5 transition-colors ${
                      isActive(link.href)
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col space-y-1">
                  <Link
                    href="/"
                    className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2.5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {copy.home}
                  </Link>
                </div>
                {NAV_GROUPS.map((group) => (
                  <div key={group.label} className="mt-4">
                    <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground/70">
                      {group.label}
                    </p>
                    <div className="flex flex-col space-y-1">
                      {group.tools.map((tool) => {
                        const Icon = tool.icon
                        return (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className={`flex items-center gap-3 text-sm font-medium rounded-md px-3 py-2.5 transition-colors ${
                              isActive(tool.href)
                                ? 'bg-accent text-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {tool.name}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 移动端 GitHub 入口与语言切换 */}
            <div className="mt-5 pt-4 border-t flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                {copy.githubLabel}
              </a>
              <Link
                href={switchHref}
                hrefLang={isEn ? 'zh-CN' : 'en'}
                className="flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Languages className="w-3.5 h-3.5" />
                {copy.languageSwitch}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
