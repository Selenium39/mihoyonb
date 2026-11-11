import { getPageUrl } from '@/config/site'
import { localizedPath, type Locale } from '@/lib/i18n'
import { getScreenshotStitchCopy } from './copy'

/** 页面结构化数据。文案与可见的步骤、FAQ 共用同一份 copy。 */
export function screenshotStitchStructuredData(locale: Locale, description: string) {
  const copy = getScreenshotStitchCopy(locale)
  const pageUrl = getPageUrl(localizedPath(locale, '/screenshot-stitch'))
  const homeUrl = getPageUrl(locale === 'zh' ? '/zh' : '/')

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: copy.hero.title,
      url: pageUrl,
      description,
      applicationCategory: 'MultimediaApplication',
      applicationSubCategory: locale === 'zh' ? '截图拼接' : 'Screenshot stitcher',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a browser with Canvas and Media APIs.',
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
      '@type': 'HowTo',
      name: copy.howTo.title,
      description: copy.howTo.intro,
      inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
      totalTime: 'PT1M',
      step: copy.howTo.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.body,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: locale === 'zh' ? 'zh-CN' : 'en',
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
