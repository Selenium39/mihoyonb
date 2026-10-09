'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { trackToolExport } from '@/lib/analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Scissors,
  Grid3X3,
  MoveVertical,
  MoveHorizontal,
  ImagePlus,
  Download,
  FileArchive,
  ShieldCheck,
  Loader2,
  X,
  RefreshCw,
  Columns,
  Rows,
  FileImage,
  Sparkles,
  MessageCircle,
  BookOpen,
  Layers,
} from 'lucide-react'
import {
  computeSlices,
  downloadBlob,
  formatBytes,
  getFileBaseName,
  buildSliceFilename,
  loadImageFile,
  makeSlicePreviewUrl,
  renderSliceBlob,
  type ExportFormat,
  type LoadedImage,
  type SliceRect,
  type SplitMode,
} from '@/lib/image-split'

// 网格切割快捷方式：行×列
const GRID_PRESETS: Array<{ label: string; rows: number; cols: number }> = [
  { label: '1×2', rows: 1, cols: 2 },
  { label: '2×1', rows: 2, cols: 1 },
  { label: '2×2', rows: 2, cols: 2 },
  { label: '3×3', rows: 3, cols: 3 },
]

const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string }> = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
]

const FEATURES = [
  {
    icon: Grid3X3,
    title: '九宫格一键切割',
    description: '默认 3×3 九宫格，行×列在 1–10 间自由调节，发朋友圈、微博九宫格不用再装 App。',
  },
  {
    icon: Scissors,
    title: '长图自由分段',
    description: '纵向按片数或自定义每片高度切割长图，横向按片数等分宽度，最后一片自动取剩余部分。',
  },
  {
    icon: FileImage,
    title: '多格式导出',
    description: '支持 PNG / JPEG / WebP 导出，JPEG 与 WebP 可调节质量，单张下载或一键打包 ZIP。',
  },
  {
    icon: ShieldCheck,
    title: '本地处理不上传',
    description: '切割全部在浏览器内完成，图片不会上传到服务器，隐私安全，完全免费。',
  },
]

const SCENARIOS = [
  {
    icon: MessageCircle,
    title: '朋友圈九宫格',
    description: '把一张方形照片切成 3×3 九张，按顺序发布，收获整齐的朋友宫格墙。',
  },
  {
    icon: BookOpen,
    title: '小红书长图分段',
    description: '笔记长图超过发布限制时，按固定高度切成多张，连续上传不丢内容。',
  },
  {
    icon: Layers,
    title: '公众号配图裁切',
    description: '一张大图快速切成多组配图，规格统一，排版更整齐。',
  },
  {
    icon: Sparkles,
    title: '聊天截图分页',
    description: '超长聊天记录截图切成多段，逐张发送或存档，阅读更轻松。',
  },
]

const FAQS = [
  {
    question: '切割后图片质量会下降吗？',
    answer:
      '不会。切割只是把原图像素区域分开裁出，不缩放、不重采样。导出 PNG 为无损；选择 JPEG 或 WebP 时可通过质量滑块控制压缩程度，默认 0.9 接近原图观感。',
  },
  {
    question: '支持哪些图片格式？',
    answer:
      '支持浏览器能够打开的主流图片格式，包括 PNG、JPG/JPEG、WebP、GIF（取静态首帧）、BMP 等。导出格式可独立选择 PNG、JPEG 或 WebP。',
  },
  {
    question: '图片会被上传到服务器吗？',
    answer:
      '不会。本工具完全在浏览器本地运行，图片解码、切割、打包全部由你设备上的 Canvas API 完成，断网状态下也可以正常使用。',
  },
  {
    question: '九宫格切完后怎么发朋友圈？',
    answer:
      '上传正方形图片后保持默认 3×3 设置，点击「打包下载 ZIP」，解压后按文件名 _01 到 _09 的顺序依次选图发布即可。',
  },
  {
    question: '最多能切成多少片？',
    answer:
      '网格切割最多 10×10 共 100 片；纵向/横向按片数切割最多 100 片；按每片高度切割的片数取决于图片高度。片数越多预览与导出耗时越长，建议按需切割。',
  },
]

