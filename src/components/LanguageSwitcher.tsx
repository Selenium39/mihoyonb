'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Languages } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  alternateLocalePath,
  getLocaleFromPathname,
  LOCALES,
  type Locale,
} from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * 语言切换下拉：全站统一入口。
 *
 * - 中文在根路径、英文在 /en；选项只有两个，但用下拉避免误触，也方便以后扩展。
 * - header / mobile / footer / inline 四种外观，语义与跳转逻辑一致。
 * - 当前页面若尚未翻译，alternateLocalePath 会回落到对应语言首页。
 */
const LANGUAGE_LABELS: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
}

const TRIGGER_CLASS: Record<LanguageSwitcherVariant, string> = {
  header:
    'flex h-8 w-auto items-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus:ring-1 focus:ring-ring focus:ring-offset-0',
  mobile:
    'flex h-auto w-auto items-center gap-2 rounded-md border-0 bg-transparent px-3 py-0 text-xs font-medium text-muted-foreground hover:text-foreground focus:ring-1 focus:ring-ring focus:ring-offset-0',
  footer:
    'flex h-auto w-auto items-center gap-1.5 border-0 bg-transparent p-0 text-xs text-muted-foreground hover:text-foreground focus:ring-1 focus:ring-ring focus:ring-offset-0',
  inline:
    'flex h-auto w-auto items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus:ring-1 focus:ring-ring focus:ring-offset-0',
}

export type LanguageSwitcherVariant = 'header' | 'mobile' | 'footer' | 'inline'

export function LanguageSwitcher({
  variant = 'inline',
  locale,
  onSelect,
  className,
}: {
  variant?: LanguageSwitcherVariant
  locale?: Locale
  onSelect?: () => void
  className?: string
}) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const currentLocale = locale ?? getLocaleFromPathname(pathname)

  const handleChange = (value: string) => {
    const next = value as Locale
    if (next === currentLocale) return
    router.push(alternateLocalePath(pathname))
    onSelect?.()
  }

  return (
    <Select value={currentLocale} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(TRIGGER_CLASS[variant], className)}
        aria-label={currentLocale === 'en' ? 'Change language' : '切换语言'}
      >
        <Languages className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[8rem]">
        {LOCALES.map((item) => (
          <SelectItem key={item} value={item}>
            {LANGUAGE_LABELS[item]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
