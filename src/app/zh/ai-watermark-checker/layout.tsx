import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'
import { aiWatermarkStructuredData } from './jsonld'

const ZH_URL = getPageUrl('/zh/ai-watermark-checker')
const EN_URL = getPageUrl('/ai-watermark-checker')
const DESCRIPTION = siteConfig.pages.aiWatermarkChecker.description

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.aiWatermarkChecker.title),
  description: DESCRIPTION,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': EN_URL,
    },
  },
  keywords: siteConfig.pages.aiWatermarkChecker.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.aiWatermarkChecker.title),
    description: DESCRIPTION,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: siteConfig.logo.ogZh,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AiWatermarkCheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = aiWatermarkStructuredData('zh', DESCRIPTION)
  return (
    <>
      {structuredData.map((entry) => (
        <script
          key={entry['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
      {children}
    </>
  )
}
