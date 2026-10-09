import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Crop,
  FileText,
  Film,
  Grid3X3,
  QrCode,
  Scissors,
  ShieldAlert,
  Stamp,
  Subtitles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { siteConfig } from '@/config/site'

// 工具卡片数据：图标与浅底色一一对应，不重复
type ToolCardData = {
  title: string
  subtitle: string
  description: string
  href: string
  icon: LucideIcon
  chipClass: string
  iconClass: string
  tags: string[]
  cta: string
}

const TOOL_GROUPS: { label: string; tools: ToolCardData[] }[] = [
  {
    label: '图片工具',
    tools: [
      {
        title: '图片拼接',
        subtitle: '多图布局拼接合成',
        description:
          '支持多种网格布局和自定义图片拼接，纯浏览器本地处理，图片不上传服务器，自由调整间距、圆角和背景，创作出个性化的照片拼接作品。',
        href: '/image-combine',
        icon: Grid3X3,
        chipClass: 'bg-pink-100',
        iconClass: 'text-pink-600',
        tags: ['布局拼接', '长图拼接', '本地处理'],
        cta: '开始拼接',
      },
      {
        title: '长图切割',
        subtitle: '长图切片九宫格切图',
        description:
          '将长图按行列网格切成多张图片，或一键切成九宫格，适合微博、朋友圈分享，纯浏览器本地处理，图片不上传服务器。',
        href: '/image-split',
        icon: Scissors,
        chipClass: 'bg-orange-100',
        iconClass: 'text-orange-600',
        tags: ['网格切割', '九宫格', '批量下载'],
        cta: '开始切割',
      },
      {
        title: '图片加水印',
        subtitle: '批量文字与图片水印',
        description:
          '批量为多张图片添加文字或图片水印，支持九宫格位置、透明度、旋转与平铺模式，纯浏览器本地处理，图片不上传服务器。',
        href: '/image-watermark',
        icon: Stamp,
        chipClass: 'bg-teal-100',
        iconClass: 'text-teal-600',
        tags: ['批量处理', '文字水印', '图片水印'],
        cta: '开始加水印',
      },
      {
        title: '尺寸适配',
        subtitle: '多平台尺寸一键转换',
        description:
          '一键将图片适配公众号、小红书、抖音等平台封面尺寸，支持居中裁切与完整保留两种模式，并可自定义宽高，本地处理不上传。',
        href: '/social-resize',
        icon: Crop,
        chipClass: 'bg-cyan-100',
        iconClass: 'text-cyan-600',
        tags: ['多平台预设', '居中裁切', '自定义尺寸'],
        cta: '开始适配',
      },
      {
        title: '二维码生成',
        subtitle: '二维码生成与美化',
        description:
          '输入文字或链接在线生成二维码，自定义颜色、尺寸与样式，导出高清图片，纯浏览器本地生成，内容不上传服务器。',
        href: '/qr-code',
        icon: QrCode,
        chipClass: 'bg-emerald-100',
        iconClass: 'text-emerald-600',
        tags: ['实时生成', '自定义样式', '高清导出'],
        cta: '开始生成',
      },
    ],
  },
  {
    label: '视频工具',
    tools: [
      {
        title: '视频截帧',
        subtitle: '视频逐帧精准截取',
        description:
          '上传视频后播放定位、逐帧精调，一键截取当前画面并导出图片，支持快捷键操作，纯浏览器本地处理，视频不上传服务器。',
        href: '/video-frame',
        icon: Film,
        chipClass: 'bg-violet-100',
        iconClass: 'text-violet-600',
        tags: ['逐帧定位', '快捷键', '本地处理'],
        cta: '开始截帧',
      },
    ],
  },
  {
    label: '文案工具',
    tools: [
      {
        title: 'Markdown转图片',
        subtitle: '文档美化导出图片',
        description:
          '将Markdown文档转换为精美图片，纯浏览器本地渲染导出，支持自定义背景、字体大小和样式，适合社交媒体分享和文档展示。',
        href: '/markdown-to-image',
        icon: FileText,
        chipClass: 'bg-indigo-100',
        iconClass: 'text-indigo-600',
        tags: ['实时预览', '自定义样式', '高清导出', '本地处理'],
        cta: '开始转换',
      },
      {
        title: '字幕工具',
        subtitle: 'SRT/VTT 字幕处理',
        description:
          'SRT 与 VTT 字幕双向转换、时间轴平移、多份字幕合并与清理修复，纯浏览器本地处理，文件不上传服务器。',
        href: '/subtitle-tools',
        icon: Subtitles,
        chipClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
        tags: ['格式互转', '时间轴平移', '合并清理'],
        cta: '开始处理',
      },
      {
        title: '敏感词检测',
        subtitle: '广告法违禁词检测',
        description:
          '内置广告法极限词与平台违规词双词库，一键检测并分类高亮标注，支持遮罩替换与自定义词库，文本不上传服务器。',
        href: '/sensitive-words',
        icon: ShieldAlert,
        chipClass: 'bg-red-100',
        iconClass: 'text-red-600',
        tags: ['双词库', '高亮标注', '一键遮罩'],
        cta: '开始检测',
      },
    ],
  },
]

function ToolCardItem({ tool }: { tool: ToolCardData }) {
  const Icon = tool.icon
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div
            className={`w-12 h-12 ${tool.chipClass} rounded-lg flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-6 h-6 ${tool.iconClass}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{tool.title}</h3>
            <p className="text-sm text-muted-foreground font-normal">{tool.subtitle}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-muted-foreground mb-4">{tool.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tool.tags.map((tag) => (
            <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto">
          <Link href={tool.href}>
            <Button className="w-full">
              <Icon className="w-4 h-4 mr-2" />
              {tool.cta}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  return (
    <div className="bg-background">
      <div className="container mx-auto py-12 px-4">
        {/* 网站介绍 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src={siteConfig.logo.src}
              alt={siteConfig.name}
              width={64}
              height={64}
              className="w-16 h-16"
            />
            <h1 className="text-4xl font-bold text-foreground">{siteConfig.name}</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-2">{siteConfig.slogan}</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            所有处理均在您的浏览器本地完成，
            文件不上传服务器，隐私安全，免费无限制。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-muted-foreground">纯浏览器本地处理</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-muted-foreground">文件不上传服务器</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-muted-foreground">隐私安全</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-muted-foreground">免费无限制</span>
          </div>
        </div>

        {/* 分组工具目录 */}
        <div className="max-w-6xl mx-auto space-y-10">
          {TOOL_GROUPS.map((group) => (
            <section key={group.label}>
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-lg font-semibold text-foreground flex-shrink-0">
                  {group.label}
                </h2>
                <div className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.tools.map((tool) => (
                  <ToolCardItem key={tool.href} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>所有工具完全免费、无需注册登录，处理全程在浏览器本地完成，文件不会上传到服务器</p>
        </div>
      </div>
    </div>
  )
}
