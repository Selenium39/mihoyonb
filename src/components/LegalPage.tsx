import Link from 'next/link'
import { Languages } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { LegalDoc } from '@/content/legal'
import type { Locale } from '@/lib/i18n'

/**
 * 法律页面通用渲染：隐私政策 / 服务条款共用，中英同构。
 * 语言切换由路由传入 altHref，避免这里再判断路径。
 */
export function LegalPage({
  doc,
  locale,
  altHref,
}: {
  doc: LegalDoc
  locale: Locale
  altHref: string
}) {
  return (
    <div className="bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto mb-4 flex justify-end">
          <Link
            href={altHref}
            hrefLang={locale === 'en' ? 'zh-CN' : 'en'}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Languages size={14} />
            {locale === 'en' ? '中文' : 'English'}
          </Link>
        </div>

        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">{doc.title}</h1>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none break-words">
            <p className="text-muted-foreground text-center mb-6">{doc.lastUpdated}</p>

            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold mt-6 mb-3">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mb-4">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="list-disc pl-6 mb-4">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
