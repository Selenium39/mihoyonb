import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/image-combine')
const EN_URL = getPageUrl('/en/image-combine')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.imageCombine.title),
  description: siteConfig.pages.imageCombine.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': ZH_URL,
    },
  },
  keywords: siteConfig.pages.imageCombine.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.imageCombine.title),
    description: siteConfig.pages.imageCombine.description,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function ImageCombineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
