import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/image-watermark')
const ZH_URL = getPageUrl('/image-watermark')

const TITLE = 'Watermark Images Online – Batch Text & Logo Watermarks'
const DESCRIPTION =
  'Add text or logo watermarks to one image or a whole batch in your browser. Control position, opacity, size, rotation and tiling, preview live, then download every watermarked image in one ZIP. Free, no upload.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'watermark images',
    'add watermark to photo',
    'batch watermark',
    'bulk watermark images',
    'text watermark',
    'logo watermark',
    'image watermark tool',
    'photo watermark online',
    'watermark maker',
    'add watermark without photoshop',
    'protect images from theft',
    'free watermark tool',
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
  name: 'Image Watermark Tool',
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
    'Add a text watermark to images',
    'Add a transparent PNG logo watermark',
    'Batch watermark many images at once',
    'Set position, opacity, size and rotation',
    'Tile a watermark across the whole image',
    'Export as PNG, JPEG or WebP',
    'Download every watermarked image in one ZIP',
  ],
}

export default function EnImageWatermarkLayout({
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
