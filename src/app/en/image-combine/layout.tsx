import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/image-combine')
const ZH_URL = getPageUrl('/image-combine')

const TITLE = 'Photo Collage Maker – Free Image Grid & Photo Grid Tool'
const DESCRIPTION =
  'Combine multiple photos into one image with grid layouts. Drag to rearrange, add text or watermarks, then download PNG, JPEG or WebP — free, no upload.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'photo collage maker',
    'collage maker',
    'combine images',
    'combine photos',
    'merge images',
    'image combiner',
    'image grid',
    'photo grid',
    'picture collage',
    'photo collage',
    'collage generator',
    'free collage maker',
    'photo stitching',
    'long image stitch',
    'watermark photo',
    'add text to photo',
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

/** 结构化数据：SoftwareApplication，帮助搜索引擎把页面识别为免费在线拼图工具 */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Photo Collage Maker',
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
    'Combine 2 to 16 photos with ready-made grid layouts',
    'Stitch photos into a long vertical or horizontal image',
    'Drag and drop to swap photo positions',
    'Add text, arrows, rectangles and circles',
    'Add text or image watermarks, single or tiled',
    'Adjust spacing, corner radius, margins and background',
    'Export as PNG, JPEG or WebP without uploading files',
  ],
}

export default function EnImageCombineLayout({
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
