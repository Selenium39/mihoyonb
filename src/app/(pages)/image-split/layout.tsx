import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.imageSplit.title),
  description: siteConfig.pages.imageSplit.description,
  alternates: {
    canonical: getPageUrl('/image-split'),
  },
  keywords: siteConfig.pages.imageSplit.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.imageSplit.title),
    description: siteConfig.pages.imageSplit.description,
    url: getPageUrl('/image-split'),
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
