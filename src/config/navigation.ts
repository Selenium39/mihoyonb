import {
  Crop,
  FileText,
  Film,
  LayoutGrid,
  QrCode,
  Scissors,
  ShieldAlert,
  Stamp,
  Subtitles,
  type LucideIcon,
} from 'lucide-react'

/**
 * 全站导航的唯一数据源
 * 新增工具时在此追加一项（并同步 site.ts 的 SEO 配置与 sitemap.ts），
 * 桌面端「全部工具」下拉与移动端菜单均由该数据渲染。
 */
export interface NavTool {
  name: string
  href: string
  description: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  tools: NavTool[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: '图片工具',
    tools: [
      { name: '图片拼接', href: '/image-combine', description: '多图自由拼贴', icon: LayoutGrid },
      { name: '长图切割', href: '/image-split', description: '切片与九宫格', icon: Scissors },
      { name: '图片加水印', href: '/image-watermark', description: '批量文字/图片水印', icon: Stamp },
      { name: '尺寸适配', href: '/social-resize', description: '一键适配平台规格', icon: Crop },
      { name: '二维码生成', href: '/qr-code', description: '自定义样式导出', icon: QrCode },
    ],
  },
  {
    label: '视频工具',
    tools: [
      { name: '视频截帧', href: '/video-frame', description: '逐帧截取保存', icon: Film },
    ],
  },
  {
    label: '文案工具',
    tools: [
      { name: 'Markdown转图片', href: '/markdown-to-image', description: '排版一键出图', icon: FileText },
      { name: '字幕工具', href: '/subtitle-tools', description: 'SRT/VTT 处理', icon: Subtitles },
      { name: '敏感词检测', href: '/sensitive-words', description: '违禁词高亮', icon: ShieldAlert },
    ],
  },
]

/** 判断某分组是否包含当前路由对应的工具 */
export const isGroupActive = (group: NavGroup, pathname: string) =>
  group.tools.some((tool) =>
    tool.href === '/' ? pathname === '/' : pathname.startsWith(tool.href),
  )
