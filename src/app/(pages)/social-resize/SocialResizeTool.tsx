'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { trackToolExport } from '@/lib/analytics'
import { type Locale } from '@/lib/i18n'
import {
  Crop,
  Expand,
  ImagePlus,
  Download,
  FileArchive,
  ShieldCheck,
  Loader2,
  X,
  RefreshCw,
  Plus,
  Check,
  FileImage,
  Sparkles,
  MessageCircle,
  BookOpen,
  Layers,
} from 'lucide-react'
import {
  getSocialResizeCopy,
  type ExportFormatValue,
  type SizePreset,
} from './copy'

type ExportFormat = ExportFormatValue
type FitMode = 'cover' | 'contain'
type ContainBgMode = 'color' | 'blur'

type SizeOption = SizePreset

/** 与 copy.ts 的 features / scenarios 顺序一一对应 */
const FEATURE_ICONS = [Crop, Expand, FileImage, ShieldCheck]
const SCENARIO_ICONS = [MessageCircle, BookOpen, Sparkles, Layers]

// 自定义宽高上限（Canvas 面积过大时部分设备无法导出）
const MAX_SIZE = 8000

// 预览缩略图的最大边长（像素）
const PREVIEW_MAX = 360

// 获取不带扩展名的文件名
function getFileBaseName(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx > 0 ? name.slice(0, idx) : name
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

// 居中裁切（cover）：计算源图上应裁出的区域 sx/sy/sw/sh，使裁出区域与目标等比
function computeCoverSource(imgW: number, imgH: number, targetW: number, targetH: number) {
  const srcRatio = imgW / imgH
  const dstRatio = targetW / targetH
  if (srcRatio > dstRatio) {
    // 源图更宽：左右各裁一部分
    const sw = imgH * dstRatio
    return { sx: (imgW - sw) / 2, sy: 0, sw, sh: imgH }
  }
  // 源图更高：上下各裁一部分
  const sh = imgW / dstRatio
  return { sx: 0, sy: (imgH - sh) / 2, sw: imgW, sh }
}

// 完整保留（contain）：计算图片在画布上的绘制区域 dx/dy/dw/dh，居中且不变形
function computeContainDest(imgW: number, imgH: number, targetW: number, targetH: number) {
  const srcRatio = imgW / imgH
  const dstRatio = targetW / targetH
  let dw = targetW
  let dh = targetH
  if (srcRatio > dstRatio) {
    dh = targetW / srcRatio
  } else {
    dw = targetH * srcRatio
  }
  return { dx: (targetW - dw) / 2, dy: (targetH - dh) / 2, dw, dh }
}

interface RenderOptions {
  fitMode: FitMode
  containBgMode: ContainBgMode
  bgColor: string
}

interface RenderMessages {
  canvasUnsupported: string
}

// 将图片按目标尺寸与填充模式渲染到离屏画布
function renderToCanvas(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  opts: RenderOptions,
  messages: RenderMessages
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error(messages.canvasUnsupported)

  const imgW = img.naturalWidth || img.width
  const imgH = img.naturalHeight || img.height

  if (opts.fitMode === 'cover') {
    // 居中裁切：从源图裁出等比区域铺满画布
    const { sx, sy, sw, sh } = computeCoverSource(imgW, imgH, targetW, targetH)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH)
    return canvas
  }

  // 完整保留：先铺背景，再居中叠加原图
  if (opts.containBgMode === 'blur') {
    // 模糊放大：底图按 cover 裁切并整体放大 10%，避免 blur 后边缘露出白边
    const { sx, sy, sw, sh } = computeCoverSource(imgW, imgH, targetW, targetH)
    const scale = 1.1
    const dw = targetW * scale
    const dh = targetH * scale
    ctx.save()
    ctx.filter = `blur(${Math.max(4, Math.round(Math.max(targetW, targetH) / 40))}px)`
    ctx.drawImage(img, sx, sy, sw, sh, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh)
    ctx.restore()
  } else {
    ctx.fillStyle = opts.bgColor
    ctx.fillRect(0, 0, targetW, targetH)
  }

  const { dx, dy, dw, dh } = computeContainDest(imgW, imgH, targetW, targetH)
  ctx.drawImage(img, dx, dy, dw, dh)
  return canvas
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality: number,
  renderFailedMessage: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(renderFailedMessage))),
      `image/${format}`,
      format === 'png' ? undefined : quality
    )
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// 导出文件名：原文件名_宽x高.ext（JPEG 扩展名习惯用 .jpg）
function buildFilename(base: string, width: number, height: number, format: ExportFormat): string {
  const ext = format === 'jpeg' ? 'jpg' : format
  return `${base}_${width}x${height}.${ext}`
}

