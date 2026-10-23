import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/sensitive-words')
const ZH_URL = getPageUrl('/sensitive-words')

const TITLE = 'Free Sensitive Word Checker – Scan Ad Copy for Risky Claims'
const DESCRIPTION =
  'Scan ad copy, product pages and posts for absolute claims, banned words and compliance risks. Free, private and runs entirely in your browser.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'sensitive word checker',
    'ad copy checker',
    'risky claims checker',
    'compliance word scanner',
    'banned words checker',
    'advertising compliance check',
    'absolute claims',
    'prohibited words',
    'copy compliance',
    'content policy checker',
    'free sensitive word scanner',
    'ad copy compliance',
  ],
  alternates: {
    canonical: EN_URL,
    languages: {
      en: EN_URL,
      'zh-CN': ZH_URL,
      'x-default': ZH_URL,
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
  name: 'Sensitive Word Checker',
  url: EN_URL,
  description: DESCRIPTION,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any (browser-based)',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Check ad copy and content for absolute and advertising claims',
    'Flag prohibited and high-risk terms such as gambling, drugs and weapons',
    'Whole-word, case-insensitive English matching with multi-word phrase support',
    'Highlight every match and count hits by category',
    'Mask matches in one click and copy the cleaned text',
    'Add and save your own custom word list',
    'Everything runs locally in the browser, with no uploads',
  ],
}

export default function EnSensitiveWordsLayout({
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
