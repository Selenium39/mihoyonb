import type { Metadata } from 'next'
import { siteConfig, getPageTitle, getPageUrl } from '@/config/site'

export const metadata: Metadata = {
  title: getPageTitle(siteConfig.pages.qrCode.title),
  description: siteConfig.pages.qrCode.description,
  alternates: {
    canonical: getPageUrl('/qr-code'),
  },
  keywords: siteConfig.pages.qrCode.keywords,
  openGraph: {
    title: getPageTitle(siteConfig.pages.qrCode.title),
    description: siteConfig.pages.qrCode.description,
    url: getPageUrl('/qr-code'),
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function QrCodeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
