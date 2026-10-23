'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { getLocaleFromPathname, hreflang } from '@/lib/i18n'

/**
 * 客户端路由切换时同步 `<html lang>`。
 *
 * 根布局在服务端按 x-pathname 输出 lang，但 App Router 的 layout 在客户端
 * 导航时不会重新渲染，`/` 与 `/zh` 互跳后 lang 会停留在旧值，影响读屏与 SEO。
 * 这里在路由变化后按 pathname 修正一次。
 */
export function HtmlLangSync() {
  const pathname = usePathname()

  useEffect(() => {
    const lang = hreflang(getLocaleFromPathname(pathname || '/'))
    if (document.documentElement.lang !== lang) {
      document.documentElement.lang = lang
    }
  }, [pathname])

  return null
}
