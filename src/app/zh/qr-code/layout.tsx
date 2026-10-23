import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'
import { hreflang } from '@/lib/i18n'

const ZH_URL = getPageUrl('/zh/qr-code')
const EN_URL = getPageUrl('/qr-code')

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.qrCode.title),
  description: siteConfig.pages.qrCode.description,
  alternates: {
    canonical: ZH_URL,
    languages: {
      [hreflang('zh')]: ZH_URL,
      [hreflang('en')]: EN_URL,
      'x-default': EN_URL,
    },
  },
  keywords: siteConfig.pages.qrCode.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.qrCode.title),
    description: siteConfig.pages.qrCode.description,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: siteConfig.logo.ogZh,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
}

export default function QrCodeLayout({ children }: { children: React.ReactNode }) {
  return children
}
