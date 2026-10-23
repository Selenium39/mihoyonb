import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/subtitle-tools')
const EN_URL = getPageUrl('/en/subtitle-tools')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.subtitleTools.title),
  description: siteConfig.pages.subtitleTools.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': ZH_URL,
    },
  },
  keywords: siteConfig.pages.subtitleTools.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.subtitleTools.title),
    description: siteConfig.pages.subtitleTools.description,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function SubtitleToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
