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
import type { Locale } from '@/lib/i18n'

type HomeTool = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  chipClass: string
  iconClass: string
}

type PrivacyPoint = {
  title: string
  description: string
  icon: LucideIcon
  chipClass: string
  iconClass: string
}

type HomeCopy = {
  brandAlt: string
  hero: {
    title: string
    intro: string
    badges: readonly string[]
    primaryCta: string
    secondaryCta: string
    note: string
  }
  privacyHeading: string
  privacyPoints: readonly PrivacyPoint[]
  toolsHeading: string
  featured: {
    title: string
    subtitle: string
    description: string
    features: readonly string[]
    href: string
    cta: string
  }
  otherTools: readonly HomeTool[]
  toolsCta: string
  faqHeading: string
  faqs: readonly { question: string; answer: string }[]
  cta: {
    title: string
    description: string
    primary: string
    secondary: string
  }
}

const HOME_COPY: Record<Locale, HomeCopy> = {
  zh: {
    brandAlt: siteConfig.name,
    hero: {
      title: '免费在线工具，文件不上传服务器',
      intro:
        '原牛是一组完全在浏览器本地运行的创作工具：拼豆图纸、图片拼接、长图切割、加水印、尺寸适配、二维码、字幕与视频截帧，打开即用，无需安装。',
      badges: ['纯浏览器本地处理', '文件不上传服务器', '免费无限制'],
      primaryCta: '打开拼豆图纸生成器',
      secondaryCta: '浏览全部工具',
      note: '无需上传，无需注册，完全免费。',
    },
    privacyHeading: '隐私优先',
    privacyPoints: [
      {
        title: '文件始终留在你的设备上',
        description:
          '所有工具都在浏览器标签页内处理图片和文本，没有上传步骤，也没有服务器端处理；打开的文件只留在你的电脑、平板或手机上。',
        icon: WifiOff,
        chipClass: 'bg-emerald-100',
        iconClass: 'text-emerald-600',
      },
      {
        title: '无需账号，不追踪你的内容',
        description:
          '打开页面即可开始使用，不需要注册或邮箱；我们不会查看你载入工具的图片或文字。',
        icon: ShieldCheck,
        chipClass: 'bg-sky-100',
        iconClass: 'text-sky-600',
      },
      {
        title: '免费，无水印与导出限制',
        description: '没有付费墙、每日额度或带水印的下载，随时按原始分辨率导出。',
        icon: BadgeCheck,
        chipClass: 'bg-amber-100',
        iconClass: 'text-amber-600',
      },
    ],
    toolsHeading: '现已上线',
    featured: {
      title: '拼豆图纸生成器',
      subtitle: '照片一键转可打印拼豆图纸，全程在浏览器完成',
      description:
        '上传照片即可生成可打印拼豆图纸：自动将图片采样为网格，每个格子匹配 96 色参考色号，统计每种颜色所需拼豆数量，并导出高清 PNG 图纸与 CSV 采购清单。支持 Perler、Hama、Artkal 等拼豆。',
      features: [
        '96 色数字参考色号',
        '每种颜色的用量与占比',
        '可打印高清 PNG 图纸',
        'CSV 拼豆采购清单',
      ],
      href: '/pindou',
      cta: '生成拼豆图纸',
    },
    otherTools: [
      {
        title: '图片拼接',
        description: '多种网格布局，把多张照片拼成一张图，免费、不上传。',
        href: '/image-combine',
        icon: LayoutGrid,
        chipClass: 'bg-pink-100',
        iconClass: 'text-pink-600',
      },
      {
        title: '长图切割',
        description: '把长图切成等宽切片或 3×3 九宫格，适合社交平台发布。',
        href: '/image-split',
        icon: Scissors,
        chipClass: 'bg-orange-100',
        iconClass: 'text-orange-600',
      },
      {
        title: '图片加水印',
        description: '批量添加文字或 Logo 水印，打包为一个 ZIP 下载。',
        href: '/image-watermark',
        icon: Stamp,
        chipClass: 'bg-teal-100',
        iconClass: 'text-teal-600',
      },
      {
        title: '尺寸适配',
        description: '一键适配 Instagram、X、LinkedIn、YouTube 等平台尺寸。',
        href: '/social-resize',
        icon: Scaling,
        chipClass: 'bg-rose-100',
        iconClass: 'text-rose-600',
      },
      {
        title: '敏感词检测',
        description: '检测广告文案中的极限词与高风险表述，高亮并一键遮罩。',
        href: '/sensitive-words',
        icon: ShieldAlert,
        chipClass: 'bg-amber-100',
        iconClass: 'text-amber-600',
      },
      {
        title: 'Markdown 转图片',
        description: '把 Markdown 转成可分享的 PNG，支持实时预览与自定义主题。',
        href: '/markdown-to-image',
        icon: FileText,
        chipClass: 'bg-indigo-100',
        iconClass: 'text-indigo-600',
      },
      {
        title: '二维码生成',
        description: '自定义颜色、Logo 与透明背景，导出高清 PNG。',
        href: '/qr-code',
        icon: QrCode,
        chipClass: 'bg-emerald-100',
        iconClass: 'text-emerald-600',
      },
      {
        title: '视频截帧',
        description: '在浏览器中从视频逐帧截取画面，支持单张或批量。',
        href: '/video-frame',
        icon: Film,
        chipClass: 'bg-purple-100',
        iconClass: 'text-purple-600',
      },
      {
        title: '字幕工具',
        description: 'SRT/VTT 互转、时间轴平移、合并与清理，全部本地完成。',
        href: '/subtitle-tools',
        icon: Subtitles,
        chipClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
      },
    ],
    toolsCta: '打开工具',
    faqHeading: '常见问题',
    faqs: [
      {
        question: '这些工具真的免费吗？',
        answer:
          '是的。本站所有工具均可免费使用，没有水印、导出限制，也无需注册；站点通过广告维持运营。',
      },
      {
        question: '我的文件会被上传到服务器吗？',
        answer:
          '不会。所有处理都在浏览器内完成，图片和文字不会离开你的设备；大多数工具断网后仍可使用。',
      },
      {
        question: '需要安装或注册吗？',
        answer: '不需要。用桌面、平板或手机上的现代浏览器打开即可使用。',
      },
      {
        question: '拼豆图纸生成器能做什么？',
        answer:
          '上传照片即可生成可打印图纸：每个格子匹配 96 色数字参考色号，统计每种颜色用量，导出高清 PNG 图纸与 CSV 采购清单；适用于 Perler、Hama、Artkal 等拼豆。',
      },
      {
        question: '还有哪些工具？',
        answer:
          '图片拼接、长图切割、批量加水印、尺寸适配、敏感词检测、Markdown 转图片、二维码生成、字幕转换与视频截帧。所有工具都在浏览器本地运行，遵循同样的不上传、不注册原则。',
      },
    ],
    cta: {
      title: '一分钟把照片变成拼豆图纸',
      description: '选择照片、设置图纸宽度，然后打印图纸。全部在你的设备上完成。',
      primary: '从拼豆图纸开始',
      secondary: '浏览全部工具',
    },
  },
  en: {
    brandAlt: 'mihoyonb',
    hero: {
      title: 'Free browser-based tools that never upload your files',
      intro:
        'mihoyonb is a growing collection of creative tools that run entirely in your browser. Start with the Perler bead pattern generator, then split images, convert Markdown, generate QR codes and clean up subtitles — all on your device.',
      badges: ['Runs 100% in your browser', 'Files never uploaded', 'Free, no signup'],
      primaryCta: 'Open the bead pattern generator',
      secondaryCta: 'Browse all tools',
      note: 'No uploads. No account. No cost.',
    },
    privacyHeading: 'Private by design',
    privacyPoints: [
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
    ],
    toolsHeading: 'Available now',
    featured: {
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
    },
    otherTools: [
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
        description:
          'Convert SRT to VTT, shift timing, merge and clean up subtitles locally.',
        href: '/en/subtitle-tools',
        icon: Subtitles,
        chipClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
      },
    ],
    toolsCta: 'Open tool',
    faqHeading: 'Frequently asked questions',
    faqs: [
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
    ],
    cta: {
      title: 'Turn a photo into a bead pattern in under a minute',
      description:
        'Pick a photo, choose your pattern width, and print the blueprint. Everything runs on your device.',
      primary: 'Start with bead patterns',
      secondary: 'Browse all tools',
    },
  },
}

