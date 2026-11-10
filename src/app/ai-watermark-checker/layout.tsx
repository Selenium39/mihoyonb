import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'
import { aiWatermarkStructuredData } from '@/app/zh/ai-watermark-checker/jsonld'

const EN_URL = getPageUrl('/ai-watermark-checker')
const ZH_URL = getPageUrl('/zh/ai-watermark-checker')

const TITLE = 'AI Watermark Checker: Detect and Remove Hidden Characters'
const DESCRIPTION =
  'Check text for hidden AI watermark characters — zero-width spaces, U+202F narrow spaces, smart quotes — and remove them in your browser. Free, and nothing you paste is uploaded.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'ai watermark checker',
    'chatgpt watermark checker',
    'hidden character detector',
    'zero width space remover',
    'remove invisible characters',
    'unicode cleaner',
    'narrow no-break space',
    'U+202F',
    'clean chatgpt text',
    'smart quotes remover',
  ],
  alternates: {
    canonical: EN_URL,
    languages: {
      en: EN_URL,
      'zh-CN': ZH_URL,
      'x-default': EN_URL,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: EN_URL,
    siteName: 'mihoyonb',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: siteConfig.logo.og,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: siteConfig.author.twitter,
    images: [siteConfig.logo.og],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function EnAiWatermarkCheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = aiWatermarkStructuredData('en', DESCRIPTION)
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
