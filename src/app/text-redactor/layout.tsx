import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/text-redactor')
const ZH_URL = getPageUrl('/zh/text-redactor')

const TITLE = 'Free Text Redactor – Redact PII Before Sharing Text with AI'
const DESCRIPTION =
  'Redact names, phone numbers, emails, ID and card numbers, addresses and API keys from English or Chinese text before you paste it into an AI chat. Free, private, and it runs entirely in your browser.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'text redaction',
    'PII redactor',
    'redact text online',
    'text redactor',
    'personal information removal',
    'AI privacy',
    'data redaction tool',
    'de-identify text',
    'anonymize text online',
    'free text redactor',
    'Chinese text redaction',
    'replace names with placeholders',
    'redact before ChatGPT',
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

/** 结构化数据：SoftwareApplication，帮助搜索引擎把页面识别为免费在线工具 */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Text Redactor',
  url: EN_URL,
  description: DESCRIPTION,
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Any (browser-based)',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Runs entirely in the browser, with no text uploads',
    'Detects person names, phones, emails, ID and card numbers, addresses and API keys in English and Chinese',
    'Replaces each detection with a placeholder such as [PERSON_1]',
    'Lists every detection with its type, risk level and rule, heuristic or model source',
    'Exports the placeholder-to-original mapping table as JSON',
    'Restores the original values from an AI reply using the mapping',
  ],
}

export default function EnTextRedactorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {children}
    </>
  )
}