// ZIP 内同名文件自动加 -2、-3 后缀
function dedupeFilename(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name)
    return name
  }
  const dot = name.lastIndexOf('.')
  const stem = name.slice(0, dot)
  const ext = name.slice(dot)
  let i = 2
  let candidate = `${stem}-${i}${ext}`
  while (used.has(candidate)) {
    i += 1
    candidate = `${stem}-${i}${ext}`
  }
  used.add(candidate)
  return candidate
}

export interface SocialResizeToolProps {
  locale: Locale
}

export default function SocialResizeTool({ locale }: SocialResizeToolProps) {
  const copy = getSocialResizeCopy(locale)
  const [file, setFile] = useState<File | null>(null)
  const [loaded, setLoaded] = useState<{ img: HTMLImageElement; url: string } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // 尺寸选择（预设 + 自定义，统一多选）
  const [selectedIds, setSelectedIds] = useState<string[]>([
    copy.sizes.defaultSelectedPresetId,
  ])
  const [customSizes, setCustomSizes] = useState<SizeOption[]>([])
  const [customWidthInput, setCustomWidthInput] = useState('')
  const [customHeightInput, setCustomHeightInput] = useState('')
  const [customError, setCustomError] = useState<string | null>(null)
  const customIdRef = useRef(0)

  // 填充模式与背景
  const [fitMode, setFitMode] = useState<FitMode>('cover')
  const [containBgMode, setContainBgMode] = useState<ContainBgMode>('color')
  const [bgColor, setBgColor] = useState('#FFFFFF')

  // 导出设置
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [exportQuality, setExportQuality] = useState(0.9)
  const [isZipping, setIsZipping] = useState(false)

  // 预览缩略图（dataURL，按选中尺寸生成）
  const [previews, setPreviews] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 文件变化后解码图像（objectURL 随 loaded 一同替换，effect 清理时释放）
  useEffect(() => {
    if (!file) {
      setLoaded(null)
      return
    }
    let cancelled = false
    setLoadError(null)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      if (cancelled) {
        URL.revokeObjectURL(url)
        return
      }
      setLoaded({ img, url })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      if (!cancelled) setLoadError(copy.errors.loadFailed)
    }
    img.src = url
    return () => {
      cancelled = true
    }
  }, [file, copy])

  // 替换 / 卸载时释放上一个 objectURL
  useEffect(() => {
    return () => {
      if (loaded) URL.revokeObjectURL(loaded.url)
    }
  }, [loaded])

  const allOptions = useMemo<SizeOption[]>(
    () => [...copy.sizes.presets, ...customSizes],
    [copy.sizes.presets, customSizes]
  )
  const selectedOptions = useMemo<SizeOption[]>(
    () => allOptions.filter((opt) => selectedIds.includes(opt.id)),
    [allOptions, selectedIds]
  )

  // 尺寸 / 模式 / 背景变化后重新生成预览缩略图（等比缩小渲染，逻辑与导出一致）
  useEffect(() => {
    if (!loaded || selectedOptions.length === 0) {
      setPreviews({})
      return
    }
    const next: Record<string, string> = {}
    for (const opt of selectedOptions) {
      const scale = Math.min(1, PREVIEW_MAX / Math.max(opt.width, opt.height))
      const w = Math.max(1, Math.round(opt.width * scale))
      const h = Math.max(1, Math.round(opt.height * scale))
      try {
        const canvas = renderToCanvas(loaded.img, w, h, { fitMode, containBgMode, bgColor }, copy.errors)
        next[opt.id] = canvas.toDataURL('image/jpeg', 0.85)
      } catch {
        // 单个预览失败时跳过，不影响其它尺寸
      }
    }
    setPreviews(next)
  }, [loaded, selectedOptions, fitMode, containBgMode, bgColor, copy])

  const handleFile = (next: File | null | undefined) => {
    if (!next) return
    if (!next.type.startsWith('image/')) {
      setLoadError(copy.errors.unsupportedType)
      return
    }
    setActionError(null)
    setFile(next)
  }

  const clearFile = () => {
    setFile(null)
    setLoadError(null)
    setActionError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleSize = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const addCustomSize = () => {
    const w = Number.parseInt(customWidthInput, 10)
    const h = Number.parseInt(customHeightInput, 10)
    if (
      !Number.isFinite(w) ||
      !Number.isFinite(h) ||
      w < 1 ||
      h < 1 ||
      w > MAX_SIZE ||
      h > MAX_SIZE
    ) {
      setCustomError(copy.errors.customSizeInvalid(MAX_SIZE))
      return
    }
    setCustomError(null)
    customIdRef.current += 1
    const id = `custom-${customIdRef.current}`
    setCustomSizes((prev) => [
      ...prev,
      { id, name: copy.sizes.customName, ratio: `${w}:${h}`, width: w, height: h },
    ])
    setSelectedIds((prev) => [...prev, id])
    setCustomWidthInput('')
    setCustomHeightInput('')
  }

  const removeCustomSize = (id: string) => {
    setCustomSizes((prev) => prev.filter((opt) => opt.id !== id))
    setSelectedIds((prev) => prev.filter((v) => v !== id))
  }

  const renderOption = { fitMode, containBgMode, bgColor }

  const handleDownloadOne = async (opt: SizeOption) => {
    if (!loaded) return
    setActionError(null)
    try {
      const canvas = renderToCanvas(loaded.img, opt.width, opt.height, renderOption, copy.errors)
      const blob = await canvasToBlob(
        canvas,
        exportFormat,
        exportQuality,
        copy.errors.renderFailed
      )
      const base = file ? getFileBaseName(file.name) : copy.fallbackBaseName
      downloadBlob(blob, buildFilename(base, opt.width, opt.height, exportFormat))
      trackToolExport('social_resize', 'single', {
        format: exportFormat,
        size: `${opt.width}x${opt.height}`,
      })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : copy.errors.exportFailed)
    }
  }

  const handleDownloadZip = async () => {
    if (!loaded || selectedOptions.length === 0 || isZipping) return
    setIsZipping(true)
    setActionError(null)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const base = file ? getFileBaseName(file.name) : copy.fallbackBaseName
      const used = new Set<string>()
      for (const opt of selectedOptions) {
        const canvas = renderToCanvas(loaded.img, opt.width, opt.height, renderOption, copy.errors)
        const blob = await canvasToBlob(
          canvas,
          exportFormat,
          exportQuality,
          copy.errors.renderFailed
        )
        const name = dedupeFilename(
          buildFilename(base, opt.width, opt.height, exportFormat),
          used
        )
        zip.file(name, blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(zipBlob, copy.zipFileName(base))
      trackToolExport('social_resize', 'zip', {
        format: exportFormat,
        count: selectedOptions.length,
      })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : copy.errors.zipFailed)
    } finally {
      setIsZipping(false)
    }
  }

  const baseName = file ? getFileBaseName(file.name) : null
  const showQuality = exportFormat === 'jpeg' || exportFormat === 'webp'
  const fitModeLabel = fitMode === 'cover' ? copy.fit.cover : copy.fit.contain
  const backgroundLabel =
    containBgMode === 'color' ? copy.preview.backgroundSolid : copy.preview.backgroundBlur

  // 尺寸多选卡片
  const renderSizeCard = (opt: SizeOption, removable: boolean) => {
    const checked = selectedIds.includes(opt.id)
    return (
      <div
        key={opt.id}
        className={`relative rounded-lg border p-3 pr-8 cursor-pointer select-none transition-colors ${
          checked
            ? 'border-primary bg-primary/5 ring-1 ring-primary'
            : 'border-border hover:border-primary/50'
        }`}
        role="checkbox"
        aria-checked={checked}
        aria-label={opt.name}
        tabIndex={0}
        onClick={() => toggleSize(opt.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleSize(opt.id)
          }
        }}
      >
        <p className="text-sm font-medium truncate" title={opt.name}>
          {opt.name}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{opt.ratio}</p>
        <p className="text-xs text-muted-foreground">
          {opt.width} × {opt.height}
        </p>
        {checked && (
          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check size={11} strokeWidth={3} />
          </span>
        )}
        {removable && (
          <button
            type="button"
            className="absolute bottom-2 right-2 text-muted-foreground/60 hover:text-destructive transition-colors"
            title={copy.sizes.removeTitle}
            aria-label={copy.sizes.removeTitle}
            onClick={(e) => {
              e.stopPropagation()
              removeCustomSize(opt.id)
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher variant="inline" />
        </div>

        {/* 标题区 */}
        <div className="mb-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
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

        {/* 工具区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 左侧：填充模式与导出设置 */}
          <div className="col-span-1 lg:col-span-4 order-2 lg:order-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crop size={18} />
                  {copy.fit.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={fitMode === 'cover' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-1.5 text-xs"
                    onClick={() => setFitMode('cover')}
                  >
                    <Crop size={14} />
                    {copy.fit.cover}
                  </Button>
                  <Button
                    variant={fitMode === 'contain' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-1.5 text-xs"
                    onClick={() => setFitMode('contain')}
                  >
                    <Expand size={14} />
                    {copy.fit.contain}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {fitMode === 'cover' ? copy.fit.coverHint : copy.fit.containHint}
                </p>

                {fitMode === 'contain' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{copy.fit.backgroundModeLabel}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={containBgMode === 'color' ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => setContainBgMode('color')}
                        >
                          {copy.fit.colorBackground}
                        </Button>
                        <Button
                          variant={containBgMode === 'blur' ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => setContainBgMode('blur')}
                        >
                          {copy.fit.blurBackground}
                        </Button>
                      </div>
                    </div>
                    {containBgMode === 'color' ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {copy.fit.backgroundColorLabel}
                        </label>
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          aria-label={copy.fit.backgroundColorLabel}
                          className="w-full h-8 rounded border cursor-pointer bg-background"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {copy.fit.blurHint}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download size={18} />
                  {copy.export.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{copy.export.formatLabel}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {copy.export.formats.map((item) => (
                      <Button
                        key={item.value}
                        variant={exportFormat === item.value ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        onClick={() => setExportFormat(item.value)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {showQuality && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center justify-between">
                      <span>{copy.export.qualityLabel}</span>
                      <span className="text-muted-foreground">
                        {Math.round(exportQuality * 100)}%
                      </span>
                    </label>
                    <Slider
                      value={[exportQuality]}
                      min={0.1}
                      max={1}
                      step={0.05}
                      onValueChange={([v]) => setExportQuality(v)}
                    />
                  </div>
                )}

                <Button
                  className="w-full flex items-center gap-2"
                  disabled={!loaded || selectedOptions.length === 0 || isZipping}
                  onClick={handleDownloadZip}
                >
                  {isZipping ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FileArchive size={16} />
                  )}
                  {isZipping
                    ? copy.export.zipping
                    : copy.export.zipButton(selectedOptions.length)}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {copy.export.fileNamingHint(copy.export.exampleFileName(baseName))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：上传 + 尺寸选择 + 预览 */}
          <div className="col-span-1 lg:col-span-8 order-1 lg:order-2 space-y-4">
            {/* 上传 / 原图信息 */}
            <Card>
              <CardContent className="p-4">
                {!loaded ? (
                  <div
                    className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    style={{ minHeight: '220px' }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsDragOver(false)
                      handleFile(e.dataTransfer.files?.[0])
                    }}
                  >
                    {loadError ? (
                      <div className="text-center text-destructive px-4">
                        <p className="text-sm font-medium">{loadError}</p>
                        <p className="text-xs mt-1 text-muted-foreground">
                          {copy.upload.chooseAnother}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground px-4">
                        {file ? (
                          <Loader2 size={40} className="mx-auto animate-spin" />
                        ) : (
                          <ImagePlus size={40} className="mx-auto" />
                        )}
                        <p className="mt-3 text-sm">
                          {file ? copy.upload.decoding : copy.upload.dropTitle}
                        </p>
                        <p className="text-xs opacity-70 mt-1">{copy.upload.dropHint}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-44 flex-shrink-0 flex items-center justify-center rounded-lg border bg-muted/20 p-2">
                      <img
                        src={loaded.url}
                        alt={copy.upload.originalAlt}
                        className="max-h-28 max-w-full object-contain"
                        draggable={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-medium truncate" title={file?.name}>
                        {file?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {copy.upload.dimensions(
                          loaded.img.naturalWidth,
                          loaded.img.naturalHeight
                        )}
                        {file ? ` · ${formatBytes(file.size)}` : ''}
                      </p>
                      {loadError && <p className="text-xs text-destructive">{loadError}</p>}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <RefreshCw size={13} />
                          {copy.upload.replace}
                        </Button>
                        <Button
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
                  accept="image/*"
                  aria-label={copy.upload.dropTitle}
                  className="hidden"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </CardContent>
            </Card>

            {/* 尺寸选择 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Expand size={16} />
                    {copy.sizes.cardTitle}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {copy.sizes.selectionCount(selectedOptions.length)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
                  {copy.sizes.presets.map((preset) => renderSizeCard(preset, false))}
                </div>

                {customSizes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {copy.sizes.customGroupLabel}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
                      {customSizes.map((opt) => renderSizeCard(opt, true))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-medium">{copy.sizes.addLabel}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={MAX_SIZE}
                      value={customWidthInput}
                      onChange={(e) => setCustomWidthInput(e.target.value)}
                      placeholder={copy.sizes.widthPlaceholder}
                      aria-label={copy.sizes.widthPlaceholder}
                      className="text-center"
                    />
                    <span className="text-sm text-muted-foreground flex-shrink-0">×</span>
                    <Input
                      type="number"
                      min={1}
                      max={MAX_SIZE}
                      value={customHeightInput}
                      onChange={(e) => setCustomHeightInput(e.target.value)}
                      placeholder={copy.sizes.heightPlaceholder}
                      aria-label={copy.sizes.heightPlaceholder}
                      className="text-center"
                    />
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 flex-shrink-0"
                      onClick={addCustomSize}
                    >
                      <Plus size={14} />
                      {copy.sizes.add}
                    </Button>
                  </div>
                  {customError ? (
                    <p className="text-xs text-destructive">{customError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {copy.sizes.rangeHint(MAX_SIZE)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 输出预览 */}
            {loaded && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Crop size={16} />
                      {copy.preview.cardTitle}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {fitModeLabel}
                      {fitMode === 'contain' && ` · ${backgroundLabel}`}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      {copy.preview.empty}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                      {selectedOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="rounded-lg border overflow-hidden bg-muted/10"
                        >
                          <div className="relative flex items-center justify-center h-44 p-1.5">
                            {previews[opt.id] ? (
                              <img
                                src={previews[opt.id]}
                                alt={copy.sizes.previewAlt(opt.name)}
                                className="max-h-full max-w-full object-contain"
                                draggable={false}
                              />
                            ) : (
                              <Loader2
                                size={18}
                                className="animate-spin text-muted-foreground"
                              />
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-1 px-2.5 py-2 border-t bg-background">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" title={opt.name}>
                                {opt.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {opt.width} × {opt.height}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 flex-shrink-0"
                              title={copy.sizes.downloadTitle(opt.width, opt.height)}
                              aria-label={copy.sizes.downloadTitle(opt.width, opt.height)}
                              disabled={isZipping}
                              onClick={() => void handleDownloadOne(opt)}
                            >
                              <Download size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {actionError && <p className="mt-3 text-xs text-destructive">{actionError}</p>}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* SEO 内容区 */}
        <div className="mt-12 space-y-12">
          {/* 功能特性 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              {copy.sections.features}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {copy.features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index] ?? Sparkles
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

          {/* 使用场景 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              {copy.sections.scenarios}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {copy.scenarios.map((scenario, index) => {
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

          {/* 常见问题 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              {copy.sections.faqs}
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {copy.faqs.map((faq) => (
                <details key={faq.question} className="group rounded-lg border bg-card px-5 py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium">
                    {faq.question}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
