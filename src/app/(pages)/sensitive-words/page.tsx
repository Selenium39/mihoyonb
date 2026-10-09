'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trackToolExport, trackToolUse } from '@/lib/analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ShieldAlert,
  ShieldCheck,
  ScanSearch,
  Eraser,
  Copy,
  Check,
  Trash2,
  BookOpen,
  PenLine,
  Send,
  ShoppingBag,
  Users,
  FileCheck,
} from 'lucide-react'
import {
  SENSITIVE_WORD_CATEGORIES,
  CUSTOM_CATEGORY_ID,
  detectSensitiveWords,
  splitSegments,
  maskText,
  parseCustomWords,
  type DetectResult,
  type SensitiveWordCategory,
} from '@/lib/sensitive-words'

/** 自定义词库的 localStorage 键 */
const CUSTOM_STORAGE_KEY = 'yuanniu:sensitive-words:custom'

/** 超长文本时高亮预览的截断长度（统计与替换仍基于全文） */
const PREVIEW_LIMIT = 50000

/** 各分类的高亮与徽章样式 */
const CATEGORY_STYLES: Record<string, { mark: string; badge: string }> = {
  'ad-law': {
    mark: 'bg-red-100 text-red-700 rounded px-0.5 dark:bg-red-900/70 dark:text-red-200',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-200',
  },
  platform: {
    mark: 'bg-orange-100 text-orange-700 rounded px-0.5 dark:bg-orange-900/70 dark:text-orange-200',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/70 dark:text-orange-200',
  },
  [CUSTOM_CATEGORY_ID]: {
    mark: 'bg-blue-100 text-blue-700 rounded px-0.5 dark:bg-blue-900/70 dark:text-blue-200',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-200',
  },
}

const SAMPLE_TEXT =
  '这款面膜是全网销量第一的国家级爆款，配方纯天然无副作用，坚持使用可根治痘痘，错过今天再等一年！加微信领取内部渠道专属优惠，还有稳赚不赔的带货项目等你来。'

