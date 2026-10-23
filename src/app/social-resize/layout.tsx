import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/social-resize')
const ZH_URL = getPageUrl('/zh/social-resize')

const TITLE = 'Social Media Image Resizer – Instagram, X & YouTube Sizes'
const DESCRIPTION =
  'Resize a photo for Instagram, X (Twitter), LinkedIn and YouTube in seconds. Crop or fit each size, then export PNG, JPEG or WebP — free, no uploads.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'social media image resizer',
    'resize image for instagram',
    'x post image size',
    'twitter post image size',
    'linkedin image size',
    'youtube thumbnail size',
    'instagram post size',
    'instagram story size',
    'social media image sizes',
    'image resizer',
    'resize image for social media',
    'free image resizer',
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
  name: 'Social Media Image Resizer',
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
    'Resize one image to Instagram, X, LinkedIn and YouTube presets',
    'Crop to fill or fit the whole image with a solid color or blurred background',
    'Add unlimited custom width and height sizes',
    'Export PNG, JPEG or WebP with adjustable quality',
    'Download a single size or every size as one ZIP',
    'All processing happens locally in the browser',
  ],
}

export default function EnSocialResizeLayout({
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
