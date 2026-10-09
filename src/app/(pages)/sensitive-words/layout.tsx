import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.sensitiveWords.title),
  description: siteConfig.pages.sensitiveWords.description,
  alternates: {
    canonical: getPageUrl('/sensitive-words'),
  },
  keywords: siteConfig.pages.sensitiveWords.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.sensitiveWords.title),
    description: siteConfig.pages.sensitiveWords.description,
    url: getPageUrl('/sensitive-words'),
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
