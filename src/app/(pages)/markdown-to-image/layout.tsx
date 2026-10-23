import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/markdown-to-image')
const EN_URL = getPageUrl('/en/markdown-to-image')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.markdownToImage.title),
  description: siteConfig.pages.markdownToImage.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': ZH_URL,
    },
  },
  keywords: siteConfig.pages.markdownToImage.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.markdownToImage.title),
    description: siteConfig.pages.markdownToImage.description,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function MarkdownToImageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
