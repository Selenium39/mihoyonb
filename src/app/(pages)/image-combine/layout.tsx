import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.imageCombine.title),
  description: siteConfig.pages.imageCombine.description,
  alternates: {
    canonical: getPageUrl('/image-combine'),
  },
  keywords: siteConfig.pages.imageCombine.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.imageCombine.title),
    description: siteConfig.pages.imageCombine.description,
    url: getPageUrl('/image-combine'),
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
