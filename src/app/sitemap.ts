import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * 站点地图：英文为默认语言，使用根路径；中文统一挂在 /zh 前缀下。
 *
 * 关于 hreflang：Next 14.0.3 的 sitemap 序列化器只输出 loc/lastmod/changefreq/priority，
 * 不支持条目级 `alternates.languages`（MetadataRoute.Sitemap 类型里也没有该字段，
 * XML 端不会生成 <xhtml:link>）。因此中英互指统一放在各页面的 metadata.alternates.languages
 * （即 <head> 里的 hreflang，Google 官方支持的主要声明方式）：
 * - 首页：src/app/layout.tsx（en / zh-CN / x-default）
 * - /zh：src/app/zh/layout.tsx
 * - /pindou 与 /zh/pindou：各自页面的 layout.tsx
 * - /privacy 与 /zh/privacy、/terms 与 /zh/terms：各自页面的 layout.tsx
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.domain
  const lastModified = new Date()

  const english = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/pindou', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/image-combine', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/image-split', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/image-watermark', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/social-resize', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/sensitive-words', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/markdown-to-image', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/qr-code', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/video-frame', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/subtitle-tools', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  const chinese = english.map((item) => ({
    ...item,
    path: item.path === '' ? '/zh' : `/zh${item.path}`,
    priority: item.path === '' ? 0.8 : item.priority,
  }))

  return [...english, ...chinese].map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }))
}
