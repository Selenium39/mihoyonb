'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { trackToolExport, trackToolUse } from '@/lib/analytics'
import {
  PALETTE,
  PALETTE_NAME,
  PALETTE_NOTE,
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
import {
  Crop,
  Download,
  Eraser,
  FileText,
  Grid3X3,
  Hash,
  ImagePlus,
  Loader2,
  Palette,
  Printer,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react'

const ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'
const MAX_FILE_BYTES = 40 * 1024 * 1024
const ZOOM_CELLS = [12, 18, 26, 36]

const FEATURES = [
  {
    icon: ImagePlus,
    title: '照片转拼豆图纸',
    description: '上传 JPG、PNG 或 WebP，按格数采样成方格图，适合直接对照着拼。',
  },
  {
    icon: Palette,
    title: '感知色差配色',
    description: '每格先取平均色，再用 CIE Lab 色差匹配 96 色数字参考色里最接近的色号。',
  },
  {
    icon: Hash,
    title: '色号与用量',
    description: '预览网格标出色号，并统计每个色号要买多少颗，可导出 CSV 或复制文本清单。',
  },
  {
    icon: ShieldCheck,
    title: '本地处理不上传',
    description: '解码、配色、出图都在浏览器里完成，图片不经过服务器，断网也能用，完全免费。',
  },
]

const SCENARIOS = [
  {
    icon: Sparkles,
    title: '钥匙扣和冰箱贴',
    description: '宽度设在 16–32 格，颜色再收一收，小挂件一下午就能拼完。',
  },
  {
    icon: Grid3X3,
    title: '照片人像',
    description: '人像常用 40–72 格宽。打开颜色上限，肤色会更整、更好买齐。',
  },
  {
    icon: Printer,
    title: '可打印图纸',
    description: 'PNG 自带网格、坐标、色号和用量图例，彩色打印后就可以上板。',
  },
  {
    icon: Eraser,
    title: '纯色背景的素材',
    description: '白底、纯色底可以试试边缘去背景，空白格不计入颗数。',
  },
]

const FAQS = [
  {
    question: '这是免费的拼豆图纸生成器吗？图片会上传吗？',
    answer:
      '免费，也不用注册。上传的 JPG、PNG、WebP 只在你的浏览器里用 Canvas 处理，没有上传接口，服务器拿不到原图。',
  },
  {
    question: '色号是官方 MARD 色卡吗？',
    answer:
      '色板是本站整理的 96 色数字参考色，色号用了拼豆圈常见的字母加数字写法，HEX 是屏幕近似值，用来把照片转成可对照的图纸和用量。它不是某一品牌的官方色卡，下单前请拿实物色卡再对一次。',
  },
  {
    question: '图纸宽度怎么选？',
    answer:
      '宽度是横向格数，范围 16–128，默认 48。高度按原图比例自动算。小挂件用 24 格左右，照片人像用 48–72 格。格数越多越像原图，也越费珠子。',
  },
  {
    question: '锁定正方形裁剪会怎样？',
    answer:
      '打开后高度等于宽度，并取原图正中的正方形。适合头像、表情包这类本来就想做成方图的素材。',
  },
  {
    question: '背景去除怎么用？',
    answer:
      '它从画面边缘向里找和边缘主色接近的连通区域，把这些格子变成空白，不计入用量。适合白底或纯色底。主体贴着边缘、或背景和主体颜色很近时，可能会多去掉一块，把阈值调小即可。阈值大到几乎整张图都被去掉时，会自动放弃这次去除。',
  },
  {
    question: '颜色上限和合并相近色有什么区别？',
    answer:
      '合并相近色会把色差小于阈值的两个色号并成用量更多的那个，适合收掉几乎一样的邻近色。颜色上限则只保留用量最多的若干色，其余格子按原图颜色重新就近匹配。可以两个一起开：先合并，再按颗数封顶。',
  },
  {
    question: '导出的 PNG 怎么打印？',
    answer:
      'PNG 里有网格、色号、行列坐标和用量图例。用系统图片查看或浏览器打开后彩色打印。格子很多时选“适合页面”，想按珠子尺寸估大小时再按实际尺寸打印。CSV 和文本清单用来对着用量表采购。',
  },
]

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

export default function PindouPage() {
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
        setGenError(error instanceof Error ? error.message : '生成图纸失败')
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
    })
    canvas.width = rendered.width
    canvas.height = rendered.height
    canvas.style.width = `${Math.round(rendered.width / pixelRatio)}px`
    canvas.style.height = `${Math.round(rendered.height / pixelRatio)}px`
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(rendered, 0, 0)
  }, [pattern, cssCell, showCodes, codesFit, highlight])

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
      setLoadError('请上传 JPG、PNG 或 WebP 图片')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setLoadError('图片超过 40MB，请先压缩后再试')
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
      setLoadError('这张图片无法解码，请换一张 JPG、PNG 或 WebP')
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
      })
      rendered.toBlob((blob) => {
        if (!blob) {
          setExportError('导出 PNG 失败，请降低图纸宽度后再试')
          return
        }
        downloadBlob(blob, `拼豆图纸-${pattern.cols}x${pattern.rows}.png`)
        trackToolExport('pindou', 'png', {
          cols: pattern.cols,
          rows: pattern.rows,
          colors: pattern.usage.length,
        })
      }, 'image/png')
    } catch (error) {
      setExportError(error instanceof Error ? error.message : '导出 PNG 失败')
    }
  }

  const handleDownloadCsv = () => {
    if (!pattern || pattern.totalBeads === 0) return
    downloadBlob(
      new Blob([patternToCsv(pattern)], { type: 'text/csv;charset=utf-8' }),
      `拼豆用量-${pattern.cols}x${pattern.rows}.csv`,
    )
    trackToolExport('pindou', 'csv', { colors: pattern.usage.length })
  }

  const handleCopyList = async () => {
    if (!pattern || pattern.totalBeads === 0) return
    const ok = await copyText(patternToText(pattern))
    if (!ok) {
      setExportError('复制失败，请改用 CSV 下载')
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
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">拼豆图纸生成器</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={13} />
              本地处理 · 图片不上传
            </span>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            免费把照片转成可打印的拼豆图纸。上传图片后在浏览器本地完成图片转拼豆、色号对照和用量统计，不经过任何上传接口。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          <div className="col-span-1 lg:col-span-4 order-2 lg:order-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Grid3X3 size={18} />
                  图纸尺寸
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center justify-between" htmlFor="bead-cols">
                    <span>宽度（格）</span>
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
                    aria-label="图纸宽度格数"
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
                    按原图比例
                  </Button>
                  <Button
                    type="button"
                    variant={square ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs flex items-center gap-1"
                    onClick={() => setSquare(true)}
                  >
                    <Crop size={14} />
                    正方形裁剪
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {gridPreview
                    ? `高度 ${gridPreview.rows} 格${square ? '，取画面中心的正方形。' : '，按原图比例计算。'}`
                    : '上传图片后按比例计算高度。宽度建议：小挂件 24 格左右，照片 48–72 格。'}
                </p>
                {gridPreview?.rowsClamped && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    原图太高或太扁，高度已限制在 {MIN_ROWS}–{MAX_ROWS} 格，画面比例会有一点变化。
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SlidersHorizontal size={18} />
                  颜色
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">简单去背景</label>
                    <Button
                      type="button"
                      size="sm"
                      variant={removeBackground ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setRemoveBackground((value) => !value)}
                    >
                      {removeBackground ? '已开启' : '关闭'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    从边缘向内去掉接近边缘主色的区域，适合白底或纯色底。空白格不计入颗数。
                  </p>
                  {removeBackground && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>去背景强度</span>
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
                    <label className="text-sm font-medium">合并相近色</label>
                    <Button
                      type="button"
                      size="sm"
                      variant={mergeSimilar ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setMergeSimilar((value) => !value)}
                    >
                      {mergeSimilar ? '已开启' : '关闭'}
                    </Button>
                  </div>
                  {mergeSimilar && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>合并阈值</span>
                        <span className="text-muted-foreground">{mergeThreshold}</span>
                      </label>
                      <Slider
                        value={[mergeThreshold]}
                        min={6}
                        max={28}
                        step={1}
                        onValueChange={([value]) => setMergeThreshold(value)}
                      />
                      <p className="text-xs text-muted-foreground">数值越大，越容易把邻近色号并到一起。</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-medium">颜色数上限</label>
                    <Button
                      type="button"
                      size="sm"
                      variant={limitColors ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setLimitColors((value) => !value)}
                    >
                      {limitColors ? '已开启' : '关闭'}
                    </Button>
                  </div>
                  {limitColors && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>最多色号</span>
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
                  当前色板：{PALETTE_NAME}（共 {PALETTE.length} 色）。{PALETTE_NOTE}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  disabled={!image || generating}
                  onClick={regenerate}
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  重新生成
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download size={18} />
                  导出
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
                  下载高清 PNG
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
                    CSV 清单
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-1.5 text-xs"
                    disabled={!canExport}
                    onClick={() => void handleCopyList()}
                  >
                    <FileText size={14} />
                    {copied ? '已复制' : '复制文本'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  PNG 带网格、色号、坐标和用量图例，适合彩色打印。CSV 按颗数从多到少排列，方便采购。
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
                      <p className="mt-3 text-sm">{decoding ? '图片解码中…' : '点击选择或拖拽图片到此处'}</p>
                      <p className="text-xs opacity-70 mt-1">支持 JPG、PNG、WebP，仅在本地处理</p>
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
                        alt="原图缩略"
                        className="max-h-28 max-w-full object-contain"
                        draggable={false}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-medium truncate" title={fileMeta?.name}>
                        {fileMeta?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        原图 {image.naturalWidth} × {image.naturalHeight} 像素
                        {fileMeta ? ` · ${formatBytes(fileMeta.size)}` : ''}
                        {decoding ? ' · 正在更换图片…' : ''}
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
                          重新选择
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={clearFile}
                        >
                          <X size={13} />
                          清除
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
                    图纸预览
                  </span>
                  <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                    {pattern ? `${pattern.cols} × ${pattern.rows} 格` : '等待图片'}
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
                        放大预览
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
                    {showCodes ? '色号已显示' : '显示色号'}
                  </Button>
                </div>

                {!image && (
                  <div className="rounded-lg border border-dashed py-16 px-6 text-center text-sm text-muted-foreground">
                    还没有图片。上传后会在这里生成拼豆网格、色号和用量。
                  </div>
                )}
                {image && !pattern && (
                  <div className="rounded-lg border py-16 flex items-center justify-center text-sm text-muted-foreground">
                    {genError ? <span className="text-destructive">{genError}</span> : <Loader2 className="animate-spin" />}
                  </div>
                )}
                {pattern && pattern.totalBeads === 0 && (
                  <div className="rounded-lg border py-12 px-6 text-center text-sm text-muted-foreground">
                    这张图没有可用的像素。如果开了去背景，先把它关掉再试。
                  </div>
                )}
                {pattern && pattern.totalBeads > 0 && (
                  <>
                    <div className="overflow-auto max-h-[70vh] rounded-lg border bg-muted/30">
                      <canvas ref={canvasRef} className="block" aria-label="拼豆图纸预览" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {showCodes && !codesFit
                        ? '当前格子较小，色号会在放大后显示。导出的 PNG 始终带色号。'
                        : '格子中央是色号。棋盘格是空白，不需要拼。'}
                      {highlight ? ` 正在只看 ${highlight}。再点一次用量列表可取消。` : ''}
                    </p>
                  </>
                )}
                {genError && pattern && <p className="text-xs text-destructive">{genError}</p>}
                {pattern?.backgroundReverted && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    去背景范围太大，几乎整张图都被去掉了，这次已保留原图。请把强度调低。
                  </p>
                )}
                {pattern && pattern.backgroundRemoved > 0 && (
                  <p className="text-xs text-muted-foreground">
                    已去除背景 {pattern.backgroundRemoved} 格，这些位置不计入用量。
                  </p>
                )}
              </CardContent>
            </Card>

            {pattern && pattern.totalBeads > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-base">
                    <span>用量统计</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {pattern.totalBeads} 颗 · {pattern.usage.length} 色
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex h-3 w-full overflow-hidden rounded-full" role="img" aria-label="色号用量比例">
                    {pattern.usage.map((item) => {
                      const color = PALETTE[item.index]
                      return (
                        <span
                          key={color.code}
                          title={`${color.code} ${color.name} ${item.count} 颗`}
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
                      按颗数
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={sortBy === 'code' ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setSortBy('code')}
                    >
                      按色号
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
                          <span className="text-muted-foreground w-16 truncate">{color.name}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline w-16">{color.family}</span>
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

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">怎么把图片转成拼豆图纸</h2>
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                '上传 JPG、PNG 或 WebP。文件只留在浏览器里，不上传服务器。',
                '设置宽度格数。高度按比例生成，也可以锁定正方形裁剪。',
                '看色号和用量，导出带网格的高清 PNG，或下载 CSV 采购清单。',
              ].map((step, index) => (
                <Card key={step}>
                  <CardContent className="p-5 space-y-2">
                    <p className="text-sm font-semibold">第 {index + 1} 步</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">功能特性</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="p-5 space-y-2">
                    <feature.icon size={22} className="text-primary" />
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">使用场景</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SCENARIOS.map((scenario) => (
                <Card key={scenario.title}>
                  <CardContent className="p-5 space-y-2">
                    <scenario.icon size={22} className="text-primary" />
                    <h3 className="text-sm font-semibold">{scenario.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{scenario.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">常见问题</h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq) => (
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
