'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  applyConsent,
  clientNeedsConsent,
  isConsentCountry,
  OPEN_CONSENT_EVENT,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from '@/lib/consent'
import { getLocaleFromPathname, type Locale } from '@/lib/i18n'

const COPY = {
  zh: {
    title: 'Cookie 与广告',
    body: '本站通过 Google AdSense 展示广告来维持免费。选择“全部接受”会启用个性化广告及相关 Cookie；选择“仅必要”则完全不加载广告脚本。你可以随时在页脚更改选择。',
    accept: '全部接受',
    reject: '仅必要',
    privacy: '隐私政策',
    privacyHref: '/zh/privacy',
    dialogLabel: 'Cookie 同意',
  },
  en: {
    title: 'Cookies and ads',
    body: 'We use Google AdSense to keep these tools free. “Accept all” enables personalized ads and their cookies; “Essential only” loads no advertising scripts at all. You can change your choice anytime via Cookie settings in the footer.',
    accept: 'Accept all',
    reject: 'Essential only',
    privacy: 'Privacy Policy',
    privacyHref: '/privacy',
    dialogLabel: 'Cookie consent',
  },
} as const

export function ConsentBanner() {
  const pathname = usePathname()
  const locale: Locale = getLocaleFromPathname(pathname || '/')
  const [visible, setVisible] = useState(false)
  const copy = COPY[locale] ?? COPY.zh

  useEffect(() => {
    const stored = readConsent()
    if (stored) {
      applyConsent(stored)
      return
    }

    let cancelled = false
    // 静态托管下无请求头可读，国家码改从 Cloudflare 边缘端点取：
    // /cdn-cgi/trace 返回纯文本，loc= 行即 ISO 国家码。1.5s 超时或不可用时
    // 走 clientNeedsConsent() 的时区/语言兜底，与原 middleware 注入语义一致。
    const geo = fetch('/cdn-cgi/trace')
      .then((res) => res.text())
      .then((text) => text.match(/^loc=(.+)$/m)?.[1] ?? null)
      .catch(() => null)
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))

    Promise.race([geo, timeout]).then((country) => {
      if (cancelled) return
      const needsConsent = isConsentCountry(country) || clientNeedsConsent()
      if (!needsConsent) {
        // 非 EEA/UK/CH：直接授予，保持原有的个性化广告体验
        writeConsent('granted')
        applyConsent('granted')
        return
      }
      setVisible(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const open = () => setVisible(true)
    window.addEventListener(OPEN_CONSENT_EVENT, open)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open)
  }, [])

  const choose = (value: ConsentChoice) => {
    writeConsent(value)
    applyConsent(value)
    setVisible(false)

    // 撤回同意时，已经加载的广告脚本与广告位无法可靠清除，直接刷新页面，
    // 让页面以 denied 状态重新渲染（刷新后不会再加载广告）。
    if (value === 'denied' && document.querySelector('script[data-mihoyonb-ads]')) {
      window.location.reload()
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={copy.dialogLabel}
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="container mx-auto max-w-3xl rounded-xl border bg-background/95 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-start gap-2">
            <Cookie size={18} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{copy.title}</p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {copy.body}{' '}
                <Link href={copy.privacyHref} className="underline hover:text-foreground">
                  {copy.privacy}
                </Link>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => choose('denied')}>
              {copy.reject}
            </Button>
            <Button size="sm" onClick={() => choose('granted')}>
              {copy.accept}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
