import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * 站点地图：中文页保留原 URL，英文页统一挂在 /en 前缀下。
 *
 * 关于 hreflang：Next 14.0.3 的 sitemap 序列化器只输出 loc/lastmod/changefreq/priority，
 * 不支持条目级 `alternates.languages`（MetadataRoute.Sitemap 类型里也没有该字段，
 * XML 端不会生成 <xhtml:link>）。因此中英互指统一放在各页面的 metadata.alternates.languages
 * （即 <head> 里的 hreflang，Google 官方支持的主要声明方式）：
 * - 首页：src/app/layout.tsx（zh-CN / en / x-default）
 * - /en：src/app/en/page.tsx
 * - /pindou 与 /en/pindou：各自页面的 layout.tsx
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.domain
  const lastModified = new Date()

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/image-combine`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/image-split`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/markdown-to-image`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-frame`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/image-watermark`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/social-resize`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pindou`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/pindou`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/qr-code`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subtitle-tools`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sensitive-words`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ]
}
