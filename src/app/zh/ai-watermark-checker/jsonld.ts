import { getPageUrl } from '@/config/site'
import { localizedPath, type Locale } from '@/lib/i18n'
import { getAiWatermarkCopy } from './copy'

/** 页面结构化数据：工具、FAQ、面包屑。文案与可见内容共用同一份 copy。 */
export function aiWatermarkStructuredData(locale: Locale, description: string) {
  const copy = getAiWatermarkCopy(locale)
  const pageUrl = getPageUrl(localizedPath(locale, '/ai-watermark-checker'))
  const homeUrl = getPageUrl(locale === 'zh' ? '/zh' : '/')

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: copy.hero.title,
      url: pageUrl,
      description,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any (browser-based)',
      isAccessibleForFree: true,
      inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: copy.features.map((feature) => `${feature.title}: ${feature.description}`),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: copy.faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: copy.breadcrumb.home,
          item: homeUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: copy.breadcrumb.current,
          item: pageUrl,
        },
      ],
    },
  ]
}
