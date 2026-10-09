import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { siteConfig } from '@/config/site'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.domain,
  },
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.twitterUrl }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.domain),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.domain,
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
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
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
    // baidu: 'your-baidu-verification-code',
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
    <html lang="zh-CN">
      <head>
        {/* 额外的SEO标签 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        
        {/* Umami Analytics */}
        <Script
          defer
          src={siteConfig.analytics.umami.src}
          data-website-id={siteConfig.analytics.umami.websiteId}
          strategy="afterInteractive"
        />
        
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3914969090265698"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

      </body>
    </html>
  )
} 