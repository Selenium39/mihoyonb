import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/image-split')
const ZH_URL = getPageUrl('/image-split')

const TITLE = 'Long Image Splitter – Split an Image into Grid or 9-Grid Tiles'
const DESCRIPTION =
  'Split a long screenshot or photo into equal slices, a 3×3 Instagram grid, or any rows × columns up to 10×10. Free, no upload — export PNG, JPEG or WebP, or download every slice in one ZIP.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'long image splitter',
    'split image into grid',
    'split image into tiles',
    '9-grid cutter',
    'instagram grid maker',
    'image splitter',
    'photo splitter',
    'split long screenshot',
    'slice image online',
    'image cutter',
    'split image into 3x3',
    'free image splitter',
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
  name: 'Long Image Splitter',
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
    'Split a long image into equal slices',
    'One-click 3×3 grid for Instagram',
    'Custom rows and columns up to 10×10',
    'Export PNG, JPEG or WebP',
    'Download every slice as a single ZIP',
  ],
}

export default function EnImageSplitLayout({
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
