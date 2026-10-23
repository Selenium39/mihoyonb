import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.terms.title),
  description: `${siteConfig.name}${siteConfig.pages.terms.description}`,
  alternates: {
    canonical: getPageUrl('/zh/terms'),
    languages: {
      'zh-CN': getPageUrl('/zh/terms'),
      en: getPageUrl('/terms'),
      'x-default': getPageUrl('/terms'),
    },
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
