import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.videoFrame.title),
  description: siteConfig.pages.videoFrame.description,
  alternates: {
    canonical: getPageUrl('/video-frame'),
  },
  keywords: siteConfig.pages.videoFrame.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.videoFrame.title),
    description: siteConfig.pages.videoFrame.description,
    url: getPageUrl('/video-frame'),
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function VideoFrameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
