'use client'

import { ExternalLink } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { CPS_PROMO } from '@/config/promo'
import { getLocaleFromPathname, type Locale } from '@/lib/i18n'

/**
 * 页脚顶部腾讯云 CPS 推广横条（普通外链，非广告脚本，
 * 不依赖 Cookie 同意；仅用户点击后才跳转第三方站点）。
 * 与 Footer 同一套语言判定逻辑：以当前路由为准，属性兜底。
 */
export function PromoBar() {
  const currentPathname = usePathname()
  const locale: Locale = getLocaleFromPathname(currentPathname || '/')
  const promo = CPS_PROMO[locale]

  return (
    <a
      href={promo.href}
      target="_blank"
      rel="nofollow sponsored noopener"
      className="group mb-8 flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm transition-colors hover:bg-muted/60"
    >
      <span className="flex-none rounded border border-border px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground/80">
        {promo.tag}
      </span>
      <span className="text-muted-foreground transition-colors group-hover:text-foreground">
        {promo.text}
      </span>
      <ExternalLink
        size={14}
        className="ml-auto flex-none text-muted-foreground/60"
        aria-hidden="true"
      />
    </a>
  )
}
