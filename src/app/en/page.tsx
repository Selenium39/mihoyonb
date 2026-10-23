import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Film,
  LayoutGrid,
  Palette,
  QrCode,
  Scaling,
  Scissors,
  ShieldAlert,
  ShieldCheck,
  Stamp,
  Subtitles,
  WifiOff,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

/** 首页要点标签 */
const HERO_BADGES = [
  'Runs 100% in your browser',
  'Files never uploaded',
  'Free, no signup',
] as const

/** 隐私三点 */
const PRIVACY_POINTS: {
  title: string
  description: string
  icon: LucideIcon
  chipClass: string
  iconClass: string
}[] = [
  {
    title: 'Your files never leave your device',
    description:
      'Every tool processes images and text locally in your browser tab. There is no upload step and no server-side processing — what you open stays on your computer, tablet or phone.',
    icon: WifiOff,
    chipClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
  },
  {
    title: 'No account, no email, no tracking of your content',
    description:
      'Open a page and start working. We never ask you to sign up, and we do not look at the photos or text you load into a tool.',
    icon: ShieldCheck,
    chipClass: 'bg-sky-100',
    iconClass: 'text-sky-600',
  },
  {
    title: 'Free, with no watermarks or export limits',
    description:
      'No paywall, no daily quota and no watermarked downloads. Export at full resolution as often as you like.',
    icon: BadgeCheck,
    chipClass: 'bg-amber-100',
    iconClass: 'text-amber-600',
  },
]

/** 主推工具：已上线的拼豆图纸生成器 */
const FEATURED_TOOL = {
  title: 'Perler Bead Pattern Generator',
  subtitle: 'Photo to printable bead pattern, in your browser',
  description:
    'Upload a photo and get a printable bead pattern in seconds. The generator samples your image into a grid, matches every cell to a 96-color numeric reference palette, counts the beads you need per color, and exports a high-resolution PNG blueprint plus a CSV shopping list. Works with Perler, Hama and Artkal beads.',
  features: [
    '96-color numeric reference palette',
    'Bead count and share per color',
    'Printable high-resolution PNG pattern',
    'CSV shopping list for bead shopping',
  ],
  href: '/en/pindou',
  cta: 'Create a bead pattern',
}

/** 其他已上线工具（英文页） */
const OTHER_TOOLS: {
  title: string
  description: string
  href: string
  icon: LucideIcon
  chipClass: string
  iconClass: string
}[] = [
  {
    title: 'Photo Collage',
    description: 'Combine photos into one image with grid layouts — free, no upload.',
    href: '/en/image-combine',
    icon: LayoutGrid,
    chipClass: 'bg-pink-100',
    iconClass: 'text-pink-600',
  },
  {
    title: 'Image Splitter',
    description:
      'Split long images into equal slices or a 3×3 Instagram grid — free, no upload.',
    href: '/en/image-split',
    icon: Scissors,
    chipClass: 'bg-orange-100',
    iconClass: 'text-orange-600',
  },
  {
    title: 'Image Watermark',
    description: 'Batch text or logo watermarks on images, downloaded as one ZIP.',
    href: '/en/image-watermark',
    icon: Stamp,
    chipClass: 'bg-teal-100',
    iconClass: 'text-teal-600',
  },
  {
    title: 'Social Media Image Resizer',
    description:
      'Resize one image for Instagram, X, LinkedIn and YouTube in a click — free, no upload.',
    href: '/en/social-resize',
    icon: Scaling,
    chipClass: 'bg-rose-100',
    iconClass: 'text-rose-600',
  },
  {
    title: 'Sensitive Word Checker',
    description:
      'Scan ad copy and posts for risky claims, with highlights and one-click masking.',
    href: '/en/sensitive-words',
    icon: ShieldAlert,
    chipClass: 'bg-amber-100',
    iconClass: 'text-amber-600',
  },
  {
    title: 'Markdown to Image',
    description:
      'Turn Markdown into a shareable PNG with live preview and custom themes.',
    href: '/en/markdown-to-image',
    icon: FileText,
    chipClass: 'bg-indigo-100',
    iconClass: 'text-indigo-600',
  },
  {
    title: 'QR Code Generator',
    description: 'Free QR code generator with logo, colors, and transparent PNG export.',
    href: '/en/qr-code',
    icon: QrCode,
    chipClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
  },
  {
    title: 'Video Frame Extractor',
    description:
      'Capture still frames from any video in your browser, one by one or in bulk.',
    href: '/en/video-frame',
    icon: Film,
    chipClass: 'bg-purple-100',
    iconClass: 'text-purple-600',
  },
  {
    title: 'Subtitle Converter',
    description: 'Convert SRT to VTT, shift timing, merge and clean up subtitles locally.',
    href: '/en/subtitle-tools',
    icon: Subtitles,
    chipClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
  },
]

