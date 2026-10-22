import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.pindou.title),
  description: siteConfig.pages.pindou.description,
  alternates: {
    canonical: getPageUrl('/pindou'),
  },
  keywords: siteConfig.pages.pindou.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.pindou.title),
    description: siteConfig.pages.pindou.description,
    url: getPageUrl('/pindou'),
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
