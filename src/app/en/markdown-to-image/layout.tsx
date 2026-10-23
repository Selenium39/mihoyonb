import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/markdown-to-image')
const ZH_URL = getPageUrl('/markdown-to-image')

const TITLE = 'Markdown to Image Converter – Free Markdown to PNG'
const DESCRIPTION =
  'Convert Markdown to a clean PNG image in your browser. Free markdown screenshot tool with live preview, custom themes and HD export — no signup, no upload.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'markdown to image',
    'markdown screenshot',
    'convert markdown to png',
    'markdown to png',
    'markdown image generator',
    'code snippet image',
    'render markdown as image',
    'markdown screenshot generator',
    'markdown poster maker',
    'markdown to image online',
    'free markdown to png converter',
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
        url: siteConfig.logo.ogEn,
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
    images: [siteConfig.logo.ogEn],
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
  name: 'Markdown to Image Converter',
  url: EN_URL,
  description: DESCRIPTION,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any (browser-based)',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Convert Markdown to a PNG image',
    'Live preview while you type',
    'Custom backgrounds, fonts and poster themes',
    'Export a high-resolution PNG for sharing or printing',
    'Runs locally in the browser with no upload',
  ],
}

export default function EnMarkdownToImageLayout({
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
