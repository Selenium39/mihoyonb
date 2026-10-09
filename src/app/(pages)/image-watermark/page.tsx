'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import JSZip from 'jszip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { trackToolExport } from '@/lib/analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Stamp,
  Droplets,
  Type,
  ImagePlus,
  X,
  Trash2,
  Download,
  FileArchive,
  ShieldCheck,
  Loader2,
  Grid3X3,
  RotateCcw,
  Sparkles,
  Camera,
  Store,
  Users,
} from 'lucide-react'
import {
  buildWatermarkedFilename,
  drawWatermarked,
  downloadBlob,
  formatBytes,
  getFileBaseName,
  EXPORT_EXTS,
  loadImageElement,
  POSITION_OPTIONS,
  renderWatermarkedBlob,
  type ExportFormat,
  type ImageWatermarkSettings,
  type TextWatermarkSettings,
  type WatermarkConfig,
  type WatermarkPosition,
} from '@/lib/image-watermark'

// 待处理图片条目：url 为本地 objectURL，删除/清空时需要回收
interface ImageItem {
  id: string
  file: File
  url: string
}

const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string }> = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
]

const FEATURES = [
  {
    icon: Type,
    title: '文字水印自由定制',
    description:
      '水印内容、字号、颜色、透明度、旋转角度随意调整，九宫格快速定位，还可开启平铺模式覆盖全图防盗裁剪。',
  },
  {
    icon: Stamp,
    title: '品牌 Logo 水印',
    description: '上传 PNG 透明底 Logo，按图片宽度比例缩放，配合透明度与九宫格位置，轻松打造统一品牌形象。',
  },
  {
    icon: FileArchive,
    title: '批量处理一键打包',
    description: '多选、拖拽批量上传，实时预览第一张效果，全部应用后自动打包 ZIP 下载，支持 PNG / JPEG / WebP 导出。',
  },
  {
    icon: ShieldCheck,
    title: '本地处理不上传',
    description: '水印合成全部在浏览器内由 Canvas 完成，图片不会上传到服务器，隐私安全，完全免费。',
  },
]

const SCENARIOS = [
  {
    icon: Sparkles,
    title: '自媒体图片防盗',
    description: '给文章配图、小红书笔记统一加上 @账号 水印，转载传播时也能带走你的署名。',
  },
  {
    icon: Camera,
    title: '摄影作品展示',
    description: '作品分享前铺上半透明签名水印，既不影响观感，又能防止原图被盗用。',
  },
  {
    icon: Store,
    title: '电商产品图',
    description: '批量给产品图、详情图加盖店铺 Logo，统一视觉的同时防止同行盗图。',
  },
  {
    icon: Users,
    title: '团队品牌统一',
    description: '活动照片、社群素材批量加水印分发，品牌曝光更规范，整理归档更高效。',
  },
]

const FAQS = [
  {
    question: '图片会被上传到服务器吗？',
    answer:
      '不会。本工具完全在浏览器本地运行，图片解码、水印合成、ZIP 打包全部由你设备上的 Canvas API 完成，断网状态下也可以正常使用。',
  },
  {
    question: '水印字号和平铺间距是按什么计算的？',
    answer:
      '字号与间距均按「底图宽度比例」计算。这样批量处理不同尺寸的图片时，每张图上水印的相对大小和密度保持一致，不会出现有的图水印过大、有的过小的情况。',
  },
  {
    question: '为什么导出 JPEG 后透明背景变白了？',
    answer:
      'JPEG 格式本身不支持透明像素，导出前会自动用白色填充透明背景；WebP 导出同样会铺白底以保证各端显示一致。如需保留透明背景，请选择 PNG 格式。',
  },
  {
    question: '批量图片里有同名文件怎么办？',
    answer: '打包时如遇同名文件，会自动在文件名后追加序号（如 photo_1、photo_2），确保 ZIP 内每张图片都被保留。',
  },
  {
    question: '水印加错了还能去掉吗？',
    answer:
      '水印与原图是合成为一体的，导出后无法直接还原。建议保留原始图片，仅对导出副本加水印；调整参数时可在左侧预览区实时确认效果后再导出。',
  },
]

