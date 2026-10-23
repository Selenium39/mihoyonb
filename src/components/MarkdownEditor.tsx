'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Heading, 
  List, 
  Link, 
  Image, 
  Trash2,
  Code,
  Quote
} from 'lucide-react'
import type { Locale } from '@/lib/i18n'

/**
 * 编辑器界面文案：默认中文，英文页传 locale="en"。
 * 中文保持原有字面量不变。
 */
const EDITOR_COPY = {
  zh: {
    placeholder: '在这里输入你的 Markdown 内容...',
    boldTitle: '粗体 (Ctrl+B)',
    italicTitle: '斜体 (Ctrl+I)',
    headingTitle: '标题',
    listTitle: '列表',
    quoteTitle: '引用',
    codeTitle: '代码',
    linkTitle: '链接',
    imageTitle: '插入图片',
    clearTitle: '清空',
    boldText: '粗体文本',
    italicText: '斜体文本',
    headingText: '标题',
    listText: '列表项',
    linkText: '链接文本',
    quoteText: '引用文本',
    imageAlt: '图片',
    codePlaceholder: 'code',
  },
  en: {
    placeholder: 'Type or paste Markdown here…',
    boldTitle: 'Bold (Ctrl+B)',
    italicTitle: 'Italic (Ctrl+I)',
    headingTitle: 'Heading',
    listTitle: 'Bulleted list',
    quoteTitle: 'Quote',
    codeTitle: 'Code',
    linkTitle: 'Link',
    imageTitle: 'Insert image',
    clearTitle: 'Clear',
    boldText: 'bold text',
    italicText: 'italic text',
    headingText: 'Heading',
    listText: 'list item',
    linkText: 'link text',
    quoteText: 'quote text',
    imageAlt: 'image',
    codePlaceholder: 'code',
  },
} as const

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  isFullscreen?: boolean
  locale?: Locale
}

export function MarkdownEditor({
  value,
  onChange,
  isFullscreen = false,
  locale = 'zh',
}: MarkdownEditorProps) {
  const copy = EDITOR_COPY[locale]
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 插入文本到光标位置
  const insertText = (text: string, moveCursor: number = 0) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const beforeText = textarea.value.substring(0, start)
    const afterText = textarea.value.substring(end)

    const newValue = beforeText + text + afterText
    onChange(newValue)

    // 设置光标位置
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + (moveCursor || text.length)
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // 处理工具栏按钮点击
  const handleToolbarAction = (action: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    switch(action) {
      case 'bold':
        insertText(`**${selectedText || copy.boldText}**`, selectedText ? undefined : 2)
        break
      case 'italic':
        insertText(`*${selectedText || copy.italicText}*`, selectedText ? undefined : 1)
        break
      case 'heading':
        insertText(`## ${selectedText || copy.headingText}`, selectedText ? undefined : 3)
        break
      case 'list':
        insertText(`\n- ${selectedText || copy.listText}`, selectedText ? undefined : 3)
        break
      case 'link':
        insertText(`[${selectedText || copy.linkText}](https://example.com)`, selectedText ? undefined : 1)
        break
      case 'code':
        if (selectedText.includes('\n')) {
          insertText(`\`\`\`\n${selectedText || copy.codePlaceholder}\n\`\`\``)
        } else {
          insertText(`\`${selectedText || copy.codePlaceholder}\``, selectedText ? undefined : 1)
        }
        break
      case 'quote':
        insertText(`> ${selectedText || copy.quoteText}`, selectedText ? undefined : 2)
        break
      case 'image':
        fileInputRef.current?.click()
        break
      case 'clear':
        onChange('')
        textarea.focus()
        break
    }
  }

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      insertText(`![${copy.imageAlt}](${base64})`)
    }
    reader.readAsDataURL(file)
  }

  // 处理粘贴事件
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault()
        const blob = items[i].getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const base64 = event.target?.result as string
            insertText(`![${copy.imageAlt}](${base64})`)
          }
          reader.readAsDataURL(blob)
        }
        break
      }
    }
  }

  return (
    <div className={`${isFullscreen ? 'flex flex-col h-full' : 'space-y-2'}`}>
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-md flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('bold')}
          className="h-8 w-8"
          title={copy.boldTitle}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('italic')}
          className="h-8 w-8"
          title={copy.italicTitle}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('heading')}
          className="h-8 w-8"
          title={copy.headingTitle}
        >
          <Heading className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('list')}
          className="h-8 w-8"
          title={copy.listTitle}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('quote')}
          className="h-8 w-8"
          title={copy.quoteTitle}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('code')}
          className="h-8 w-8"
          title={copy.codeTitle}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('link')}
          className="h-8 w-8"
          title={copy.linkTitle}
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('image')}
          className="h-8 w-8"
          title={copy.imageTitle}
        >
          <Image className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('clear')}
          className="h-8 w-8 text-destructive hover:text-destructive"
          title={copy.clearTitle}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* 编辑器 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        className={`w-full p-4 bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm ${
          isFullscreen ? 'flex-1' : 'min-h-[400px] md:min-h-[700px]'
        }`}
        placeholder={copy.placeholder}
        onKeyDown={(e) => {
          // 快捷键支持
          if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
              case 'b':
                e.preventDefault()
                handleToolbarAction('bold')
                break
              case 'i':
                e.preventDefault()
                handleToolbarAction('italic')
                break
            }
          }
        }}
      />

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  )
}
