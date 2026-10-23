import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/image-split')
const EN_URL = getPageUrl('/en/image-split')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.imageSplit.title),
  description: siteConfig.pages.imageSplit.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': ZH_URL,
    },
  },
  keywords: siteConfig.pages.imageSplit.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.imageSplit.title),
    description: siteConfig.pages.imageSplit.description,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function ImageSplitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
