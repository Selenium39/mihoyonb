'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { trackToolExport, trackToolUse } from '@/lib/analytics'
import {
  Bot,
  Check,
  Copy,
  Cpu,
  EyeOff,
  FileCheck,
  RotateCcw,
  ScanSearch,
  Send,
  ShieldAlert,
  ShieldCheck,
  Table2,
  Trash2,
  Undo2,
  Users,
} from 'lucide-react'
import { loadDefaultModel, redact, restore, MAX_INPUT } from 'edge-redact'
import type { Locale } from '@/lib/i18n'
import { getTextRedactorCopy } from './copy'

/**
 * 模型文件随静态导出放在 public/models/ 下，运行时显式 fetch 加载。
 * 不依赖打包器对包内资产的 new URL 处理（静态导出下行为不可靠）。
 */
const MODEL_URL = '/models/zh-en-ds48-int4.erdm'

/**
 * 从库函数签名推导类型，避免与 d.ts 的具名导出耦合：
 * RedactModel = loadDefaultModel 的返回值；RedactResult = redact 的返回值。
 */
type RedactModel = Awaited<ReturnType<typeof loadDefaultModel>>
type RedactResult = Awaited<ReturnType<typeof redact>>
type RedactEntity = RedactResult['entities'][number]

/** 风险等级徽章配色（high / medium / low） */
const RISK_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-200',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-200',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
}

/** 与 copy.ts 的 features / scenarios 顺序一一对应 */
const FEATURE_ICONS = [ShieldCheck, Cpu, Table2, Undo2]
const SCENARIO_ICONS = [Bot, Users, Send, FileCheck]

/** 三个复制按钮的标识，用于「已复制 / 复制失败」反馈定位 */
type CopyTarget = 'redacted' | 'mapping' | 'restored'

/**
 * 模型懒加载缓存（模块级 Promise）：首次点击「脱敏」才下载约 1.4 MB 的 .erdm，
 * 成功后整页会话内复用；加载失败不缓存失败态，再次点击即可重试。
 * 失败必须显式报错——绝不静默降级成纯规则检测（诚实原则）。
 */
let modelPromise: Promise<RedactModel> | null = null

function loadModelOnce(): Promise<RedactModel> {
  if (!modelPromise) {
    modelPromise = loadDefaultModel(MODEL_URL).catch((error: unknown) => {
      modelPromise = null // 失败不缓存，允许用户重试
      throw error
    })
  }
  return modelPromise
}

/** 拼接错误详情（本地化冒号由调用方的 copy 函数负责，这里只取 message） */
function errorDetail(error: unknown): string {
  if (error instanceof Error && error.message) {
    return ` ${error.message}`
  }
  return ''
}

export interface TextRedactorToolProps {
  locale: Locale
}