function PrivacyPointCard({ point }: { point: PrivacyPoint }) {
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

/**
 * 中英文首页共用同一套结构与视觉层级：
 * Hero → 隐私说明 → 主推工具 + 全部工具 → FAQ → 结尾 CTA。
 * 文案与链接随 locale 切换，避免两套首页各自演化。
 */
export function HomePage({ locale }: { locale: Locale }) {
  const copy = HOME_COPY[locale]

  return (
    <div className="bg-background">
      <section className="container mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <Image
              src={siteConfig.logo.src}
              alt={copy.brandAlt}
              width={56}
              height={56}
              className="w-14 h-14"
              priority
            />
          </div>
          <p className="text-sm font-semibold tracking-[0.18em] text-muted-foreground">
            {copy.brandAlt}
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            {copy.hero.title}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">{copy.hero.intro}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {copy.hero.badges.map((badge) => (
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
              <Link href={copy.featured.href}>
                <Palette className="w-5 h-5 mr-2" />
                {copy.hero.primaryCta}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="#tools">{copy.hero.secondaryCta}</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{copy.hero.note}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground flex-shrink-0">
              {copy.privacyHeading}
            </h2>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {copy.privacyPoints.map((point) => (
              <PrivacyPointCard key={point.title} point={point} />
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="container mx-auto px-4 py-8 md:py-10 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground flex-shrink-0">
              {copy.toolsHeading}
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
                  <h3 className="text-xl font-semibold">{copy.featured.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {copy.featured.subtitle}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{copy.featured.description}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {copy.featured.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <BadgeCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={copy.featured.href}>
                <Button className="w-full sm:w-auto">
                  {copy.featured.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            {copy.otherTools.map((tool) => {
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
                      {copy.toolsCta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-foreground flex-shrink-0">
              {copy.faqHeading}
            </h2>
            <div className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <div className="space-y-5">
            {copy.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-14 pt-4">
        <div className="max-w-3xl mx-auto rounded-xl border bg-muted/20 p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">{copy.cta.title}</h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            {copy.cta.description}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={copy.featured.href}>
                <Palette className="w-5 h-5 mr-2" />
                {copy.cta.primary}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="#tools">{copy.cta.secondary}</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
