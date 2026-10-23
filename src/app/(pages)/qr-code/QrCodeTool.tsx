'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  QrCode as QrCodeIcon,
  Download,
  Upload,
  Trash2,
  Palette,
  ShieldCheck,
  Sparkles,
  Image as ImageIcon,
  Link2,
  Wifi,
  CreditCard,
  AlertCircle,
  Zap,
  Languages,
} from 'lucide-react'
import { siteConfig } from '@/config/site'
import { trackToolExport } from '@/lib/analytics'
import { alternateLocalePath, type Locale } from '@/lib/i18n'
import { getQrCodeCopy, type ErrorLevel } from './copy'

const SIZE_PRESETS = [256, 512, 800, 1024, 2048]

// 透明底棋盘格样式：便于预览时识别透明背景区域
const CHECKER_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
}

/** 与 copy.ts 的 features / scenarios 顺序一一对应 */
const FEATURE_ICONS = [Zap, Palette, ImageIcon, ShieldCheck]
const SCENARIO_ICONS = [CreditCard, Link2, Wifi, Sparkles]

export interface QrCodeToolProps {
  locale: Locale
}

export default function QrCodeTool({ locale }: QrCodeToolProps) {
  const copy = getQrCodeCopy(locale)
  const currentPath = locale === 'en' ? '/en/qr-code' : '/qr-code'
  const switchHref = alternateLocalePath(currentPath)

  const [text, setText] = useState(siteConfig.domain)
  const [size, setSize] = useState(800)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [margin, setMargin] = useState(4)
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('Q')
  const [transparentBg, setTransparentBg] = useState(false)
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(20)
  const [logoRound, setLogoRound] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  // 缓存已解码的 Logo 图片，避免每次生成重复加载
  const logoImgRef = useRef<HTMLImageElement | null>(null)
  // 生成序号：丢弃防抖期间被新参数覆盖的过期结果
  const genIdRef = useRef(0)

  const loadLogo = useCallback(
    async (src: string): Promise<HTMLImageElement> => {
      if (logoImgRef.current?.src === src) return logoImgRef.current
      const img = new Image()
      img.src = src
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(copy.errors.logoLoadFailed))
      })
      logoImgRef.current = img
      return img
    },
    [copy]
  )

  const generate = useCallback(
    async (content: string, id: number) => {
      try {
        // 1. 隐藏 canvas 生成二维码本体（light 设为全透明，便于二次合成）
        const hidden = document.createElement('canvas')
        await QRCode.toCanvas(hidden, content, {
          width: size,
          margin,
          errorCorrectionLevel: errorLevel,
          color: { dark: fgColor, light: '#00000000' },
        })

        // 2. 新画布：按需铺背景色，再绘制二维码
        const finalCanvas = document.createElement('canvas')
        finalCanvas.width = size
        finalCanvas.height = size
        const ctx = finalCanvas.getContext('2d')
        if (!ctx) throw new Error(copy.errors.canvasFailed)
        if (!transparentBg) {
          ctx.fillStyle = bgColor
          ctx.fillRect(0, 0, size, size)
        }
        ctx.drawImage(hidden, 0, 0, size, size)

        // 3. 中央绘制 Logo：等比 contain 到 logoSize% 边长内，可选圆形裁切
        const logo = logoSrc ? await loadLogo(logoSrc) : null
        if (logo) {
          const box = (size * logoSize) / 100
          const ratio = logo.width / logo.height || 1
          const w = ratio >= 1 ? box : box * ratio
          const h = ratio >= 1 ? box / ratio : box
          const x = (size - w) / 2
          const y = (size - h) / 2
          if (logoRound) {
            ctx.save()
            ctx.beginPath()
            ctx.arc(size / 2, size / 2, box / 2, 0, Math.PI * 2)
            ctx.clip()
          }
          ctx.drawImage(logo, x, y, w, h)
          if (logoRound) ctx.restore()
        }

        if (id !== genIdRef.current) return
        setQrDataUrl(finalCanvas.toDataURL('image/png'))
        setErrorMsg(null)
      } catch (err) {
        if (id !== genIdRef.current) return
        const message = err instanceof Error ? err.message : copy.errors.unknown
        setQrDataUrl(null)
        setErrorMsg(
          message.includes('overflow') || message.includes('too long')
            ? copy.errors.tooLong
            : copy.errors.generateFailed(message)
        )
      }
    },
    [
      size,
      fgColor,
      bgColor,
      margin,
      errorLevel,
      transparentBg,
      logoSrc,
      logoSize,
      logoRound,
      loadLogo,
      copy,
    ]
  )

  // 任意参数变化重新生成（150ms 防抖，输入更流畅）
  useEffect(() => {
    const content = text.trim()
    if (!content) {
      setQrDataUrl(null)
      setErrorMsg(null)
      return
    }
    const id = ++genIdRef.current
    const timer = setTimeout(() => void generate(content, id), 150)
    return () => clearTimeout(timer)
  }, [text, generate])

  const handleLogoUpload = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setLogoSrc(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleLogoRemove = () => {
    setLogoSrc(null)
    logoImgRef.current = null
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const handleDownload = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.download = copy.downloadFileName(size)
    link.href = qrDataUrl
    link.click()
    trackToolExport('qr_code', 'download_png', { size, has_logo: !!logoSrc })
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
          <h1 className="text-4xl font-bold text-foreground mb-4">{copy.hero.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{copy.hero.intro}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 左侧：内容与参数 */}
          <div className="col-span-1 lg:col-span-7 order-2 lg:order-1 space-y-4">
            {/* 内容输入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <QrCodeIcon size={18} className="text-primary" />
                  {copy.content.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="qr-text">{copy.content.label}</Label>
                <Textarea
                  id="qr-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={copy.content.placeholder}
                  className="min-h-[90px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">{copy.content.hint}</p>
              </CardContent>
            </Card>

            {/* 样式设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette size={18} className="text-primary" />
                  {copy.style.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* 尺寸 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{copy.style.sizeLabel}</Label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {size} × {size} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={256}
                    max={2048}
                    step={16}
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="grid grid-cols-5 gap-1">
                    {SIZE_PRESETS.map((s) => (
                      <Button
                        key={s}
                        variant={size === s ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setSize(s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 颜色 */}
                <div className="space-y-2">
                  <Label>{copy.style.colorLabel}</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {copy.style.colorPresets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={
                          fgColor === preset.fg && bgColor === preset.bg ? 'default' : 'outline'
                        }
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          setFgColor(preset.fg)
                          setBgColor(preset.bg)
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{copy.style.foreground}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-10 h-8 rounded border cursor-pointer p-0.5"
                        />
                        <span className="text-xs text-muted-foreground font-mono">{fgColor}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">{copy.style.background}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          disabled={transparentBg}
                          className="w-10 h-8 rounded border cursor-pointer p-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <span className="text-xs text-muted-foreground font-mono">
                          {transparentBg ? copy.style.transparent : bgColor}
                        </span>
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                      className="w-4 h-4"
                    />
                    {copy.style.transparentBg}
                  </label>
                </div>

                {/* 边距 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{copy.style.marginLabel}</Label>
                    <span className="text-sm text-muted-foreground font-mono">{margin}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">{copy.style.marginHint}</p>
                </div>

                {/* 容错等级 */}
                <div className="space-y-2">
                  <Label>{copy.style.errorLevelLabel}</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {copy.style.errorLevels.map((level) => (
                      <Button
                        key={level.value}
                        variant={errorLevel === level.value ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs flex-col gap-0 py-1"
                        onClick={() => setErrorLevel(level.value)}
                        title={copy.style.errorLevelTitle(level.desc)}
                      >
                        <span className="font-semibold">{level.value}</span>
                        <span className="text-[10px] opacity-70">{level.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo 贴图 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon size={18} className="text-primary" />
                  {copy.logo.cardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    {logoSrc ? copy.logo.replace : copy.logo.upload}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={handleLogoRemove}
                    disabled={!logoSrc}
                  >
                    <Trash2 size={14} />
                    {copy.logo.remove}
                  </Button>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleLogoUpload(e.target.files?.[0])
                  }}
                />

                {logoSrc && (
                  <>
                    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoSrc}
                        alt={copy.logo.previewAlt}
                        className={`w-12 h-12 object-contain ${logoRound ? 'rounded-full' : ''}`}
                        style={CHECKER_STYLE}
                      />
                      <p className="text-xs text-muted-foreground">{copy.logo.hint}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{copy.logo.sizeLabel}</Label>
                        <span className="text-sm text-muted-foreground font-mono">
                          {copy.logo.sizeValue(logoSize)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={25}
                        step={1}
                        value={logoSize}
                        onChange={(e) => setLogoSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={logoRound}
                        onChange={(e) => setLogoRound(e.target.checked)}
                        className="w-4 h-4"
                      />
                      {copy.logo.round}
                    </label>

                    {errorLevel !== 'H' && (
                      <div className="flex items-center justify-between gap-2 rounded-md border border-amber-300/60 bg-amber-500/10 px-3 py-2">
                        <span className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                          <AlertCircle size={13} className="flex-shrink-0" />
                          {copy.logo.warn}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs flex-shrink-0"
                          onClick={() => setErrorLevel('H')}
                        >
                          {copy.logo.warnAction}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：预览与下载 */}
          <div className="col-span-1 lg:col-span-5 order-1 lg:order-2">
            <Card className="lg:sticky lg:top-20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{copy.preview.cardTitle}</span>
                  <span className="text-xs text-muted-foreground font-mono font-normal">
                    {size} × {size} px
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="flex items-center justify-center rounded-lg border p-4 min-h-[280px]"
                  style={transparentBg ? CHECKER_STYLE : undefined}
                >
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt={copy.preview.alt}
                      className="w-full max-w-[360px] h-auto rounded-md shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-10">
                      <QrCodeIcon size={40} className="opacity-40" />
                      <p className="text-sm">{errorMsg || copy.preview.empty}</p>
                    </div>
                  )}
                </div>

                {errorMsg && qrDataUrl === null && text.trim() !== '' && (
                  <p className="flex items-start gap-1.5 text-xs text-destructive">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {errorMsg}
                  </p>
                )}

                <Button
                  onClick={handleDownload}
                  disabled={!qrDataUrl}
                  className="w-full flex items-center gap-2"
                >
                  <Download size={16} />
                  {copy.preview.download(size)}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {copy.preview.hint(transparentBg)}
                </p>
              </CardContent>
            </Card>
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
                const Icon = FEATURE_ICONS[index] ?? ShieldCheck
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