/** FAQ（英文站首屏之下，覆盖常见搜索疑问） */
const FAQS: { question: string; answer: string }[] = [
  {
    question: 'Are these tools really free?',
    answer:
      'Yes. Every tool on this site is free to use, with no watermarks, no export limits and no account required. The site is supported by advertising.',
  },
  {
    question: 'Do my files get uploaded to a server?',
    answer:
      'No. All processing happens inside your browser using modern web APIs, so your images and text never leave your device. You can even keep working after disconnecting from the internet in most tools.',
  },
  {
    question: 'Do I need to install anything or sign up?',
    answer:
      'No install and no signup. Open a tool in a modern browser on desktop, tablet or phone and start working right away.',
  },
  {
    question: 'What can I do with the Perler bead pattern generator?',
    answer:
      'Upload a photo and it becomes a printable bead pattern: every cell is matched to a 96-color numeric reference palette, with per-color bead counts, a high-resolution PNG blueprint and a CSV shopping list. It works for Perler, Hama and Artkal style fuse beads.',
  },
  {
    question: 'Which other tools are available?',
    answer:
      'A photo collage maker, image splitter, batch image watermark, social media image resizer, sensitive word checker, Markdown to image converter, QR code generator, subtitle converter (SRT/VTT) and video frame extractor. All of them run locally in your browser and share the same no-upload, no-signup approach.',
  },
]

function PrivacyPointCard({ point }: { point: (typeof PRIVACY_POINTS)[number] }) {
  const Icon = point.icon
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div
            className={`w-10 h-10 ${point.chipClass} rounded-lg flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-5 h-5 ${point.iconClass}`} />
          </div>
          <span>{point.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
      </CardContent>
    </Card>
  )
}

export default function EnglishHomePage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <Image
              src={siteConfig.logo.src}
              alt="mihoyonb"
              width={56}
              height={56}
              className="w-14 h-14"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Free browser-based tools that never upload your files
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            mihoyonb is a growing collection of creative tools that run entirely in your browser.
            Start with the Perler bead pattern generator, then split images, convert Markdown,
            generate QR codes and clean up subtitles — all on your device.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {HERO_BADGES.map((badge) => (
              <span
                key={badge}
                className="bg-gray-100 px-3 py-1 rounded-full text-xs text-muted-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/en/pindou">
                <Palette className="w-5 h-5 mr-2" />
                Open the bead pattern generator
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="#tools">Browse all tools</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No uploads. No account. No cost.
          </p>
        </div>
      </section>

      {/* 隐私三点 */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground flex-shrink-0">
              Private by design
            </h2>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRIVACY_POINTS.map((point) => (
              <PrivacyPointCard key={point.title} point={point} />
            ))}
          </div>
        </div>
      </section>

      {/* 已上线工具 */}
      <section id="tools" className="container mx-auto px-4 py-8 md:py-10 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground flex-shrink-0">
              Available now
            </h2>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{FEATURED_TOOL.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {FEATURED_TOOL.subtitle}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{FEATURED_TOOL.description}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {FEATURED_TOOL.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={FEATURED_TOOL.href}>
                <Button className="w-full sm:w-auto">
                  {FEATURED_TOOL.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            {OTHER_TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <Card key={tool.href} className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div
                        className={`w-9 h-9 ${tool.chipClass} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-4 h-4 ${tool.iconClass}`} />
                      </div>
                      <span>{tool.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:underline"
                    >
                      Open tool
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground flex-shrink-0">
              Frequently asked questions
            </h2>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <div className="space-y-5">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 结尾 CTA */}
      <section className="container mx-auto px-4 pb-14 pt-4">
        <div className="max-w-3xl mx-auto rounded-xl border bg-muted/20 p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Turn a photo into a bead pattern in under a minute
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Pick a photo, choose your pattern width, and print the blueprint. Everything runs on
            your device.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/en/pindou">
                <Palette className="w-5 h-5 mr-2" />
                Start with bead patterns
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="#tools">Browse all tools</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