export default function SensitiveWordsPage() {
  const [text, setText] = useState('')
  const [customWordsText, setCustomWordsText] = useState('')
  const [maskChar, setMaskChar] = useState('*')
  const [result, setResult] = useState<DetectResult | null>(null)
  const [processedText, setProcessedText] = useState<string | null>(null)
  const [resultTab, setResultTab] = useState<string>('highlight')
  const [copied, setCopied] = useState(false)

  // 恢复本地保存的自定义词库
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_STORAGE_KEY)
      if (stored) setCustomWordsText(stored)
    } catch {
      // 忽略：localStorage 不可用时仅会话内生效
    }
  }, [])

  // 持久化自定义词库
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_STORAGE_KEY, customWordsText)
    } catch {
      // 忽略：写入失败不影响本次会话
    }
  }, [customWordsText])

  /** 解析后的自定义词 */
  const customWords = useMemo(() => parseCustomWords(customWordsText), [customWordsText])

  /** 检测用的完整分类列表（内置 + 自定义） */
  const categories = useMemo<SensitiveWordCategory[]>(() => {
    const list = [...SENSITIVE_WORD_CATEGORIES]
    if (customWords.length > 0) {
      list.push({
        id: CUSTOM_CATEGORY_ID,
        name: '自定义',
        description: '自行追加的词，与内置词库合并检测',
        words: customWords,
      })
    }
    return list
  }, [customWords])

  const categoryName = (id: string): string =>
    categories.find((c) => c.id === id)?.name ?? id

  /** 超长文本时预览用的前缀片段与命中区间 */
  const preview = useMemo(() => {
    if (!result) return null
    const truncated = text.length > PREVIEW_LIMIT
    const sliced = truncated ? text.slice(0, PREVIEW_LIMIT) : text
    const ranges = truncated
      ? result.ranges.filter((r) => r.end <= PREVIEW_LIMIT)
      : result.ranges
    return { segments: splitSegments(sliced, ranges), truncated }
  }, [result, text])

  const handleTextChange = (value: string) => {
    setText(value)
    // 文本变化后旧结果失效
    setResult(null)
    setProcessedText(null)
  }

  const handleDetect = () => {
    setResult(detectSensitiveWords(text, categories))
    setProcessedText(null)
    setResultTab('highlight')
    trackToolUse('sensitive_words', 'detect')
  }

  const handleMask = () => {
    if (!result) return
    setProcessedText(maskText(text, result.ranges, maskChar))
    setResultTab('processed')
    trackToolUse('sensitive_words', 'mask')
  }

  const handleCopy = async () => {
    if (!processedText) return
    let ok = false
    try {
      await navigator.clipboard.writeText(processedText)
      ok = true
    } catch {
      // 降级方案：临时 textarea + execCommand
      try {
        const ta = document.createElement('textarea')
        ta.value = processedText
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        ok = document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        ok = false
      }
    }
    if (ok) {
      setCopied(true)
      trackToolExport('sensitive_words', 'copy')
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
        {/* 页头 */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            敏感词检测
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
            自媒体发文前自检工具：内置广告法极限词与平台违规词词库，支持自定义词、命中高亮与一键遮罩，全部在浏览器本地完成。
          </p>
        </div>

        {/* 免责声明（显著位置） */}
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            免责声明：词库仅供发布前自检参考，检测存在误报与漏报的可能，不构成法律 / 合规意见。正式发布请以各平台规则与专业审核为准。
          </p>
        </div>

        {/* 主工作区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 左侧：输入 + 结果 */}
          <div className="col-span-1 lg:col-span-8 space-y-4 order-1">
            {/* 文本输入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base md:text-lg">
                  <span className="flex items-center gap-2">
                    <ScanSearch className="h-5 w-5" />
                    待检测文本
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {text.length} 字
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="粘贴或输入文章、标题、直播话术、商品详情等文案，然后点击「开始检测」…"
                  className="min-h-[220px] leading-6"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={handleDetect} disabled={!text.trim()} className="flex items-center gap-1.5">
                    <ScanSearch className="h-4 w-4" />
                    开始检测
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMask}
                    disabled={!result || result.total === 0}
                    className="flex items-center gap-1.5"
                  >
                    <Eraser className="h-4 w-4" />
                    一键遮罩替换
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextChange(SAMPLE_TEXT)}
                    className="text-muted-foreground"
                  >
                    填入示例
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextChange('')}
                    disabled={!text}
                    className="text-muted-foreground flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 检测结果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <ShieldCheck className="h-5 w-5" />
                  检测结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result === null ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    点击「开始检测」后，这里会高亮显示命中的敏感词
                  </p>
                ) : result.total === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-green-600 dark:text-green-400">
                    <ShieldCheck className="h-10 w-10" />
                    <p className="text-sm font-medium">未检测到命中词</p>
                    <p className="text-xs text-muted-foreground">
                      词库无法穷尽所有违规表述，结果仅供参考
                    </p>
                  </div>
                ) : (
                  <Tabs value={resultTab} onValueChange={setResultTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="highlight">高亮原文</TabsTrigger>
                      <TabsTrigger value="processed">处理后文本</TabsTrigger>
                    </TabsList>
                    <TabsContent value="highlight" className="mt-3">
                      <div className="max-h-[420px] overflow-y-auto rounded-md border bg-muted/20 p-4 text-sm leading-7">
                        <div className="whitespace-pre-wrap break-words">
                          {preview?.segments.map((segment, i) =>
                            segment.match ? (
                              <mark
                                key={i}
                                className={
                                  CATEGORY_STYLES[segment.match.categoryId]?.mark ??
                                  CATEGORY_STYLES[CUSTOM_CATEGORY_ID].mark
                                }
                                title={`${categoryName(segment.match.categoryId)}：${segment.match.word}`}
                              >
                                {segment.text}
                              </mark>
                            ) : (
                              <span key={i}>{segment.text}</span>
                            )
                          )}
                        </div>
                      </div>
                      {preview?.truncated && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          文本超过 {PREVIEW_LIMIT} 字，预览已截断，统计与替换仍基于全文。
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        红色为广告法极限词，橙色为平台违规词{customWords.length > 0 ? '，蓝色为自定义词' : ''}，悬停可查看所属分类。
                      </p>
                    </TabsContent>
                    <TabsContent value="processed" className="mt-3">
                      {processedText === null ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
                          <p>还没有生成处理后文本</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMask}
                            className="flex items-center gap-1.5"
                          >
                            <Eraser className="h-4 w-4" />
                            生成遮罩文本（{maskChar || '*'} 等长替换）
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="max-h-[420px] overflow-y-auto rounded-md border bg-muted/20 p-4 text-sm leading-7">
                            <div className="whitespace-pre-wrap break-words">{processedText}</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={handleCopy}
                            className="flex items-center gap-1.5"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                一键复制
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：统计 + 设置 */}
          <div className="col-span-1 lg:col-span-4 space-y-4 order-2">
            {/* 统计面板 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">统计面板</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result === null ? (
                  <p className="text-sm text-muted-foreground">开始检测后显示统计</p>
                ) : (
                  <>
                    <div className="flex items-end gap-6">
                      <div>
                        <div className={`text-3xl font-bold ${result.total > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {result.total}
                        </div>
                        <div className="text-xs text-muted-foreground">命中总数</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-foreground">
                          {result.wordHits.length}
                        </div>
                        <div className="text-xs text-muted-foreground">命中词种数</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {categories.map((category) => {
                        const count = result.byCategory[category.id] || 0
                        return (
                          <div
                            key={category.id}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                            title={category.description}
                          >
                            <span className="text-sm">{category.name}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                词库 {category.words.length} 词
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category.id]?.badge ?? ''}`}
                              >
                                命中 {count}
                              </span>
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {result.wordHits.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          命中词列表（按出现次数排序）
                        </p>
                        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                          {result.wordHits.map((hit) => (
                            <div
                              key={`${hit.categoryId}-${hit.word}`}
                              className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5 text-sm"
                            >
                              <span className="font-medium">{hit.word}</span>
                              <span className="flex items-center gap-2 text-xs">
                                <span
                                  className={`rounded px-1.5 py-0.5 ${CATEGORY_STYLES[hit.categoryId]?.badge ?? ''}`}
                                >
                                  {categoryName(hit.categoryId)}
                                </span>
                                <span className="text-muted-foreground">× {hit.count}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 词库设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <PenLine className="h-5 w-5" />
                  词库设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="mask-char">
                    遮罩字符
                  </label>
                  <Input
                    id="mask-char"
                    value={maskChar}
                    onChange={(e) => setMaskChar(e.target.value)}
                    maxLength={2}
                    className="w-20 text-center"
                    placeholder="*"
                  />
                  <p className="text-xs text-muted-foreground">
                    一键遮罩时按原词字数等长替换，默认 *
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="custom-words">
                    自定义词库
                  </label>
                  <Textarea
                    id="custom-words"
                    value={customWordsText}
                    onChange={(e) => setCustomWordsText(e.target.value)}
                    placeholder={'用逗号或换行分隔，例如：\n内部价, 独家渠道\n老板特批'}
                    className="min-h-[110px] text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    已识别 {customWords.length} 个自定义词，与内置词库合并检测（自动保存在本浏览器）
                  </p>
                </div>

                <div className="rounded-md border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
                  <p className="mb-1 flex items-center gap-1 font-medium text-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    内置词库
                  </p>
                  {SENSITIVE_WORD_CATEGORIES.map((category) => (
                    <p key={category.id}>
                      {category.name}（{category.words.length} 词）：{category.description}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SEO 内容区 */}
        <div className="mt-12 space-y-12 text-foreground">
          {/* 功能特性 */}
          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">功能特性</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ShieldCheck,
                  title: '纯本地检测',
                  desc: '文本不出浏览器，无上传、无联网请求，隐私安全',
                },
                {
                  icon: BookOpen,
                  title: '双内置词库',
                  desc: '广告法极限词与平台违规词两大类，覆盖常见雷区',
                },
                {
                  icon: PenLine,
                  title: '自定义词库',
                  desc: '按行业与场景追加自己的词，与内置词合并检测',
                },
                {
                  icon: Eraser,
                  title: '一键遮罩替换',
                  desc: '命中词按字数等长替换为遮罩字符，一键复制带走',
                },
              ].map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="p-5 text-center">
                    <feature.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 使用场景 */}
          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">使用场景</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  icon: Send,
                  title: '图文发布前自检',
                  desc: '公众号、小红书、知乎、微博等平台发文前，快速排查极限词与违规表述，降低限流与封禁风险',
                },
                {
                  icon: ShoppingBag,
                  title: '电商文案自查',
                  desc: '商品标题、详情页、直播话术中的「最」「第一」等广告法禁用语，发布前逐一排查',
                },
                {
                  icon: Users,
                  title: '私域与社群文案',
                  desc: '社群通知、朋友圈文案、私信话术检查敏感词，避免账号被平台处罚',
                },
                {
                  icon: FileCheck,
                  title: '对外文本初筛',
                  desc: '招聘启事、公告声明、营销物料等对外内容的敏感词初筛，减少返工',
                },
              ].map((scenario) => (
                <Card key={scenario.title}>
                  <CardContent className="flex items-start gap-4 p-5">
                    <scenario.icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                    <div>
                      <h3 className="mb-1 font-semibold">{scenario.title}</h3>
                      <p className="text-sm text-muted-foreground">{scenario.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 常见问题 */}
          <section>
            <h2 className="mb-6 text-center text-2xl font-bold">常见问题</h2>
            <div className="mx-auto max-w-3xl space-y-4">
              {[
                {
                  q: '检测结果准确吗，会误报吗？',
                  a: '本工具采用逐词匹配：命中只代表「文本包含词库中的词」，存在误报（如正常语境使用）与漏报（变体、谐音、拼音缩写等）的可能。词库仅供自检参考，不构成法律或合规意见。',
                },
                {
                  q: '我的文本会被上传或保存吗？',
                  a: '不会。检测、高亮、替换全部在你的浏览器本地完成，没有任何网络请求，关闭页面后即无残留（自定义词库仅保存在你自己的浏览器中）。',
                },
                {
                  q: '可以添加自己的敏感词吗？',
                  a: '可以。在右侧「词库设置」中用逗号或换行分隔输入自定义词，检测时会与内置词库合并生效，并自动保存在本地浏览器。',
                },
                {
                  q: '词库能覆盖所有违规词吗？',
                  a: '不能。违规词没有官方完整清单，各平台规则也在动态变化。本工具内置的是广告法与新广告法处罚案例、各平台社区规范中较常见的词，用于发布前快速自检。',
                },
                {
                  q: '「一键遮罩替换」是怎么替换的？',
                  a: '命中词会按原词字数等长替换为你设置的遮罩字符（默认 *），例如「第一名」替换为「***」，替换后可一键复制完整文本。',
                },
              ].map((item) => (
                <Card key={item.q}>
                  <CardContent className="p-5">
                    <h3 className="mb-2 font-semibold">{item.q}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
