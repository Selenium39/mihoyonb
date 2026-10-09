import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.socialResize.title),
  description: siteConfig.pages.socialResize.description,
  alternates: {
    canonical: getPageUrl('/social-resize'),
  },
  keywords: siteConfig.pages.socialResize.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.socialResize.title),
    description: siteConfig.pages.socialResize.description,
    url: getPageUrl('/social-resize'),
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function SocialResizeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
