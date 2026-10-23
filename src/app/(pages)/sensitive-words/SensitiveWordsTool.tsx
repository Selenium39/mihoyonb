'use client'

import { useEffect, useMemo, useState } from 'react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trackToolExport, trackToolUse } from '@/lib/analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShieldAlert,
  ShieldCheck,
  ScanSearch,
  Eraser,
  Copy,
  Check,
  Trash2,
  BookOpen,
  PenLine,
  Send,
  ShoppingBag,
  Users,
  FileCheck,
} from 'lucide-react'
import {
  SENSITIVE_WORD_CATEGORIES,
  CUSTOM_CATEGORY_ID,
  detectSensitiveWords,
  splitSegments,
  maskText,
  parseCustomWords,
  type DetectResult,
  type SensitiveWordCategory,
} from '@/lib/sensitive-words'
import {
  ENGLISH_SENSITIVE_WORD_CATEGORIES,
  detectEnglishSensitiveWords,
  parseEnglishCustomWords,
} from '@/lib/sensitive-words-en'
import { type Locale } from '@/lib/i18n'
import { getSensitiveWordsCopy } from './copy'

/**
 * 自定义词库的 localStorage 键。
 * 中英分开存储：英文页需要保留多词短语，中文页保持原有键不变以兼容老数据。
 */
const CUSTOM_STORAGE_KEY: Record<Locale, string> = {
  zh: 'yuanniu:sensitive-words:custom',
  en: 'yuanniu:sensitive-words:custom:en',
}

/** 超长文本时高亮预览的截断长度（统计与替换仍基于全文） */
const PREVIEW_LIMIT = 50000

/** 各分类的高亮与徽章样式 */
const CATEGORY_STYLES: Record<string, { mark: string; badge: string }> = {
  'ad-law': {
    mark: 'bg-red-100 text-red-700 rounded px-0.5 dark:bg-red-900/70 dark:text-red-200',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-200',
  },
  'ad-claims': {
    mark: 'bg-red-100 text-red-700 rounded px-0.5 dark:bg-red-900/70 dark:text-red-200',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-200',
  },
  platform: {
    mark: 'bg-orange-100 text-orange-700 rounded px-0.5 dark:bg-orange-900/70 dark:text-orange-200',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/70 dark:text-orange-200',
  },
  prohibited: {
    mark: 'bg-orange-100 text-orange-700 rounded px-0.5 dark:bg-orange-900/70 dark:text-orange-200',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/70 dark:text-orange-200',
  },
  [CUSTOM_CATEGORY_ID]: {
    mark: 'bg-blue-100 text-blue-700 rounded px-0.5 dark:bg-blue-900/70 dark:text-blue-200',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-200',
  },
}

/** 与 copy.ts 的 features / scenarios 顺序一一对应 */
const FEATURE_ICONS = [ShieldCheck, BookOpen, PenLine, Eraser]
const SCENARIO_ICONS = [Send, ShoppingBag, Users, FileCheck]

export interface SensitiveWordsToolProps {
  locale: Locale
}

