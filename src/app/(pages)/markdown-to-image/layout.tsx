import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.markdownToImage.title),
  description: siteConfig.pages.markdownToImage.description,
  alternates: {
    canonical: getPageUrl('/markdown-to-image'),
  },
  keywords: siteConfig.pages.markdownToImage.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.markdownToImage.title),
    description: siteConfig.pages.markdownToImage.description,
    url: getPageUrl('/markdown-to-image'),
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
