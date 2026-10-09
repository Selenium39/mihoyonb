'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Film,
  Camera,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Upload,
  Loader2,
  Package,
  X,
} from 'lucide-react'
import JSZip from 'jszip'
import { trackToolExport, trackToolUse } from '@/lib/analytics'

// 帧率未知时的默认步进间隔（1/25 秒）
const FRAME_STEP = 1 / 25

// 导出格式对应的 MIME 类型与扩展名
const FORMAT_MIME: Record<'png' | 'jpeg' | 'webp', string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}
const FORMAT_EXT: Record<'png' | 'jpeg' | 'webp', string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
}

interface CapturedFrame {
  id: string
  url: string // 缩略图/预览用的 objectURL
  blob: Blob // 原始 PNG 数据，用于下载与转码
  time: number // 截取时的时间点（秒）
}

// 秒 → mm:ss
const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const total = Math.floor(seconds)
  const mm = Math.floor(total / 60)
  const ss = total % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

// 秒 → mm:ss.xx（帧列表时间戳）
const formatTimePrecise = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00.00'
  const mm = Math.floor(seconds / 60)
  const ss = seconds - mm * 60
  return `${String(mm).padStart(2, '0')}:${ss.toFixed(2).padStart(5, '0')}`
}

// 本地时间戳，用于 ZIP 文件名
const getFileTimestamp = (): string => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

const canvasToBlob = (canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, mime, quality))

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

// 等待视频当前帧实际呈现（优先 requestVideoFrameCallback，不支持或超时则退回双 rAF）
const waitForPresentedFrame = (video: HTMLVideoElement): Promise<void> =>
  new Promise((resolve) => {
    const rvfc = (
      video as HTMLVideoElement & {
        requestVideoFrameCallback?: (callback: () => void) => number
      }
    ).requestVideoFrameCallback
    if (typeof rvfc === 'function') {
      const timer = setTimeout(resolve, 150)
      rvfc.call(video, () => {
        clearTimeout(timer)
        resolve()
      })
      return
    }
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })

// 抽样判断画布是否全黑/全透明（用于检测硬解视频 drawImage 产生的黑帧）
const isCanvasBlank = (ctx: CanvasRenderingContext2D, w: number, h: number): boolean => {
  try {
    for (let i = 0; i < 16; i++) {
      const x = Math.floor(((i % 4) + 0.5) * (w / 4))
      const y = Math.floor((Math.floor(i / 4) + 0.5) * (h / 4))
      const { data } = ctx.getImageData(x, y, 1, 1)
      if (data[3] === 0) continue
      if (data[0] + data[1] + data[2] > 24) return false
    }
    return true
  } catch {
    return false
  }
}

// 截帧失败时的用户提示
const FRAME_CAPTURE_ERROR =
  '截帧失败：当前浏览器无法捕获此视频的画面（可能为 HDR/HEVC 等特殊编码），建议使用最新版 Chrome 或 Safari 重试'

/**
 * 从视频当前帧导出 Blob。
 * 某些视频（如 HDR / 10bit HEVC 硬解）直接 drawImage(video) 会得到全黑画面，
 * 因此首选 createImageBitmap（直接从解码器取帧，绕过 canvas 读回），
 * 失败或得到黑帧时退回 drawImage + 等待帧呈现并重试。
 */