export default function SensitiveWordsTool({ locale }: SensitiveWordsToolProps) {
  const copy = getSensitiveWordsCopy(locale)
  const storageKey = CUSTOM_STORAGE_KEY[locale]
  const builtinCategories =
    locale === 'en' ? ENGLISH_SENSITIVE_WORD_CATEGORIES : SENSITIVE_WORD_CATEGORIES

  const [text, setText] = useState('')
  const [customWordsText, setCustomWordsText] = useState('')
  const [maskChar, setMaskChar] = useState('*')
  const [result, setResult] = useState<DetectResult | null>(null)
  const [processedText, setProcessedText] = useState<string | null>(null)
  const [resultTab, setResultTab] = useState<string>('highlight')
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  // 记录已经读完的词库键，避免首次渲染时用空值覆盖 localStorage 里的自定义词
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null)

  // 恢复本地保存的自定义词库
  useEffect(() => {
    let stored = ''
    try {
      stored = localStorage.getItem(storageKey) ?? ''
    } catch {
      // 忽略：localStorage 不可用时仅会话内生效
    }
    setCustomWordsText(stored)
    setLoadedStorageKey(storageKey)
  }, [storageKey])

  // 持久化自定义词库（必须等恢复完成，否则会用空字符串覆盖已保存内容）
  useEffect(() => {
    if (loadedStorageKey !== storageKey) return
    try {
      localStorage.setItem(storageKey, customWordsText)
    } catch {
      // 忽略：写入失败不影响本次会话
    }
  }, [customWordsText, storageKey, loadedStorageKey])

  /** 解析后的自定义词：英文保留多词短语，中文沿用原有拆分规则 */
  const customWords = useMemo(
    () =>
      locale === 'en'
        ? parseEnglishCustomWords(customWordsText)
        : parseCustomWords(customWordsText),
    [customWordsText, locale]
  )

  /** 检测用的完整分类列表（内置 + 自定义） */
  const categories = useMemo<SensitiveWordCategory[]>(() => {
    const list = [...builtinCategories]
    if (customWords.length > 0) {
      list.push({
        id: CUSTOM_CATEGORY_ID,
        name: copy.customCategory.name,
        description: copy.customCategory.description,
        words: customWords,
      })
    }
    return list
  }, [builtinCategories, customWords, copy])

  const categoryName = (id: string): string =>
    categories.find((c) => c.id === id)?.name ?? id

  /** 超长文本时预览用的前缀片段与命中区间 */
  const preview = useMemo(() => {
    if (!result) return null
    const truncated = text.length > PREVIEW_LIMIT
    const sliced = truncated ? text.slice(0, PREVIEW_LIMIT) : text
    const ranges = truncated
      ? result.ranges.filter((r) => r.end <= PREVIEW_LIMIT)
      : result.ranges
    return { segments: splitSegments(sliced, ranges), truncated }
  }, [result, text])

  const handleTextChange = (value: string) => {
    setText(value)
    // 文本变化后旧结果失效
    setResult(null)
    setProcessedText(null)
  }

  const handleDetect = () => {
    setResult(
      locale === 'en'
        ? detectEnglishSensitiveWords(text, categories)
        : detectSensitiveWords(text, categories)
    )
    setProcessedText(null)
    setResultTab('highlight')
    setCopyFailed(false)
    trackToolUse('sensitive_words', 'detect')
  }

  const handleMask = () => {
    if (!result) return
    setProcessedText(maskText(text, result.ranges, maskChar))
    setResultTab('processed')
    setCopyFailed(false)
    trackToolUse('sensitive_words', 'mask')
  }

  const handleCopy = async () => {
    if (!processedText) return
    let ok = false
    try {
      await navigator.clipboard.writeText(processedText)
      ok = true
    } catch {
      // 降级方案：临时 textarea + execCommand
      try {
        const ta = document.createElement('textarea')
        ta.value = processedText
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ok = document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        ok = false
      }
    }
    if (ok) {
      setCopied(true)
      setCopyFailed(false)
      trackToolExport('sensitive_words', 'copy')
      setTimeout(() => setCopied(false), 1500)
    } else {
      setCopyFailed(true)
      setTimeout(() => setCopyFailed(false), 3000)
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher variant="inline" />
        </div>

        {/* 页头 */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            {copy.hero.title}
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {copy.hero.intro}
          </p>
        </div>

        {/* 免责声明（显著位置） */}
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{copy.disclaimer}</p>
        </div>

        {/* 主工作区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 左侧：输入 + 结果 */}
          <div className="col-span-1 lg:col-span-8 space-y-4 order-1">
            {/* 文本输入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base md:text-lg">
                  <span className="flex items-center gap-2">
                    <ScanSearch className="h-5 w-5" />
                    {copy.input.cardTitle}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {copy.input.charCount(text.length)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={copy.input.placeholder}
                  aria-label={copy.input.ariaLabel}
                  className="min-h-[220px] leading-6"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={handleDetect} disabled={!text.trim()} className="flex items-center gap-1.5">
                    <ScanSearch className="h-4 w-4" />
                    {copy.actions.detect}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMask}
                    disabled={!result || result.total === 0}
                    className="flex items-center gap-1.5"
                  >
                    <Eraser className="h-4 w-4" />
                    {copy.actions.mask}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextChange(copy.sampleText)}
                    className="text-muted-foreground"
                  >
                    {copy.actions.sample}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextChange('')}
                    disabled={!text}
                    className="text-muted-foreground flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {copy.actions.clear}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 检测结果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <ShieldCheck className="h-5 w-5" />
                  {copy.results.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result === null ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {copy.results.idle}
                  </p>
                ) : result.total === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-green-600 dark:text-green-400">
                    <ShieldCheck className="h-10 w-10" />
                    <p className="text-sm font-medium">{copy.results.cleanTitle}</p>
                    <p className="text-xs text-muted-foreground">{copy.results.cleanHint}</p>
                  </div>
                ) : (
                  <Tabs value={resultTab} onValueChange={setResultTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="highlight">{copy.results.tabs.highlight}</TabsTrigger>
                      <TabsTrigger value="processed">{copy.results.tabs.processed}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="highlight" className="mt-3">
                      <div className="max-h-[420px] overflow-y-auto rounded-md border bg-muted/20 p-4 text-sm leading-7">
                        <div className="whitespace-pre-wrap break-words">
                          {preview?.segments.map((segment, i) =>
                            segment.match ? (
                              <mark
                                key={i}
                                className={
                                  CATEGORY_STYLES[segment.match.categoryId]?.mark ??
                                  CATEGORY_STYLES[CUSTOM_CATEGORY_ID].mark
                                }
                                title={copy.results.markTitle(
                                  categoryName(segment.match.categoryId),
                                  segment.text
                                )}
                              >
                                {segment.text}
                              </mark>
                            ) : (
                              <span key={i}>{segment.text}</span>
                            )
                          )}
                        </div>
                      </div>
                      {preview?.truncated && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {copy.results.truncated(PREVIEW_LIMIT)}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {copy.results.legend(customWords.length > 0)}
                      </p>
                    </TabsContent>
                    <TabsContent value="processed" className="mt-3">
                      {processedText === null ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
                          <p>{copy.results.processedEmpty}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMask}
                            className="flex items-center gap-1.5"
                          >
                            <Eraser className="h-4 w-4" />
                            {copy.results.generateMask(maskChar || '*')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="max-h-[420px] overflow-y-auto rounded-md border bg-muted/20 p-4 text-sm leading-7">
                            <div className="whitespace-pre-wrap break-words">{processedText}</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={handleCopy}
                            className="flex items-center gap-1.5"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                {copy.results.copied}
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                {copy.results.copy}
                              </>
                            )}
                          </Button>
                          {copyFailed && (
                            <p className="text-xs text-destructive" role="status">
                              {copy.results.copyFailed}
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：统计 + 设置 */}
          <div className="col-span-1 lg:col-span-4 space-y-4 order-2">
            {/* 统计面板 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">{copy.stats.cardTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result === null ? (
                  <p className="text-sm text-muted-foreground">{copy.stats.empty}</p>
                ) : (
                  <>
                    <div className="flex items-end gap-6">
                      <div>
                        <div className={`text-3xl font-bold ${result.total > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {result.total}
                        </div>
                        <div className="text-xs text-muted-foreground">{copy.stats.total}</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-foreground">
                          {result.wordHits.length}
                        </div>
                        <div className="text-xs text-muted-foreground">{copy.stats.unique}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {categories.map((category) => {
                        const count = result.byCategory[category.id] || 0
                        return (
                          <div
                            key={category.id}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                            title={category.description}
                          >
                            <span className="text-sm">{category.name}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {copy.stats.libraryCount(category.words.length)}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category.id]?.badge ?? ''}`}
                              >
                                {copy.stats.hitCount(count)}
                              </span>
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {result.wordHits.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          {copy.stats.hitListTitle}
                        </p>
                        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                          {result.wordHits.map((hit) => (
                            <div
                              key={`${hit.categoryId}-${hit.word}`}
                              className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-sm"
                            >
                              <span className="font-medium">{hit.word}</span>
                              <span className="flex items-center gap-2 text-xs">
                                <span
                                  className={`rounded px-1.5 py-0.5 ${CATEGORY_STYLES[hit.categoryId]?.badge ?? ''}`}
                                >
                                  {categoryName(hit.categoryId)}
                                </span>
                                <span className="text-muted-foreground">× {hit.count}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 词库设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <PenLine className="h-5 w-5" />
                  {copy.settings.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="mask-char">
                    {copy.settings.maskCharLabel}
                  </label>
                  <Input
                    id="mask-char"
                    value={maskChar}
                    onChange={(e) => setMaskChar(e.target.value)}
                    maxLength={2}
                    className="w-20 text-center"
                    placeholder="*"
                  />
                  <p className="text-xs text-muted-foreground">{copy.settings.maskHint}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="custom-words">
                    {copy.settings.customLabel}
                  </label>
                  <Textarea
                    id="custom-words"
                    value={customWordsText}
                    onChange={(e) => setCustomWordsText(e.target.value)}
                    placeholder={copy.settings.customPlaceholder}
                    className="min-h-[110px] text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {copy.settings.customHint(customWords.length)}
                  </p>
                </div>

                <div className="rounded-md border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
                  <p className="mb-1 flex items-center gap-1 font-medium text-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    {copy.settings.builtinTitle}
                  </p>
                  {builtinCategories.map((category) => (
                    <p key={category.id}>
                      {copy.settings.builtinLine(
                        category.name,
                        category.words.length,
                        category.description
                      )}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SEO 内容区 */}
        <div className="mt-12 space-y-12 text-foreground">
          {/* 功能特性 */}
          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">{copy.sections.features}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {copy.features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index] ?? ShieldCheck
                return (
                  <Card key={feature.title}>
                    <CardContent className="p-5 text-center">
                      <Icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                      <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* 使用场景 */}
          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">{copy.sections.scenarios}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {copy.scenarios.map((scenario, index) => {
                const Icon = SCENARIO_ICONS[index] ?? FileCheck
                return (
                  <Card key={scenario.title}>
                    <CardContent className="flex items-start gap-4 p-5">
                      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                      <div>
                        <h3 className="mb-1 font-semibold">{scenario.title}</h3>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* 常见问题 */}
          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">{copy.sections.faqs}</h2>
            <div className="mx-auto max-w-3xl space-y-4">
              {copy.faqs.map((item) => (
                <Card key={item.question}>
                  <CardContent className="p-5">
                    <h3 className="mb-2 font-semibold">{item.question}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
