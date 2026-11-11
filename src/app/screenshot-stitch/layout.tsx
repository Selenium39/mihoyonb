import type { Metadata } from 'next'
import { siteConfig, getPageUrl } from '@/config/site'
import { screenshotStitchStructuredData } from '@/app/zh/screenshot-stitch/jsonld'

const EN_URL = getPageUrl('/screenshot-stitch')
const ZH_URL = getPageUrl('/zh/screenshot-stitch')

const TITLE = 'Screenshot Stitcher — Combine Screenshots into One Long Image'
const DESCRIPTION =
  'Stitch chat, page, and subtitle screenshots into one tall PNG. The repeated strip is measured from your frames, and a video can be sampled too. Free, in your browser, nothing uploaded.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  publisher: 'mihoyonb',
  keywords: [
    'screenshot stitcher',
    'stitch screenshots',
    'combine screenshots into one image',
    'long screenshot stitcher',
    'stitch chat screenshots',
    'subtitle screenshot stitcher',
    'scrolling screenshot combiner',
    'video to subtitle images',
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

export default function EnScreenshotStitchLayout({ children }: { children: React.ReactNode }) {
  const structuredData = screenshotStitchStructuredData('en', DESCRIPTION)
  return (
    <>
      {structuredData.map((entry) => (
        <script
          key={entry['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
      {children}
    </>
  )
}
