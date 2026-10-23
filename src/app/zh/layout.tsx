import type { Metadata } from 'next'
import { getPageUrl, siteConfig } from '@/config/site'

const ZH_URL = getPageUrl('/zh')
const EN_URL = siteConfig.domain
const TITLE = siteConfig.title
const DESCRIPTION = siteConfig.description

/** 中文首页与中文工具页共用的站点级元数据（英文为根路径默认语言） */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: ZH_URL,
    languages: {
      'zh-CN': ZH_URL,
      en: EN_URL,
      'x-default': EN_URL,
    },
  },
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.twitterUrl }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  metadataBase: new URL(siteConfig.domain),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: ZH_URL,
    siteName: siteConfig.name,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: siteConfig.logo.ogZh,
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
    images: [siteConfig.logo.ogZh],
  },
}

export default function ZhLayout({ children }: { children: React.ReactNode }) {
  return children
}
