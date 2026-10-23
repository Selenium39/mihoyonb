'use client'

// 公众号排版复制对话框：主题选择 + 实时预览 + 复制富文本到微信编辑器
import { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ClipboardCopy, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import {
  getWechatThemes,
  renderWechatHtml,
  wechatPlainText,
  type WechatThemeId
} from '@/lib/wechat-themes'
import { trackToolExport } from '@/lib/analytics'
import type { Locale } from '@/lib/i18n'

/**
 * 公众号排版对话框文案：默认中文，英文页传 locale="en"。
 * 中文保持原有字面量不变。
 */
const WECHAT_COPY = {
  zh: {
    title: '公众号排版复制',
    description: '选择排版主题，预览效果，一键复制后粘贴到微信公众号编辑器，样式完整保留',
    themeLabel: '公众号主题',
    copyButton: '复制公众号格式',
    copiedButton: '已复制',
    statusHtml: '已复制富文本排版，去公众号编辑器 Ctrl+V 粘贴即可',
    statusPlain: '当前浏览器不支持富文本复制，已复制纯文本',
    statusError: '复制失败，请手动选中预览内容复制',
    supported:
      '支持正文、标题、列表、引用、代码块、表格与 ==高亮== 标记。 图片以链接形式保留，公众号会自动转存外链图片。',
    previewLabel: '排版预览',
    generating: '生成预览中…',
  },
  en: {
    title: 'Copy formatted for WeChat',
    description:
      'Pick a theme, preview the result, then copy it into the WeChat editor — formatting is preserved.',
    themeLabel: 'Theme',
    copyButton: 'Copy for WeChat',
    copiedButton: 'Copied',
    statusHtml: 'Rich text copied — paste it into the WeChat editor with Ctrl+V.',
    statusPlain: 'This browser does not support rich text copying, so the plain text was copied.',
    statusError: 'Copy failed — select the preview and copy it manually.',
    supported:
      'Supports paragraphs, headings, lists, quotes, code blocks, tables and ==highlight== marks. Images stay as links, and WeChat re-hosts external images automatically.',
    previewLabel: 'Preview',
    generating: 'Generating preview…',
  },
} as const

interface WechatCopyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  markdownContent: string
  locale?: Locale
}

type CopyStatus = 'idle' | 'html' | 'plain' | 'error'

// 降级复制纯文本（ClipboardItem 不可用时）
function copyTextFallback(text: string): boolean {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export function WechatCopyDialog({
  open,
  onOpenChange,
  markdownContent,
  locale = 'zh',
}: WechatCopyDialogProps) {
  const copy = WECHAT_COPY[locale]
  const themes = getWechatThemes(locale)
  const [themeId, setThemeId] = useState<WechatThemeId>('classicBlue')
  const [inlineHtml, setInlineHtml] = useState('')
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 打开时 / 内容或主题变化时重新生成内联样式 HTML
  useEffect(() => {
    if (!open) return
    let cancelled = false
    renderWechatHtml(markdownContent, themeId)
      .then((html) => {
        if (!cancelled) setInlineHtml(html)
      })
      .catch(() => {
        if (!cancelled) setInlineHtml('')
      })
    return () => {
      cancelled = true
    }
  }, [open, markdownContent, themeId])

  // 卸载时清理反馈重置定时器
  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  const handleCopy = async () => {
    if (!inlineHtml) return
    const plain = wechatPlainText(inlineHtml)

    try {
      // ClipboardItem + text/html：粘贴到富文本编辑器（如公众号编辑器）时保留排版
      if (
        typeof ClipboardItem === 'undefined' ||
        !navigator.clipboard ||
        typeof navigator.clipboard.write !== 'function'
      ) {
        throw new Error('ClipboardItem unavailable')
      }
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([inlineHtml], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' })
        })
      ])
      setCopyStatus('html')
      trackToolExport('markdown_to_image', 'copy_wechat', { theme: themeId, mode: 'html' })
    } catch {
      // 降级：复制纯文本
      const ok = copyTextFallback(plain)
      setCopyStatus(ok ? 'plain' : 'error')
      if (ok) {
        trackToolExport('markdown_to_image', 'copy_wechat', { theme: themeId, mode: 'plain' })
      }
    }

    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopyStatus('idle'), 3500)
  }

  const statusView: Record<CopyStatus, { className: string; text: string } | null> = {
    idle: null,
    html: {
      className: 'text-sm text-green-600 flex items-center gap-1.5',
      text: copy.statusHtml
    },
    plain: {
      className: 'text-sm text-amber-600 flex items-center gap-1.5',
      text: copy.statusPlain
    },
    error: {
      className: 'text-sm text-red-600 flex items-center gap-1.5',
      text: copy.statusError
    }
  }
  const status = statusView[copyStatus]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[260px_1fr] gap-5 py-2">
          {/* 左侧：主题选择 + 操作 */}
          <div className="space-y-4">
            <div>
              <Label>{copy.themeLabel}</Label>
              <div className="grid grid-cols-3 md:grid-cols-1 gap-2 mt-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`rounded-lg border-2 p-2 text-left transition-all ${
                      themeId === t.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="h-6 w-full rounded" style={{ background: t.swatch }} />
                    <div className="mt-1.5 text-xs font-medium">{t.label}</div>
                    <div className="hidden md:block text-[10px] leading-tight text-muted-foreground mt-0.5">
                      {t.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleCopy} disabled={!inlineHtml} className="w-full flex items-center gap-2">
              {copyStatus === 'html' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ClipboardCopy className="w-4 h-4" />
              )}
              {copyStatus === 'html' ? copy.copiedButton : copy.copyButton}
            </Button>

            {status && (
              <div className={status.className}>
                {copyStatus === 'html' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                {copyStatus === 'plain' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                {copyStatus === 'error' && <XCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{status.text}</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              {copy.supported}
            </p>
          </div>

          {/* 右侧：排版预览（模拟公众号正文白底） */}
          <div className="space-y-2">
            <Label>{copy.previewLabel}</Label>
            <div className="rounded-lg border bg-white p-5 max-h-[460px] overflow-y-auto">
              <div
                className="mx-auto w-full max-w-[440px]"
                dangerouslySetInnerHTML={{ __html: inlineHtml || `<p style="color:#94a3b8;font-size:14px;">${copy.generating}</p>` }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
