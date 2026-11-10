'use client'

/**
 * 印章生成器主组件（/stamp-maker 与 /zh/stamp-maker 共用）。
 *
 * - 渲染核心在 src/lib/stamp-maker.ts（纯函数），导出在 src/lib/stamp-export.ts；
 * - 预览通过 dangerouslySetInnerHTML 注入同一渲染管线的 SVG，所见即所得；
 * - 撤销/重做：滑杆等高频输入 live 更新（debounce 合并为一步历史），
 *   按钮/下拉等离散输入立即入历史；
 * - 自动保存到 localStorage，挂载时恢复。
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Circle as CircleIcon,
  RectangleHorizontal,
  Square,
  Download,
  FileText,
  FileImage,
  FileArchive,
  Redo2,
  Undo2,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'
import {
  STAMP_FONTS,
  STAMP_TEMPLATES,
  cloneState,
  defaultStampState,
  renderStampSVG,
  type ArcText,
  type BorderStyle,
  type StampShape,
  type StampState,
} from '@/lib/stamp-maker'
import { stampFontCssUrl } from '@/lib/stamp-fonts'
import { exportJPG, exportPDF, exportPNG, exportSVG, exportZIP } from '@/lib/stamp-export'
import { trackToolExport } from '@/lib/analytics'
import { type Locale } from '@/lib/i18n'
import { getStampMakerCopy } from './copy'

const STORAGE_KEY = 'mihoyonb:stamp-maker:v1'

/** 中央文字快捷插入符号 */
const SYMBOLS = ['★', '☆', '✓', '※', '§', '№', '†', '©', '℗']

/** 墨水预设色 */
const INK_PRESETS = [
  '#c8102e', // 印章红
  '#9d0f1c', // 深红
  '#0b4f9e', // 蓝
  '#1a3a6b', // 深蓝
  '#1a7f37', // 绿
  '#6b21a8', // 紫
  '#1f1f1f', // 黑
]

const HISTORY_LIMIT = 50
const LIVE_COMMIT_MS = 700

export interface StampMakerToolProps {
  locale: Locale
}

