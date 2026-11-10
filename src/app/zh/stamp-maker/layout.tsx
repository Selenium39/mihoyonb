import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/zh/stamp-maker')
const EN_URL = getPageUrl('/stamp-maker')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.stampMaker.title),
  description: siteConfig.pages.stampMaker.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': EN_URL,
    },
  },
  keywords: siteConfig.pages.stampMaker.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.stampMaker.title),
    description: siteConfig.pages.stampMaker.description,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: siteConfig.logo.ogZh,
        width: 1200,
        height: 630,
        alt: getPageTitle(siteConfig.pages.stampMaker.title),
      },
    ],
  },
}

export default function ZhStampMakerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
