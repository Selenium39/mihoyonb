'use client'

import { useMemo, useRef, useState } from 'react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trackToolExport, trackToolUse } from '@/lib/analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Subtitles,
  Upload,
  Copy,
  Download,
  Trash2,
  ArrowRightLeft,
  Clock,
  Merge,
  Wrench,
  Check,
  AlertTriangle,
} from 'lucide-react'
import {
  type OverlapIssue,
  type SubtitleCue,
  type SubtitleFormat,
  parseSubtitle,
  formatTimestamp,
  parseOffsetSeconds,
  shiftCues,
  mergeCues,
  detectOverlaps,
  fixOverlaps,
  serializeSubtitle,
} from '@/lib/subtitle'
import { type Locale } from '@/lib/i18n'
import { getSubtitleToolsCopy } from './copy'

interface ActionMessage {
  type: 'error' | 'info'
  text: string
}

/**
 * 字幕工具主体：/zh/subtitle-tools 与 /subtitle-tools 共用。
 * 逻辑、埋点参数与交互完全一致，只有文案与下载文件名按 locale 取。
 */
export default function SubtitleToolsTool({ locale }: { locale: Locale }) {
  const copy = getSubtitleToolsCopy(locale)

  // 输入
  const [inputText, setInputText] = useState('')
  const [mergeText, setMergeText] = useState('')

  // 输出
  const [outputText, setOutputText] = useState('')
  const [outputFormat, setOutputFormat] = useState<SubtitleFormat>('srt')
  const [outputLabel, setOutputLabel] = useState('')
  const [copied, setCopied] = useState(false)

  // 各功能选项
  const [shiftValue, setShiftValue] = useState('-0.5')
  const [shiftOutFormat, setShiftOutFormat] = useState<SubtitleFormat | null>(null)
  const [mergeShiftToEnd, setMergeShiftToEnd] = useState(true)
  const [mergeOutFormat, setMergeOutFormat] = useState<SubtitleFormat | null>(null)
  const [autoFixOverlap, setAutoFixOverlap] = useState(true)
  const [cleanOutFormat, setCleanOutFormat] = useState<SubtitleFormat | null>(null)
  const [overlapInfo, setOverlapInfo] = useState<{ issues: OverlapIssue[]; format: SubtitleFormat } | null>(null)

  // 提示信息
  const [message, setMessage] = useState<ActionMessage | null>(null)

  const mainFileRef = useRef<HTMLInputElement>(null)
  const mergeFileRef = useRef<HTMLInputElement>(null)

  // 解析主输入（识别格式 + 条目）
  const parsedInput = useMemo(() => {
    if (!inputText.trim()) return null
    return parseSubtitle(inputText)
  }, [inputText])

  const parsedMerge = useMemo(() => {
    if (!mergeText.trim()) return null
    return parseSubtitle(mergeText)
  }, [mergeText])

  const hasInputCues = !!parsedInput && parsedInput.cues.length > 0
  const sourceFormat: SubtitleFormat = parsedInput?.format ?? 'srt'

  const inputMeta = useMemo(() => {
    if (!inputText.trim()) return copy.input.waiting
    if (!hasInputCues) return copy.input.noCues
    return copy.input.recognized(parsedInput!.format.toUpperCase(), parsedInput!.cues.length)
  }, [inputText, hasInputCues, parsedInput, copy])

  const mergeMeta = useMemo(() => {
    if (!mergeText.trim()) return copy.input.waiting
    if (!parsedMerge || parsedMerge.cues.length === 0) return copy.input.noCues
    return copy.input.recognized(parsedMerge.format.toUpperCase(), parsedMerge.cues.length)
  }, [mergeText, parsedMerge, copy])

  // 读取上传的字幕文件（UTF-8 文本）
  const readSubtitleFile = (file: File, onLoad: (text: string) => void) => {
    const reader = new FileReader()
    reader.onload = (e) => onLoad(typeof e.target?.result === 'string' ? e.target.result : '')
    reader.readAsText(file, 'utf-8')
  }

  // 统一输出
  const applyOutput = (cues: SubtitleCue[], format: SubtitleFormat, label: string) => {
    setOutputText(serializeSubtitle(cues, format))
    setOutputFormat(format)
    setOutputLabel(copy.messages.outputMeta(label, cues.length))
  }

  // 校验主输入可用，返回解析结果
  const getParsedOrNotify = () => {
    if (!inputText.trim()) {
      setMessage({ type: 'error', text: copy.messages.needFirst })
      return null
    }
    const result = parseSubtitle(inputText)
    if (result.cues.length === 0) {
      setMessage({ type: 'error', text: copy.messages.invalidInput })
      return null
    }
    return result
  }

  // 格式转换
  const handleConvert = (target: SubtitleFormat) => {
    const result = getParsedOrNotify()
    if (!result) return
    applyOutput(
      result.cues,
      target,
      copy.messages.converted(result.format.toUpperCase(), target.toUpperCase()),
    )
    trackToolUse('subtitle_tools', 'convert', { target })
    setMessage(null)
  }

  // 时间轴平移
  const handleShift = () => {
    const result = getParsedOrNotify()
    if (!result) return
    const offset = parseOffsetSeconds(shiftValue)
    if (offset === null) {
      setMessage({ type: 'error', text: copy.messages.invalidOffset })
      return
    }
    const shifted = shiftCues(result.cues, offset)
    const fmt = shiftOutFormat ?? result.format
    const abs = Math.abs(offset / 1000).toFixed(3)
    applyOutput(shifted, fmt, copy.messages.shifted(abs, offset >= 0))
    trackToolUse('subtitle_tools', 'shift')
    setMessage(null)
  }

  // 平移实时预览（首/末条目平移后的时间）
  const shiftPreview = useMemo(() => {
    if (!hasInputCues || !parsedInput) return null
    const offset = parseOffsetSeconds(shiftValue)
    if (offset === null) return null
    const first = parsedInput.cues[0]
    const last = parsedInput.cues[parsedInput.cues.length - 1]
    const fmt = parsedInput.format
    return {
      offsetMs: offset,
      firstBefore: formatTimestamp(first.start, fmt),
      firstAfter: formatTimestamp(Math.max(0, first.start + offset), fmt),
      lastBefore: formatTimestamp(last.end, fmt),
      lastAfter: formatTimestamp(Math.max(0, last.end + offset), fmt),
    }
  }, [hasInputCues, parsedInput, shiftValue])

  // 合并
  const handleMerge = () => {
    const first = getParsedOrNotify()
    if (!first) return
    if (!mergeText.trim()) {
      setMessage({ type: 'error', text: copy.messages.needSecond })
      return
    }
    const second = parseSubtitle(mergeText)
    if (second.cues.length === 0) {
      setMessage({ type: 'error', text: copy.messages.invalidSecond })
      return
    }
    const merged = mergeCues(first.cues, second.cues, { shiftSecondToEnd: mergeShiftToEnd })
    const fmt = mergeOutFormat ?? first.format
    applyOutput(merged, fmt, copy.messages.merged(first.cues.length, second.cues.length))
    trackToolUse('subtitle_tools', 'merge')
    setMessage(null)
  }

  // 清理修复
  const handleClean = () => {
    const result = getParsedOrNotify()
    if (!result) return
    const issues = detectOverlaps(result.cues)
    setOverlapInfo({ issues, format: result.format })

    let cues = result.cues
    let fixedCount: number | null = null
    if (autoFixOverlap && issues.length > 0) {
      const fixed = fixOverlaps(result.cues)
      cues = fixed.cues
      fixedCount = fixed.fixedCount
    }
    const fmt = cleanOutFormat ?? result.format
    applyOutput(cues, fmt, copy.messages.cleanLabel(fixedCount))
    trackToolUse('subtitle_tools', 'clean')

    if (!autoFixOverlap && issues.length > 0) {
      setMessage({ type: 'info', text: copy.messages.overlapHint(issues.length) })
    } else {
      setMessage(null)
    }
  }

  // 复制结果
  const handleCopy = async () => {
    if (!outputText) return
    try {
      await navigator.clipboard.writeText(outputText)
    } catch {
      // 剪贴板 API 不可用时的兜底
      const ta = document.createElement('textarea')
      ta.value = outputText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    trackToolExport('subtitle_tools', 'copy')
    setTimeout(() => setCopied(false), 2000)
  }

  // 下载结果（扩展名跟随输出格式）
  const handleDownload = () => {
    if (!outputText) return
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = copy.output.fileName(outputFormat)
    link.click()
    trackToolExport('subtitle_tools', 'download', { format: outputFormat })
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  // 输出格式选择器（跟随源 / SRT / VTT）
  const renderFormatPicker = (
    value: SubtitleFormat | null,
    onChange: (v: SubtitleFormat | null) => void,
    source: SubtitleFormat
  ) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{copy.formatPicker.label}</span>
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant={value === null ? 'default' : 'outline'}
          className="h-8 text-xs"
          onClick={() => onChange(null)}
        >
          {copy.formatPicker.followSource(source.toUpperCase())}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={value === 'srt' ? 'default' : 'outline'}
          className="h-8 text-xs"
          onClick={() => onChange('srt')}
        >
          SRT
        </Button>
        <Button
          type="button"
          size="sm"
          variant={value === 'vtt' ? 'default' : 'outline'}
          className="h-8 text-xs"
          onClick={() => onChange('vtt')}
        >
          VTT
        </Button>
      </div>
    </div>
  )

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* 语言切换 */}
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher variant="inline" />
        </div>

        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-3">
            <Subtitles className="w-8 h-8" />
            {copy.hero.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{copy.hero.intro}</p>
        </div>

        {/* 输入 / 输出 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* 输入字幕 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span>{copy.input.cardTitle}</span>
                <span className="text-xs font-normal text-muted-foreground">{inputMeta}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={copy.input.placeholder}
                className="h-72 font-mono text-xs resize-y"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mainFileRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-1.5" />
                  {copy.input.upload}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInputText('')} disabled={!inputText}>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  {copy.input.clear}
                </Button>
                <span className="text-xs text-muted-foreground">{copy.input.acceptHint}</span>
              </div>
              {parsedInput?.warnings.map((w) => (
                <p key={w} className="text-xs text-muted-foreground">
                  {copy.input.warningPrefix}
                  {w}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* 处理结果 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span>{copy.output.cardTitle}</span>
                {outputLabel && <span className="text-xs font-normal text-muted-foreground">{outputLabel}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                readOnly
                value={outputText}
                placeholder={copy.output.placeholder}
                className="h-72 font-mono text-xs resize-y bg-muted/40"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!outputText}>
                  {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {copied ? copy.output.copied : copy.output.copy}
                </Button>
                <Button size="sm" onClick={handleDownload} disabled={!outputText}>
                  <Download className="w-4 h-4 mr-1.5" />
                  {copy.output.download(outputFormat)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能区 */}
        <Card className="mt-4 lg:mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">{copy.functionCard.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="convert">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="convert" className="text-xs md:text-sm">{copy.functionCard.tabs.convert}</TabsTrigger>
                <TabsTrigger value="shift" className="text-xs md:text-sm">{copy.functionCard.tabs.shift}</TabsTrigger>
                <TabsTrigger value="merge" className="text-xs md:text-sm">{copy.functionCard.tabs.merge}</TabsTrigger>
                <TabsTrigger value="clean" className="text-xs md:text-sm">{copy.functionCard.tabs.clean}</TabsTrigger>
              </TabsList>

              {/* 格式转换 */}
              <TabsContent value="convert" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {copy.convert.description}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => handleConvert('vtt')} disabled={!hasInputCues || sourceFormat === 'vtt'}>
                    <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                    {copy.convert.srtToVtt}
                  </Button>
                  <Button size="sm" onClick={() => handleConvert('srt')} disabled={!hasInputCues || sourceFormat === 'srt'}>
                    <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                    {copy.convert.vttToSrt}
                  </Button>
                  {!hasInputCues && inputText.trim() && (
                    <span className="text-xs text-muted-foreground">{copy.convert.noValidCues}</span>
                  )}
                </div>
              </TabsContent>

              {/* 时间轴平移 */}
              <TabsContent value="shift" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {copy.shift.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      value={shiftValue}
                      onChange={(e) => setShiftValue(e.target.value)}
                      placeholder="-0.5"
                      className="w-28 font-mono text-xs"
                    />
                    <span className="text-xs text-muted-foreground">{copy.shift.unit}</span>
                  </div>
                  {renderFormatPicker(shiftOutFormat, setShiftOutFormat, sourceFormat)}
                  <Button size="sm" onClick={handleShift} disabled={!hasInputCues}>
                    {copy.shift.apply}
                  </Button>
                </div>
                {shiftPreview ? (
                  <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                    {copy.shift.preview(
                      `${shiftPreview.offsetMs >= 0 ? '+' : ''}${(shiftPreview.offsetMs / 1000).toFixed(3)}s`,
                      shiftPreview.firstBefore,
                      shiftPreview.firstAfter,
                      shiftPreview.lastBefore,
                      shiftPreview.lastAfter,
                    )}
                  </div>
                ) : (
                  hasInputCues &&
                  shiftValue.trim() && (
                    <p className="text-xs text-muted-foreground">{copy.shift.invalidInline}</p>
                  )
                )}
              </TabsContent>

              {/* 字幕合并 */}
              <TabsContent value="merge" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {copy.merge.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{copy.merge.secondTitle}</span>
                      <span className="text-xs text-muted-foreground">{mergeMeta}</span>
                    </div>
                    <Textarea
                      value={mergeText}
                      onChange={(e) => setMergeText(e.target.value)}
                      placeholder={copy.merge.placeholder}
                      className="h-36 font-mono text-xs resize-y"
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => mergeFileRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-1.5" />
                        {copy.input.upload}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setMergeText('')} disabled={!mergeText}>
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        {copy.input.clear}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={mergeShiftToEnd}
                        onChange={(e) => setMergeShiftToEnd(e.target.checked)}
                        className="w-4 h-4"
                      />
                      {copy.merge.shiftToEnd}
                    </label>
                    {renderFormatPicker(mergeOutFormat, setMergeOutFormat, sourceFormat)}
                    <Button size="sm" onClick={handleMerge} disabled={!hasInputCues}>
                      <Merge className="w-4 h-4 mr-1.5" />
                      {copy.merge.submit}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* 清理修复 */}
              <TabsContent value="clean" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {copy.clean.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoFixOverlap}
                      onChange={(e) => setAutoFixOverlap(e.target.checked)}
                      className="w-4 h-4"
                    />
                    {copy.clean.autoFix}
                  </label>
                  {renderFormatPicker(cleanOutFormat, setCleanOutFormat, sourceFormat)}
                  <Button size="sm" onClick={handleClean} disabled={!hasInputCues}>
                    <Wrench className="w-4 h-4 mr-1.5" />
                    {copy.clean.submit}
                  </Button>
                </div>
                {overlapInfo &&
                  (overlapInfo.issues.length > 0 ? (
                    <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
                      <p className="text-xs font-medium text-amber-600 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {copy.clean.overlapFound(overlapInfo.issues.length)}
                      </p>
                      <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {overlapInfo.issues.map((issue) => (
                          <li key={issue.index} className="text-xs text-muted-foreground font-mono">
                            {copy.clean.overlapItem(
                              issue.index - 1,
                              formatTimestamp(issue.prevEnd, overlapInfo.format),
                              issue.index,
                              formatTimestamp(issue.nextStart, overlapInfo.format),
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{copy.clean.overlapNone}</p>
                  ))}
              </TabsContent>
            </Tabs>

            {message && (
              <p className={`text-xs mt-4 border-t pt-3 ${message.type === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
                {message.type === 'error' ? copy.messagePrefix.error : copy.messagePrefix.info}
                {message.text}
              </p>
            )}
          </CardContent>
        </Card>

        {/* SEO：功能特性 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">{copy.sections.featuresTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {copy.sections.features.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SEO：使用场景 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">{copy.sections.scenariosTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {copy.sections.scenarios.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SEO：常见问题 */}
        <section className="mt-12 mb-4">
          <h2 className="text-2xl font-bold text-center mb-6">{copy.sections.faqTitle}</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {copy.sections.faqs.map((item) => (
              <Card key={item.question}>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-base mb-2">{item.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 隐藏的文件选择框 */}
        <input
          ref={mainFileRef}
          type="file"
          accept=".srt,.vtt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) readSubtitleFile(file, setInputText)
            // 重置 value，确保同一个文件可以再次选择
            e.target.value = ''
          }}
        />
        <input
          ref={mergeFileRef}
          type="file"
          accept=".srt,.vtt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) readSubtitleFile(file, setMergeText)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
