'use client'

import { forwardRef, useEffect, useState } from 'react'
import {
  getPosterStyle,
  getContentStyle,
  getFontVars,
  getThemeClass,
  renderMarkdown,
  type PosterSettings
} from '@/lib/markdown-poster'

interface ImagePreviewProps {
  markdownContent: string
  settings: PosterSettings
  zoom: number
  isFullscreen?: boolean
}

export const ImagePreview = forwardRef<HTMLDivElement, ImagePreviewProps>(
  ({ markdownContent, settings, zoom, isFullscreen = false }, ref) => {
    const [htmlContent, setHtmlContent] = useState('')
    const [isMobile, setIsMobile] = useState(false)

    // 检测是否为移动设备
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // 更新 HTML 内容
    useEffect(() => {
      renderMarkdown(markdownContent)
        .then(setHtmlContent)
        .catch(() => setHtmlContent(''))
    }, [markdownContent])

    // 与导出逻辑共用的内联样式
    const posterStyle: React.CSSProperties = getPosterStyle(settings, { isMobile, zoom })
    const contentStyle: React.CSSProperties = getContentStyle(settings, isMobile)

    return (
      <div
        ref={ref}
        className={`overflow-auto bg-muted/30 rounded-lg ${isFullscreen ? 'h-full p-2' : 'min-h-[400px] md:min-h-[700px] max-h-[450px] md:max-h-[750px] p-2 md:p-4'}`}
      >
        <div
          style={posterStyle}
          className="markdown-poster"
        >
          <div
            style={contentStyle}
            className="markdown-content"
          >
            {markdownContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                className={getThemeClass(settings.theme)}
                style={getFontVars(settings, isMobile) as any}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">开始创作吧！</h3>
                <p className="text-sm">在左侧编辑器中输入 Markdown 内容</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

ImagePreview.displayName = 'ImagePreview'
