import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HtmlLangSync } from '@/components/HtmlLangSync'
import { ConsentBanner } from '@/components/ConsentBanner'
import { AdsScript } from '@/components/AdsScript'
import { siteConfig } from '@/config/site'
import { getLocaleFromPathname, hreflang } from '@/lib/i18n'
import Script from 'next/script'

// Next 14 静态页默认输出 s-maxage=31536000（一年），CDN 会长期缓存旧页面
// 且部署后不自动失效；改为动态渲染让响应带 no-store，部署即刻生效。
// 页面均为轻量静态组件，动态渲染开销可忽略。
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

const SITE_TITLE = 'mihoyonb — Free Browser-Based Tools for Creators'
const SITE_DESCRIPTION =
  'Free, privacy-first browser tools: Perler bead patterns, photo collage, image splitter, watermark, social media image resizer, sensitive word checker, Markdown to image, QR codes, subtitles and video frames. No uploads, no signup.'
const SITE_KEYWORDS =
  'browser-based tools, free online tools, perler bead pattern generator, photo to bead pattern, photo collage maker, image splitter, image watermark, social media image resizer, instagram image resizer, sensitive word checker, ad copy checker, markdown to image, qr code generator, subtitle converter, video frame extractor, privacy-first tools, no upload tools, no signup tools, client-side image tools'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: siteConfig.domain,
    languages: {
      en: siteConfig.domain,
      'zh-CN': `${siteConfig.domain}/zh`,
      'x-default': siteConfig.domain,
    },
  },
  keywords: SITE_KEYWORDS,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.twitterUrl }],
  creator: siteConfig.author.name,
  publisher: 'mihoyonb',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.domain),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: siteConfig.domain,
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 如果你有的话，可以添加搜索引擎验证码
    // google: 'your-google-verification-code',
    // baidu: 'your-baidu-verification-code'
  },
  icons: {
    icon: siteConfig.logo.ico,
    shortcut: siteConfig.logo.ico,
    apple: siteConfig.logo.apple,
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: siteConfig.logo.apple,
      },
      {
        rel: 'icon',
        type: 'image/png',
        url: siteConfig.logo.src,
      },
    ],
  },
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 语言由 middleware 注入的 x-pathname 决定：/zh 前缀 -> zh，其余 -> en。
  // 直接取不到时兜底为英文（默认语言）。
  const pathname = headers().get('x-pathname') || '/'
  const locale = getLocaleFromPathname(pathname)
  const geoCountry = headers().get('x-geo-country')

  return (
    <html lang={hreflang(locale)}>
      <head>
        {/* 额外的SEO标签 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        {/* Google Consent Mode v2 默认值：广告与统计全部先拒绝，用户选择后再 update */}
        <script
          id="consent-default"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);`,
          }}
        />
      </head>
      <body className={inter.className}>
        <HtmlLangSync />
        <ConsentBanner locale={locale} geoCountry={geoCountry} />
        <div className="flex flex-col min-h-screen">
          <Header locale={locale} />
          <main className="flex-1">
            {children}
          </main>
          <Footer locale={locale} />
        </div>
        
        {/* Umami Analytics（无 Cookie，不记录工具内容） */}
        <Script
          defer
          src={siteConfig.analytics.umami.src}
          data-website-id={siteConfig.analytics.umami.websiteId}
          strategy="afterInteractive"
        />

        {/* Google AdSense：仅在用户同意后加载 */}
        <AdsScript clientId="ca-pub-3914969090265698" />

      </body>
    </html>
  )
} 