export default function StampMakerTool({ locale }: StampMakerToolProps) {
  const copy = getStampMakerCopy(locale)
  const isZh = locale === 'zh'

  const [state, setState] = useState<StampState>(defaultStampState)
  const [hist, setHist] = useState<{ past: StampState[]; future: StampState[] }>({ past: [], future: [] })
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stateRef = useRef(state)
  stateRef.current = state
  /** live 更新（滑杆拖动）的基线：开始拖动前的状态，debounce 后并入历史 */
  const pendingBase = useRef<StampState | null>(null)
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 预览字体：注入全量 css2 <link>（一次）
  useEffect(() => {
    const id = 'stamp-maker-fonts'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = stampFontCssUrl()
    document.head.appendChild(link)
  }, [])

  // 恢复自动保存
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as StampState
        setState({ ...defaultStampState(), ...saved })
      }
    } catch {
      // 忽略损坏的存档
    }
  }, [])

  // 自动保存（debounce）
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // 隐私模式等存储失败可忽略
      }
    }, 400)
    return () => clearTimeout(t)
  }, [state])

  const pushHistory = (base: StampState) =>
    setHist((h) => ({ past: [...h.past.slice(-(HISTORY_LIMIT - 1)), base], future: [] }))

  /**
   * 状态更新入口。
   * @param live 高频输入（滑杆/输入框）传 true：立即生效、基线 debounce 合并为一步历史
   */
  const update = (mutate: (draft: StampState) => void, live = false) => {
    const prev = stateRef.current
    const next = cloneState(prev)
    mutate(next)
    if (!live) {
      pendingBase.current = null
      if (commitTimer.current) clearTimeout(commitTimer.current)
      pushHistory(prev)
    } else {
      if (!pendingBase.current) pendingBase.current = prev
      if (commitTimer.current) clearTimeout(commitTimer.current)
      commitTimer.current = setTimeout(() => {
        if (pendingBase.current) {
          pushHistory(pendingBase.current)
          pendingBase.current = null
        }
      }, LIVE_COMMIT_MS)
    }
    stateRef.current = next
    setState(next)
  }

  const commitLiveNow = () => {
    if (commitTimer.current) clearTimeout(commitTimer.current)
    if (pendingBase.current) {
      pushHistory(pendingBase.current)
      pendingBase.current = null
    }
  }

  const undo = () => {
    commitLiveNow()
    if (hist.past.length === 0) return
    const prev = hist.past[hist.past.length - 1]
    setHist({ past: hist.past.slice(0, -1), future: [state, ...hist.future].slice(0, HISTORY_LIMIT) })
    stateRef.current = prev
    setState(prev)
  }

  const redo = () => {
    if (hist.future.length === 0) return
    const next = hist.future[0]
    setHist({ past: [...hist.past, state].slice(-HISTORY_LIMIT), future: hist.future.slice(1) })
    stateRef.current = next
    setState(next)
  }

  const reset = () => {
    if (commitTimer.current) clearTimeout(commitTimer.current)
    pendingBase.current = null
    const fresh = defaultStampState()
    pushHistory(stateRef.current)
    stateRef.current = fresh
    setState(fresh)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 忽略
    }
  }

  const applyTemplate = (tplState: StampState) => {
    update((draft) => {
      Object.assign(draft, cloneState(tplState))
    })
  }

  const setShape = (shape: StampShape) => {
    update((draft) => {
      draft.shape = shape
      if (shape === 'circle') draft.sizeMm.height = draft.sizeMm.width
    })
  }

  // 键盘快捷键：Ctrl/Cmd+Z 撤销、Shift+Z / Y 重做
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hist, state])

  const svgMarkup = useMemo(() => renderStampSVG(state, { uid: 'stamp-preview' }), [state])

  const runExport = async (kind: string, fn: () => Promise<void>) => {
    setBusy(kind)
    setError(null)
    try {
      await fn()
      trackToolExport('stamp_maker', kind)
    } catch {
      setError(copy.errors.exportFailed)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      {/* Hero */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{copy.hero.title}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{copy.hero.intro}</p>
        </div>
        <LanguageSwitcher variant="inline" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* 预览 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{copy.preview.cardTitle}</CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={undo} disabled={hist.past.length === 0} title="Ctrl+Z">
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={redo} disabled={hist.future.length === 0} title="Ctrl+Shift+Z">
                  <Redo2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={reset} title={copy.preview.reset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center justify-center rounded-lg border p-6"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}
              >
                <div
                  className="w-full max-w-[420px] [&>svg]:h-auto [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {copy.preview.sizeLabel}: {state.sizeMm.width} × {state.sizeMm.height} mm · {copy.preview.hint}
              </p>
            </CardContent>
          </Card>

          {/* 导出 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.exportSection.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{copy.exportSection.intro}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => runExport('png_1x', () => exportPNG(state, 1))}
                >
                  <FileImage className="w-4 h-4 mr-1" /> {copy.exportSection.png1x}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => runExport('png_3x', () => exportPNG(state, 3))}
                >
                  <FileImage className="w-4 h-4 mr-1" /> {copy.exportSection.png3x}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => runExport('png_10x', () => exportPNG(state, 10))}
                >
                  <FileImage className="w-4 h-4 mr-1" /> {copy.exportSection.png10x}
                </Button>
                <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => runExport('jpg', () => exportJPG(state))}>
                  <FileImage className="w-4 h-4 mr-1" /> {copy.exportSection.jpg}
                </Button>
                <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => runExport('svg', () => exportSVG(state))}>
                  <FileText className="w-4 h-4 mr-1" /> {copy.exportSection.svg}
                </Button>
                <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => runExport('pdf', () => exportPDF(state))}>
                  <FileText className="w-4 h-4 mr-1" /> {copy.exportSection.pdf}
                </Button>
                <Button disabled={busy !== null} onClick={() => runExport('zip', () => exportZIP(state))}>
                  <FileArchive className="w-4 h-4 mr-1" />
                  {busy === 'zip' ? copy.exportSection.busy : copy.exportSection.zip}
                </Button>
              </div>
              {busy !== null && busy !== 'zip' && (
                <p className="text-xs text-muted-foreground">{copy.exportSection.busy}</p>
              )}
              {error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.templates.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {STAMP_TEMPLATES.map((tpl) => (
                <Button key={tpl.id} variant="outline" size="sm" onClick={() => applyTemplate(tpl.state)}>
                  {isZh ? tpl.nameZh : tpl.nameEn}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.shape.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['circle', CircleIcon, copy.shape.circle],
                    ['ellipse', RectangleHorizontal, copy.shape.ellipse],
                    ['rect', Square, copy.shape.rect],
                  ] as const
                ).map(([shape, Icon, label]) => (
                  <Button
                    key={shape}
                    variant={state.shape === shape ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShape(shape)}
                  >
                    <Icon className="w-4 h-4 mr-1" /> {label}
                  </Button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label>{copy.shape.borderStyle}</Label>
                <Select
                  value={state.border.style}
                  onValueChange={(v) => update((d) => (d.border.style = v as BorderStyle))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(copy.shape.styles) as BorderStyle[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {copy.shape.styles[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{copy.shape.borderWidth}</Label>
                  <span className="text-xs text-muted-foreground">{state.border.width}</span>
                </div>
                <Slider
                  min={1}
                  max={12}
                  step={0.5}
                  value={[state.border.width]}
                  onValueChange={([v]) => update((d) => (d.border.width = v), true)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.textSections.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ArcPanel
                label={copy.textSections.top}
                placeholder={copy.textSections.topPlaceholder}
                state={state}
                zone="top"
                copy={copy}
                update={update}
                onCommit={commitLiveNow}
              />
              <ArcPanel
                label={copy.textSections.bottom}
                placeholder={copy.textSections.bottomPlaceholder}
                state={state}
                zone="bottom"
                copy={copy}
                update={update}
                onCommit={commitLiveNow}
              />

              {/* 中央文字 */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>{copy.textSections.center}</Label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={state.center.enabled}
                      onChange={(e) => update((d) => (d.center.enabled = e.target.checked))}
                    />
                    {copy.textSections.enabled}
                  </label>
                </div>
                <Textarea
                  rows={3}
                  value={state.center.lines}
                  placeholder={copy.textSections.centerPlaceholder}
                  onChange={(e) => update((d) => (d.center.lines = e.target.value), true)}
                  onBlur={commitLiveNow}
                />
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-1">{copy.textSections.symbols}:</span>
                  {SYMBOLS.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      className="rounded border px-1.5 py-0.5 text-sm hover:bg-accent"
                      onClick={() => update((d) => (d.center.lines = d.center.lines + sym))}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
                <FontSelect
                  value={state.center.fontId}
                  onChange={(v) => update((d) => (d.center.fontId = v))}
                  copy={copy}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">{copy.textSections.fontSize}</Label>
                      <span className="text-xs text-muted-foreground">{state.center.size}</span>
                    </div>
                    <Slider
                      min={12}
                      max={110}
                      step={1}
                      value={[state.center.size]}
                      onValueChange={([v]) => update((d) => (d.center.size = v), true)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">{copy.textSections.lineHeight}</Label>
                      <span className="text-xs text-muted-foreground">{state.center.lineHeight.toFixed(2)}</span>
                    </div>
                    <Slider
                      min={0.9}
                      max={2}
                      step={0.05}
                      value={[state.center.lineHeight]}
                      onValueChange={([v]) => update((d) => (d.center.lineHeight = v), true)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.appearance.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{copy.appearance.color}</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {INK_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={c}
                      className={`h-7 w-7 rounded-full border-2 ${
                        state.color === c ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => update((d) => (d.color = c))}
                    />
                  ))}
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="color"
                      value={state.color}
                      className="h-7 w-10 cursor-pointer rounded border bg-transparent"
                      onChange={(e) => update((d) => (d.color = e.target.value), true)}
                      onBlur={commitLiveNow}
                    />
                    {copy.appearance.customColor}
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{copy.appearance.opacity}</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(state.opacity * 100)}%</span>
                </div>
                <Slider
                  min={0.2}
                  max={1}
                  step={0.01}
                  value={[state.opacity]}
                  onValueChange={([v]) => update((d) => (d.opacity = v), true)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{copy.appearance.aging}</Label>
                  <span className="text-xs text-muted-foreground">{state.aging}</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[state.aging]}
                  onValueChange={([v]) => update((d) => (d.aging = v), true)}
                />
                <p className="text-xs text-muted-foreground">{copy.appearance.agingHint}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.sizeSection.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{copy.sizeSection.width}</Label>
                  <Input
                    type="number"
                    min={10}
                    max={200}
                    value={state.sizeMm.width}
                    onChange={(e) => {
                      const w = Number(e.target.value) || state.sizeMm.width
                      update((d) => {
                        d.sizeMm.width = w
                        if (d.shape === 'circle') d.sizeMm.height = w
                      }, true)
                    }}
                    onBlur={commitLiveNow}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{copy.sizeSection.height}</Label>
                  <Input
                    type="number"
                    min={10}
                    max={200}
                    value={state.sizeMm.height}
                    disabled={state.shape === 'circle'}
                    onChange={(e) => update((d) => (d.sizeMm.height = Number(e.target.value) || d.sizeMm.height), true)}
                    onBlur={commitLiveNow}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{copy.sizeSection.hint}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEO 内容区：特性 */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{copy.features.heading}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {copy.features.items.map((f) => (
            <div key={f.title} className="rounded-lg border p-4">
              <h3 className="font-medium mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO 内容区：FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">{copy.faqs.heading}</h2>
        <div className="space-y-2">
          {copy.faqs.items.map((faq) => (
            <details key={faq.question} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">{faq.question}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Download className="w-3.5 h-3.5" />
        {copy.preview.hint}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 子面板
// ---------------------------------------------------------------------------

function FontSelect({ value, onChange, copy }: { value: string; onChange: (v: string) => void; copy: ReturnType<typeof getStampMakerCopy> }) {
  const western = STAMP_FONTS.filter((f) => !f.cjk)
  const cjk = STAMP_FONTS.filter((f) => f.cjk)
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{copy.textSections.font}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Latin</SelectLabel>
            {western.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>中文</SelectLabel>
            {cjk.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

interface PanelProps {
  label: string
  placeholder: string
  state: StampState
  zone: 'top' | 'bottom'
  copy: ReturnType<typeof getStampMakerCopy>
  update: (mutate: (draft: StampState) => void, live?: boolean) => void
  /** 输入框失焦时把 live 编辑基线并入历史 */
  onCommit: () => void
}

/** 顶部 / 底部弧形文字面板 */
function ArcPanel({ label, placeholder, state, zone, copy, update, onCommit }: PanelProps) {
  const t: ArcText = state[zone]
  const setT = (mutate: (draft: ArcText) => void, live = true) =>
    update((d) => mutate(d[zone]), live)
  return (
    <div className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={t.enabled}
            onChange={(e) => setT((draft) => (draft.enabled = e.target.checked), false)}
          />
          {copy.textSections.enabled}
        </label>
      </div>
      <Input
        value={t.text}
        placeholder={placeholder}
        onChange={(e) => setT((draft) => (draft.text = e.target.value))}
        onBlur={onCommit}
      />
      <div className="flex flex-wrap gap-1">
        {SYMBOLS.slice(0, 5).map((sym) => (
          <button
            key={sym}
            type="button"
            className="rounded border px-1.5 py-0.5 text-sm hover:bg-accent"
            onClick={() => setT((draft) => (draft.text = draft.text + sym), false)}
          >
            {sym}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <FontSelect
          value={t.fontId}
          onChange={(v) => setT((draft) => (draft.fontId = v), false)}
          copy={copy}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{copy.textSections.fontSize}</Label>
            <span className="text-xs text-muted-foreground">{t.size}</span>
          </div>
          <Slider
            min={12}
            max={60}
            step={1}
            value={[t.size]}
            onValueChange={([v]) => setT((draft) => (draft.size = v))}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">{copy.textSections.letterSpacing}</Label>
            <span className="text-xs text-muted-foreground">{t.letterSpacing.toFixed(2)}</span>
          </div>
          <Slider
            min={-0.05}
            max={0.6}
            step={0.01}
            value={[t.letterSpacing]}
            onValueChange={([v]) => setT((draft) => (draft.letterSpacing = v))}
          />
        </div>
      </div>
    </div>
  )
}
