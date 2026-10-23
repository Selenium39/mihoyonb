import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.privacy.title),
  description: `${siteConfig.name}${siteConfig.pages.privacy.description}`,
  alternates: {
    canonical: getPageUrl('/privacy'),
    languages: {
      'zh-CN': getPageUrl('/privacy'),
      en: getPageUrl('/en/privacy'),
      'x-default': getPageUrl('/privacy'),
    },
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
