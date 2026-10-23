import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/video-frame')
const EN_URL = getPageUrl('/en/video-frame')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.videoFrame.title),
  description: siteConfig.pages.videoFrame.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': ZH_URL,
    },
  },
  keywords: siteConfig.pages.videoFrame.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.videoFrame.title),
    description: siteConfig.pages.videoFrame.description,
    url: getPageUrl('/video-frame'),
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: siteConfig.logo.og,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
}

export default function VideoFrameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