const captureFrameToBlob = async (
  video: HTMLVideoElement,
  mime: string,
  quality?: number
): Promise<Blob | null> => {
  const w = video.videoWidth
  const h = video.videoHeight
  if (!w || !h) return null

  // 路径一：createImageBitmap 直接取解码帧
  try {
    const bitmap = await createImageBitmap(video)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0)
        if (!isCanvasBlank(ctx, w, h)) {
          const blob = await canvasToBlob(canvas, mime, quality)
          if (blob) return blob
        }
      }
    } finally {
      bitmap.close()
    }
  } catch {
    // 忽略，走备选路径
  }

  // 路径二：等待帧呈现后直接绘制视频，检测黑帧并重试
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  for (let attempt = 0; attempt < 3; attempt++) {
    await waitForPresentedFrame(video)
    ctx.drawImage(video, 0, 0)
    if (!isCanvasBlank(ctx, w, h)) {
      const blob = await canvasToBlob(canvas, mime, quality)
      if (blob) return blob
    }
  }
  return null
}

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // 延迟释放，避免个别浏览器尚未开始下载
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function VideoFramePage() {
  // 视频状态
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [duration, setDuration] = useState(0)
  const [videoSize, setVideoSize] = useState<{ width: number; height: number } | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // 截帧列表
  const [frames, setFrames] = useState<CapturedFrame[]>([])

  // 导出设置
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [exportQuality, setExportQuality] = useState(0.9)
  const [extractInterval, setExtractInterval] = useState(1)

  // 批量抽帧
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState<{ current: number; total: number } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // 保存最新的 objectURL 与帧列表，供卸载清理与切换视频时释放
  const videoUrlRef = useRef<string | null>(null)
  const framesRef = useRef<CapturedFrame[]>([])
  // 快捷键监听为一次性挂载，需通过 ref 读取最新抽帧状态
  const isExtractingRef = useRef(false)

  useEffect(() => {
    framesRef.current = frames
  }, [frames])

  useEffect(() => {
    isExtractingRef.current = isExtracting
  }, [isExtracting])

  // 组件卸载时释放所有 objectURL
  useEffect(() => {
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
      framesRef.current.forEach((f) => URL.revokeObjectURL(f.url))
    }
  }, [])

  // 快捷键：空格 播放/暂停，←/→ 逐帧步进（输入框聚焦时不拦截）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      const video = videoRef.current
      if (!video || !videoUrlRef.current) return
      // 抽帧过程中不响应快捷键，避免干扰串行 seek
      if (isExtractingRef.current) return

      if (e.code === 'Space') {
        e.preventDefault() // 防止页面滚动
        if (video.paused) {
          video.play()
        } else {
          video.pause()
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        stepFrame(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        stepFrame(1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 逐帧步进（帧率未知时按 1/25 秒）
  const stepFrame = (dir: 1 | -1) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(video.duration) || isExtractingRef.current) return
    video.pause()
    const target = Math.min(
      Math.max(video.currentTime + dir * FRAME_STEP, 0),
      Math.max(0, video.duration - FRAME_STEP)
    )
    video.currentTime = target
    setCurrentTime(target)
  }

  // seek 到指定时间并等待 seeked 完成（带超时兜底）
  const seekTo = (time: number): Promise<void> =>
    new Promise((resolve) => {
      const video = videoRef.current
      if (!video) {
        resolve()
        return
      }
      const target = Math.min(Math.max(time, 0), Math.max(0, (video.duration || 0) - 0.001))
      // 目标与当前一致时浏览器不会触发 seeked，直接返回
      if (Math.abs(video.currentTime - target) < 0.0005) {
        resolve()
        return
      }
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        video.removeEventListener('seeked', finish)
        clearTimeout(timer)
        resolve()
      }
      const timer = setTimeout(finish, 5000)
      video.addEventListener('seeked', finish)
      video.currentTime = target
    })

  // 清空截帧列表（释放 objectURL）
  const clearFrames = () => {
    framesRef.current.forEach((f) => URL.revokeObjectURL(f.url))
    setFrames([])
  }

  // 加载本地视频文件
  const loadVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setVideoError('请选择视频文件（如 MP4、WebM 等）')
      return
    }
    // 释放旧资源
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
    clearFrames()
    const url = URL.createObjectURL(file)
    videoUrlRef.current = url
    setVideoUrl(url)
    setFileName(file.name)
    setDuration(0)
    setVideoSize(null)
    setCurrentTime(0)
    setIsPlaying(false)
    setVideoError(null)
  }

  // 移除当前视频
  const removeVideo = () => {
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current)
    videoUrlRef.current = null
    clearFrames()
    setVideoUrl(null)
    setFileName('')
    setDuration(0)
    setVideoSize(null)
    setCurrentTime(0)
    setIsPlaying(false)
    setVideoError(null)
  }

  const togglePlay = () => {
    const video = videoRef.current
    // 抽帧过程中保持暂停，避免播放干扰串行 seek
    if (!video || isExtracting) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  // 手动截取当前帧（保存为 PNG，下载时再按格式转码）
  const captureCurrentFrame = async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || video.readyState < 2) return
    const blob = await captureFrameToBlob(video, 'image/png')
    if (!blob) {
      alert(FRAME_CAPTURE_ERROR)
      return
    }
    const frame: CapturedFrame = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      url: URL.createObjectURL(blob),
      blob,
      time: video.currentTime,
    }
    setFrames((prev) => [...prev, frame])
    trackToolUse('video_frame', 'capture')
  }

  const removeFrame = (id: string) => {
    const frame = framesRef.current.find((f) => f.id === id)
    if (frame) URL.revokeObjectURL(frame.url)
    setFrames((prev) => prev.filter((f) => f.id !== id))
  }

  // 下载单张截帧（按当前导出格式/质量转码）
  const downloadFrame = async (frame: CapturedFrame) => {
    let blob = frame.blob
    let ext = 'png'
    if (exportFormat !== 'png') {
      try {
        const img = await loadImage(frame.url)
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const converted = await canvasToBlob(canvas, FORMAT_MIME[exportFormat], exportQuality)
          // 个别浏览器不支持 WebP 编码时会回退为 PNG
          if (converted) {
            blob = converted
            ext = converted.type === FORMAT_MIME.png ? 'png' : FORMAT_EXT[exportFormat]
          }
        }
      } catch {
        // 转码失败时回退 PNG
      }
    }
    downloadBlob(blob, `frame_${frame.time.toFixed(2).replace('.', '_')}.${ext}`)
    trackToolExport('video_frame', 'single', { format: exportFormat })
  }

  // 预计抽帧数量
  const estimatedFrames =
    duration > 0 && extractInterval > 0 ? Math.max(1, Math.ceil(duration / extractInterval)) : 0

  // 按间隔批量抽帧，ZIP 打包下载
  const runBatchExtract = async () => {
    const video = videoRef.current
    if (!video || !videoUrl || duration <= 0 || extractInterval <= 0) return

    const total = Math.max(1, Math.ceil(duration / extractInterval))
    // 长视频大量抽帧前二次确认
    if (total > 300) {
      const ok = window.confirm(
        `按当前间隔预计抽取 ${total} 帧，处理可能耗时较长（视频越长越慢），是否继续？`
      )
      if (!ok) return
    }

    setIsExtracting(true)
    setExtractProgress({ current: 0, total })
    video.pause()

    try {
      const zip = new JSZip()
      const quality = exportFormat === 'png' ? undefined : exportQuality
      let failedFrames = 0
      let consecutiveFailures = 0

      for (let i = 0; i < total; i++) {
        const t = i * extractInterval
        await seekTo(t)
        const blob = await captureFrameToBlob(video, FORMAT_MIME[exportFormat], quality)
        if (blob) {
          const ext = blob.type === FORMAT_MIME.png ? 'png' : FORMAT_EXT[exportFormat]
          zip.file(`frame_${String(i + 1).padStart(4, '0')}.${ext}`, blob)
          consecutiveFailures = 0
        } else {
          failedFrames++
          consecutiveFailures++
          // 连续多帧失败说明该视频大概率无法被当前浏览器捕获，提前中止
          if (consecutiveFailures >= 5) {
            throw new Error(FRAME_CAPTURE_ERROR)
          }
        }
        setExtractProgress({ current: i + 1, total })
      }

      if (failedFrames === total) {
        throw new Error(FRAME_CAPTURE_ERROR)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(zipBlob, `video-frames-${getFileTimestamp()}.zip`)
      trackToolExport('video_frame', 'zip_batch', { format: exportFormat, count: total })
      if (failedFrames > 0) {
        alert(`已完成，其中 ${failedFrames} 帧捕获失败已跳过`)
      }
    } catch (error) {
      console.error('批量抽帧失败:', error)
      alert(`批量抽帧失败：${error instanceof Error ? error.message : '请重试'}`)
    } finally {
      setIsExtracting(false)
      setExtractProgress(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadVideoFile(file)
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* 页头 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Film className="w-8 h-8" />
            视频截帧
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            在浏览器中直接从本地视频截取画面，支持逐帧定位、单帧导出与按间隔批量抽帧打包，视频不上传，隐私安全。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 左侧：导出与抽帧设置 */}
          <div className="col-span-1 lg:col-span-3 order-3 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">导出设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* 导出格式 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">导出格式</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={exportFormat === 'png' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => setExportFormat('png')}
                    >
                      PNG
                    </Button>
                    <Button
                      variant={exportFormat === 'jpeg' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => setExportFormat('jpeg')}
                    >
                      JPEG
                    </Button>
                    <Button
                      variant={exportFormat === 'webp' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => setExportFormat('webp')}
                    >
                      WebP
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG 无损；JPEG/WebP 体积更小</p>
                </div>

                {/* 质量（仅 JPEG/WebP） */}
                {exportFormat !== 'png' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">质量：{Math.round(exportQuality * 100)}%</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                {/* 批量抽帧 */}
                <div className="space-y-3 border-t pt-4">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    批量自动抽帧
                  </label>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      抽帧间隔：{extractInterval.toFixed(1)} 秒
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="30"
                      step="0.1"
                      value={extractInterval}
                      onChange={(e) => setExtractInterval(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  {videoUrl && duration > 0 && (
                    <p
                      className={`text-xs ${
                        estimatedFrames > 200 ? 'text-yellow-600' : 'text-muted-foreground'
                      }`}
                    >
                      预计抽取 {estimatedFrames} 帧
                      {estimatedFrames > 200 && '，数量较多，处理可能耗时较长'}
                    </p>
                  )}
                  {isExtracting && extractProgress ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        正在抽帧 {extractProgress.current}/{extractProgress.total}
                      </p>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.round((extractProgress.current / extractProgress.total) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={runBatchExtract}
                      disabled={!videoUrl || duration <= 0}
                      size="sm"
                      className="w-full flex items-center gap-2 text-xs"
                    >
                      <Package className="w-4 h-4" />
                      开始抽帧并打包 ZIP
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间：视频播放器 */}
          <div className="col-span-1 lg:col-span-6 order-1 lg:order-2 space-y-4">
            <Card>
              <CardContent className="p-3 md:p-4">
                {!videoUrl ? (
                  // 上传区
                  <div
                    className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/20 hover:border-primary/50'
                    }`}
                    style={{ minHeight: '360px' }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragOver(true)
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="text-center text-muted-foreground">
                      <Upload size={48} className="mx-auto" />
                      <p className="mt-3 text-sm font-medium">点击选择或拖拽视频到此处</p>
                      <p className="text-xs opacity-70 mt-1">支持 MP4、WebM 等浏览器可播放的格式</p>
                      <p className="text-xs opacity-70 mt-1">视频仅在本地处理，不会上传服务器</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 视频画面 */}
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full max-h-[420px] object-contain"
                        playsInline
                        preload="auto"
                        onClick={togglePlay}
                        onLoadedMetadata={(e) => {
                          const v = e.currentTarget
                          setDuration(Number.isFinite(v.duration) ? v.duration : 0)
                          setVideoSize({ width: v.videoWidth, height: v.videoHeight })
                        }}
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onError={() =>
                          setVideoError('当前浏览器无法解码该视频，请更换 MP4 / WebM 等常用格式')
                        }
                      />
                      {videoError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-sm px-4 text-center gap-3">
                          <span>{videoError}</span>
                          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            重新选择视频
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 播放控制条 */}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={togglePlay}
                        disabled={!!videoError || isExtracting}
                        title={isPlaying ? '暂停（空格）' : '播放（空格）'}
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => stepFrame(-1)}
                        disabled={isExtracting || !!videoError}
                        title="上一帧（←）"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => stepFrame(1)}
                        disabled={isExtracting || !!videoError}
                        title="下一帧（→）"
                      >
                        <ChevronRight size={16} />
                      </Button>
                      <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.01}
                        value={Math.min(currentTime, duration || 0)}
                        disabled={isExtracting || !!videoError}
                        onChange={(e) => {
                          const t = parseFloat(e.target.value)
                          setCurrentTime(t)
                          if (videoRef.current) videoRef.current.currentTime = t
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        className="h-9 flex items-center gap-1.5"
                        onClick={captureCurrentFrame}
                        disabled={isExtracting || !!videoError}
                        title="截取当前帧"
                      >
                        <Camera size={16} />
                        截帧
                      </Button>
                    </div>

                    {/* 视频信息 */}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate max-w-[60%]" title={fileName}>
                        🎬 {fileName}
                        {videoSize && ` · ${videoSize.width}×${videoSize.height}`}
                        {duration > 0 && ` · ${formatTime(duration)}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden md:inline">
                          快捷键：空格 播放/暂停 · ←/→ 逐帧
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={removeVideo}
                          disabled={isExtracting}
                        >
                          <X size={12} className="mr-1" />
                          移除视频
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：截帧列表 */}
          <div className="col-span-1 lg:col-span-3 order-2 lg:order-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">截帧列表（{frames.length}）</CardTitle>
                {frames.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-500 hover:text-red-700"
                    onClick={clearFrames}
                  >
                    <Trash2 size={12} className="mr-1" />
                    清空
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {frames.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-10">
                    <Camera size={32} className="mx-auto mb-2 opacity-50" />
                    <p>暂无截帧</p>
                    <p className="text-xs opacity-70 mt-1">
                      播放视频到目标画面后，点击「截帧」按钮保存当前帧
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[640px] overflow-y-auto pr-1">
                    {frames.map((frame) => (
                      <div key={frame.id} className="relative group rounded-lg overflow-hidden border">
                        <img
                          src={frame.url}
                          alt={`截帧 ${formatTimePrecise(frame.time)}`}
                          className="w-full aspect-video object-cover bg-black"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded tabular-nums">
                          {formatTimePrecise(frame.time)}
                        </span>
                        <div className="absolute top-1 right-1 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                            onClick={() => downloadFrame(frame)}
                            title="下载此帧"
                          >
                            <Download size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFrame(frame.id)}
                            title="删除此帧"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SEO：功能特性 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: '逐帧精确定位',
                desc: '播放、暂停配合方向键逐帧步进（约 1/25 秒），精准停在想要的画面',
              },
              {
                title: '高清原始分辨率导出',
                desc: '按视频原始分辨率截取，不缩水，支持 PNG / JPEG / WebP 与质量调节',
              },
              {
                title: '按间隔批量抽帧',
                desc: '设置秒数间隔自动抽取全片帧画面，一键打包 ZIP 下载，附实时进度',
              },
              {
                title: '本地处理隐私安全',
                desc: '所有操作在浏览器内完成，视频不上传服务器，免费无限制',
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SEO：使用场景 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">使用场景</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              {
                title: '视频封面制作',
                desc: '从素材中逐帧挑选光线、表情最理想的瞬间，导出作为视频封面或宣传图',
              },
              {
                title: '动画与运动研究',
                desc: '逐帧查看动画、体育动作或舞蹈分解，观察每一帧的细节变化',
              },
              {
                title: '教程与文档配图',
                desc: '把操作录屏的关键步骤截成图片，插入图文教程，步骤一目了然',
              },
              {
                title: '镜头与内容分析',
                desc: '批量抽帧快速浏览整支视频的镜头节奏与画面构成，辅助剪辑策划',
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SEO：常见问题 */}
        <section className="mt-12 mb-4">
          <h2 className="text-2xl font-bold text-center mb-6">常见问题</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                q: '支持哪些视频格式？',
                a: '取决于浏览器自身的能力，通常支持 MP4（H.264）、WebM（VP8/VP9）等主流格式。若提示无法解码，请将视频转换为 MP4 后重试。',
              },
              {
                q: '逐帧步进的精度是多少？',
                a: '由于浏览器无法直接读取视频帧率，逐帧步进按每秒 25 帧（即 0.04 秒）计算，可满足绝大多数精确定位需求。',
              },
              {
                q: '批量抽帧会损失画质吗？',
                a: 'PNG 为无损格式，画质与视频原始画面一致；JPEG / WebP 为有损压缩，可通过质量滑块在体积与画质之间权衡。',
              },
              {
                q: '长视频批量抽帧很慢怎么办？',
                a: '抽帧需要在浏览器中逐个时间点定位并绘制画面，视频越长帧数越多耗时越久。建议先增大抽帧间隔（如 5 秒以上）再开始，或分段截取。',
              },
              {
                q: '我的视频会被上传吗？',
                a: '不会。本工具完全在浏览器本地运行，视频文件不会离开你的设备，关闭页面后即释放，请放心使用。',
              },
            ].map((item) => (
              <Card key={item.q}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-base mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 隐藏的文件选择框 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) loadVideoFile(file)
            // 重置 value，确保同一文件可再次选择
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
