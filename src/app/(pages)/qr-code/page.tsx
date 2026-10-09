'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
} from 'lucide-react'
import { siteConfig } from '@/config/site'

type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

const ERROR_LEVELS: Array<{ value: ErrorLevel; label: string; desc: string }> = [
  { value: 'L', label: 'L', desc: '约 7%' },
  { value: 'M', label: 'M', desc: '约 15%' },
  { value: 'Q', label: 'Q', desc: '约 25%' },
  { value: 'H', label: 'H', desc: '约 30%' },
]

const COLOR_PRESETS = [
  { label: '经典黑', fg: '#000000', bg: '#FFFFFF' },
  { label: '商务蓝', fg: '#1D4ED8', bg: '#FFFFFF' },
  { label: '清新绿', fg: '#16A34A', bg: '#FFFFFF' },
]

const SIZE_PRESETS = [256, 512, 800, 1024, 2048]

// 透明底棋盘格样式：便于预览时识别透明背景区域
const CHECKER_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
}

const FEATURES = [
  {
    icon: Zap,
    title: '输入即时生成',
    description: '输入文字或链接，二维码实时刷新，所见即所得，无需点击等待。',
  },
  {
    icon: Palette,
    title: '样式自由定制',
    description: '前景色、背景色自由搭配并提供常用配色预设，尺寸、边距、容错等级均可调节。',
  },
  {
    icon: ImageIcon,
    title: '中央 Logo 贴图',
    description: '上传品牌 Logo 合成到二维码中央，大小可调、支持圆形裁切，宣传物料更专业。',
  },
  {
    icon: ShieldCheck,
    title: '本地生成不上传',
    description: '二维码完全在浏览器本地生成与合成，内容不上传服务器，隐私安全，完全免费。',
  },
]

const SCENARIOS = [
  {
    icon: CreditCard,
    title: '名片与宣传单',
    description: '把官网、店铺链接生成二维码印在名片、传单上，扫码即达，比长链接更体面。',
  },
  {
    icon: Link2,
    title: '活动海报引流',
    description: '海报中嵌入带品牌 Logo 的二维码，辨识度更高，公众号、社群转化更顺畅。',
  },
  {
    icon: Wifi,
    title: 'Wi-Fi 与文本分享',
    description: '将 Wi-Fi 密码、备注信息编码成二维码，贴在工位、民宿前台，扫码即可查看。',
  },
  {
    icon: Sparkles,
    title: '电商与支付场景',
    description: '商品详情、售后卡片快速生成码图，打印张贴即扫即用，物料更新零成本。',
  },
]

const FAQS = [
  {
    question: '生成的二维码扫描不出来怎么办？',
    answer:
      '可从三方面排查：一是前景色与背景色对比度要足够，建议深色前景配浅色背景；二是带 Logo 时建议容错等级切换为 H、Logo 尺寸不超过 25%；三是适当增大导出尺寸与边距，打印场景建议 800px 以上。',
  },
  {
    question: '二维码内容有长度限制吗？',
    answer:
      '有。内容越长二维码模块越密，超过容量上限会提示生成失败，请精简文本或改用短链接。另外容错等级越低（如 L）可容纳的内容越多，对长文本可适当调低容错等级。',
  },
  {
    question: '透明背景的二维码适合用在哪里？',
    answer:
      '开启透明背景后导出的 PNG 底色完全透明，适合叠加到带底色或渐变的海报、PPT、网页上，不会出现突兀的白色方块。注意部分老旧扫描器对无静区（边距为 0）的码识别较差，建议保留一定边距。',
  },
  {
    question: '我输入的内容和上传的 Logo 会被上传到服务器吗？',
    answer:
      '不会。本工具基于浏览器本地 Canvas API 完成二维码生成与 Logo 合成，全程无任何网络请求与数据上传，关闭页面后数据即消失，请放心使用。',
  },
]

