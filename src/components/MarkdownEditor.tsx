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

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  isFullscreen?: boolean
}

export function MarkdownEditor({ value, onChange, isFullscreen = false }: MarkdownEditorProps) {
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
        insertText(`**${selectedText || '粗体文本'}**`, selectedText ? undefined : 2)
        break
      case 'italic':
        insertText(`*${selectedText || '斜体文本'}*`, selectedText ? undefined : 1)
        break
      case 'heading':
        insertText(`## ${selectedText || '标题'}`, selectedText ? undefined : 3)
        break
      case 'list':
        insertText(`\n- ${selectedText || '列表项'}`, selectedText ? undefined : 3)
        break
      case 'link':
        insertText(`[${selectedText || '链接文本'}](https://example.com)`, selectedText ? undefined : 1)
        break
      case 'code':
        if (selectedText.includes('\n')) {
          insertText(`\`\`\`\n${selectedText || 'code'}\n\`\`\``)
        } else {
          insertText(`\`${selectedText || 'code'}\``, selectedText ? undefined : 1)
        }
        break
      case 'quote':
        insertText(`> ${selectedText || '引用文本'}`, selectedText ? undefined : 2)
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
      insertText(`![图片](${base64})`)
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
            insertText(`![图片](${base64})`)
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
          title="粗体 (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('italic')}
          className="h-8 w-8"
          title="斜体 (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('heading')}
          className="h-8 w-8"
          title="标题"
        >
          <Heading className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('list')}
          className="h-8 w-8"
          title="列表"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('quote')}
          className="h-8 w-8"
          title="引用"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('code')}
          className="h-8 w-8"
          title="代码"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('link')}
          className="h-8 w-8"
          title="链接"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('image')}
          className="h-8 w-8"
          title="插入图片"
        >
          <Image className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleToolbarAction('clear')}
          className="h-8 w-8 text-destructive hover:text-destructive"
          title="清空"
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
        placeholder="在这里输入你的 Markdown 内容..."
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
