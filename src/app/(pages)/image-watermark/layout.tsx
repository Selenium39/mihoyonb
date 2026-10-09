import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.imageWatermark.title),
  description: siteConfig.pages.imageWatermark.description,
  alternates: {
    canonical: getPageUrl('/image-watermark'),
  },
  keywords: siteConfig.pages.imageWatermark.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.imageWatermark.title),
    description: siteConfig.pages.imageWatermark.description,
    url: getPageUrl('/image-watermark'),
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function ImageWatermarkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
