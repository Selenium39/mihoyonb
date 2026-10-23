import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/pindou')
const EN_URL = getPageUrl('/en/pindou')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.pindou.title),
  description: siteConfig.pages.pindou.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': ZH_URL,
    },
  },
  keywords: siteConfig.pages.pindou.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.pindou.title),
    description: siteConfig.pages.pindou.description,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function PindouLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
