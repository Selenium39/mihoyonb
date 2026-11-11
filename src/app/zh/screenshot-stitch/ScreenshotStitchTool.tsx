'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlignVerticalJustifyCenter,
  ArrowDown,
  ArrowUp,
  ClipboardCopy,
  Download,
  Film,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { trackToolExport, trackToolUse } from '@/lib/analytics'
import { localizedPath, type Locale } from '@/lib/i18n'
import { bandSignature } from '@/lib/stitch-pixels'
import { detectChangeBand, detectEdgeBand, segmentBySignature } from '@/lib/stitch-band'
import {
  canvasToPng,
  drawStitch,
  grayThumb,
  loadImageFile,
  openVideo,
  PROFILE_ROWS,
  PROFILE_WIDTH,
  releaseVideo,
  sampleVideo,
  snapshotVideo,
  type StitchVisual,
} from '@/lib/stitch-media'
import { clampBand, compareFileNames, formatTimestamp } from '@/lib/stitch-plan'
import { getScreenshotStitchCopy } from './copy'
import { makeExampleClip, makeExampleScreenshots } from './examples'

type SourceKind = 'images' | 'video'
type WidthPreset = 'source' | '720' | '1080' | '1440'
type LayoutMode = 'band' | 'full'

interface StitchFrame {
  id: string
  name: string
  width: number
  height: number
  bitmap: ImageBitmap | null
  thumbUrl: string
  included: boolean
  time: number | null
  mean: Float64Array | null
  edge: Float64Array | null
  gray: Uint8Array | null
}

function classify(file: File): 'image' | 'video' | null {
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('image/')) return 'image'
  const name = file.name.toLowerCase()
  if (/\.(mp4|mov|webm|m4v)$/.test(name)) return 'video'
  if (/\.(png|jpe?g|webp|gif|bmp)$/.test(name)) return 'image'
  return null
}