export default function ImageWatermarkPage() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  // 预览底图（第一张图）与水印 Logo
  const [previewBase, setPreviewBase] = useState<HTMLImageElement | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null)
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string | null>(null)
  const [watermarkImageError, setWatermarkImageError] = useState<string | null>(null)

  // 水印设置
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text')
  const [textSettings, setTextSettings] = useState<TextWatermarkSettings>({
    text: '@我的自媒体',
    fontScale: 0.05,
    color: '#FFFFFF',
    opacity: 0.7,
    rotation: -30,
    position: 'bottom-right',
    tiled: false,
    tileGapX: 0.25,
    tileGapY: 0.25,
  })
  const [imageSettings, setImageSettings] = useState<ImageWatermarkSettings>({
    scale: 0.2,
    opacity: 0.8,
    position: 'bottom-right',
  })

  // 导出设置与进度
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [exportQuality, setExportQuality] = useState(0.9)
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSummary, setExportSummary] = useState<{ ok: number; failed: number } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const watermarkInputRef = useRef<HTMLInputElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // 卸载时回收 objectURL
  const itemsRef = useRef(items)
  const watermarkUrlRef = useRef(watermarkImageUrl)
  useEffect(() => {
    itemsRef.current = items
  }, [items])
  useEffect(() => {
    watermarkUrlRef.current = watermarkImageUrl
  }, [watermarkImageUrl])
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
      if (watermarkUrlRef.current) URL.revokeObjectURL(watermarkUrlRef.current)
    }
  }, [])

  const addFiles = useCallback((files: FileList | File[] | null) => {
    if (!files) return
    const accepted = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (accepted.length === 0) return
    setItems((prev) => [
      ...prev,
      ...accepted.map((file, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ])
  }, [])

  const removeImage = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((item) => item.id !== id)
    })
  }

  const clearAll = () => {
    items.forEach((item) => URL.revokeObjectURL(item.url))
    setItems([])
  }

  const removeWatermarkImage = () => {
    if (watermarkImageUrl) URL.revokeObjectURL(watermarkImageUrl)
    setWatermarkImage(null)
    setWatermarkImageUrl(null)
    setWatermarkImageError(null)
  }

  // 第一张图变化时重新加载预览底图
  const firstItem = items[0]
  useEffect(() => {
    if (!firstItem) {
      setPreviewBase(null)
      setPreviewError(null)
      return
    }
    let cancelled = false
    setPreviewError(null)
    loadImageElement(firstItem.url)
      .then((img) => {
        if (!cancelled) setPreviewBase(img)
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewBase(null)
          setPreviewError('预览图加载失败，请更换图片')
        }
      })
    return () => {
      cancelled = true
    }
  }, [firstItem?.id, firstItem?.url])

  // 参数调整即时重绘预览（与导出共用 drawWatermarked）
  useEffect(() => {
    const canvas = previewCanvasRef.current
    if (!canvas) return
    if (!previewBase) {
      canvas.width = 0
      canvas.height = 0
      return
    }
    drawWatermarked(canvas, {
      base: {
        source: previewBase,
        width: previewBase.naturalWidth,
        height: previewBase.naturalHeight,
      },
      config: { type: watermarkType, text: textSettings, image: imageSettings },
      watermarkImage: watermarkImage
        ? {
            source: watermarkImage,
            width: watermarkImage.naturalWidth,
            height: watermarkImage.naturalHeight,
          }
        : null,
      fillWhite: exportFormat !== 'png',
    })
  }, [previewBase, watermarkType, textSettings, imageSettings, watermarkImage, exportFormat])

  const handleWatermarkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const url = URL.createObjectURL(file)
    try {
      const img = await loadImageElement(url)
      if (watermarkImageUrl) URL.revokeObjectURL(watermarkImageUrl)
      setWatermarkImage(img)
      setWatermarkImageUrl(url)
      setWatermarkImageError(null)
    } catch {
      URL.revokeObjectURL(url)
      setWatermarkImageError('水印图片加载失败，请更换图片')
    }
  }

  const watermarkReady = watermarkType === 'text' ? textSettings.text.trim() !== '' : !!watermarkImage

  // 应用到全部并打包下载：逐张串行合成，避免大图并发导致内存峰值过高
  const handleExportAll = async () => {
    if (items.length === 0 || isExporting || !watermarkReady) return
    setIsExporting(true)
    setExportError(null)
    setExportSummary(null)
    setProgress({ done: 0, total: items.length })

    const config: WatermarkConfig = { type: watermarkType, text: textSettings, image: imageSettings }
    const wmDrawable = watermarkImage
      ? {
          source: watermarkImage,
          width: watermarkImage.naturalWidth,
          height: watermarkImage.naturalHeight,
        }
      : null
    const zip = new JSZip()
    const usedNames = new Set<string>()
    let failed = 0

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      try {
        const blob = await renderWatermarkedBlob(item.file, config, wmDrawable, exportFormat, exportQuality)
        let name = buildWatermarkedFilename(item.file.name, exportFormat)
        // 同名文件防覆盖：追加序号
        if (usedNames.has(name)) {
          const base = getFileBaseName(item.file.name)
          const ext = EXPORT_EXTS[exportFormat]
          let seq = i + 1
          name = `${base}_${seq}.${ext}`
          while (usedNames.has(name)) {
            seq += 1
            name = `${base}_${seq}.${ext}`
          }
        }
        usedNames.add(name)
        zip.file(name, blob)
      } catch {
        failed += 1
      }
      setProgress({ done: i + 1, total: items.length })
      // 让出主线程，保证进度条实时刷新
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    try {
      if (usedNames.size === 0) {
        setExportError('全部图片处理失败，请确认图片文件完好后重试')
      } else {
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        downloadBlob(zipBlob, `watermarked-images-${Date.now()}.zip`)
        trackToolExport('image_watermark', 'zip', { format: exportFormat, ok: usedNames.size, failed })
        setExportSummary({ ok: usedNames.size, failed })
      }
    } catch {
      setExportError('打包下载失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const totalBytes = items.reduce((sum, item) => sum + item.file.size, 0)
  const progressPercent =
    progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  // 九宫格位置选择器（文字 / 图片水印共用）
  const renderPositionGrid = (
    value: WatermarkPosition,
    onChange: (position: WatermarkPosition) => void
  ) => (
    <div className="grid grid-cols-3 gap-1.5">
      {POSITION_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Stamp className="text-primary" size={34} />
            图片加水印
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            批量给图片添加文字或 Logo 水印，位置、透明度、旋转自由调节，实时预览一键打包下载。全部本地处理，图片不上传。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 左侧：上传列表 + 实时预览 */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <ImagePlus size={18} className="text-primary" />
                    上传图片
                  </span>
                  {items.length > 0 && (
                    <span className="flex items-center gap-3 text-xs font-normal text-muted-foreground">
                      <span>
                        共 {items.length} 张 · {formatBytes(totalBytes)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={clearAll}
                        disabled={isExporting}
                      >
                        <Trash2 size={13} className="mr-1" />
                        清空
                      </Button>
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragOver ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragOver(false)
                    addFiles(e.dataTransfer.files)
                  }}
                >
                  <ImagePlus size={36} className="mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">点击选择或拖拽图片到此处（支持多选）</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">支持 PNG、JPG、WebP 等浏览器可打开的图片格式</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />

                {items.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {items.map((item, index) => (
                      <div key={item.id} className="relative group rounded-lg overflow-hidden border bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={`图片 ${index + 1}`} className="w-full h-20 object-cover" />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 rounded bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0.5">
                            预览图
                          </span>
                        )}
                        <button
                          type="button"
                          className="absolute top-1 right-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          onClick={() => removeImage(item.id)}
                          aria-label="删除图片"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles size={18} className="text-primary" />
                  实时预览（第一张图）
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewError ? (
                  <p className="text-sm text-destructive text-center py-10">{previewError}</p>
                ) : previewBase ? (
                  <div className="flex justify-center rounded-lg border bg-[repeating-conic-gradient(#f0f0f0_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] p-2">
                    <canvas ref={previewCanvasRef} className="max-w-full h-auto rounded" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    上传图片后，可在此实时预览水印效果，参数调整即时生效
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：水印设置 + 导出 */}
          <div className="col-span-1 lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Droplets size={18} className="text-primary" />
                  水印设置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={watermarkType} onValueChange={(value) => setWatermarkType(value as 'text' | 'image')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="text">文字水印</TabsTrigger>
                    <TabsTrigger value="image">图片水印</TabsTrigger>
                  </TabsList>

                  {/* 文字水印设置 */}
                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">水印内容</label>
                      <Input
                        value={textSettings.text}
                        onChange={(e) => setTextSettings((prev) => ({ ...prev, text: e.target.value }))}
                        placeholder="输入水印文字，如 @我的自媒体"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex justify-between">
                        <span>字号（相对图片宽度）</span>
                        <span className="text-muted-foreground">{(textSettings.fontScale * 100).toFixed(1)}%</span>
                      </label>
                      <Slider
                        min={1}
                        max={20}
                        step={0.5}
                        value={[textSettings.fontScale * 100]}
                        onValueChange={([v]) => setTextSettings((prev) => ({ ...prev, fontScale: v / 100 }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">文字颜色</label>
                      <input
                        type="color"
                        value={textSettings.color}
                        onChange={(e) => setTextSettings((prev) => ({ ...prev, color: e.target.value }))}
                        className="w-full h-8 rounded border cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex justify-between">
                        <span>透明度</span>
                        <span className="text-muted-foreground">{Math.round(textSettings.opacity * 100)}%</span>
                      </label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[textSettings.opacity]}
                        onValueChange={([v]) => setTextSettings((prev) => ({ ...prev, opacity: v }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex justify-between">
                        <span className="flex items-center gap-1">
                          <RotateCcw size={12} />
                          旋转角度
                        </span>
                        <span className="text-muted-foreground">{textSettings.rotation}°</span>
                      </label>
                      <Slider
                        min={-90}
                        max={90}
                        step={1}
                        value={[textSettings.rotation]}
                        onValueChange={([v]) => setTextSettings((prev) => ({ ...prev, rotation: v }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">平铺模式</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={!textSettings.tiled ? 'default' : 'outline'}
                          className="h-8 text-xs"
                          onClick={() => setTextSettings((prev) => ({ ...prev, tiled: false }))}
                        >
                          单个水印
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={textSettings.tiled ? 'default' : 'outline'}
                          className="h-8 text-xs"
                          onClick={() => setTextSettings((prev) => ({ ...prev, tiled: true }))}
                        >
                          <Grid3X3 size={13} className="mr-1" />
                          平铺全图
                        </Button>
                      </div>
                    </div>

                    {textSettings.tiled ? (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium flex justify-between">
                            <span>列间距（相对图片宽度）</span>
                            <span className="text-muted-foreground">{Math.round(textSettings.tileGapX * 100)}%</span>
                          </label>
                          <Slider
                            min={5}
                            max={100}
                            step={5}
                            value={[textSettings.tileGapX * 100]}
                            onValueChange={([v]) => setTextSettings((prev) => ({ ...prev, tileGapX: v / 100 }))}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium flex justify-between">
                            <span>行间距（相对图片宽度）</span>
                            <span className="text-muted-foreground">{Math.round(textSettings.tileGapY * 100)}%</span>
                          </label>
                          <Slider
                            min={5}
                            max={100}
                            step={5}
                            value={[textSettings.tileGapY * 100]}
                            onValueChange={([v]) => setTextSettings((prev) => ({ ...prev, tileGapY: v / 100 }))}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">水印位置</label>
                        {renderPositionGrid(textSettings.position, (position) =>
                          setTextSettings((prev) => ({ ...prev, position }))
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* 图片水印设置 */}
                  <TabsContent value="image" className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">水印图片（建议 PNG 透明底）</label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => watermarkInputRef.current?.click()}
                        >
                          <ImagePlus size={13} className="mr-1" />
                          上传水印图片
                        </Button>
                        {watermarkImageUrl && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={removeWatermarkImage}
                            >
                              移除
                            </Button>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={watermarkImageUrl}
                              alt="水印图片"
                              className="h-8 w-8 object-contain rounded border bg-muted/30"
                            />
                          </>
                        )}
                      </div>
                      <input
                        ref={watermarkInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleWatermarkUpload}
                      />
                      {!watermarkImage && !watermarkImageError && (
                        <p className="text-xs text-muted-foreground">请先上传水印图片，才能使用图片水印</p>
                      )}
                      {watermarkImageError && <p className="text-xs text-destructive">{watermarkImageError}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex justify-between">
                        <span>缩放比例（相对图片宽度）</span>
                        <span className="text-muted-foreground">{Math.round(imageSettings.scale * 100)}%</span>
                      </label>
                      <Slider
                        min={5}
                        max={80}
                        step={1}
                        value={[imageSettings.scale * 100]}
                        onValueChange={([v]) => setImageSettings((prev) => ({ ...prev, scale: v / 100 }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex justify-between">
                        <span>透明度</span>
                        <span className="text-muted-foreground">{Math.round(imageSettings.opacity * 100)}%</span>
                      </label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        value={[imageSettings.opacity]}
                        onValueChange={([v]) => setImageSettings((prev) => ({ ...prev, opacity: v }))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">水印位置</label>
                      {renderPositionGrid(imageSettings.position, (position) =>
                        setImageSettings((prev) => ({ ...prev, position }))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download size={18} className="text-primary" />
                  应用并导出
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">导出格式</label>
                  <div className="grid grid-cols-3 gap-2">
                    {EXPORT_FORMATS.map((format) => (
                      <Button
                        key={format.value}
                        type="button"
                        size="sm"
                        variant={exportFormat === format.value ? 'default' : 'outline'}
                        className="h-8 text-xs"
                        onClick={() => setExportFormat(format.value)}
                      >
                        {format.label}
                      </Button>
                    ))}
                  </div>
                  {exportFormat !== 'png' && (
                    <p className="text-xs text-muted-foreground">JPEG / WebP 会先用白色填充透明背景</p>
                  )}
                </div>

                {exportFormat !== 'png' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium flex justify-between">
                      <span>导出质量</span>
                      <span className="text-muted-foreground">{Math.round(exportQuality * 100)}%</span>
                    </label>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={[exportQuality]}
                      onValueChange={([v]) => setExportQuality(v)}
                    />
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full"
                  disabled={items.length === 0 || isExporting || !watermarkReady}
                  onClick={handleExportAll}
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      正在处理 {progress ? `${progress.done}/${progress.total}` : ''}
                    </>
                  ) : (
                    <>
                      <FileArchive size={16} className="mr-2" />
                      应用到全部并打包下载
                    </>
                  )}
                </Button>

                {isExporting && progress && (
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      正在合成第 {Math.min(progress.done + 1, progress.total)} / {progress.total} 张…
                    </p>
                  </div>
                )}

                {exportError && <p className="text-xs text-destructive">{exportError}</p>}
                {exportSummary && !isExporting && (
                  <p className="text-xs text-muted-foreground">
                    已完成：成功 {exportSummary.ok} 张
                    {exportSummary.failed > 0 ? `，失败 ${exportSummary.failed} 张（已跳过）` : ''}，ZIP 已开始下载
                  </p>
                )}
                {watermarkType === 'text' && textSettings.text.trim() === '' && (
                  <p className="text-xs text-muted-foreground">请输入水印内容后再导出</p>
                )}
              </CardContent>
            </Card>
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
