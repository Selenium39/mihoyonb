import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/stamp-maker')
const ZH_URL = getPageUrl('/zh/stamp-maker')

const TITLE = 'Stamp Maker – Free Online Custom Stamp Generator (PNG/SVG/PDF)'
const DESCRIPTION =
  'Design custom rubber stamps, company seals and stamps online: curved text, classic borders, aging effect. Export PNG, JPG, SVG or print-ready PDF. Free, no signup, runs entirely in your browser.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'stamp maker',
    'online stamp generator',
    'custom stamp',
    'rubber stamp maker',
    'seal maker',
    'company seal generator',
    'stamp design online',
    'create stamp',
    'round stamp maker',
    'stamp png',
    'free stamp maker',
    'digital stamp',
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
  name: 'Online Stamp Maker',
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
    'Design round, oval and rectangular stamps',
    'Curved top text with upright bottom text',
    'Single, double, triple, dashed and dotted borders',
    'Realistic aging and ink-erosion effect',
    'Chinese and Latin stamp fonts with adjustable spacing',
    'Export PNG (400/1200/4000px), JPG, SVG and mm-sized PDF',
    'One-click ZIP with all formats',
    'Everything runs locally in the browser',
  ],
}

export default function EnStampMakerLayout({ children }: { children: React.ReactNode }) {
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
