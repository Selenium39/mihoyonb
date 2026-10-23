'use client'

import { useEffect, useRef, useState } from 'react'
import { CONSENT_EVENT, readConsent, type ConsentChoice } from '@/lib/consent'
import { ADSENSE_CLIENT } from '@/config/ads'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

/**
 * 手动广告位：仅在用户同意（granted）后渲染 <ins> 并 push 到
 * adsbygoogle 队列，与 AdsScript 的“未同意不加载脚本”保持同一口径。
 * 广告位置完全由代码里的 <AdSlot> 摆放决定，不依赖自动广告。
 */
export function AdSlot({
  slot,
  label = 'Advertisement',
  className = '',
}: {
  slot: string
  label?: string
  className?: string
}) {
  const [granted, setGranted] = useState(false)
  const pushed = useRef(false)

  useEffect(() => {
    const onChange = (event: Event) => {
      const choice = (event as CustomEvent<ConsentChoice>).detail
      if (choice !== 'granted') {
        // <ins> 已随 granted=false 卸载；恢复同意后会重新挂载，需要重新 push
        pushed.current = false
      }
      setGranted(readConsent() === 'granted')
    }
    setGranted(readConsent() === 'granted')
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  useEffect(() => {
    if (!granted || pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // 脚本尚未加载时 push 已入队，adsbygoogle.js 加载后会处理队列
    }
  }, [granted])

  if (!granted) return null

  return (
    <aside className={`my-8 ${className}`} aria-label={label}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
        {label}
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
