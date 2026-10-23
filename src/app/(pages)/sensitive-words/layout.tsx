import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/sensitive-words')
const EN_URL = getPageUrl('/en/sensitive-words')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.sensitiveWords.title),
  description: siteConfig.pages.sensitiveWords.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': ZH_URL,
    },
  },
  keywords: siteConfig.pages.sensitiveWords.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.sensitiveWords.title),
    description: siteConfig.pages.sensitiveWords.description,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function SensitiveWordsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
