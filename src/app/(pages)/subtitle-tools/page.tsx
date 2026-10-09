'use client'

import { useMemo, useRef, useState } from 'react'
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

interface ActionMessage {
  type: 'error' | 'info'
  text: string
}

export default function SubtitleToolsPage() {
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
    if (!inputText.trim()) return '等待输入'
    if (!hasInputCues) return '未识别到有效字幕'
    return `已识别 ${parsedInput!.format.toUpperCase()} · ${parsedInput!.cues.length} 条`
  }, [inputText, hasInputCues, parsedInput])

  const mergeMeta = useMemo(() => {
    if (!mergeText.trim()) return '等待输入'
    if (!parsedMerge || parsedMerge.cues.length === 0) return '未识别到有效字幕'
    return `已识别 ${parsedMerge.format.toUpperCase()} · ${parsedMerge.cues.length} 条`
  }, [mergeText, parsedMerge])

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
    setOutputLabel(`${label}，共 ${cues.length} 条`)
  }

  // 校验主输入可用，返回解析结果
  const getParsedOrNotify = () => {
    if (!inputText.trim()) {
      setMessage({ type: 'error', text: '请先在上方粘贴或上传第一份字幕' })
      return null
    }
    const result = parseSubtitle(inputText)
    if (result.cues.length === 0) {
      setMessage({ type: 'error', text: '未解析到任何字幕条目，请检查内容是否为有效的 SRT / VTT' })
      return null
    }
    return result
  }

  // 格式转换
  const handleConvert = (target: SubtitleFormat) => {
    const result = getParsedOrNotify()
    if (!result) return
    applyOutput(result.cues, target, `已转换 ${result.format.toUpperCase()} → ${target.toUpperCase()}`)
    trackToolUse('subtitle_tools', 'convert', { target })
    setMessage(null)
  }

  // 时间轴平移
  const handleShift = () => {
    const result = getParsedOrNotify()
    if (!result) return
    const offset = parseOffsetSeconds(shiftValue)
    if (offset === null) {
      setMessage({ type: 'error', text: '偏移量格式无效，请输入秒数（支持负数），如 -0.5 或 1.200' })
      return
    }
    const shifted = shiftCues(result.cues, offset)
    const fmt = shiftOutFormat ?? result.format
    const abs = Math.abs(offset / 1000).toFixed(3)
    applyOutput(shifted, fmt, `已整体${offset >= 0 ? '延后' : '提前'} ${abs} 秒`)
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
      setMessage({ type: 'error', text: '请先粘贴或上传第二份字幕' })
      return
    }
    const second = parseSubtitle(mergeText)
    if (second.cues.length === 0) {
      setMessage({ type: 'error', text: '第二份字幕未解析到任何条目，请检查内容格式' })
      return
    }
    const merged = mergeCues(first.cues, second.cues, { shiftSecondToEnd: mergeShiftToEnd })
    const fmt = mergeOutFormat ?? first.format
    applyOutput(merged, fmt, `已合并两份字幕（${first.cues.length} + ${second.cues.length} 条）`)
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
    let label = '已清理：去空行 + 重排序号'
    if (autoFixOverlap && issues.length > 0) {
      const fixed = fixOverlaps(result.cues)
      cues = fixed.cues
      label += `，修正 ${fixed.fixedCount} 处重叠`
    }
    const fmt = cleanOutFormat ?? result.format
    applyOutput(cues, fmt, label)
    trackToolUse('subtitle_tools', 'clean')

    if (!autoFixOverlap && issues.length > 0) {
      setMessage({ type: 'info', text: `检测到 ${issues.length} 处时间码重叠，可勾选「自动修正时间重叠」后再次清理` })
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
    link.download = `subtitle-${Date.now()}.${outputFormat}`
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
      <span className="text-xs text-muted-foreground shrink-0">输出格式</span>
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant={value === null ? 'default' : 'outline'}
          className="h-8 text-xs"
          onClick={() => onChange(null)}
        >
          跟随源（{source.toUpperCase()}）
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
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-3">
            <Subtitles className="w-8 h-8" />
            字幕工具
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            SRT / VTT 字幕在线转换、时间轴平移、合并与清理修复，纯浏览器本地处理，文件不上传，完全免费
          </p>
        </div>

        {/* 输入 / 输出 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* 输入字幕 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span>输入字幕</span>
                <span className="text-xs font-normal text-muted-foreground">{inputMeta}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={'粘贴 SRT / VTT 字幕文本，或点击下方按钮上传文件\n\n例如：\n1\n00:00:01,000 --> 00:00:03,000\n你好，世界！'}
                className="h-72 font-mono text-xs resize-y"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mainFileRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-1.5" />
                  上传文件
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInputText('')} disabled={!inputText}>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  清空
                </Button>
                <span className="text-xs text-muted-foreground">支持 .srt / .vtt</span>
              </div>
              {parsedInput?.warnings.map((w) => (
                <p key={w} className="text-xs text-muted-foreground">
                  提示：{w}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* 处理结果 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span>处理结果</span>
                {outputLabel && <span className="text-xs font-normal text-muted-foreground">{outputLabel}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                readOnly
                value={outputText}
                placeholder="处理结果将显示在这里，可一键复制或下载为字幕文件"
                className="h-72 font-mono text-xs resize-y bg-muted/40"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} disabled={!outputText}>
                  {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {copied ? '已复制' : '复制'}
                </Button>
                <Button size="sm" onClick={handleDownload} disabled={!outputText}>
                  <Download className="w-4 h-4 mr-1.5" />
                  下载 .{outputFormat}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能区 */}
        <Card className="mt-4 lg:mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">选择功能</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="convert">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="convert" className="text-xs md:text-sm">格式转换</TabsTrigger>
                <TabsTrigger value="shift" className="text-xs md:text-sm">时间轴平移</TabsTrigger>
                <TabsTrigger value="merge" className="text-xs md:text-sm">字幕合并</TabsTrigger>
                <TabsTrigger value="clean" className="text-xs md:text-sm">清理修复</TabsTrigger>
              </TabsList>

              {/* 格式转换 */}
              <TabsContent value="convert" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  在 SRT 与 VTT 之间双向转换：VTT 输出自动添加 WEBVTT 头，时间码分隔符 00:00:01,000 ↔
                  00:00:01.000，序号统一保留。
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => handleConvert('vtt')} disabled={!hasInputCues || sourceFormat === 'vtt'}>
                    <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                    SRT → VTT
                  </Button>
                  <Button size="sm" onClick={() => handleConvert('srt')} disabled={!hasInputCues || sourceFormat === 'srt'}>
                    <ArrowRightLeft className="w-4 h-4 mr-1.5" />
                    VTT → SRT
                  </Button>
                  {!hasInputCues && inputText.trim() && (
                    <span className="text-xs text-muted-foreground">当前输入未识别到有效字幕条目</span>
                  )}
                </div>
              </TabsContent>

              {/* 时间轴平移 */}
              <TabsContent value="shift" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  整体提前或延后全部字幕：输入秒数（支持负数，如 -0.5、1.200），平移后时间不允许为负，会截为
                  0。
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
                    <span className="text-xs text-muted-foreground">秒</span>
                  </div>
                  {renderFormatPicker(shiftOutFormat, setShiftOutFormat, sourceFormat)}
                  <Button size="sm" onClick={handleShift} disabled={!hasInputCues}>
                    应用平移
                  </Button>
                </div>
                {shiftPreview ? (
                  <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                    偏移 {shiftPreview.offsetMs >= 0 ? '+' : ''}
                    {(shiftPreview.offsetMs / 1000).toFixed(3)}s：首条开始 {shiftPreview.firstBefore} →{' '}
                    {shiftPreview.firstAfter}｜末条结束 {shiftPreview.lastBefore} → {shiftPreview.lastAfter}
                  </div>
                ) : (
                  hasInputCues &&
                  shiftValue.trim() && (
                    <p className="text-xs text-muted-foreground">偏移量格式无效，请输入如 -0.5 或 1.200 的秒数</p>
                  )
                )}
              </TabsContent>

              {/* 字幕合并 */}
              <TabsContent value="merge" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  将第二份字幕顺序拼接到第一份后面，序号自动重排；可选择把第二份整体后移到第一份结束时刻，避免时间重叠。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">第二份字幕</span>
                      <span className="text-xs text-muted-foreground">{mergeMeta}</span>
                    </div>
                    <Textarea
                      value={mergeText}
                      onChange={(e) => setMergeText(e.target.value)}
                      placeholder="粘贴或上传第二份 SRT / VTT 字幕..."
                      className="h-36 font-mono text-xs resize-y"
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => mergeFileRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-1.5" />
                        上传文件
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setMergeText('')} disabled={!mergeText}>
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        清空
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
                      第二份整体后移到第一份结束时刻
                    </label>
                    {renderFormatPicker(mergeOutFormat, setMergeOutFormat, sourceFormat)}
                    <Button size="sm" onClick={handleMerge} disabled={!hasInputCues}>
                      <Merge className="w-4 h-4 mr-1.5" />
                      合并字幕
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* 清理修复 */}
              <TabsContent value="clean" className="space-y-3 mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  去除多余空行、重排序号；检测相邻条目的时间码重叠（上一条结束晚于下一条开始），可选自动修正为顺序衔接。
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoFixOverlap}
                      onChange={(e) => setAutoFixOverlap(e.target.checked)}
                      className="w-4 h-4"
                    />
                    自动修正时间重叠
                  </label>
                  {renderFormatPicker(cleanOutFormat, setCleanOutFormat, sourceFormat)}
                  <Button size="sm" onClick={handleClean} disabled={!hasInputCues}>
                    <Wrench className="w-4 h-4 mr-1.5" />
                    开始清理
                  </Button>
                </div>
                {overlapInfo &&
                  (overlapInfo.issues.length > 0 ? (
                    <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
                      <p className="text-xs font-medium text-amber-600 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        检测到 {overlapInfo.issues.length} 处时间码重叠
                      </p>
                      <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {overlapInfo.issues.map((issue) => (
                          <li key={issue.index} className="text-xs text-muted-foreground font-mono">
                            第 {issue.index - 1} 条结束 {formatTimestamp(issue.prevEnd, overlapInfo.format)} 晚于第{' '}
                            {issue.index} 条开始 {formatTimestamp(issue.nextStart, overlapInfo.format)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">未检测到时间码重叠</p>
                  ))}
              </TabsContent>
            </Tabs>

            {message && (
              <p className={`text-xs mt-4 border-t pt-3 ${message.type === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
                {message.type === 'error' ? '错误：' : '提示：'}
                {message.text}
              </p>
            )}
          </CardContent>
        </Card>

        {/* SEO：功能特性 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'SRT / VTT 双向转换',
                desc: '时间码精确到毫秒无损互转，VTT 自动添加 WEBVTT 头，序号统一保留重排',
              },
              {
                title: '时间轴整体平移',
                desc: '按秒整体提前或延后（支持 -0.5、1.200 这类精度），负时间自动截为 0，附首末时间预览',
              },
              {
                title: '多份字幕合并',
                desc: '顺序拼接两份字幕并自动重排序号，可选将第二份整体后移到第一份结束时刻',
              },
              {
                title: '本地处理隐私安全',
                desc: '所有解析与转换均在浏览器内完成，字幕文件不上传服务器，免费无限制',
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
                title: '播放器兼容适配',
                desc: '部分播放器只认 SRT，而 HTML5 网页播放器只认 VTT，一键互转即可两边通用',
              },
              {
                title: '字幕时机校准',
                desc: '下载的字幕整体偏早或偏晚时，输入秒数一键平移，无需逐条手改时间码',
              },
              {
                title: '分段字幕合并',
                desc: '将分卷翻译、分段压制的字幕拼成完整一份，时间轴自动顺延不重叠',
              },
              {
                title: '下载字幕修复',
                desc: '修复序号错乱、多余空行、时间码重叠等常见问题，输出规范字幕文件',
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
                q: '支持哪些字幕格式？',
                a: '支持 SRT（.srt）与 WebVTT（.vtt）两种最常见的纯文本字幕格式，并可互相转换。ASS / SSA 等带样式的字幕格式暂不支持。',
              },
              {
                q: '转换后时间码会有误差吗？',
                a: '不会。时间码解析为毫秒整数后再生成的另一格式，SRT 与 VTT 之间往返转换时间码完全无损，仅分隔符在「,」与「.」之间切换。',
              },
              {
                q: '时间轴平移时输入负数会怎样？',
                a: '输入负数表示整体提前，如 -0.5 即提前 0.5 秒。平移后时间不允许为负，任何条目若被移到 0 之前，其开始/结束时间会被截为 0。',
              },
              {
                q: 'VTT 里的 NOTE、STYLE 块会保留吗？',
                a: '转换时会自动剥离 NOTE / STYLE / REGION 等注释与样式块，只保留字幕正文；需要自定义样式的 VTT 可在转换后手动补回 STYLE 块。',
              },
              {
                q: '我的字幕文件会被上传吗？',
                a: '不会。本工具完全在浏览器本地运行，解析、转换、合并全部在本机内存中完成，文件不会离开你的设备，请放心使用。',
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