function closeFrames(frames: readonly StitchFrame[]) {
  for (const frame of frames) frame.bitmap?.close()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function fileStamp(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

export default function ScreenshotStitchTool({ locale }: { locale: Locale }) {
  const copy = getScreenshotStitchCopy(locale)
  const homeHref = localizedPath(locale, '/')
  const inputRef = useRef<HTMLInputElement>(null)
  const generationRef = useRef(0)
  const videoRef = useRef<{ video: HTMLVideoElement; url: string } | null>(null)
  const framesRef = useRef<StitchFrame[]>([])
  const sourceRef = useRef<SourceKind | null>(null)
  const addFilesRef = useRef<(files: File[]) => Promise<void>>(async () => {})

  const [frames, setFrames] = useState<StitchFrame[]>([])
  const [source, setSource] = useState<SourceKind | null>(null)
  const [mode, setMode] = useState<LayoutMode>('band')
  const [bandTop, setBandTop] = useState(70)
  const [bandHeight, setBandHeight] = useState(18)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [keepFirstFull, setKeepFirstFull] = useState(true)
  const [widthPreset, setWidthPreset] = useState<WidthPreset>('source')
  const [exportScale, setExportScale] = useState<1 | 2>(1)
  const [showTime, setShowTime] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  framesRef.current = frames
  sourceRef.current = source
  addFilesRef.current = addFiles

  useEffect(() => {
    return () => {
      generationRef.current += 1
      closeFrames(framesRef.current)
      if (videoRef.current) releaseVideo(videoRef.current.video, videoRef.current.url)
    }
  }, [])

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const target = event.target
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      const files = Array.from(event.clipboardData?.files ?? [])
      if (files.length === 0) return
      event.preventDefault()
      void addFilesRef.current(files)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  function resetMedia(nextGeneration: number) {
    generationRef.current = nextGeneration
    closeFrames(framesRef.current)
    if (videoRef.current) {
      releaseVideo(videoRef.current.video, videoRef.current.url)
      videoRef.current = null
    }
    setFrames([])
    setSource(null)
  }

  function publishBand(detected: { band: { top: number; height: number }; confidence: number } | null, fallback: boolean) {
    if (detected) {
      setBandTop(Math.round(detected.band.top * 1000) / 10)
      setBandHeight(Math.round(detected.band.height * 1000) / 10)
      setConfidence(detected.confidence)
      setMode('band')
      return
    }
    setConfidence(fallback ? 0 : null)
    if (fallback) {
      setBandTop(78)
      setBandHeight(16)
      setMode('band')
    } else {
      setMode('full')
    }
  }

  async function runImages(files: File[], replace = false) {
    const generation = generationRef.current + 1
    const previous = framesRef.current
    const appending = !replace && sourceRef.current === 'images'
    if (!appending) resetMedia(generation)
    else generationRef.current = generation
    setBusy(true)
    const loaded: StitchFrame[] = []
    let failed = false
    const ordered = [...files].sort((a, b) => compareFileNames(a.name, b.name))
    for (let index = 0; index < ordered.length; index++) {
      if (generationRef.current !== generation) return
      setStatus(copy.status.reading(index + 1, ordered.length))
      try {
        const image = await loadImageFile(ordered[index])
        loaded.push({
          id: crypto.randomUUID(),
          name: ordered[index].name || `image-${index + 1}`,
          width: image.width,
          height: image.height,
          bitmap: image.bitmap,
          thumbUrl: grayThumb(image.profile.gray, PROFILE_WIDTH, PROFILE_ROWS),
          included: true,
          time: null,
          mean: image.profile.mean,
          edge: image.profile.edge,
          gray: image.profile.gray,
        })
      } catch {
        failed = true
      }
    }
    if (generationRef.current !== generation) {
      closeFrames(loaded)
      return
    }
    const next = appending ? [...previous, ...loaded] : loaded
    const detected = detectChangeBand(next.map((frame) => frame.mean).filter((profile): profile is Float64Array => Boolean(profile)))
    publishBand(detected, false)
    setSource('images')
    setFrames(next)
    setBusy(false)
    trackToolUse('screenshot_stitch', 'add_images', { count: loaded.length })
    if (loaded.length === 0) setStatus(copy.status.readFailed)
    else if (detected && detected.confidence < 0.25) setStatus(copy.status.lowConfidence)
    else if (!detected && next.length >= 2) setStatus(copy.status.lowConfidence)
    else if (next.length < 2) setStatus(failed ? copy.status.readFailed : copy.status.needShots)
    else setStatus(failed ? copy.status.readFailed : copy.status.imagesReady(next.length))
  }

  async function runVideo(file: File): Promise<number> {
    const generation = generationRef.current + 1
    resetMedia(generation)
    setBusy(true)
    setStatus(copy.status.sampling(0, 1))
    try {
      const opened = await openVideo(file)
      if (generationRef.current !== generation) {
        releaseVideo(opened.video, opened.url)
        return 0
      }
      videoRef.current = opened
      const samples = await sampleVideo(
        opened.video,
        (done, total) => {
          if (generationRef.current === generation) setStatus(copy.status.sampling(done, total))
        },
        () => generationRef.current !== generation,
      )
      if (generationRef.current !== generation) return 0
      if (samples.length === 0) {
        setBusy(false)
        setStatus(copy.status.videoFailed)
        return 0
      }
      const detected = detectEdgeBand(samples.map((sample) => sample.profile.edge))
      const band = detected?.band ?? { top: 0.78, height: 0.16 }
      const signatures = samples.map((sample) =>
        bandSignature(sample.profile.gray, PROFILE_WIDTH, PROFILE_ROWS, band),
      )
      const segments = segmentBySignature(
        signatures.map((item) => item.vector),
        signatures.map((item) => item.contrast),
      )
      const picks = new Set(segments.map((segment) => segment.pick))
      const next: StitchFrame[] = samples.map((sample, index) => ({
        id: crypto.randomUUID(),
        name: formatTimestamp(sample.time),
        width: opened.video.videoWidth || PROFILE_WIDTH,
        height: opened.video.videoHeight || PROFILE_ROWS,
        bitmap: null,
        thumbUrl: grayThumb(sample.profile.gray, PROFILE_WIDTH, PROFILE_ROWS),
        included: picks.size > 0 ? picks.has(index) : index % 8 === 0,
        time: sample.time,
        mean: sample.profile.mean,
        edge: sample.profile.edge,
        gray: sample.profile.gray,
      }))
      publishBand(detected, true)
      setSource('video')
      setFrames(next)
      setBusy(false)
      trackToolUse('screenshot_stitch', 'sample_video', {
        samples: samples.length,
        lines: next.filter((frame) => frame.included).length,
        seconds: Math.round(opened.video.duration || 0),
      })
      setStatus(
        detected
          ? copy.status.videoReady(next.filter((frame) => frame.included).length, samples.length)
          : copy.status.bandFallback,
      )
      for (const frame of next) {
        if (!frame.included || frame.time == null) continue
        if (generationRef.current !== generation) return 0
        try {
          const shot = await snapshotVideo(opened.video, frame.time, 960)
          if (generationRef.current !== generation) {
            shot.bitmap.close()
            return 0
          }
          setFrames((current) =>
            current.map((item) =>
              item.id === frame.id
                ? { ...item, bitmap: shot.bitmap, width: shot.width, height: shot.height }
                : item,
            ),
          )
        } catch {
          // 这一帧留缩略图，导出时再试一次
        }
      }
      return next.filter((frame) => frame.included).length
    } catch {
      if (generationRef.current === generation) {
        setBusy(false)
        setStatus(copy.status.videoFailed)
      }
      return 0
    }
  }

  async function addFiles(list: File[]) {
    const images: File[] = []
    let video: File | null = null
    for (const file of list) {
      const kind = classify(file)
      if (kind === 'video' && !video) video = file
      else if (kind === 'image') images.push(file)
    }
    if (video) {
      if (images.length > 0) setStatus(copy.status.videoIgnoredImages)
      await runVideo(video)
      return
    }
    if (images.length === 0) {
      setStatus(copy.status.readFailed)
      return
    }
    await runImages(images)
  }

  function remeasure() {
    if (source === 'video') {
      const edges = frames.map((frame) => frame.edge).filter((profile): profile is Float64Array => Boolean(profile))
      const detected = detectEdgeBand(edges)
      publishBand(detected, true)
      setStatus(detected ? copy.status.videoReady(frames.filter((frame) => frame.included).length, frames.length) : copy.status.bandFallback)
    } else {
      const means = frames.map((frame) => frame.mean).filter((profile): profile is Float64Array => Boolean(profile))
      const detected = detectChangeBand(means)
      publishBand(detected, false)
      setStatus(
        detected && detected.confidence < 0.25
          ? copy.status.lowConfidence
          : detected
            ? copy.status.imagesReady(frames.length)
            : copy.status.lowConfidence,
      )
    }
    trackToolUse('screenshot_stitch', 'remeasure', { source: source ?? 'none', count: frames.length })
  }

  async function toggleFrame(id: string) {
    const frame = frames.find((item) => item.id === id)
    if (!frame) return
    const included = !frame.included
    setFrames((current) => current.map((item) => (item.id === id ? { ...item, included } : item)))
    if (!included || frame.bitmap || frame.time == null || !videoRef.current) return
    const generation = generationRef.current
    try {
      const shot = await snapshotVideo(videoRef.current.video, frame.time, 960)
      if (generationRef.current !== generation) {
        shot.bitmap.close()
        return
      }
      setFrames((current) =>
        current.map((item) => {
          if (item.id !== id) return item
          item.bitmap?.close()
          return { ...item, bitmap: shot.bitmap, width: shot.width, height: shot.height }
        }),
      )
    } catch {
      setStatus(copy.status.videoFailed)
    }
  }

  function moveFrame(id: string, direction: -1 | 1) {
    setFrames((current) => {
      const index = current.findIndex((item) => item.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  function removeFrame(id: string) {
    setFrames((current) => {
      const frame = current.find((item) => item.id === id)
      frame?.bitmap?.close()
      return current.filter((item) => item.id !== id)
    })
  }

  function sortByName() {
    setFrames((current) => [...current].sort((a, b) => compareFileNames(a.name, b.name)))
    trackToolUse('screenshot_stitch', 'sort_name', { count: frames.length })
  }

  function clearAll() {
    generationRef.current += 1
    setBusy(false)
    closeFrames(framesRef.current)
    if (videoRef.current) {
      releaseVideo(videoRef.current.video, videoRef.current.url)
      videoRef.current = null
    }
    setFrames([])
    setSource(null)
    setStatus('')
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return null
    })
  }

  useEffect(() => {
    const included = frames.filter((frame) => frame.included && frame.bitmap)
    if (included.length === 0) {
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return null
      })
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const visuals: StitchVisual[] = included.map((frame) => ({
            source: frame.bitmap as CanvasImageSource,
            width: frame.width,
            height: frame.height,
            caption: showTime && frame.time != null ? formatTimestamp(frame.time) : null,
          }))
          const { canvas } = drawStitch(visuals, {
            mode,
            band: clampBand(bandTop, bandHeight),
            targetWidth: 640,
            scale: 1,
            keepFirstFull,
            maxPixels: 8_000_000,
          })
          const blob = await canvasToPng(canvas)
          if (cancelled) return
          const url = URL.createObjectURL(blob)
          setPreviewUrl((current) => {
            if (current) URL.revokeObjectURL(current)
            return url
          })
        } catch {
          // 预览失败时保留上一张，导出仍会再画一次
        }
      })()
    }, 80)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [frames, mode, bandTop, bandHeight, keepFirstFull, showTime])

  async function exportPng() {
    const included = frames.filter((frame) => frame.included)
    if (included.length === 0) {
      setStatus(copy.status.nothingIncluded)
      return
    }
    setExporting(true)
    const temporary: ImageBitmap[] = []
    try {
      const visuals: StitchVisual[] = []
      for (const frame of included) {
        if (frame.time != null && videoRef.current) {
          const native = videoRef.current.video.videoWidth || frame.width
          const wanted = (widthPreset === 'source' ? native : Number(widthPreset)) * exportScale
          const shot = await snapshotVideo(videoRef.current.video, frame.time, Math.max(320, wanted))
          temporary.push(shot.bitmap)
          visuals.push({
            source: shot.bitmap,
            width: shot.width,
            height: shot.height,
            caption: showTime ? formatTimestamp(frame.time) : null,
          })
        } else if (frame.bitmap) {
          visuals.push({
            source: frame.bitmap,
            width: frame.width,
            height: frame.height,
            caption: null,
          })
        }
      }
      if (visuals.length === 0) {
        setStatus(copy.status.nothingIncluded)
        return
      }
      const { canvas, plan } = drawStitch(visuals, {
        mode,
        band: clampBand(bandTop, bandHeight),
        targetWidth: widthPreset === 'source' ? 0 : Number(widthPreset),
        scale: exportScale,
        keepFirstFull,
      })
      const blob = await canvasToPng(canvas)
      downloadBlob(blob, `long-screenshot-${fileStamp()}.png`)
      trackToolExport('screenshot_stitch', 'png', {
        mode,
        scale: exportScale,
        width: widthPreset,
        rows: visuals.length,
        source: source ?? 'images',
        timestamps: showTime,
        capped: plan.capped,
      })
      setStatus(plan.capped ? copy.status.capped : copy.status.exported)
    } catch {
      setStatus(copy.status.readFailed)
    } finally {
      temporary.forEach((bitmap) => bitmap.close())
      setExporting(false)
    }
  }

  async function copyTimes() {
    const lines = frames
      .filter((frame) => frame.included && frame.time != null)
      .map((frame) => formatTimestamp(frame.time as number))
    if (lines.length === 0) return
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
      trackToolExport('screenshot_stitch', 'timestamps', { count: lines.length })
    } catch {
      setStatus(copy.controls.copyFailed)
    }
  }

  async function loadExample(kind: 'images' | 'video') {
    setBusy(true)
    try {
      if (kind === 'images') {
        const files = await makeExampleScreenshots()
        trackToolUse('screenshot_stitch', 'example', { kind: 'images' })
        await runImages(files, true)
        setStatus(copy.status.exampleShots)
      } else {
        const file = await makeExampleClip()
        trackToolUse('screenshot_stitch', 'example', { kind: 'video' })
        const lines = await runVideo(file)
        if (lines > 0) setStatus(copy.status.exampleClip)
      }
    } catch {
      setBusy(false)
      setStatus(copy.examples.failed)
    }
  }

  const includedCount = frames.filter((frame) => frame.included).length
  const hasTimes = frames.some((frame) => frame.included && frame.time != null)
  const band = clampBand(bandTop, bandHeight)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav aria-label={copy.breadcrumb.label} className="mb-4 text-sm text-muted-foreground">
          <Link href={homeHref} className="hover:text-foreground">
            {copy.breadcrumb.home}
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-foreground">{copy.breadcrumb.current}</span>
        </nav>

        <header className="mb-6 text-center">
          <h1 className="mb-3 flex flex-col items-center justify-center gap-2 text-center text-3xl font-bold text-foreground sm:flex-row sm:text-4xl">
            <AlignVerticalJustifyCenter className="h-8 w-8 shrink-0 text-violet-700 dark:text-violet-300" />
            <span>{copy.hero.title}</span>
          </h1>
          <p className="mx-auto max-w-3xl text-sm leading-6 text-muted-foreground md:text-lg md:leading-8">
            {copy.hero.intro}
          </p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {copy.hero.badges.map((badge) => (
              <li key={badge} className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-foreground">
                {badge}
              </li>
            ))}
          </ul>
        </header>

        <div className="mb-6 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
          {copy.honesty}
        </div>

        <noscript>
          <p className="mb-6 rounded-lg border px-4 py-3 text-sm text-muted-foreground">{copy.noscript}</p>
        </noscript>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-3 p-4">
                <button
                  type="button"
                  className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors hover:border-violet-600/60 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    void addFiles(Array.from(event.dataTransfer.files))
                  }}
                  aria-label={copy.drop.aria}
                >
                  <Upload className="mb-2 h-6 w-6 text-violet-700 dark:text-violet-300" />
                  <span className="font-medium text-foreground">{copy.drop.title}</span>
                  <span className="mt-1 text-sm text-muted-foreground">{copy.drop.paste}</span>
                  <span className="mt-2 text-xs text-muted-foreground">{copy.drop.hint}</span>
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  className="sr-only"
                  accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm,image/*,video/*"
                  multiple
                  onChange={(event) => {
                    const selected = Array.from(event.target.files ?? [])
                    event.target.value = ''
                    if (selected.length) void addFiles(selected)
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
                    {copy.drop.browse}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void loadExample('images')} disabled={busy}>
                    <ImagePlus className="mr-1.5 h-4 w-4" />
                    {copy.examples.shots}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void loadExample('video')} disabled={busy}>
                    <Film className="mr-1.5 h-4 w-4" />
                    {copy.examples.clip}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{copy.list.title(frames.length, includedCount)}</CardTitle>
                <div className="flex gap-2">
                  {source === 'images' && frames.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={sortByName}>
                      {copy.list.sort}
                    </Button>
                  )}
                  {frames.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                      {copy.list.clear}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {frames.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{copy.list.empty}</p>
                ) : (
                  <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                    {frames.map((frame, index) => (
                      <li key={frame.id} className="flex items-center gap-2 rounded-md border p-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 accent-violet-700"
                          checked={frame.included}
                          aria-label={copy.list.include}
                          onChange={() => void toggleFrame(frame.id)}
                        />
                        {frame.thumbUrl ? (
                          // 缩略图是当场从像素画出来的 data URL，不走 next/image
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={frame.thumbUrl} alt="" width={72} height={40} className="h-10 w-[4.5rem] rounded object-cover" />
                        ) : null}
                        <span className="min-w-0 flex-1 truncate text-xs text-foreground" title={frame.name}>
                          {frame.name}
                        </span>
                        {source === 'images' && (
                          <span className="flex shrink-0 gap-1">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={copy.list.moveUp} disabled={index === 0} onClick={() => moveFrame(frame.id, -1)}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={copy.list.moveDown} disabled={index === frames.length - 1} onClick={() => moveFrame(frame.id, 1)}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={copy.list.remove} onClick={() => removeFrame(frame.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{copy.controls.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant={mode === 'band' ? 'default' : 'outline'} onClick={() => setMode('band')} aria-pressed={mode === 'band'}>
                    {copy.controls.modeBand}
                  </Button>
                  <Button type="button" size="sm" variant={mode === 'full' ? 'default' : 'outline'} onClick={() => setMode('full')} aria-pressed={mode === 'full'}>
                    {copy.controls.modeFull}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={remeasure} disabled={frames.length < 2 || busy}>
                    {copy.controls.redetect}
                  </Button>
                </div>

                <div className={mode === 'full' ? 'space-y-3 opacity-50' : 'space-y-3'}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{copy.controls.band}</span>
                    <span className="text-muted-foreground">
                      {copy.controls.top} {Math.round(band.top * 100)}% · {copy.controls.height} {Math.round(band.height * 100)}%
                      {confidence != null ? ` · ${Math.round(confidence * 100)}%` : ''}
                    </span>
                  </div>
                  <label className="block text-xs text-muted-foreground">
                    {copy.controls.top}
                    <Slider
                      className="mt-2"
                      min={0}
                      max={98}
                      step={0.5}
                      value={[bandTop]}
                      disabled={mode === 'full'}
                      onValueChange={(value) => {
                        const next = clampBand(value[0] ?? 0, bandHeight)
                        setBandTop(Math.round(next.top * 1000) / 10)
                        setBandHeight(Math.round(next.height * 1000) / 10)
                      }}
                    />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    {copy.controls.height}
                    <Slider
                      className="mt-2"
                      min={2}
                      max={100}
                      step={0.5}
                      value={[bandHeight]}
                      disabled={mode === 'full'}
                      onValueChange={(value) => {
                        const next = clampBand(bandTop, value[0] ?? 2)
                        setBandTop(Math.round(next.top * 1000) / 10)
                        setBandHeight(Math.round(next.height * 1000) / 10)
                      }}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-violet-700"
                      checked={keepFirstFull}
                      disabled={mode === 'full'}
                      onChange={(event) => setKeepFirstFull(event.target.checked)}
                    />
                    {copy.controls.keepFirst}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-muted-foreground">{copy.controls.width}</span>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={widthPreset}
                      onChange={(event) => setWidthPreset(event.target.value as WidthPreset)}
                    >
                      <option value="source">{copy.controls.widths.source}</option>
                      <option value="720">{copy.controls.widths.w720}</option>
                      <option value="1080">{copy.controls.widths.w1080}</option>
                      <option value="1440">{copy.controls.widths.w1440}</option>
                    </select>
                  </label>
                  <div>
                    <span className="mb-1 block text-xs text-muted-foreground">{copy.controls.scale}</span>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant={exportScale === 1 ? 'default' : 'outline'} onClick={() => setExportScale(1)} aria-pressed={exportScale === 1}>
                        {copy.controls.scale1}
                      </Button>
                      <Button type="button" size="sm" variant={exportScale === 2 ? 'default' : 'outline'} onClick={() => setExportScale(2)} aria-pressed={exportScale === 2}>
                        {copy.controls.scale2}
                      </Button>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-violet-700"
                    checked={showTime}
                    onChange={(event) => setShowTime(event.target.checked)}
                  />
                  <span>
                    {copy.controls.time}
                    <span className="mt-0.5 block text-xs text-muted-foreground">{copy.controls.timeHint}</span>
                  </span>
                </label>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => void exportPng()} disabled={exporting || busy || includedCount === 0}>
                    {exporting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
                    {exporting ? copy.controls.exporting : copy.controls.export}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => void copyTimes()} disabled={!hasTimes}>
                    <ClipboardCopy className="mr-1.5 h-4 w-4" />
                    {copied ? copy.controls.copied : copy.controls.copyTimes}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{copy.preview.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {status && (
                  <p className="mb-3 text-sm text-muted-foreground" role="status">
                    {busy && <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" />}
                    {status}
                  </p>
                )}
                {previewUrl ? (
                  <div className="max-h-[70vh] overflow-auto rounded-md border bg-muted/40">
                    {/* 预览是本地 blob，尺寸随拼接结果变化 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt={copy.preview.alt} className="mx-auto block max-w-full" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.preview.empty}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 space-y-12 text-foreground">
          <section id="how-to">
            <h2 className="mb-3 text-center text-2xl font-bold">{copy.howTo.title}</h2>
            <p className="mx-auto mb-6 max-w-3xl text-center text-sm leading-6 text-muted-foreground">{copy.howTo.intro}</p>
            <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {copy.howTo.steps.map((step, index) => (
                <li key={step.title}>
                  <Card className="h-full">
                    <CardContent className="p-5">
                      <p className="mb-2 text-xs font-semibold text-violet-700 dark:text-violet-300">{index + 1}</p>
                      <h3 className="mb-1.5 font-semibold">{step.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </section>

          <section id="how-it-measures" className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold">{copy.article.title}</h2>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              {copy.article.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold">{copy.compare.title}</h2>
            <p className="mb-4 max-w-3xl text-sm leading-6 text-muted-foreground">{copy.compare.intro}</p>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-semibold">{copy.compare.columns.job}</th>
                    <th scope="col" className="px-3 py-2 font-semibold">{copy.compare.columns.keeps}</th>
                    <th scope="col" className="px-3 py-2 font-semibold">{copy.compare.columns.when}</th>
                  </tr>
                </thead>
                <tbody>
                  {copy.compare.rows.map((row) => (
                    <tr key={row.job} className="border-t align-top">
                      <th scope="row" className="px-3 py-2 font-medium">{row.job}</th>
                      <td className="px-3 py-2 text-muted-foreground">{row.keeps}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">{copy.sections.features}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {copy.features.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="p-5 text-center">
                    <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">{copy.sections.scenarios}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {copy.scenarios.map((scenario) => (
                <Card key={scenario.title}>
                  <CardContent className="p-5">
                    <h3 className="mb-1 font-semibold">{scenario.title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{scenario.description}</p>
                  </CardContent>
                </Card>
              ))}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {copy.related.map((tool) => (
                <Link key={tool.href} href={tool.href} className="block h-full">
                  <Card className="h-full transition-colors hover:border-violet-600/50">
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
