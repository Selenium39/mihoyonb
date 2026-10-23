import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/video-frame')
const ZH_URL = getPageUrl('/video-frame')

const TITLE = 'Video Frame Extractor – Capture Frames from Video Online'
const DESCRIPTION =
  'Extract frames from any video in your browser. Step frame by frame, capture a still, or batch export frames at a set interval as a ZIP. Free, no upload.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'video frame extractor',
    'extract frames from video',
    'video to image',
    'capture frame from video',
    'video screenshot',
    'video frame capture',
    'frame grabber',
    'batch extract frames',
    'video to png',
    'mp4 frame extractor',
    'video frame extraction online',
    'free video frame extractor',
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
  name: 'Video Frame Extractor',
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
    'Step through a video frame by frame',
    'Capture the current frame as a still image',
    'Export frames at full video resolution',
    'Choose PNG, JPEG or WebP and adjust quality',
    'Batch extract frames at a fixed interval and download a ZIP',
  ],
}

export default function EnVideoFrameLayout({
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
