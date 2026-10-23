import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  LayoutGrid,
  Mail,
  Palette,
  QrCode,
  Scissors,
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
  'Free, privacy-first browser tools. Turn any photo into a printable Perler bead pattern with color chart and shopping list — no uploads, no signup.'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  publisher: 'mihoyonb',
  keywords:
    'browser-based tools, free online tools, perler bead pattern generator, photo to bead pattern, privacy-first tools, no upload tools, no signup tools, client-side image tools, hama bead pattern, artkal beads',
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

/** 即将上线的工具（英文站暂未开放，不链接到中文页面） */
const COMING_SOON: {
  title: string
  description: string
  icon: LucideIcon
  chipClass: string
  iconClass: string
}[] = [
  {
    title: 'Image Splitter',
    description:
      'Cut a long screenshot into swipeable tiles or an Instagram-style 3×3 grid, ready to post.',
    icon: Scissors,
    chipClass: 'bg-orange-100',
    iconClass: 'text-orange-600',
  },
  {
    title: 'Image Watermark',
    description:
      'Batch-add text or logo watermarks with position, opacity, rotation and tiling controls.',
    icon: Stamp,
    chipClass: 'bg-teal-100',
    iconClass: 'text-teal-600',
  },
  {
    title: 'Markdown to Image',
    description:
      'Turn Markdown notes into clean, shareable images without leaving the browser.',
    icon: FileText,
    chipClass: 'bg-indigo-100',
    iconClass: 'text-indigo-600',
  },
  {
    title: 'Photo Collage',
    description:
      'Combine several photos into one grid layout with custom spacing, corners and background.',
    icon: LayoutGrid,
    chipClass: 'bg-pink-100',
    iconClass: 'text-pink-600',
  },
  {
    title: 'QR Code Generator',
    description:
      'Create custom-colored QR codes and export them at print-ready resolution.',
    icon: QrCode,
    chipClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
  },
  {
    title: 'Subtitle Tools',
    description:
      'Convert, shift and merge SRT/VTT subtitle files locally, with nothing uploaded.',
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
            Start with the Perler bead pattern generator, with more tools on the way.
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
              <a href="#coming-soon">See what is coming next</a>
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
      <section className="container mx-auto px-4 py-8 md:py-10">
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
        </div>
      </section>

      {/* 即将上线 */}
      <section id="coming-soon" className="container mx-auto px-4 py-8 md:py-10 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground flex-shrink-0">
              Coming soon
            </h2>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMING_SOON.map((tool) => {
              const Icon = tool.icon
              return (
                <Card key={tool.title} className="h-full bg-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div
                        className={`w-10 h-10 ${tool.chipClass} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-5 h-5 ${tool.iconClass}`} />
                      </div>
                      <span>{tool.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                    <span className="inline-block mt-3 bg-background border px-2 py-0.5 rounded text-xs text-muted-foreground">
                      Coming soon
                    </span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <p className="mt-5 text-sm text-muted-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>
              Want a specific tool sooner?{' '}
              <a
                href={`mailto:${siteConfig.author.email}`}
                className="text-primary hover:underline"
              >
                Send us a note
              </a>
              .
            </span>
          </p>
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
              <a href="#coming-soon">See what is coming next</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
