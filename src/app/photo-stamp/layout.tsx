import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'

const EN_URL = getPageUrl('/photo-stamp')
const ZH_URL = getPageUrl('/zh/photo-stamp')

const TITLE = 'Add a Stamp to a Photo – Free Online Photo Stamp Tool'
const DESCRIPTION =
  'Place a rubber stamp on any photo in your browser: pull in your stamp maker design or upload a transparent PNG, drag to position, and export a full-resolution JPG or PNG. No uploads, no signup.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'add stamp to photo',
    'photo stamp',
    'stamp a photo online',
    'rubber stamp on picture',
    'photo stamp maker',
    'stamp image online',
    'put stamp on photo',
    'free photo stamping',
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
    images: [{ url: siteConfig.logo.og, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: siteConfig.author.twitter,
    images: [siteConfig.logo.og],
  },
  robots: { index: true, follow: true },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Photo Stamp Tool',
  url: EN_URL,
  description: DESCRIPTION,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any (browser-based)',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Pull in a stamp design saved from the stamp maker',
    'Or upload a transparent PNG/SVG stamp image',
    'Click or drag to position, with size, rotation and opacity controls',
    'Ink (multiply) blend mode for a realistic stamped look',
    'Export full-resolution JPG or PNG',
    'Runs entirely in the browser',
  ],
}

export default function EnPhotoStampLayout({ children }: { children: React.ReactNode }) {
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
