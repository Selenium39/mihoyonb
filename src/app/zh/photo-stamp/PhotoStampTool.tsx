'use client'

/**
 * 照片盖章主组件（/photo-stamp 与 /zh/photo-stamp 共用）。
 *
 * - 印章来源：读取印章生成器在本机保存的设计（localStorage → 渲染管线含字体内嵌），
 *   或上传透明底印章图；
 * - 交互：预览画布上点击/拖动放置印章，滑杆调大小/旋转/透明度，
 *   multiply 混合模式模拟真实印泥；
 * - 导出：照片原始分辨率 JPG / PNG，全部本地完成。
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, ImagePlus, RefreshCw, Stamp as StampIcon, Upload, AlertCircle } from 'lucide-react'
import { cloneState, defaultStampState, type StampState } from '@/lib/stamp-maker'
import { rasterizeToCanvas } from '@/lib/stamp-export'
import { trackToolExport } from '@/lib/analytics'
import { type Locale } from '@/lib/i18n'
import { getPhotoStampCopy } from './copy'

const STAMP_MAKER_KEY = 'mihoyonb:stamp-maker:v1'
/** 印章位图的光栅化尺寸（内部用，绘制时再缩放） */
const STAMP_RASTER_SIZE = 600

interface StampTransform {
  /** 相对照片宽/高的比例位置 */
  x: number
  y: number
  /** 相对照片短边的比例 */
  scale: number
  rotation: number
  opacity: number
  blend: 'multiply' | 'normal'
}

const DEFAULT_TRANSFORM: StampTransform = {
  x: 0.72,
  y: 0.75,
  scale: 0.34,
  rotation: -12,
  opacity: 0.88,
  blend: 'multiply',
}

export interface PhotoStampToolProps {
  locale: Locale
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = src
  })
}

