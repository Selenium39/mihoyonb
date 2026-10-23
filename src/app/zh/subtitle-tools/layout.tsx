import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/zh/subtitle-tools')
const EN_URL = getPageUrl('/subtitle-tools')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.subtitleTools.title),
  description: siteConfig.pages.subtitleTools.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': EN_URL,
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
    images: [
      {
        url: siteConfig.logo.ogZh,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
}

export default function SubtitleToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
