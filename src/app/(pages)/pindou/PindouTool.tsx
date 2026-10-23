'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { trackToolExport, trackToolUse } from '@/lib/analytics'
import {
  PALETTE,
  PALETTE_NAME,
  PALETTE_NAME_EN,
  PALETTE_NOTE,
  PALETTE_NOTE_EN,
} from '@/lib/bead-palette'
import {
  DEFAULT_COLS,
  MAX_COLS,
  MAX_ROWS,
  MIN_COLS,
  MIN_ROWS,
  computeGridSize,
  generateBeadPattern,
  patternToCsv,
  patternToText,
  renderBeadPattern,
  type BeadPattern,
} from '@/lib/bead-pattern'
import { alternateLocalePath, type Locale } from '@/lib/i18n'
import { affiliateConfig, amazonSearchUrl, isAffiliateEnabled } from '@/config/affiliate'
import { getPindouCopy } from './copy'
import {
  Crop,
  Download,
  Eraser,
  ExternalLink,
  FileText,
  Grid3X3,
  Hash,
  ImagePlus,
  Languages,
  Loader2,
  Palette,
  Printer,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react'

const ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'
const MAX_FILE_BYTES = 40 * 1024 * 1024
const ZOOM_CELLS = [12, 18, 26, 36]

/** 与 copy.ts 的 features / scenarios 顺序一一对应 */
const FEATURE_ICONS = [ImagePlus, Palette, Hash, ShieldCheck]
const SCENARIO_ICONS = [Sparkles, Grid3X3, Printer, Eraser]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function isSupportedImage(file: File): boolean {
  const type = file.type.toLowerCase()
  if (type === 'image/jpeg' || type === 'image/png' || type === 'image/webp') return true
  return /\.(jpe?g|png|webp)$/i.test(file.name)
}

function previewCssCell(cols: number, rows: number, zoom: number): number {
  const base = ZOOM_CELLS[zoom - 1] ?? 18
  const longest = Math.max(cols, rows, 1)
  return Math.max(6, Math.min(base, Math.floor(2200 / longest)))
}

function exportCellSize(cols: number, rows: number): number {
  const maxGrid = 5600
  return Math.max(16, Math.min(32, Math.floor(maxGrid / cols), Math.floor(maxGrid / rows)))
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

export interface PindouToolProps {
  locale: Locale
}

export default function PindouTool({ locale }: PindouToolProps) {
  const copy = getPindouCopy(locale)
  const paletteName = locale === 'en' ? PALETTE_NAME_EN : PALETTE_NAME
  const paletteNote = locale === 'en' ? PALETTE_NOTE_EN : PALETTE_NOTE
  const currentPath = locale === 'en' ? '/en/pindou' : '/pindou'
  const switchHref = alternateLocalePath(currentPath)

  const [cols, setCols] = useState(DEFAULT_COLS)
  const [square, setSquare] = useState(false)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [backgroundThreshold, setBackgroundThreshold] = useState(18)
  const [limitColors, setLimitColors] = useState(false)
  const [maxColors, setMaxColors] = useState(24)
  const [mergeSimilar, setMergeSimilar] = useState(false)
  const [mergeThreshold, setMergeThreshold] = useState(12)
  const [zoom, setZoom] = useState(2)
  const [showCodes, setShowCodes] = useState(true)
  const [sortBy, setSortBy] = useState<'count' | 'code'>('count')
  const [highlight, setHighlight] = useState<string | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; url: string } | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [decoding, setDecoding] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pattern, setPattern] = useState<BeadPattern | null>(null)
  const [genNonce, setGenNonce] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileUrlRef = useRef<string | null>(null)
  const loadTokenRef = useRef(0)
  const trackNextRef = useRef(false)

  useEffect(() => {
    return () => {
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current)
    }
  }, [])

  const gridPreview = useMemo(() => {
    if (!image) return null
    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height
    if (!width || !height) return null
    return computeGridSize(width, height, cols, square)
  }, [image, cols, square])

  useEffect(() => {
    if (!image) {
      setPattern(null)
      setGenerating(false)
      return
    }
    let cancelled = false
    setGenerating(true)
    const timer = window.setTimeout(() => {
      try {
        const next = generateBeadPattern(image, {
          cols,
          square,
          removeBackground,
          backgroundThreshold,
          maxColors: limitColors ? maxColors : null,
          mergeThreshold: mergeSimilar ? mergeThreshold : null,
          locale,
        })
        if (cancelled) return
        setPattern(next)
        setGenError(null)
        if (trackNextRef.current && next.totalBeads > 0) {
          trackNextRef.current = false
          trackToolUse('pindou', 'generate', {
            cols: next.cols,
            rows: next.rows,
            colors: next.usage.length,
          })
        }
      } catch (error) {
        if (cancelled) return
        setPattern(null)
        setGenError(error instanceof Error ? error.message : copy.errors.generateFailed)
      } finally {
        if (!cancelled) setGenerating(false)
      }
    }, 80)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    image,
    cols,
    square,
    removeBackground,
    backgroundThreshold,
    limitColors,
    maxColors,
    mergeSimilar,
    mergeThreshold,
    genNonce,
    locale,
    copy,
  ])

  useEffect(() => {
    if (!pattern || !highlight) return
    const alive = pattern.usage.some((item) => PALETTE[item.index].code === highlight)
    if (!alive) setHighlight(null)
  }, [pattern, highlight])

  const cssCell = pattern ? previewCssCell(pattern.cols, pattern.rows, zoom) : 18
  const codesFit = cssCell >= 14

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !pattern || pattern.totalBeads === 0) return
    const pixelRatio = Math.min(2, window.devicePixelRatio || 1)
    const cell = Math.round(cssCell * pixelRatio)
    const rendered = renderBeadPattern(pattern, {
      cellSize: cell,
      showCodes: showCodes && codesFit,
      showLegend: false,
      showCoords: true,
      showHeader: false,
      pixelRatio,
      highlightCode: highlight,
      locale,
    })
    canvas.width = rendered.width
    canvas.height = rendered.height
    canvas.style.width = `${Math.round(rendered.width / pixelRatio)}px`
    canvas.style.height = `${Math.round(rendered.height / pixelRatio)}px`
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(rendered, 0, 0)
  }, [pattern, cssCell, showCodes, codesFit, highlight, locale])

  const sortedUsage = useMemo(() => {
    if (!pattern) return []
    const list = pattern.usage.slice()
    if (sortBy === 'code') {
      list.sort((a, b) =>
        PALETTE[a.index].code.localeCompare(PALETTE[b.index].code, 'en', { numeric: true }),
      )
    }
    return list
  }, [pattern, sortBy])

  const handleFile = (file?: File) => {
    if (!file) return
    if (!isSupportedImage(file)) {
      setLoadError(copy.upload.unsupportedType)
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setLoadError(copy.upload.tooLarge)
      return
    }
    setLoadError(null)
    setExportError(null)
    const token = ++loadTokenRef.current
    const url = URL.createObjectURL(file)
    setDecoding(true)
    const img = new Image()
    img.onload = () => {
      if (token !== loadTokenRef.current) {
        URL.revokeObjectURL(url)
        return
      }
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current)
      fileUrlRef.current = url
      setFileMeta({ name: file.name, size: file.size, url })
      setHighlight(null)
      trackNextRef.current = true
      setImage(img)
      setDecoding(false)
    }
    img.onerror = () => {
      if (token !== loadTokenRef.current) return
      URL.revokeObjectURL(url)
      setDecoding(false)
      setLoadError(copy.upload.decodeFailed)
    }
    img.src = url
  }

  const clearFile = () => {
    loadTokenRef.current += 1
    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current)
      fileUrlRef.current = null
    }
    setImage(null)
    setFileMeta(null)
    setPattern(null)
    setHighlight(null)
    setDecoding(false)
    setLoadError(null)
    setGenError(null)
    setExportError(null)
  }

  const regenerate = () => {
    if (!image) return
    trackNextRef.current = true
    setGenNonce((value) => value + 1)
  }

  const toggleHighlight = (code: string) => {
    setHighlight((current) => (current === code ? null : code))
  }

  const canExport = !!pattern && pattern.totalBeads > 0 && !generating

  const handleDownloadPng = () => {
    if (!pattern || pattern.totalBeads === 0) return
    setExportError(null)
    try {
      const rendered = renderBeadPattern(pattern, {
        cellSize: exportCellSize(pattern.cols, pattern.rows),
        showCodes: true,
        showLegend: true,
        showCoords: true,
        showHeader: true,
        pixelRatio: 1,
        highlightCode: null,
        locale,
      })
      rendered.toBlob((blob) => {
        if (!blob) {
          setExportError(copy.exportCard.pngFailedBlob)
          return
        }
        downloadBlob(blob, copy.exportCard.pngFileName(pattern.cols, pattern.rows))
        trackToolExport('pindou', 'png', {
          cols: pattern.cols,
          rows: pattern.rows,
          colors: pattern.usage.length,
        })
      }, 'image/png')
    } catch (error) {
      setExportError(error instanceof Error ? error.message : copy.exportCard.pngFailed)
    }
  }

  const handleDownloadCsv = () => {
    if (!pattern || pattern.totalBeads === 0) return
    downloadBlob(
      new Blob([patternToCsv(pattern, locale)], { type: 'text/csv;charset=utf-8' }),
      copy.exportCard.csvFileName(pattern.cols, pattern.rows),
    )
    trackToolExport('pindou', 'csv', { colors: pattern.usage.length })
  }

  const handleCopyList = async () => {
    if (!pattern || pattern.totalBeads === 0) return
    const ok = await copyText(patternToText(pattern, locale))
    if (!ok) {
      setExportError(copy.exportCard.copyFailed)
      return
    }
    setCopied(true)
    setExportError(null)
    trackToolExport('pindou', 'copy_list', { colors: pattern.usage.length })
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-4 flex justify-end">
          <Link
            href={switchHref}
            hrefLang={locale === 'en' ? 'zh-CN' : 'en'}
            aria-label={copy.languageSwitch.ariaLabel}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Languages size={13} />
            {copy.languageSwitch.label}
          </Link>
        </div>

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{copy.hero.title}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={13} />
              {copy.hero.badge}
            </span>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {copy.hero.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          <div className="col-span-1 lg:col-span-4 order-2 lg:order-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Grid3X3 size={18} />
                  {copy.size.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between" htmlFor="bead-cols">
                    <span>{copy.size.widthLabel}</span>
                    <span className="text-muted-foreground">{cols}</span>
                  </label>
                  <Slider
                    id="bead-cols"
                    value={[cols]}
                    min={MIN_COLS}
                    max={MAX_COLS}
                    step={1}
                    onValueChange={([value]) => setCols(value)}
                  />
                  <Input
                    type="number"
                    min={MIN_COLS}
                    max={MAX_COLS}
                    value={cols}
                    aria-label={copy.size.widthAria}
                    onChange={(event) => {
                      if (event.target.value === '') return
                      const next = Number(event.target.value)
                      if (!Number.isFinite(next)) return
                      setCols(Math.max(MIN_COLS, Math.min(MAX_COLS, Math.round(next))))
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={!square ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setSquare(false)}
                  >
                    {copy.size.originalRatio}
                  </Button>
                  <Button
                    type="button"
                    variant={square ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs flex items-center gap-1"
                    onClick={() => setSquare(true)}
                  >
                    <Crop size={14} />
                    {copy.size.squareCrop}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {gridPreview
                    ? copy.size.heightHint(gridPreview.rows, square)
                    : copy.size.heightHintEmpty}
                </p>
                {gridPreview?.rowsClamped && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    {copy.size.heightClamped(MIN_ROWS, MAX_ROWS)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SlidersHorizontal size={18} />
                  {copy.color.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">{copy.color.removeBackground}</label>
                    <Button
                      type="button"
                      size="sm"
                      variant={removeBackground ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setRemoveBackground((value) => !value)}
                    >
                      {removeBackground ? copy.color.on : copy.color.off}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {copy.color.removeBackgroundHint}
                  </p>
                  {removeBackground && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>{copy.color.backgroundThreshold}</span>
                        <span className="text-muted-foreground">{backgroundThreshold}</span>
                      </label>
                      <Slider
                        value={[backgroundThreshold]}
                        min={8}
                        max={40}
                        step={1}
                        onValueChange={([value]) => setBackgroundThreshold(value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">{copy.color.mergeSimilar}</label>
                    <Button
                      type="button"
                      size="sm"
                      variant={mergeSimilar ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setMergeSimilar((value) => !value)}
                    >
                      {mergeSimilar ? copy.color.on : copy.color.off}
                    </Button>
                  </div>
                  {mergeSimilar && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>{copy.color.mergeThreshold}</span>
                        <span className="text-muted-foreground">{mergeThreshold}</span>
                      </label>
                      <Slider
                        value={[mergeThreshold]}
                        min={6}
                        max={28}
                        step={1}
                        onValueChange={([value]) => setMergeThreshold(value)}
                      />
                      <p className="text-xs text-muted-foreground">{copy.color.mergeHint}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">{copy.color.limitColors}</label>
                    <Button
                      type="button"
                      size="sm"
                      variant={limitColors ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setLimitColors((value) => !value)}
                    >
                      {limitColors ? copy.color.on : copy.color.off}
                    </Button>
                  </div>
                  {limitColors && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>{copy.color.maxColors}</span>
                        <span className="text-muted-foreground">{maxColors}</span>
                      </label>
                      <Slider
                        value={[maxColors]}
                        min={8}
                        max={PALETTE.length}
                        step={1}
                        onValueChange={([value]) => setMaxColors(value)}
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {copy.color.paletteLine(paletteName, PALETTE.length, paletteNote)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  disabled={!image || generating}
                  onClick={regenerate}
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {copy.color.regenerate}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download size={18} />
                  {copy.exportCard.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  className="w-full flex items-center gap-2"
                  disabled={!canExport}
                  onClick={handleDownloadPng}
                >
                  <Download size={16} />
                  {copy.exportCard.downloadPng}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-1.5 text-xs"
                    disabled={!canExport}
                    onClick={handleDownloadCsv}
                  >
                    <FileText size={14} />
                    {copy.exportCard.csvList}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-1.5 text-xs"
                    disabled={!canExport}
                    onClick={() => void handleCopyList()}
                  >
                    <FileText size={14} />
                    {copied ? copy.exportCard.copied : copy.exportCard.copyText}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {copy.exportCard.hint}
                </p>
                {exportError && <p className="text-xs text-destructive">{exportError}</p>}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 lg:col-span-8 order-1 lg:order-2 space-y-4">
            <Card>
              <CardContent className="p-4">
                {!image ? (
                  <div
                    className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    style={{ minHeight: '220px' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        fileInputRef.current?.click()
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(event) => {
                      event.preventDefault()
                      setIsDragOver(false)
                      handleFile(event.dataTransfer.files?.[0])
                    }}
                  >
                    <div className="text-center text-muted-foreground px-4">
                      {decoding ? (
                        <Loader2 size={40} className="mx-auto animate-spin" />
                      ) : (
                        <ImagePlus size={40} className="mx-auto" />
                      )}
                      <p className="mt-3 text-sm">
                        {decoding ? copy.upload.decoding : copy.upload.dropIdle}
                      </p>
                      <p className="text-xs opacity-70 mt-1">{copy.upload.supported}</p>
                      {loadError && <p className="text-sm text-destructive mt-2">{loadError}</p>}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex flex-col sm:flex-row gap-4 rounded-lg ${isDragOver ? 'ring-2 ring-primary' : ''}`}
                    onDragOver={(event) => {
                      event.preventDefault()
                      setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(event) => {
                      event.preventDefault()
                      setIsDragOver(false)
                      handleFile(event.dataTransfer.files?.[0])
                    }}
                  >
                    <div className="sm:w-44 flex-shrink-0 flex items-center justify-center rounded-lg border bg-muted/20 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fileMeta?.url}
                        alt={copy.upload.thumbnailAlt}
                        className="max-h-28 max-w-full object-contain"
                        draggable={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-medium truncate" title={fileMeta?.name}>
                        {fileMeta?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {copy.upload.originalSize(
                          image.naturalWidth,
                          image.naturalHeight,
                          fileMeta ? formatBytes(fileMeta.size) : '',
                          decoding,
                        )}
                      </p>
                      {loadError && <p className="text-xs text-destructive">{loadError}</p>}
                      <div className="flex gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <RefreshCw size={13} />
                          {copy.upload.reselect}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={clearFile}
                        >
                          <X size={13} />
                          {copy.upload.clear}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    handleFile(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Palette size={16} />
                    {copy.preview.cardTitle}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                    {pattern ? copy.preview.gridSize(pattern.cols, pattern.rows) : copy.preview.waiting}
                    {generating && <Loader2 size={14} className="animate-spin" />}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span className="inline-flex items-center gap-1">
                        <ZoomIn size={14} />
                        {copy.preview.zoomLabel}
                      </span>
                      <span className="text-muted-foreground">{zoom}×</span>
                    </label>
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={4}
                      step={1}
                      disabled={!pattern}
                      onValueChange={([value]) => setZoom(value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant={showCodes ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs sm:mb-0.5"
                    disabled={!pattern}
                    onClick={() => setShowCodes((value) => !value)}
                  >
                    {showCodes ? copy.preview.codesShown : copy.preview.codesHidden}
                  </Button>
                </div>

                {!image && (
                  <div className="rounded-lg border border-dashed py-16 px-6 text-center text-sm text-muted-foreground">
                    {copy.preview.empty}
                  </div>
                )}
                {image && !pattern && (
                  <div className="rounded-lg border py-16 flex items-center justify-center text-sm text-muted-foreground">
                    {genError ? <span className="text-destructive">{genError}</span> : <Loader2 className="animate-spin" />}
                  </div>
                )}
                {pattern && pattern.totalBeads === 0 && (
                  <div className="rounded-lg border py-12 px-6 text-center text-sm text-muted-foreground">
                    {copy.preview.noPixels}
                  </div>
                )}
                {pattern && pattern.totalBeads > 0 && (
                  <>
                    <div className="overflow-auto max-h-[70vh] rounded-lg border bg-muted/30">
                      <canvas ref={canvasRef} className="block" aria-label={copy.preview.canvasAria} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {showCodes && !codesFit
                        ? copy.preview.codesHintSmall
                        : copy.preview.codesHintNormal}
                      {highlight ? copy.preview.highlightHint(highlight) : ''}
                    </p>
                  </>
                )}
                {genError && pattern && <p className="text-xs text-destructive">{genError}</p>}
                {pattern?.backgroundReverted && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {copy.preview.backgroundReverted}
                  </p>
                )}
                {pattern && pattern.backgroundRemoved > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {copy.preview.backgroundRemoved(pattern.backgroundRemoved)}
                  </p>
                )}
              </CardContent>
            </Card>

            {pattern && pattern.totalBeads > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-base">
                    <span>{copy.usage.cardTitle}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {copy.usage.summary(pattern.totalBeads, pattern.usage.length)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex h-3 w-full overflow-hidden rounded-full" role="img" aria-label={copy.usage.barAria}>
                    {pattern.usage.map((item) => {
                      const color = PALETTE[item.index]
                      return (
                        <span
                          key={color.code}
                          title={copy.usage.swatchTitle(
                            color.code,
                            locale === 'en' ? color.nameEn : color.name,
                            item.count,
                          )}
                          style={{
                            width: `${(item.count / pattern.totalBeads) * 100}%`,
                            backgroundColor: color.hex,
                          }}
                        />
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={sortBy === 'count' ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setSortBy('count')}
                    >
                      {copy.usage.byCount}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={sortBy === 'code' ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setSortBy('code')}
                    >
                      {copy.usage.byCode}
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto rounded-lg border divide-y">
                    {sortedUsage.map((item) => {
                      const color = PALETTE[item.index]
                      const active = highlight === color.code
                      const pct = ((item.count / pattern.totalBeads) * 100).toFixed(1)
                      return (
                        <button
                          key={color.code}
                          type="button"
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50 ${
                            active ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                          }`}
                          onClick={() => toggleHighlight(color.code)}
                        >
                          <span
                            className="h-5 w-5 rounded border flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-medium w-10">{color.code}</span>
                          <span className="text-muted-foreground w-16 truncate">
                            {locale === 'en' ? color.nameEn : color.name}
                          </span>
                          <span className="text-xs text-muted-foreground hidden sm:inline w-16">
                            {locale === 'en' ? color.familyEn : color.family}
                          </span>
                          <span className="ml-auto tabular-nums">
                            {item.count}
                            <span className="text-xs text-muted-foreground ml-1">{pct}%</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {locale === 'en' && isAffiliateEnabled() && (
          <section className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag size={18} />
                  {copy.affiliate.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {copy.affiliate.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {affiliateConfig.brands.map((brand) => (
                    <Button
                      key={brand.id}
                      asChild
                      variant="outline"
                      className="justify-between gap-2 text-xs"
                    >
                      <a
                        href={amazonSearchUrl(brand.searchQuery)}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                      >
                        {copy.affiliate.brandCta(brand.name)}
                        <ExternalLink size={14} className="flex-shrink-0" />
                      </a>
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{copy.affiliate.disclosure}</p>
              </CardContent>
            </Card>
          </section>
        )}

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              {copy.steps.sectionTitle}
            </h2>
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {copy.steps.items.map((step, index) => (
                <Card key={step}>
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm font-semibold">{copy.steps.heading(index + 1)}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              {copy.features.sectionTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {copy.features.items.map((feature, index) => {
                const Icon = FEATURE_ICONS[index] ?? ImagePlus
                return (
                  <Card key={feature.title}>
                    <CardContent className="p-5 space-y-2">
                      <Icon size={22} className="text-primary" />
                      <h3 className="text-sm font-semibold">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              {copy.scenarios.sectionTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {copy.scenarios.items.map((scenario, index) => {
                const Icon = SCENARIO_ICONS[index] ?? Sparkles
                return (
                  <Card key={scenario.title}>
                    <CardContent className="p-5 space-y-2">
                      <Icon size={22} className="text-primary" />
                      <h3 className="text-sm font-semibold">{scenario.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {scenario.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              {copy.faqs.sectionTitle}
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {copy.faqs.items.map((faq) => (
                <details key={faq.question} className="group rounded-lg border bg-card px-5 py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium gap-4">
                    {faq.question}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