export default function TextRedactorTool({ locale }: TextRedactorToolProps) {
  const copy = getTextRedactorCopy(locale)

  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)
  const [redactError, setRedactError] = useState<string | null>(null)
  /** entities 的偏移量基于原始文本，快照 source 一起存，避免输入变化后错位 */
  const [result, setResult] = useState<{ source: string; output: RedactResult } | null>(null)
  const [restoreInput, setRestoreInput] = useState('')
  const [restoreBusy, setRestoreBusy] = useState(false)
  const [restoredText, setRestoredText] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null)
  const [failedTarget, setFailedTarget] = useState<CopyTarget | null>(null)

  const overLimit = text.length > MAX_INPUT

  /**
   * 实体 ↔ 占位符对应：Entity 本身不带 placeholder 字段，需由 redact() 输出的
   * mapping（形如 { '[PERSON_1]': '王建国' }，占位符 → 原值）反查推导：
   * 同值同占位符——原值与 mapping 值相等即视为该实体的占位符，以 redact
   * 输出的 mapping 为准，实体列表按出现顺序展示。
   */
  const entityRows = useMemo(() => {
    if (!result) return []
    const entries = Object.entries(result.output.mapping)
    return result.output.entities.map((entity: RedactEntity) => {
      const original = result.source.slice(entity.start, entity.end)
      let placeholder: string | null = null
      for (const [key, value] of entries) {
        if (value === original) {
          placeholder = key
          break
        }
      }
      return { entity, original, placeholder }
    })
  }, [result])

  const mappingRows = useMemo(
    () => (result ? Object.entries(result.output.mapping) : []),
    [result],
  )

  /** 映射表 JSON：占位符 → 原值，供用户存档复用（不用 Object.fromEntries，兼容 ES5 lib） */
  const mappingJson = useMemo(() => {
    if (mappingRows.length === 0) return ''
    const object: Record<string, string> = {}
    for (const [placeholder, original] of mappingRows) {
      object[placeholder] = original
    }
    return JSON.stringify(object, null, 2)
  }, [mappingRows])

  const typeLabel = (type: string) => copy.entities.types[type] ?? type
  const riskLabel = (risk: string) => copy.entities.riskLabel[risk] ?? risk
  const sourceLabel = (source: string) => copy.entities.sourceLabel[source] ?? source

  function handleTextChange(value: string) {
    setText(value)
    // 文本变化后旧结果（含偏移量与映射表）失效
    setResult(null)
    setRedactError(null)
    setRestoredText(null)
  }

  function loadSample(which: 'zh' | 'en') {
    handleTextChange(copy.samples[which])
    trackToolUse('text_redactor', `sample_${which}`)
  }

  async function handleRedact() {
    if (!text.trim() || busy || overLimit) return
    setBusy(true)
    setModelError(null)
    setRedactError(null)
    setModelLoading(!modelReady)
    let model: RedactModel
    try {
      model = await loadModelOnce()
      setModelReady(true)
    } catch (error) {
      // 加载失败显式报错，绝不降级为纯规则检测
      setModelError(copy.model.loadError(errorDetail(error)))
      setModelLoading(false)
      setBusy(false)
      return
    }
    setModelLoading(false)
    try {
      const output = await redact(text, { model })
      setResult({ source: text, output })
      setRestoredText(null)
      setRestoreError(null)
      trackToolUse('text_redactor', 'redact', { entities: output.entities.length })
    } catch (error) {
      // 库 fail closed：出错时不展示原文，明确报错
      setResult(null)
      setRedactError(copy.results.errorTitle(errorDetail(error)))
    } finally {
      setBusy(false)
    }
  }

  function handleRestore() {
    if (!result || !restoreInput.trim() || restoreBusy) return
    setRestoreBusy(true)
    setRestoreError(null)
    try {
      const restored = restore(restoreInput, result.output.mapping)
      setRestoredText(restored)
      trackToolUse('text_redactor', 'restore')
    } catch (error) {
      setRestoredText(null)
      setRestoreError(copy.restore.errorTitle(errorDetail(error)))
    } finally {
      setRestoreBusy(false)
    }
  }

  async function copyValue(target: CopyTarget, value: string) {
    let ok = false
    try {
      await navigator.clipboard.writeText(value)
      ok = true
    } catch {
      // 降级方案：临时 textarea + execCommand（照站内既有复制交互）
      try {
        const area = document.createElement('textarea')
        area.value = value
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
      setCopiedTarget(target)
      setFailedTarget(null)
      trackToolExport('text_redactor', `copy_${target}`)
      window.setTimeout(() => setCopiedTarget(null), 1500)
    } else {
      setFailedTarget(target)
      window.setTimeout(() => setFailedTarget(null), 3000)
    }
  }

  const copyButton = (target: CopyTarget, label: string, copiedLabel: string, value: string, disabled?: boolean) => (
    <Button
      size="sm"
      variant={target === 'redacted' ? 'default' : 'outline'}
      onClick={() => copyValue(target, value)}
      disabled={disabled}
      className="flex items-center gap-1.5"
    >
      {copiedTarget === target ? (
        <>
          <Check className="h-4 w-4" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  )

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">

        {/* 页头 */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
            <EyeOff className="h-8 w-8 text-fuchsia-600" />
            {copy.hero.title}
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {copy.hero.intro}
          </p>
        </div>

        {/* 诚实提示（显著位置） */}
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{copy.honestNotice}</p>
        </div>

        {/* 主工作区：左列输入+结果，右列实体+映射表，还原区回到左列下方 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 输入 + 结果 */}
          <div className="col-span-1 lg:col-span-8 space-y-4 order-1">
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
                {overLimit && (
                  <p className="text-xs text-destructive" role="alert">
                    {copy.input.overLimit(MAX_INPUT)}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleRedact}
                    disabled={!text.trim() || busy || overLimit}
                    className="flex items-center gap-1.5"
                  >
                    <ScanSearch className="h-4 w-4" />
                    {busy ? copy.actions.redacting : copy.actions.redact}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadSample('zh')}
                    className="text-muted-foreground"
                  >
                    {copy.actions.sampleZh}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadSample('en')}
                    className="text-muted-foreground"
                  >
                    {copy.actions.sampleEn}
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
                {modelLoading && (
                  <p className="text-xs text-muted-foreground" role="status">
                    {copy.model.loading}
                  </p>
                )}
                {modelError && (
                  <p className="text-xs text-destructive" role="alert">
                    {modelError}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base md:text-lg">
                  <span className="flex items-center gap-2">
                    <EyeOff className="h-5 w-5" />
                    {copy.results.cardTitle}
                  </span>
                  {result && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {copy.results.summary(result.output.entities.length)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {redactError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {redactError}
                  </p>
                ) : !result ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {copy.results.idle}
                  </p>
                ) : (
                  <>
                    <div className="max-h-[420px] overflow-y-auto rounded-md border bg-muted/20 p-4 text-sm leading-7">
                      <div className="whitespace-pre-wrap break-words">{result.output.text}</div>
                    </div>
                    {copyButton('redacted', copy.results.copy, copy.results.copied, result.output.text)}
                    {failedTarget === 'redacted' && (
                      <p className="text-xs text-destructive" role="status">
                        {copy.copyFailed}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 实体列表 + 映射表 */}
          <div className="col-span-1 lg:col-span-4 space-y-4 order-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base md:text-lg">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    {copy.entities.cardTitle}
                  </span>
                  {result && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {copy.entities.count(entityRows.length)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <p className="text-sm text-muted-foreground">{copy.entities.idle}</p>
                ) : entityRows.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-green-600 dark:text-green-400">
                    <ShieldCheck className="h-10 w-10" />
                    <p className="text-sm font-medium">{copy.entities.empty}</p>
                    <p className="text-xs text-muted-foreground">{copy.entities.emptyHint}</p>
                  </div>
                ) : (
                  <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                    {entityRows.map((row, index) => (
                      <li
                        key={`${row.entity.start}-${row.entity.end}-${index}`}
                        className="rounded-md border px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="break-all font-mono text-sm">{row.original}</span>
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${RISK_BADGE[row.entity.risk] ?? RISK_BADGE.low}`}
                          >
                            {riskLabel(row.entity.risk)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                            {typeLabel(row.entity.type)}
                          </span>
                          <span className="font-mono">
                            {row.placeholder ?? copy.entities.noPlaceholder}
                          </span>
                          <span>{sourceLabel(row.entity.source)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Table2 className="h-5 w-5" />
                  {copy.mapping.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!result || mappingRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{copy.mapping.idle}</p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">{copy.mapping.intro}</p>
                    <div className="max-h-[360px] overflow-y-auto rounded-md border">
                      <table className="w-full text-left text-sm">
                        <caption className="sr-only">{copy.mapping.cardTitle}</caption>
                        <thead className="sticky top-0 bg-muted/60 text-foreground">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-xs font-semibold">
                              {copy.mapping.columns.placeholder}
                            </th>
                            <th scope="col" className="px-3 py-2 text-xs font-semibold">
                              {copy.mapping.columns.original}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {mappingRows.map(([placeholder, original]) => (
                            <tr key={placeholder} className="border-t">
                              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                                {placeholder}
                              </td>
                              <td className="break-all px-3 py-2 font-mono text-xs">{original}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {copyButton('mapping', copy.mapping.copy, copy.mapping.copied, mappingJson)}
                    {failedTarget === 'mapping' && (
                      <p className="text-xs text-destructive" role="status">
                        {copy.copyFailed}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 还原区（lg 下回到左列下方） */}
          <div className="col-span-1 lg:col-span-8 lg:col-start-1 space-y-4 order-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <RotateCcw className="h-5 w-5" />
                  {copy.restore.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{copy.restore.intro}</p>
                <Textarea
                  value={restoreInput}
                  onChange={(e) => {
                    setRestoreInput(e.target.value)
                    setRestoreError(null)
                  }}
                  placeholder={copy.restore.placeholder}
                  aria-label={copy.restore.ariaLabel}
                  className="min-h-[140px] leading-6"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleRestore}
                    disabled={!result || !restoreInput.trim() || restoreBusy}
                    className="flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {restoreBusy ? copy.restore.busy : copy.restore.button}
                  </Button>
                  {!result && (
                    <p className="text-xs text-muted-foreground" role="status">
                      {copy.restore.needRedact}
                    </p>
                  )}
                </div>
                {restoreError && (
                  <p className="text-xs text-destructive" role="alert">
                    {restoreError}
                  </p>
                )}
                {restoredText !== null && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {copy.restore.outputLabel}
                    </p>
                    <div className="max-h-[300px] overflow-y-auto rounded-md border bg-muted/20 p-4 text-sm leading-7">
                      <div className="whitespace-pre-wrap break-words">{restoredText}</div>
                    </div>
                    {copyButton('restored', copy.restore.copy, copy.restore.copied, restoredText)}
                    {failedTarget === 'restored' && (
                      <p className="text-xs text-destructive" role="status">
                        {copy.copyFailed}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 署名区 */}
        <section className="mt-8 rounded-lg border bg-muted/20 px-4 py-4 text-xs leading-6 text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">{copy.attribution.title}</p>
          <p>
            {copy.attribution.poweredByPrefix}
            <a
              href={copy.attribution.edgeRedactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              {copy.attribution.edgeRedactLabel}
            </a>
            {copy.attribution.poweredBySuffix}
          </p>
          <p>{copy.attribution.trainingData}</p>
        </section>

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
