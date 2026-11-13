import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HtmlLangSync } from '@/components/HtmlLangSync'
import { ConsentBanner } from '@/components/ConsentBanner'
import { AdsScript } from '@/components/AdsScript'
import { siteConfig } from '@/config/site'
import { ADSENSE_CLIENT } from '@/config/ads'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

const SITE_TITLE = 'mihoyonb — Free Browser-Based Tools for Creators'
const SITE_DESCRIPTION =
  'Free, privacy-first browser tools: Perler bead patterns, screenshot stitcher, photo collage, image splitter, watermark, social media image resizer, sensitive word checker, Markdown to image, QR codes, subtitles and video frames. No uploads, no signup.'
const SITE_KEYWORDS =
  'browser-based tools, free online tools, perler bead pattern generator, photo to bead pattern, screenshot stitcher, stitch screenshots, photo collage maker, image splitter, image watermark, social media image resizer, instagram image resizer, sensitive word checker, ad copy checker, markdown to image, qr code generator, subtitle converter, video frame extractor, privacy-first tools, no upload tools, no signup tools, client-side image tools'

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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 静态导出下 layout 是全站共享的，lang 只能写死默认值；/zh 页面的
    // html lang 由客户端组件 HtmlLangSync 按当前路由修正（SEO 语义由
    // metadata 的 hreflang alternates 兜底）。
    <html lang="en">
      <head>
        {/* pages.dev 跳转守卫（head 顶最早执行）：CF Pages 无法禁用自动分配的
            *.pages.dev 子域，命中时注入 noindex 并立即跳回主域——统计归位
            （Umami 按 hostname 记账）、收录归并。早于所有 defer/异步脚本。 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if(location.hostname.endsWith(".pages.dev")){var m=document.createElement("meta");m.name="robots";m.content="noindex";document.head.appendChild(m);location.replace("https://mihoyonb.com"+location.pathname+location.search+location.hash)}',
          }}
        />
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
        <ConsentBanner />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        
        {/* Umami Analytics（无 Cookie，不记录工具内容） */}
        <Script
          defer
          src={siteConfig.analytics.umami.src}
          data-website-id={siteConfig.analytics.umami.websiteId}
          strategy="afterInteractive"
        />

        {/* Google AdSense：仅在用户同意后加载 */}
        <AdsScript clientId={ADSENSE_CLIENT} />

      </body>
    </html>
  )
} 