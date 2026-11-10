'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  ClipboardPaste,
  Copy,
  Download,
  Eraser,
  Eye,
  FileText,
  Languages,
  PenLine,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Table2,
  Trash2,
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { trackToolExport, trackToolUse } from '@/lib/analytics'
import {
  analyze,
  clean,
  codePointLabel,
  DEFAULT_OPTIONS,
  OPTION_KEYS,
  RULES,
  ruleToggle,
  type CleanOptionKey,
  type CleanOptions,
} from '@/lib/ai-watermark'
import type { Locale } from '@/lib/i18n'
import { localizedPath } from '@/lib/i18n'
import { getAiWatermarkCopy } from './copy'

const OPTIONS_STORAGE_KEY = 'mihoyonb:ai-watermark-checker:options'

const FEATURE_ICONS = [ScanSearch, Eraser, ShieldCheck, Smile]
const SCENARIO_ICONS = [PenLine, FileText, Table2, Languages]

export interface AiWatermarkToolProps {
  locale: Locale
}

export default function AiWatermarkTool({ locale }: AiWatermarkToolProps) {
  const copy = getAiWatermarkCopy(locale)
  const numberLocale = locale === 'zh' ? 'zh-CN' : 'en-US'
  const fmt = (value: number) => value.toLocaleString(numberLocale)
  const homeHref = localizedPath(locale, '/')

  const [text, setText] = useState('')
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_OPTIONS)
  const [optionsReady, setOptionsReady] = useState(false)
  const [revealOn, setRevealOn] = useState(false)
  const [hint, setHint] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(OPTIONS_STORAGE_KEY) || '{}') as Partial<CleanOptions>
      setOptions((current) => {
        const next = { ...current }
        for (const key of OPTION_KEYS) {
          if (typeof saved[key] === 'boolean') next[key] = saved[key]
        }
        return next
      })
    } catch {
      // localStorage 不可用时继续使用默认开关
    }
    setOptionsReady(true)
  }, [])

  useEffect(() => {
    if (!optionsReady) return
    try {
      localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(options))
    } catch {
      // 忽略写入失败，开关在本次访问内仍然有效
    }
  }, [options, optionsReady])

  const analysis = useMemo(() => analyze(text), [text])
  const cleaned = useMemo(() => clean(text, options), [text, options])

  const hiddenFindings = analysis.findings.filter(
    (finding) => finding.action === 'strip' || finding.action === 'space',
  )
  const suspicious = analysis.hiddenTotal > 0 || analysis.mixedWords.count > 0

  function toggleOption(key: CleanOptionKey) {
    setOptions((current) => ({ ...current, [key]: !current[key] }))
  }

  function loadExample() {
    setText(copy.sample)
    setRevealOn(true)
    setHint(copy.input.exampleLoaded)
    trackToolUse('ai_watermark_checker', 'example')
  }

  function clearText() {
    setText('')
    setRevealOn(false)
    setHint('')
  }

  async function pasteFromClipboard() {
    setHint('')
    try {
      const value = await navigator.clipboard.readText()
      setText(value)
      setRevealOn(false)
      trackToolUse('ai_watermark_checker', 'paste')
    } catch {
      setHint(copy.input.pasteBlocked)
    }
  }

  async function copyCleanText() {
    let ok = false
    try {
      await navigator.clipboard.writeText(cleaned.text)
      ok = true
    } catch {
      try {
        const area = document.createElement('textarea')
        area.value = cleaned.text
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        ok = document.execCommand('copy')
        document.body.removeChild(area)
      } catch {
        ok = false
      }
    }
    if (ok) {
      setCopied(true)
      setCopyFailed(false)
      trackToolExport('ai_watermark_checker', 'copy')
      window.setTimeout(() => setCopied(false), 1600)
    } else {
      setCopyFailed(true)
      window.setTimeout(() => setCopyFailed(false), 3000)
    }
  }

  function downloadCleanText() {
    const blob = new Blob([cleaned.text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cleaned-text.txt'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    trackToolExport('ai_watermark_checker', 'txt')
  }

  const auditHead = !text
    ? copy.audit.idle
    : analysis.hiddenTotal > 0 && analysis.mixedWords.count > 0
      ? `${copy.audit.hidden(fmt(analysis.hiddenTotal))} · ${copy.audit.mixed(fmt(analysis.mixedWords.count))}`
      : analysis.hiddenTotal > 0
        ? copy.audit.hidden(fmt(analysis.hiddenTotal))
        : analysis.mixedWords.count > 0
          ? copy.audit.mixed(fmt(analysis.mixedWords.count))
          : copy.audit.clean

  const auditNotes = [
    analysis.typographicTotal > 0 ? copy.audit.typographic(fmt(analysis.typographicTotal)) : '',
    analysis.newlineTotal > 0 ? copy.audit.newlines(fmt(analysis.newlineTotal)) : '',
  ].filter(Boolean)

  const cleanSummary = !text
    ? ''
    : cleaned.removed || cleaned.replaced
      ? `${copy.audit.cleanedPrefix}: ${[
          cleaned.removed ? copy.audit.removed(fmt(cleaned.removed)) : '',
          cleaned.replaced ? copy.audit.replaced(fmt(cleaned.replaced)) : '',
        ]
          .filter(Boolean)
          .join(' · ')}`
      : cleaned.text !== text
        ? copy.audit.formattingOnly
        : copy.audit.alreadyClean

  const auditClass = !text
    ? 'border-border bg-muted/40 text-muted-foreground'
    : suspicious
      ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100'
      : 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-100'

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher variant="inline" />
        </div>

        <nav aria-label={copy.breadcrumb.label} className="mb-4 text-sm text-muted-foreground">
          <Link href={homeHref} className="hover:text-foreground">
            {copy.breadcrumb.home}
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-foreground">{copy.breadcrumb.current}</span>
        </nav>

        <header className="mb-6 text-center">
          <h1 className="mb-3 flex items-center justify-center gap-2 text-3xl font-bold text-foreground md:text-4xl">
            <ScanSearch className="h-8 w-8 text-cyan-600" />
            {copy.hero.title}
          </h1>
          <p className="mx-auto max-w-3xl text-sm leading-6 text-muted-foreground md:text-lg md:leading-8">
            {copy.hero.intro}
          </p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {copy.hero.badges.map((badge) => (
              <li
                key={badge}
                className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground"
              >
                {badge}
              </li>
            ))}
          </ul>
        </header>

        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{copy.honesty}</p>
        </div>

        <noscript>
          <p className="mb-6 rounded-lg border px-4 py-3 text-sm text-muted-foreground">{copy.noscript}</p>
        </noscript>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">{copy.options.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {OPTION_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-700"
                    checked={options[key]}
                    onChange={() => toggleOption(key)}
                  />
                  {copy.options.labels[key]}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{copy.options.hint}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span>{copy.input.title}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {text ? copy.counts(fmt(analysis.counts.chars), fmt(analysis.counts.words)) : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {revealOn ? (
                <div
                  className="min-h-[260px] whitespace-pre-wrap break-words rounded-md border bg-background px-3 py-2 font-mono text-sm leading-6"
                  role="region"
                  aria-label={copy.input.revealLabel}
                  tabIndex={0}
                >
                  {analysis.reveal.length === 0 ? (
                    <span className="text-muted-foreground">{copy.input.emptyReveal}</span>
                  ) : (
                    analysis.reveal.map((segment, index) => {
                      if (segment.type === 'text' || segment.type === 'emoji') {
                        return <span key={index}>{segment.text}</span>
                      }
                      if (segment.type === 'word') {
                        return (
                          <span
                            key={index}
                            title={copy.input.wordTitle}
                            className="rounded bg-violet-200 px-0.5 text-violet-950 dark:bg-violet-800 dark:text-violet-50"
                          >
                            {segment.text}
                          </span>
                        )
                      }
                      const name = copy.rules[segment.id].name
                      return (
                        <span
                          key={index}
                          title={copy.input.markTitle(name, segment.label)}
                          className="mx-0.5 inline-flex items-center rounded bg-amber-200 px-1 align-baseline font-sans text-[10px] font-semibold leading-4 text-amber-950 dark:bg-amber-700 dark:text-amber-50"
                        >
                          {segment.abbr}
                        </span>
                      )
                    })
                  )}
                  {analysis.truncated && (
                    <p className="mt-3 font-sans text-xs text-muted-foreground">{copy.input.truncated}</p>
                  )}
                </div>
              ) : (
                <Textarea
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value)
                    if (hint) setHint('')
                  }}
                  placeholder={copy.input.placeholder}
                  aria-label={copy.input.aria}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  className="min-h-[260px] font-mono text-sm leading-6"
                />
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={pasteFromClipboard}>
                  <ClipboardPaste className="mr-1.5 h-4 w-4" />
                  {copy.input.paste}
                </Button>
                <Button type="button" variant="outline" onClick={loadExample}>
                  {copy.input.example}
                </Button>
                <Button type="button" variant="ghost" onClick={clearText} disabled={!text}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  {copy.input.clear}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={revealOn}
                  onClick={() => setRevealOn((current) => !current)}
                >
                  <Eye className="mr-1.5 h-4 w-4" />
                  {revealOn ? copy.input.editing : copy.input.reveal}
                </Button>
              </div>
              {hint && (
                <p className="text-xs text-muted-foreground" role="status">
                  {hint}
                </p>
              )}

              <div className={`rounded-lg border px-3 py-3 ${auditClass}`} role="status" aria-live="polite">
                <p className="text-sm font-medium">{auditHead}</p>
                {text && hiddenFindings.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {hiddenFindings.slice(0, 8).map((finding) => {
                      const name = copy.rules[finding.id].name
                      const showCode = finding.label.length <= 18
                      return (
                        <li
                          key={finding.id}
                          title={copy.input.markTitle(name, finding.label)}
                          className="rounded-full bg-background/80 px-2 py-0.5 text-xs"
                        >
                          {fmt(finding.count)}× {name}
                          {showCode ? ` (${finding.label})` : ''}
                        </li>
                      )
                    })}
                    {hiddenFindings.length > 8 && (
                      <li className="rounded-full bg-background/80 px-2 py-0.5 text-xs">
                        {copy.audit.more(hiddenFindings.length - 8)}
                      </li>
                    )}
                  </ul>
                )}
                {text && analysis.mixedWords.count > 0 && (
                  <p className="mt-2 text-xs">
                    {copy.audit.mixedChip(
                      fmt(analysis.mixedWords.count),
                      analysis.mixedWords.examples.join(', '),
                    )}
                  </p>
                )}
                {auditNotes.length > 0 && (
                  <p className="mt-2 text-xs opacity-80">{auditNotes.join(' · ')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span>{copy.output.title}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {cleaned.text
                    ? copy.counts(
                        fmt(Array.from(cleaned.text).length),
                        fmt((cleaned.text.match(/\S+/g) || []).length),
                      )
                    : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={cleaned.text}
                readOnly
                placeholder={copy.output.placeholder}
                aria-label={copy.output.aria}
                spellCheck={false}
                className="min-h-[260px] font-mono text-sm leading-6"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={copyCleanText} disabled={!cleaned.text}>
                  {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                  {copied ? copy.output.copied : copy.output.copy}
                </Button>
                <Button type="button" variant="outline" onClick={downloadCleanText} disabled={!cleaned.text}>
                  <Download className="mr-1.5 h-4 w-4" />
                  {copy.output.download}
                </Button>
              </div>
              {copyFailed && (
                <p className="text-xs text-destructive" role="status">
                  {copy.output.copyFailed}
                </p>
              )}
              {cleanSummary && (
                <p className="text-sm text-muted-foreground" role="status">
                  {cleanSummary}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 space-y-12 text-foreground">
          <section id="how-to">
            <h2 className="mb-3 text-center text-2xl font-bold">{copy.howTo.title}</h2>
            <p className="mx-auto mb-6 max-w-3xl text-center text-sm leading-6 text-muted-foreground">
              {copy.howTo.intro}
            </p>
            <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {copy.howTo.steps.map((step, index) => (
                <li key={step.title}>
                  <Card className="h-full">
                    <CardContent className="p-5">
                      <p className="mb-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                        {index + 1}
                      </p>
                      <h3 className="mb-1.5 font-semibold">{step.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </section>

          <section id="why" className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold">{copy.article.title}</h2>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              {copy.article.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section id="characters">
            <h2 className="mb-3 text-2xl font-bold">{copy.table.title}</h2>
            <p className="mb-4 max-w-3xl text-sm leading-6 text-muted-foreground">{copy.table.intro}</p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <caption className="sr-only">{copy.table.caption}</caption>
                <thead className="bg-muted/60 text-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      {copy.table.columns.code}
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      {copy.table.columns.name}
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      {copy.table.columns.action}
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      {copy.table.columns.toggle}
                    </th>
                    <th scope="col" className="px-3 py-2 font-semibold">
                      {copy.table.columns.why}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RULES.map((rule) => {
                    const toggle = ruleToggle(rule)
                    const action =
                      rule.action === 'map'
                        ? rule.to === '"'
                          ? copy.actionLabel.straightDouble
                          : rule.to === "'"
                            ? copy.actionLabel.straightSingle
                            : rule.to === '-'
                              ? copy.actionLabel.hyphen
                              : copy.actionLabel.dots
                        : rule.action === 'strip'
                          ? copy.actionLabel.strip
                          : rule.action === 'space'
                            ? copy.actionLabel.space
                            : copy.actionLabel.newline
                    return (
                      <tr key={rule.id} className="border-t align-top">
                        <td className="px-3 py-2 font-mono text-xs">
                          <code>{codePointLabel(rule.items)}</code>
                        </td>
                        <td className="px-3 py-2 font-medium">{copy.rules[rule.id].name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{action}</td>
                        <td className="px-3 py-2 text-muted-foreground">{copy.table.toggleLabel[toggle]}</td>
                        <td className="px-3 py-2 text-muted-foreground">{copy.rules[rule.id].note}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {copy.table.footnotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">{copy.sections.features}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {copy.features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index] ?? ShieldCheck
                return (
                  <Card key={feature.title}>
                    <CardContent className="p-5 text-center">
                      <Icon className="mx-auto mb-3 h-8 w-8 text-cyan-700 dark:text-cyan-300" />
                      <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">{copy.sections.scenarios}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {copy.scenarios.map((scenario, index) => {
                const Icon = SCENARIO_ICONS[index] ?? FileText
                return (
                  <Card key={scenario.title}>
                    <CardContent className="flex items-start gap-4 p-5">
                      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-cyan-700 dark:text-cyan-300" />
                      <div>
                        <h3 className="mb-1 font-semibold">{scenario.title}</h3>
                        <p className="text-sm leading-6 text-muted-foreground">{scenario.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section id="faq">
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

          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">{copy.sections.related}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {copy.related.map((tool) => (
                <Link key={tool.href} href={tool.href} className="block h-full">
                  <Card className="h-full transition-colors hover:border-cyan-600/50">
                    <CardContent className="p-5">
                      <h3 className="mb-1.5 font-semibold">{tool.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{tool.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