export default function PhotoStampTool({ locale }: PhotoStampToolProps) {
  const copy = getPhotoStampCopy(locale)

  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [stampCanvas, setStampCanvas] = useState<HTMLCanvasElement | null>(null)
  const [stampReady, setStampReady] = useState(false)
  const [transform, setTransform] = useState<StampTransform>(DEFAULT_TRANSFORM)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSavedDesign, setHasSavedDesign] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const draggingRef = useRef(false)

  // 初始检查：本机是否有印章生成器的设计
  useEffect(() => {
    try {
      setHasSavedDesign(!!localStorage.getItem(STAMP_MAKER_KEY))
    } catch {
      setHasSavedDesign(false)
    }
  }, [])

  /** 从印章生成器的 localStorage 设计渲染印章位图（复用导出管线，含字体内嵌） */
  const loadStampFromDesign = useCallback(async () => {
    setError(null)
    try {
      const raw = localStorage.getItem(STAMP_MAKER_KEY)
      if (!raw) {
        setHasSavedDesign(false)
        return
      }
      const saved = JSON.parse(raw) as Partial<StampState>
      const state: StampState = { ...cloneState(defaultStampState()), ...saved }
      const canvas = await rasterizeToCanvas(state, STAMP_RASTER_SIZE)
      setStampCanvas(canvas)
      setStampReady(true)
    } catch {
      setError(copy.errors.photoLoadFailed)
    }
  }, [copy])

  // 页面聚焦时刷新设计可用状态（用户可能中途去印章生成器改设计）
  useEffect(() => {
    const onFocus = () => {
      try {
        setHasSavedDesign(!!localStorage.getItem(STAMP_MAKER_KEY))
      } catch {
        /* 忽略 */
      }
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const onPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const url = URL.createObjectURL(file)
      const img = await loadImage(url)
      setPhoto(img)
    } catch {
      setError(copy.errors.photoLoadFailed)
    }
    e.target.value = ''
  }

  const onStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const url = URL.createObjectURL(file)
      const img = await loadImage(url)
      const canvas = document.createElement('canvas')
      canvas.width = STAMP_RASTER_SIZE
      canvas.height = STAMP_RASTER_SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas unavailable')
      // contain 居中绘制（透明底保留）
      const ratio = Math.min(STAMP_RASTER_SIZE / img.width, STAMP_RASTER_SIZE / img.height)
      const w = img.width * ratio
      const h = img.height * ratio
      ctx.drawImage(img, (STAMP_RASTER_SIZE - w) / 2, (STAMP_RASTER_SIZE - h) / 2, w, h)
      URL.revokeObjectURL(url)
      setStampCanvas(canvas)
      setStampReady(true)
    } catch {
      setError(copy.errors.photoLoadFailed)
    }
    e.target.value = ''
  }

  /** 主画布重绘：照片 + 印章（位置为照片坐标系） */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !photo) return
    canvas.width = photo.naturalWidth
    canvas.height = photo.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(photo, 0, 0)
    if (stampCanvas && stampReady) {
      const short = Math.min(canvas.width, canvas.height)
      const s = short * transform.scale
      ctx.save()
      ctx.globalAlpha = transform.opacity
      ctx.globalCompositeOperation = transform.blend === 'multiply' ? 'multiply' : 'source-over'
      ctx.translate(transform.x * canvas.width, transform.y * canvas.height)
      ctx.rotate((transform.rotation * Math.PI) / 180)
      ctx.drawImage(stampCanvas, -s / 2, -s / 2, s, s)
      ctx.restore()
    }
  }, [photo, stampCanvas, stampReady, transform])

  useEffect(() => {
    draw()
  }, [draw])

  /** 画布 pointer → 照片坐标 → 更新印章位置 */
  const placeStamp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photo || !stampReady) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    setTransform((t) => ({ ...t, x, y }))
  }

  const runExport = async (kind: 'jpg' | 'png') => {
    if (!photo) return
    setBusy(true)
    setError(null)
    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('canvas unavailable')
      const mime = kind === 'jpg' ? 'image/jpeg' : 'image/png'
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.92))
      if (!blob) throw new Error('toBlob failed')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photo-stamp.${kind}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      trackToolExport('photo_stamp', kind)
    } catch {
      setError(copy.errors.exportFailed)
    } finally {
      setBusy(false)
    }
  }

  const updT = (patch: Partial<StampTransform>) => setTransform((t) => ({ ...t, ...patch }))

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{copy.hero.title}</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">{copy.hero.intro}</p>
        </div>
        <LanguageSwitcher variant="inline" />
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* 预览 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{copy.photo.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {photo ? (
              <canvas
                ref={canvasRef}
                className="w-full rounded-lg border touch-none select-none cursor-crosshair"
                onPointerDown={(e) => {
                  draggingRef.current = true
                  placeStamp(e)
                }}
                onPointerMove={(e) => {
                  if (draggingRef.current) placeStamp(e)
                }}
                onPointerUp={() => (draggingRef.current = false)}
                onPointerLeave={() => (draggingRef.current = false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-muted-foreground transition-colors hover:bg-accent"
              >
                <ImagePlus className="h-10 w-10" />
                <span className="text-sm">{copy.photo.upload}</span>
              </button>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              {photo ? copy.transform.position + ' · ' + copy.photo.hint : copy.photo.hint}
            </p>
          </CardContent>
        </Card>

        {/* 控制面板 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.photo.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                  <RefreshCw className="w-4 h-4 mr-1" /> {photo ? copy.photo.replace : copy.photo.upload}
                </Button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onPhotoUpload}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.stamp.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="sm" disabled={!hasSavedDesign} onClick={loadStampFromDesign}>
                <StampIcon className="w-4 h-4 mr-1" /> {copy.stamp.fromDesign}
              </Button>
              <p className="text-xs text-muted-foreground">
                {hasSavedDesign ? copy.stamp.fromDesignHint : copy.stamp.fromDesignMissing}
              </p>
              <div className="border-t pt-3">
                <Button variant="outline" size="sm" onClick={() => stampInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-1" /> {copy.stamp.upload}
                </Button>
                <input
                  ref={stampInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={onStampUpload}
                />
                <p className="mt-2 text-xs text-muted-foreground">{copy.stamp.uploadHint}</p>
              </div>
              {!stampReady && <p className="text-xs text-muted-foreground">{copy.stamp.none}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.transform.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{copy.transform.size}</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(transform.scale * 100)}%</span>
                </div>
                <Slider
                  min={0.08}
                  max={1}
                  step={0.01}
                  value={[transform.scale]}
                  onValueChange={([v]) => updT({ scale: v })}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{copy.transform.rotation}</Label>
                  <span className="text-xs text-muted-foreground">{transform.rotation}°</span>
                </div>
                <Slider
                  min={-180}
                  max={180}
                  step={1}
                  value={[transform.rotation]}
                  onValueChange={([v]) => updT({ rotation: v })}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{copy.transform.opacity}</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(transform.opacity * 100)}%</span>
                </div>
                <Slider
                  min={0.2}
                  max={1}
                  step={0.01}
                  value={[transform.opacity]}
                  onValueChange={([v]) => updT({ opacity: v })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{copy.transform.blend}</Label>
                <Select
                  value={transform.blend}
                  onValueChange={(v) => updT({ blend: v as StampTransform['blend'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiply">{copy.transform.blends.multiply}</SelectItem>
                    <SelectItem value="normal">{copy.transform.blends.normal}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{copy.transform.blendHint}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{copy.exportSection.cardTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!photo || busy} onClick={() => runExport('jpg')}>
                <Download className="w-4 h-4 mr-1" /> {busy ? copy.exportSection.busy : copy.exportSection.jpg}
              </Button>
              <Button size="sm" variant="outline" disabled={!photo || busy} onClick={() => runExport('png')}>
                <Download className="w-4 h-4 mr-1" /> {copy.exportSection.png}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEO 内容区 */}
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
    </div>
  )
}
