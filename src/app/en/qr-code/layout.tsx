import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/en/qr-code')
const ZH_URL = getPageUrl('/qr-code')

const TITLE = 'QR Code Generator – Free Custom QR Code with Logo (PNG)'
const DESCRIPTION =
  'Create a custom QR code for any link or text: pick colors, size and error correction, add a logo, download a high-res PNG. Free, no signup, no uploads.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'qr code generator',
    'free qr code generator',
    'custom qr code',
    'qr code with logo',
    'qr code png',
    'qr code maker',
    'online qr code generator',
    'colored qr code',
    'transparent qr code',
    'wifi qr code',
    'url to qr code',
    'qr code design',
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
  name: 'Custom QR Code Generator',
  url: EN_URL,
  description: DESCRIPTION,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any (browser-based)',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Generate a QR code from any text or URL',
    'Custom foreground and background colors',
    'Adjustable size, quiet-zone margin and error correction level',
    'Add a logo in the center of the QR code',
    'Download a high-resolution PNG, including transparent backgrounds',
    'Everything runs locally in the browser',
  ],
}

export default function EnQrCodeLayout({ children }: { children: React.ReactNode }) {
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
