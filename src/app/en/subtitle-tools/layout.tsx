import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/subtitle-tools')
const ZH_URL = getPageUrl('/subtitle-tools')

const TITLE = 'Subtitle Converter – Convert SRT to VTT, Shift & Merge'
const DESCRIPTION =
  'Convert SRT to VTT and back, shift subtitle timing, merge two subtitle files and fix overlapping timecodes in your browser. Free, no signup, nothing uploaded.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'subtitle converter',
    'srt to vtt',
    'vtt to srt',
    'subtitle converter online',
    'shift subtitles',
    'subtitle timing offset',
    'merge srt files',
    'merge subtitles',
    'fix subtitle overlap',
    'webvtt converter',
    'subtitle editor',
    'free subtitle tools',
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

/** 结构化数据：SoftwareApplication，帮助搜索引擎把页面识别为免费在线字幕工具 */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Subtitle Converter',
  url: EN_URL,
  description: DESCRIPTION,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any (browser-based)',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Convert SRT to VTT and VTT to SRT',
    'Shift subtitle timing by seconds',
    'Merge two subtitle files',
    'Detect and fix overlapping timecodes',
    'Copy or download the converted subtitle file',
  ],
}

export default function EnSubtitleToolsLayout({
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
