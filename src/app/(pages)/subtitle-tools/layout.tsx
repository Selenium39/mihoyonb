import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.subtitleTools.title),
  description: siteConfig.pages.subtitleTools.description,
  alternates: {
    canonical: getPageUrl('/subtitle-tools'),
  },
  keywords: siteConfig.pages.subtitleTools.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.subtitleTools.title),
    description: siteConfig.pages.subtitleTools.description,
    url: getPageUrl('/subtitle-tools'),
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function SubtitleToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
