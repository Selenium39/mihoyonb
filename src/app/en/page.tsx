import type { Metadata } from 'next'
import { HomePage } from '@/components/HomePage'
import { siteConfig } from '@/config/site'

const EN_HOME_URL = `${siteConfig.domain}/en`
const ZH_HOME_URL = siteConfig.domain

const SITE_TITLE = 'mihoyonb — Free Browser-Based Tools for Creators'
const SITE_DESCRIPTION =
  'Free, privacy-first browser tools: Perler bead patterns, photo collage, image splitter, watermark, social media image resizer, sensitive word checker, Markdown to image, QR codes, subtitles and video frames. No uploads, no signup.'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  publisher: 'mihoyonb',
  keywords:
    'browser-based tools, free online tools, perler bead pattern generator, photo to bead pattern, photo collage maker, image splitter, image watermark, social media image resizer, instagram image resizer, sensitive word checker, ad copy checker, markdown to image, qr code generator, subtitle converter, video frame extractor, privacy-first tools, no upload tools, no signup tools, client-side image tools',
  alternates: {
    canonical: EN_HOME_URL,
    languages: {
      en: EN_HOME_URL,
      'zh-CN': ZH_HOME_URL,
      'x-default': ZH_HOME_URL,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: EN_HOME_URL,
    siteName: 'mihoyonb',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: siteConfig.logo.og,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: siteConfig.author.twitter,
    images: [siteConfig.logo.og],
  },
}

export default function EnglishHomePage() {
  return <HomePage locale="en" />
}