export default function ImageSplitPage() {
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // 切割参数
  const [mode, setMode] = useState<SplitMode>('grid')
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [vMode, setVMode] = useState<'count' | 'height'>('count')
  const [vCount, setVCount] = useState(3)
  const [sliceHeightInput, setSliceHeightInput] = useState('800')
  const [hCount, setHCount] = useState(3)

  // 导出设置
  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(0.9)

  // 切片预览（缩略 objectURL，按需生成并适时释放）
  const [previews, setPreviews] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isZipping, setIsZipping] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<LoadedImage | null>(null)
  const previewsRef = useRef<string[]>([])

  // 每片高度输入为空或非法时记为 0，计算时回退为整图高度（即 1 片），避免产生海量碎片
  const parsedSliceHeight = parseInt(sliceHeightInput, 10)
  const sliceHeight =
    Number.isFinite(parsedSliceHeight) && parsedSliceHeight > 0 ? parsedSliceHeight : 0

  const applyImage = (next: LoadedImage | null) => {
    imageRef.current?.dispose()
    imageRef.current = next
    setImage(next)
  }

  // 组件卸载时释放图像与预览 URL
  useEffect(() => {
    return () => {
      imageRef.current?.dispose()
      previewsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
      previewsRef.current = []
    }
  }, [])

  // 文件变化后解码图像
  useEffect(() => {
    if (!file) {
      applyImage(null)
      return
    }
    let cancelled = false
    setLoadError(null)
    loadImageFile(file)
      .then((loaded) => {
        if (cancelled) {
          loaded.dispose()
          return
        }
        applyImage(loaded)
      })
      .catch((error) => {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : '图片加载失败，请更换图片重试')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  // 根据当前模式与参数计算切片区域（sliceHeight 为 0 时按整图高度切，即 1 片）
  const sliceRects = useMemo<SliceRect[]>(() => {
    if (!image) return []
    return computeSlices(mode, image.width, image.height, {
      grid: { rows, cols },
      vertical: { mode: vMode, count: vCount, sliceHeight: sliceHeight || image.height },
      horizontalCount: hCount,
    })
  }, [image, mode, rows, cols, vMode, vCount, sliceHeight, hCount])

  // 切片变化后重新生成缩略预览
  useEffect(() => {
    if (!image || sliceRects.length === 0) {
      previewsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
      previewsRef.current = []
      setPreviews([])
      setIsGenerating(false)
      return
    }

    let cancelled = false
    setIsGenerating(true)

    const generate = async () => {
      const urls: string[] = []
      // 切片过多时跳过缩略图生成，仅展示序号与尺寸，避免占用过多内存
      const skipThumbnails = sliceRects.length > 400
      for (const rect of sliceRects) {
        if (cancelled) break
        if (skipThumbnails) {
          urls.push('')
          continue
        }
        try {
          urls.push(await makeSlicePreviewUrl(image.source, rect))
        } catch {
          urls.push('')
        }
      }
      if (cancelled) {
        urls.forEach((url) => {
          if (url) URL.revokeObjectURL(url)
        })
        return
      }
      previewsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
      previewsRef.current = urls
      setPreviews(urls)
      setIsGenerating(false)
    }

    void generate()
    return () => {
      cancelled = true
    }
  }, [image, sliceRects])

  const handleFile = (next: File | null | undefined) => {
    if (!next) return
    if (!next.type.startsWith('image/')) {
      setLoadError('请选择图片文件（PNG、JPG、WebP 等）')
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

  const handleDownloadSlice = async (rect: SliceRect) => {
    if (!image || !file) return
    setActionError(null)
    try {
      const blob = await renderSliceBlob(image.source, rect, format, quality)
      downloadBlob(blob, buildSliceFilename(getFileBaseName(file.name), rect.index, format))
      trackToolExport('image_split', 'single', { format })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '导出失败，请重试')
    }
  }

  const handleDownloadZip = async () => {
    if (!image || !file || isZipping) return
    setIsZipping(true)
    setActionError(null)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const base = getFileBaseName(file.name)
      for (const rect of sliceRects) {
        const blob = await renderSliceBlob(image.source, rect, format, quality)
        zip.file(buildSliceFilename(base, rect.index, format), blob)
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(zipBlob, `${base}_切割.zip`)
      trackToolExport('image_split', 'zip', { format, count: sliceRects.length })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '打包导出失败，请重试')
    } finally {
      setIsZipping(false)
    }
  }

  const baseName = file ? getFileBaseName(file.name) : ''
  const showQuality = format === 'jpeg' || format === 'webp'
  const firstRect = sliceRects[0]

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* 标题区 */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">长图切割</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={13} />
              本地处理 · 图片不上传
            </span>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            把一张图片切成多张：九宫格、长图分段、横向等分都支持，单张下载或一键打包 ZIP。
          </p>
        </div>

        {/* 工具区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 左侧：切割与导出设置 */}
          <div className="col-span-1 lg:col-span-4 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scissors size={18} />
                  切割设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Tabs value={mode} onValueChange={(value) => setMode(value as SplitMode)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="grid" className="text-xs sm:text-sm">
                      <Grid3X3 size={14} className="mr-1" />
                      网格
                    </TabsTrigger>
                    <TabsTrigger value="vertical" className="text-xs sm:text-sm">
                      <MoveVertical size={14} className="mr-1" />
                      纵向切片
                    </TabsTrigger>
                    <TabsTrigger value="horizontal" className="text-xs sm:text-sm">
                      <MoveHorizontal size={14} className="mr-1" />
                      横向切片
                    </TabsTrigger>
                  </TabsList>

                  {/* 网格切割 */}
                  <TabsContent value="grid" className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">快捷方式</label>
                      <div className="grid grid-cols-4 gap-2">
                        {GRID_PRESETS.map((preset) => (
                          <Button
                            key={preset.label}
                            variant={rows === preset.rows && cols === preset.cols ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                            title={`${preset.rows} 行 × ${preset.cols} 列`}
                            onClick={() => {
                              setRows(preset.rows)
                              setCols(preset.cols)
                            }}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Rows size={14} />
                          行数（竖向分段）
                        </span>
                        <span className="text-muted-foreground">{rows}</span>
                      </label>
                      <Slider value={[rows]} min={1} max={10} step={1} onValueChange={([v]) => setRows(v)} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Columns size={14} />
                          列数（横向分段）
                        </span>
                        <span className="text-muted-foreground">{cols}</span>
                      </label>
                      <Slider value={[cols]} min={1} max={10} step={1} onValueChange={([v]) => setCols(v)} />
                    </div>

                    {mode === 'grid' && firstRect && (
                      <p className="text-xs text-muted-foreground">
                        共 {sliceRects.length} 片，每片约 {firstRect.sw} × {firstRect.sh} 像素
                      </p>
                    )}
                  </TabsContent>

                  {/* 纵向切片 */}
                  <TabsContent value="vertical" className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">切割方式</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={vMode === 'count' ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => setVMode('count')}
                        >
                          按片数
                        </Button>
                        <Button
                          variant={vMode === 'height' ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => setVMode('height')}
                        >
                          按每片高度
                        </Button>
                      </div>
                    </div>

                    {vMode === 'count' ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center justify-between">
                          <span>切片数量</span>
                          <span className="text-muted-foreground">{vCount}</span>
                        </label>
                        <Slider value={[vCount]} min={1} max={30} step={1} onValueChange={([v]) => setVCount(v)} />
                        {mode === 'vertical' && firstRect && (
                          <p className="text-xs text-muted-foreground">
                            每片约 {firstRect.sw} × {firstRect.sh} 像素
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">每片高度（px）</label>
                        <Input
                          type="number"
                          min={1}
                          value={sliceHeightInput}
                          onChange={(e) => setSliceHeightInput(e.target.value)}
                          placeholder="如 1200"
                          className="text-center"
                        />
                        {image && (
                          <p className="text-xs text-muted-foreground">
                            预计切 {Math.ceil(image.height / (sliceHeight || image.height))} 片，最后一片自动取剩余高度
                            {image.height / (sliceHeight || image.height) > 100 && (
                              <span className="text-amber-600 dark:text-amber-400">（片数较多，预览与导出耗时较长）</span>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* 横向切片 */}
                  <TabsContent value="horizontal" className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>切片数量（等分宽度）</span>
                        <span className="text-muted-foreground">{hCount}</span>
                      </label>
                      <Slider value={[hCount]} min={1} max={30} step={1} onValueChange={([v]) => setHCount(v)} />
                      {mode === 'horizontal' && firstRect && (
                        <p className="text-xs text-muted-foreground">
                          每片约 {firstRect.sw} × {firstRect.sh} 像素
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* 导出设置 */}
                <div className="space-y-4 border-t pt-4">
                  <label className="text-sm font-medium">导出格式</label>
                  <div className="grid grid-cols-3 gap-2">
                    {EXPORT_FORMATS.map((item) => (
                      <Button
                        key={item.value}
                        variant={format === item.value ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        onClick={() => setFormat(item.value)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>

                  {showQuality && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>导出质量</span>
                        <span className="text-muted-foreground">{Math.round(quality * 100)}%</span>
                      </label>
                      <Slider
                        value={[quality]}
                        min={0.1}
                        max={1}
                        step={0.05}
                        onValueChange={([v]) => setQuality(v)}
                      />
                    </div>
                  )}

                  <Button
                    className="w-full flex items-center gap-2"
                    disabled={!image || sliceRects.length === 0 || isZipping}
                    onClick={handleDownloadZip}
                  >
                    {isZipping ? <Loader2 size={16} className="animate-spin" /> : <FileArchive size={16} />}
                    {isZipping ? '打包中…' : `打包下载全部 ${sliceRects.length || ''} 片（ZIP）`}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    文件名格式：{baseName ? `${baseName}_01、${baseName}_02…` : '原文件名_01、_02…'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：上传与切片预览 */}
          <div className="col-span-1 lg:col-span-8 order-1 lg:order-2 space-y-4">
            {/* 上传 / 原图信息 */}
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
                        <p className="text-xs mt-1 text-muted-foreground">点击重新选择图片</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground px-4">
                        {file ? (
                          <Loader2 size={40} className="mx-auto animate-spin" />
                        ) : (
                          <ImagePlus size={40} className="mx-auto" />
                        )}
                        <p className="mt-3 text-sm">{file ? '图片解码中…' : '点击选择或拖拽图片到此处'}</p>
                        <p className="text-xs opacity-70 mt-1">支持 PNG、JPG、WebP 等常见格式</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-44 flex-shrink-0 flex items-center justify-center rounded-lg border bg-muted/20 p-2">
                      <canvas
                        className="max-h-28 max-w-full"
                        ref={(node) => {
                          // 用小画布呈现原图缩略，避免直接渲染大图
                          if (node && image) {
                            const scale = Math.min(
                              176 / image.width,
                              112 / image.height,
                              1
                            )
                            node.width = Math.max(1, Math.round(image.width * scale))
                            node.height = Math.max(1, Math.round(image.height * scale))
                            const ctx = node.getContext('2d')
                            ctx?.drawImage(
                              image.source,
                              0,
                              0,
                              node.width,
                              node.height
                            )
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-medium truncate" title={file?.name}>
                        {file?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        原图 {image.width} × {image.height} 像素
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
                          重新选择
                        </Button>
                        <Button
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
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </CardContent>
            </Card>

            {/* 切片预览 */}
            {image && sliceRects.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Grid3X3 size={16} />
                      切片预览
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {isGenerating ? (
                        <span className="flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" />
                          缩略图生成中…
                        </span>
                      ) : (
                        `共 ${sliceRects.length} 片`
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {sliceRects.map((rect, i) => (
                      <div key={rect.index} className="rounded-lg border overflow-hidden bg-muted/10">
                        <div className="relative flex items-center justify-center h-32 p-1.5">
                          <span className="absolute top-1.5 left-1.5 rounded bg-background/90 border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {rect.index}
                          </span>
                          {previews[i] ? (
                            <img
                              src={previews[i]}
                              alt={`切片 ${rect.index}`}
                              className="max-h-full max-w-full object-contain"
                              draggable={false}
                            />
                          ) : isGenerating ? (
                            <Loader2 size={18} className="animate-spin text-muted-foreground" />
                          ) : (
                            <ImagePlus size={18} className="text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-1 px-2 py-1.5 border-t bg-background">
                          <span className="text-[11px] text-muted-foreground truncate">
                            {rect.sw} × {rect.sh}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            title={`下载切片 ${rect.index}`}
                            disabled={isZipping}
                            onClick={() => void handleDownloadSlice(rect)}
                          >
                            <Download size={13} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
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

          {/* 使用场景 */}
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

          {/* 常见问题 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">常见问题</h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group rounded-lg border bg-card px-5 py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium">
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
