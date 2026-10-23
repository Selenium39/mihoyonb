'use client'

import { useEffect } from 'react'
import { CONSENT_EVENT, readConsent, type ConsentChoice } from '@/lib/consent'

/**
 * 只在用户同意后加载 AdSense。拒绝或未选择时不请求广告脚本，
 * 从源头上避免欧洲用户在未同意时被写入广告 Cookie。
 */
export function AdsScript({ clientId }: { clientId: string }) {
  useEffect(() => {
    const load = () => {
      if (document.querySelector('script[data-mihoyonb-ads]')) return
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`
      script.crossOrigin = 'anonymous'
      script.dataset.mihoyonbAds = 'true'
      document.head.appendChild(script)
    }

    if (readConsent() === 'granted') load()

    const onChange = (event: Event) => {
      const choice = (event as CustomEvent<ConsentChoice>).detail
      if (choice === 'granted') load()
      if (choice === 'denied') {
        document.querySelector('script[data-mihoyonb-ads]')?.remove()
      }
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [clientId])

  return null
}
