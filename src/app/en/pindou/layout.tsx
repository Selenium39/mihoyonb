import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/pindou')
const ZH_URL = getPageUrl('/pindou')

const TITLE = 'Perler Bead Pattern Generator – Free Printable Blueprint'
const DESCRIPTION =
  'Turn any photo into a printable perler bead pattern in your browser. Free, no signup, no upload: 96-color chart, HD PNG blueprint and CSV shopping list.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'perler bead pattern generator',
    'perler beads',
    'hama beads',
    'artkal beads',
    'fuse beads',
    'photo to bead pattern',
    'bead pattern maker',
    'printable bead pattern',
    'bead color chart',
    'pixel art pattern generator',
    'free bead pattern generator',
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
    siteName: 'Mihoyonb',
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
}

/** 结构化数据：SoftwareApplication，帮助搜索引擎把页面识别为免费在线工具 */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Perler Bead Pattern Generator',
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
    'Turn a photo into a printable bead pattern',
    '96-color numeric reference palette',
    'Bead count and share per color',
    'Export a high-resolution PNG blueprint',
    'Export a CSV bead shopping list',
  ],
}

export default function EnPindouLayout({
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
