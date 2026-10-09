'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MarkdownEditor } from '@/components/MarkdownEditor'
import { ImagePreview } from '@/components/ImagePreview'
import { CustomizeDialog } from '@/components/CustomizeDialog'
import { WechatCopyDialog } from '@/components/WechatCopyDialog'
import { Download, Settings, ZoomIn, ZoomOut, Maximize2, Minimize2, ClipboardCopy } from 'lucide-react'
import html2canvas from 'html2canvas-pro'
import { siteConfig } from '@/config/site'
import {
  posterBackgrounds,
  getPosterStyle,
  getContentStyle,
  getSizePreset,
  type PosterSettings
} from '@/lib/markdown-poster'
import '@/styles/markdown.css'

export default function MarkdownToImagePage() {
  const [markdownContent, setMarkdownContent] = useState(`# ${siteConfig.name}

> ${siteConfig.slogan} ✨

所有处理均在浏览器本地完成，文件不上传服务器，隐私安全，完全免费。

## ✨ 为什么选择我们

- **隐私安全** — 文件全程本地处理，不上传服务器
- **完全免费** — 无需注册，不限次数
- **简单易用** — 打开即用，一键导出精美图片

---

开始编辑你的 Markdown，右侧实时预览，随时导出分享 🎉
`)

  // 检测是否为移动设备
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const [zoom, setZoom] = useState(isMobile ? 50 : 75) // 移动端默认50%，桌面端75%
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isWechatOpen, setIsWechatOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor')
  const previewRef = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  // 样式设置
  const [settings, setSettings] = useState<PosterSettings>({
    background: 'gradient1',
    customGradient: {
      startColor: '#667eea',
      endColor: '#764ba2',
      direction: '135deg'
    },
    fontSize: 16,
    padding: 40,
    width: 640,
    sizePreset: 'custom',
    theme: 'classic',
    titleScale: 1
  })

  // 应用新设置：小红书预设画布较宽，自动降低预览缩放
  const handleSettingsChange = (next: PosterSettings) => {
    setSettings(next)
    const preset = getSizePreset(next.sizePreset)
    if (preset.width !== undefined && zoom > 50) {
      setZoom(50)
    }
  }

  // 处理缩放
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 150))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  // 处理全屏
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // 进入全屏时设置缩放为100%
      setZoom(100)
      setIsFullscreen(true)
    } else {
      // 退出全屏时恢复为75%
      setZoom(75)
      setIsFullscreen(false)
    }
  }

  // ESC键退出全屏
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setZoom(75) // 退出全屏时恢复为75%
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isFullscreen])

  // 导出为PNG
  const exportToPNG = async () => {
    if (!previewRef.current) return

    setIsExporting(true)

    // 小延迟确保按钮状态更新
    await new Promise(resolve => setTimeout(resolve, 50))

    try {
      // 直接获取预览区域的 markdown-poster 元素
      const posterElement = previewRef.current.querySelector('.markdown-poster') as HTMLElement
      if (!posterElement) {
        setIsExporting(false)
        return
      }

      // 与预览共用同一套内联样式（主题、画布预设在此生效），zoom=100 即为导出效果
      const preset = getSizePreset(settings.sizePreset)
      const exportWidth = preset.width ?? settings.width
      const posterStyle = getPosterStyle(settings, { isMobile: false, zoom: 100 })
      const contentStyle = getContentStyle(settings, false)

      // 创建临时容器
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.width = `${exportWidth}px`
      tempContainer.style.visibility = 'visible'
      tempContainer.style.opacity = '1'

      // 克隆元素并覆盖为导出样式（去掉缩放变换）
      const clonedElement = posterElement.cloneNode(true) as HTMLElement
      Object.assign(clonedElement.style, posterStyle, { transform: 'none', margin: '0' })
      clonedElement.style.width = `${exportWidth}px`

      // 处理内部内容容器（主题卡片样式）
      const innerContent = clonedElement.querySelector('.markdown-content') as HTMLElement
      if (innerContent) {
        Object.assign(innerContent.style, contentStyle)
      }

      tempContainer.appendChild(clonedElement)
      document.body.appendChild(tempContainer)

      // 等待渲染
      await new Promise(resolve => setTimeout(resolve, 100))

      // 使用 html2canvas 导出
      const canvas = await html2canvas(clonedElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: exportWidth,
        height: clonedElement.offsetHeight
      })

      // 移除临时容器
      document.body.removeChild(tempContainer)

      // 下载图片
      const link = document.createElement('a')
      link.download = `markdown-image-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()

    } catch (error) {
      console.error('导出失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      {/* 全屏模式 */}
      {isFullscreen && (
        <div 
          ref={fullscreenRef}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* 全屏模式工具栏 */}
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Markdown 转图片 - 全屏编辑模式</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomizing(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  设置
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWechatOpen(true)}
                  className="flex items-center gap-2"
                >
                  <ClipboardCopy className="w-4 h-4" />
                  公众号排版
                </Button>
                <Button
                  size="sm"
                  onClick={exportToPNG}
                  disabled={isExporting}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? '导出中...' : '导出'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2"
                >
                  <Minimize2 className="w-4 h-4" />
                  退出全屏
                </Button>
              </div>
            </div>
          </div>

          {/* 全屏模式内容区 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 左侧编辑器 */}
            <div className="flex-1 border-r flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b bg-muted/30 flex-shrink-0">
                <h3 className="font-medium flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Markdown 编辑器
                </h3>
              </div>
              <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <MarkdownEditor
                  value={markdownContent}
                  onChange={setMarkdownContent}
                  isFullscreen={true}
                />
              </div>
            </div>

            {/* 右侧预览 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b bg-muted/30 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <span className="text-lg">👁</span>
                    实时预览
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleZoomOut}
                      disabled={zoom <= 50}
                      className="h-8 w-8"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground w-12 text-center">
                      {zoom}%
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleZoomIn}
                      disabled={zoom >= 150}
                      className="h-8 w-8"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col p-4">
                <div className="flex-1 overflow-auto">
                  <ImagePreview
                    ref={previewRef}
                    markdownContent={markdownContent}
                    settings={settings}
                    zoom={zoom}
                    isFullscreen={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 常规模式 */}
      <div className="bg-background">
        <div className="container mx-auto py-4 md:py-8 px-4">
          {/* 页面标题和工具栏 */}
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Markdown 转图片</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
                  将 Markdown 文本转换为精美的图片海报
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomizing(true)}
                  className="flex items-center gap-1.5 text-xs md:text-sm"
                >
                  <Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  设置
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWechatOpen(true)}
                  className="flex items-center gap-1.5 text-xs md:text-sm"
                >
                  <ClipboardCopy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  公众号排版
                </Button>
                <Button
                  size="sm"
                  onClick={exportToPNG}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 text-xs md:text-sm"
                >
                  <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {isExporting ? '导出中...' : '导出'}
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleFullscreen}
                  className="hidden md:flex items-center gap-2"
                >
                  <Maximize2 className="w-4 h-4" />
                  全屏编辑
                </Button>
              </div>
            </div>
          </div>

        {/* 移动端标签切换 */}
        <div className="md:hidden mb-4">
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                mobileTab === 'editor' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              编辑器
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                mobileTab === 'preview' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              预览
            </button>
          </div>
        </div>

        {/* 主内容区 - 桌面端网格，移动端标签页 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧编辑器 */}
          <Card className={`${mobileTab === 'editor' ? 'block md:block' : 'hidden md:block'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <span className="text-lg">📝</span>
                Markdown 编辑器
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <MarkdownEditor
                value={markdownContent}
                onChange={setMarkdownContent}
              />
            </CardContent>
          </Card>

          {/* 右侧预览 */}
          <Card className={`${mobileTab === 'preview' ? 'block md:block' : 'hidden md:block'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👁</span>
                  实时预览
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    className="h-7 w-7 md:h-9 md:w-9"
                  >
                    <ZoomOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Button>
                  <span className="text-xs md:text-sm text-muted-foreground w-10 md:w-12 text-center">
                    {zoom}%
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleZoomIn}
                    disabled={zoom >= 150}
                    className="h-7 w-7 md:h-9 md:w-9"
                  >
                    <ZoomIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <ImagePreview
                ref={previewRef}
                markdownContent={markdownContent}
                settings={settings}
                zoom={zoom}
              />
            </CardContent>
          </Card>
        </div>

        {/* 自定义对话框 */}
        <CustomizeDialog
          open={isCustomizing}
          onOpenChange={setIsCustomizing}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          backgroundPresets={posterBackgrounds}
        />

        {/* 公众号排版复制对话框 */}
        <WechatCopyDialog
          open={isWechatOpen}
          onOpenChange={setIsWechatOpen}
          markdownContent={markdownContent}
        />
        </div>
      </div>
    </>
  )
}
