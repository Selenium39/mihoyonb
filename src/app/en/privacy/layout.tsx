import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'
import { privacyContent } from '@/content/legal'

const EN_URL = getPageUrl('/en/privacy')
const ZH_URL = getPageUrl('/privacy')
const TITLE = 'Privacy Policy – mihoyonb'
const DESCRIPTION = privacyContent.en.metaDescription

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords:
    'mihoyonb privacy policy, browser tools privacy, no upload image tools, cookie-less analytics, Google AdSense privacy, GDPR rights',
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

export default function EnPrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
