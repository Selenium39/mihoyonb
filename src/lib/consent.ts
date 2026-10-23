/**
 * EEA / UK / 瑞士的广告同意（Consent Mode v2）。
 *
 * Google 要求面向欧洲经济区、英国与瑞士的用户在设置广告 Cookie 前取得同意。
 * 这里用自建横幅 + Google Consent Mode v2 实现：默认全部 denied，用户
 * 选择后再 update；拒绝时完全不加载 AdSense 脚本。
 *
 * 注意：自建横幅不是 Google 认证 CMP。流量做大后可换成 AdSense 后台的
 * Privacy & messaging（Funding Choices）或其他认证 CMP。
 */

export const CONSENT_KEY = 'mihoyonb-consent'
export const CONSENT_EVENT = 'mihoyonb:consent-change'
export const OPEN_CONSENT_EVENT = 'mihoyonb:open-consent'
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000

export type ConsentChoice = 'granted' | 'denied'

/** EEA 30 国 + 英国 + 瑞士（ISO 3166-1 alpha-2） */
export const CONSENT_COUNTRIES: ReadonlySet<string> = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'CH',
])

export function isConsentCountry(country?: string | null): boolean {
  return !!country && CONSENT_COUNTRIES.has(country.toUpperCase())
}

/**
 * 没有拿到地理请求头时的客户端兜底：欧洲时区或欧洲语言地区即视为需要同意。
 * 宁可多问一句，也不要漏掉欧洲用户。
 */
export function clientNeedsConsent(): boolean {
  if (typeof window === 'undefined') return false

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  if (timeZone.startsWith('Europe/')) return true
  if (
    [
      'Atlantic/Canary',
      'Atlantic/Madeira',
      'Atlantic/Azores',
      'Atlantic/Reykjavik',
      'Africa/Ceuta',
      'Asia/Nicosia',
      'Asia/Famagusta',
    ].includes(timeZone)
  ) {
    return true
  }

  const region = (navigator.language || '').split('-')[1]?.toUpperCase()
  return !!region && CONSENT_COUNTRIES.has(region)
}

/** 读取本地同意记录；超过 180 天视为过期，需要重新询问 */
export function readConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value?: ConsentChoice; ts?: number }
    if (parsed.value !== 'granted' && parsed.value !== 'denied') return null
    if (!parsed.ts || Date.now() - parsed.ts > CONSENT_MAX_AGE_MS) return null
    return parsed.value
  } catch {
    return null
  }
}

export function writeConsent(value: ConsentChoice): void {
  try {
    window.localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ value, ts: Date.now() } satisfies { value: ConsentChoice; ts: number }),
    )
  } catch {
    // 隐私模式下 localStorage 可能不可用：本次会话仍然生效即可
  }
}

interface ConsentWindow extends Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

/** 把选择写入 Consent Mode，并通知广告脚本是否加载 */
export function applyConsent(value: ConsentChoice): void {
  if (typeof window === 'undefined') return
  const w = window as ConsentWindow
  w.dataLayer = w.dataLayer || []
  if (!w.gtag) {
    w.gtag = (...args: unknown[]) => {
      w.dataLayer?.push(args)
    }
  }

  w.gtag('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  })
  w.gtag('set', 'ads_data_redaction', value !== 'granted')

  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: value }))
}