export default function QrCodePage() {
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

  const loadLogo = useCallback(async (src: string): Promise<HTMLImageElement> => {
    if (logoImgRef.current?.src === src) return logoImgRef.current
    const img = new Image()
    img.src = src
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Logo 图片加载失败'))
    })
    logoImgRef.current = img
    return img
  }, [])

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
        if (!ctx) throw new Error('无法创建画布上下文')
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
        const message = err instanceof Error ? err.message : '未知错误'
        setQrDataUrl(null)
        setErrorMsg(
          message.includes('overflow') || message.includes('too long')
            ? '内容过长，超出二维码容量上限，请精简文本、改用短链接或降低容错等级'
            : `二维码生成失败：${message}`
        )
      }
    },
    [size, fgColor, bgColor, margin, errorLevel, transparentBg, logoSrc, logoSize, logoRound, loadLogo]
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
    link.download = `qrcode-${size}px-${Date.now()}.png`
    link.href = qrDataUrl
    link.click()
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">二维码生成</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            输入文字或链接即时生成二维码，自定义颜色、尺寸、边距与容错等级，支持中央 Logo 贴图与透明背景导出，全程本地处理。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 左侧：内容与参数 */}
          <div className="col-span-1 lg:col-span-7 order-2 lg:order-1 space-y-4">
            {/* 内容输入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <QrCodeIcon size={18} className="text-primary" />
                  二维码内容
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="qr-text">文字或链接（支持 URL、文本、Wi-Fi 等任意内容）</Label>
                <Textarea
                  id="qr-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="例如：https://example.com"
                  className="min-h-[90px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  内容越长二维码越密，超出容量上限会提示失败，可精简文本或降低容错等级。
                </p>
              </CardContent>
            </Card>

            {/* 样式设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette size={18} className="text-primary" />
                  样式设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* 尺寸 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>尺寸</Label>
                    <span className="text-sm text-muted-foreground font-mono">{size} × {size} px</span>
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
                  <Label>颜色</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {COLOR_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={fgColor === preset.fg && bgColor === preset.bg ? 'default' : 'outline'}
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
                      <Label className="text-xs">前景色（码点）</Label>
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
                      <Label className="text-xs">背景色</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          disabled={transparentBg}
                          className="w-10 h-8 rounded border cursor-pointer p-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                        <span className="text-xs text-muted-foreground font-mono">
                          {transparentBg ? '透明' : bgColor}
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
                    透明背景（导出 PNG 底色透明）
                  </label>
                </div>

                {/* 边距 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>外边距（静区）</Label>
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
                  <p className="text-xs text-muted-foreground">
                    建议保留 2 格以上边距（白色静区），有助于提高扫码成功率。
                  </p>
                </div>

                {/* 容错等级 */}
                <div className="space-y-2">
                  <Label>容错等级（默认 Q）</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {ERROR_LEVELS.map((level) => (
                      <Button
                        key={level.value}
                        variant={errorLevel === level.value ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-xs flex-col gap-0 py-1"
                        onClick={() => setErrorLevel(level.value)}
                        title={`可纠错 ${level.desc} 的码面损伤`}
                      >
                        <span className="font-semibold">{level.label}</span>
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
                  Logo 贴图
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
                    {logoSrc ? '更换 Logo' : '上传 Logo（建议 PNG）'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={handleLogoRemove}
                    disabled={!logoSrc}
                  >
                    <Trash2 size={14} />
                    移除 Logo
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
                        alt="Logo 预览"
                        className={`w-12 h-12 object-contain ${logoRound ? 'rounded-full' : ''}`}
                        style={CHECKER_STYLE}
                      />
                      <p className="text-xs text-muted-foreground">
                        Logo 将合成到二维码中央，建议使用背景透明的 PNG 图片。
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Logo 大小</Label>
                        <span className="text-sm text-muted-foreground font-mono">{logoSize}%（占边长）</span>
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
                      圆形裁切 Logo
                    </label>

                    {errorLevel !== 'H' && (
                      <div className="flex items-center justify-between gap-2 rounded-md border border-amber-300/60 bg-amber-500/10 px-3 py-2">
                        <span className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                          <AlertCircle size={13} className="flex-shrink-0" />
                          已添加 Logo，建议容错等级切换为 H（约 30%）以保证扫码成功率
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs flex-shrink-0"
                          onClick={() => setErrorLevel('H')}
                        >
                          一键切换
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
                  <span>实时预览</span>
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
                      alt="二维码预览"
                      className="w-full max-w-[360px] h-auto rounded-md shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-10">
                      <QrCodeIcon size={40} className="opacity-40" />
                      <p className="text-sm">{errorMsg || '请输入二维码内容'}</p>
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
                  下载 PNG（{size} × {size}）
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  透明背景时导出的 PNG 底色透明；{transparentBg ? '当前为透明背景模式。' : '当前为实色背景模式。'}
                </p>
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
