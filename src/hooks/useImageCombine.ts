import { useState, useCallback } from 'react'

export interface ImageData {
  id: string
  src: string
  position: string
  scale: number
  width: number
  height: number
}

export interface ElementData {
  id: number
  type: 'text' | 'arrow' | 'rectangle' | 'ellipse'
  content?: string
  x: number
  y: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  width?: number
  height?: number
  rotation?: number
  style: {
    color: string
    fontSize?: number
    strokeWidth?: number
  }
}

export interface LayoutConfig {
  layoutId: string
  stitchingDirection: 'horizontal' | 'vertical'
  aspectRatio: string
}

export interface StyleConfig {
  spacing: number
  radius: number
  bgColor: string
  backgroundImage: string | null
  borderWidths: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export type Mode = 'layout' | 'stitching'

export function useImageCombine() {
  const [mode, setMode] = useState<Mode>('layout')
  
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    layoutId: '2-t1b1',
    stitchingDirection: 'horizontal',
    aspectRatio: '1/1'
  })

  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    spacing: 10,
    radius: 8,
    bgColor: '#FFFFFF',
    backgroundImage: null,
    borderWidths: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  })

  const [images, setImages] = useState<ImageData[]>([])
  const [elements, setElements] = useState<ElementData[]>([])
  const [selectedElement, setSelectedElement] = useState<number | null>(null)

  const shuffleImages = useCallback(() => {
    if (images.length < 2) return
    
    setImages(prev => {
      const shuffled = [...prev]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    })
  }, [images.length])

  const clearAll = useCallback(() => {
    setImages([])
    setElements([])
    setSelectedElement(null)
  }, [])

  const exportImage = useCallback(async (format: 'png' | 'jpeg' | 'webp' = 'png', quality = 0.9) => {
    // 使用html2canvas-pro导出图片（支持 object-fit，避免导出时图片变形）
    const html2canvas = (await import('html2canvas-pro')).default
    const element = document.getElementById('image-grid-container')

    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        // JPEG 不支持透明，用背景色填充；PNG/WebP 保留透明
        backgroundColor: format === 'jpeg' ? styleConfig.bgColor : null,
        scale: 2
      })

      // JPEG 文件扩展名习惯用 .jpg
      const ext = format === 'jpeg' ? 'jpg' : format
      const link = document.createElement('a')
      link.download = `${mode}-collage-${Date.now()}.${ext}`
      link.href = canvas.toDataURL(`image/${format}`, format === 'png' ? undefined : quality)
      link.click()
    } catch (error) {
      console.error('导出失败:', error)
    }
  }, [mode, styleConfig.bgColor])

  return {
    mode,
    setMode,
    layoutConfig,
    setLayoutConfig,
    styleConfig,
    setStyleConfig,
    images,
    setImages,
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    shuffleImages,
    clearAll,
    exportImage
  }
} 