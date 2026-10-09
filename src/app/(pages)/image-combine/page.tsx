'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X, Download, Type, ArrowRight, Square, Circle, Copy, Palette } from 'lucide-react'
import { CanvasElement } from '@/components/CanvasToolbar'
import { trackToolExport } from '@/lib/analytics'

// 布局定义
const LAYOUTS = {
  // 2张图片
  "2-t1b1": { g: 2, gr: [2, 1], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }] },
  "2-l1r1": { g: 2, gr: [1, 2], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 3张图片
  "3-t1b2": { g: 3, gr: [2, 2], c: [{ r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "3-t2b1": { g: 3, gr: [2, 2], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }] },
  "3-l1r2": { g: 3, gr: [2, 2], c: [{ r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "3-l2r1": { g: 3, gr: [2, 2], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }] },
  
  // 4张图片
  "4-grid": { g: 4, gr: [2, 2] },
  "4-t1b3": { g: 4, gr: [2, 3], c: [{ r: 1, c: 3 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "4-b1t3": { g: 4, gr: [2, 3], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 3 }] },
  "4-l1r3": { g: 4, gr: [3, 2], c: [{ r: 3, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "4-r1l3": { g: 4, gr: [3, 2], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 3, c: 1 }] },
  "4-line": { g: 4, gr: [1, 4] },
  
  // 5张图片
  "5-t1b4": { g: 5, gr: [2, 4], c: [{ r: 1, c: 4 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "5-b1t4": { g: 5, gr: [2, 4], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 4 }] },
  "5-l1r4": { g: 5, gr: [4, 2], c: [{ r: 4, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "5-r1l4": { g: 5, gr: [4, 2], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 4, c: 1 }] },
  
  // 6张图片
  "6-g3x2": { g: 6, gr: [3, 2] },
  "6-g2x3": { g: 6, gr: [2, 3] },
  "6-t2b4": { g: 6, gr: [2, 4], c: [{ r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "6-line": { g: 6, gr: [1, 6] },
  
  // 7张图片
  "7-t1b6": { g: 7, gr: [2, 6], c: [{ r: 1, c: 6 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "7-l1r6": { g: 7, gr: [6, 2], c: [{ r: 6, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 8张图片
  "8-g4x2": { g: 8, gr: [4, 2] },
  "8-g2x4": { g: 8, gr: [2, 4] },
  "8-t2b6": { g: 8, gr: [2, 6], c: [{ r: 1, c: 3 }, { r: 1, c: 3 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "8-line": { g: 8, gr: [1, 8] },
  
  // 9张图片
  "9-grid": { g: 9, gr: [3, 3] },
  "9-t3b6": { g: 9, gr: [2, 6], c: [{ r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 10张图片
  "10-g5x2": { g: 10, gr: [5, 2] },
  "10-g2x5": { g: 10, gr: [2, 5] },
  "10-t2b8": { g: 10, gr: [2, 8], c: [{ r: 1, c: 4 }, { r: 1, c: 4 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 11张图片
  "11-t1b10": { g: 11, gr: [2, 10], c: [{ r: 1, c: 10 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "11-t3b8": { g: 11, gr: [2, 8], c: [{ r: 1, c: 3 }, { r: 1, c: 3 }, { r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 12张图片
  "12-g4x3": { g: 12, gr: [4, 3] },
  "12-g3x4": { g: 12, gr: [3, 4] },
  "12-g6x2": { g: 12, gr: [6, 2] },
  "12-g2x6": { g: 12, gr: [2, 6] },
  
  // 13张图片
  "13-t1b12": { g: 13, gr: [2, 12], c: [{ r: 1, c: 12 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "13-t4b9": { g: 13, gr: [2, 9], c: [{ r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 14张图片
  "14-g7x2": { g: 14, gr: [7, 2] },
  "14-g2x7": { g: 14, gr: [2, 7] },
  
  // 15张图片
  "15-g5x3": { g: 15, gr: [5, 3] },
  "15-g3x5": { g: 15, gr: [3, 5] },
  
  // 16张图片
  "16-g4x4": { g: 16, gr: [4, 4] },
  "16-g8x2": { g: 16, gr: [8, 2] },
  "16-g2x8": { g: 16, gr: [2, 8] }
} as const

interface ImageData {
  id: string
  src: string
  file: File
}

export default function ImageCombinePage() {
  const [mode, setMode] = useState<'layout' | 'stitching'>('layout')
  const [images, setImages] = useState<ImageData[]>([])
  const [spacing, setSpacing] = useState(10)
  const [radius, setRadius] = useState(8)
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal')
  const [selectedLayout, setSelectedLayout] = useState('2-t1b1')
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<number | null>(null)
  const [nextElementId, setNextElementId] = useState(1)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [borderWidths, setBorderWidths] = useState({ top: 10, right: 10, bottom: 10, left: 10 })
  const [borderInputs, setBorderInputs] = useState({ top: '10', right: '10', bottom: '10', left: '10' })
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null)
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 })
  // 处理粘贴图片
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const clipboardItems = event.clipboardData?.items
      if (clipboardItems) {
        const itemsArray = Array.from(clipboardItems)
        const imageItems = itemsArray.filter(item => item.type.startsWith('image/'))
          
        if (imageItems.length > 0) {
          event.preventDefault() // 阻止默认粘贴行为
          
          // 创建一个 FileList 对象
          const dataTransfer = new DataTransfer()
          
          imageItems.forEach(item => {
            const file = item.getAsFile()
            if (file) {
              dataTransfer.items.add(file)
            }
          })
          
          // 调用已有的文件上传处理函数
          if (dataTransfer.files.length > 0) {
            handleFileUpload(dataTransfer.files)
          }
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [])

  // 图片拖拽交换状态
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)
  const [watermarkText, setWatermarkText] = useState('水印文字')
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right')
  const [watermarkOpacity, setWatermarkOpacity] = useState(50)
  const [watermarkSize, setWatermarkSize] = useState(16)
  const [watermarkColor, setWatermarkColor] = useState('#FFFFFF')
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null)
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text')
  const [watermarkMode, setWatermarkMode] = useState<'single' | 'tiled'>('single')
  const [watermarkSpacing, setWatermarkSpacing] = useState(150)
  const [watermarkRotation, setWatermarkRotation] = useState(-45)

  // 导出格式与质量设置
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [exportQuality, setExportQuality] = useState(0.9)
  
  // 文字编辑状态
  const [editingTextId, setEditingTextId] = useState<number | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // 处理全局鼠标事件
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        setDragOffset({ x: 0, y: 0 })
      }
      if (isResizing) {
        setIsResizing(false)
        setResizeHandle(null)
        setResizeStartSize({ width: 0, height: 0 })
      }
    }

    if (isDragging || isResizing) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, isResizing])

  // 处理全局点击事件，清空选中和编辑状态
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // 检查点击是否在画布区域内
      const canvasElement = canvasRef.current
      if (canvasElement && !canvasElement.contains(e.target as Node)) {
        // 点击在画布外，清空状态
        setSelectedElement(null)
        setEditingTextId(null)
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => {
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [])

  const handleFileUpload = (files: FileList | null, targetIndex?: number) => {
    if (!files) return
    
    const newImages: ImageData[] = []
    let loadedCount = 0
    const totalImages = Array.from(files).filter(f => f.type.startsWith('image/')).length
    
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          // 使用更唯一的ID生成方式，包含时间戳、索引和随机数
          const newImage: ImageData = {
            id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            src: e.target?.result as string,
            file
          }
          newImages[index] = newImage
          loadedCount++
          
          if (loadedCount === totalImages) {
            // 过滤掉undefined值，保持顺序
            const validImages = newImages.filter(img => img !== undefined)
            
            if (typeof targetIndex === 'number') {
              // 如果指定了目标位置，则将图片放到指定位置
              setImages(prev => {
                const newArray = [...prev]
                validImages.forEach((img, idx) => {
                  if (targetIndex + idx < newArray.length) {
                    newArray[targetIndex + idx] = img
                  } else {
                    newArray.push(img)
                  }
                })
                return newArray
              })
            } else {
              // 否则添加到末尾
              setImages(prev => [...prev, ...validImages])
            }
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const shuffleImages = () => {
    if (images.length < 2) return
    setImages(prev => {
      const shuffled = [...prev]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    })
  }

  // 图片拖拽交换处理函数
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // 设置拖拽时的预览图片
    if (images[index]) {
      const img = new Image()
      img.src = images[index].src
      e.dataTransfer.setDragImage(img, 50, 50)
    }
  }

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleImageDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) {
      setDraggedImageIndex(null)
      setDragOverIndex(null)
      return
    }

    // 交换图片位置
    setImages(prev => {
      const newImages = [...prev]
      const draggedImage = newImages[draggedImageIndex]
      const targetImage = newImages[dropIndex]
      
      // 如果目标位置有图片，则交换
      if (targetImage) {
        newImages[draggedImageIndex] = targetImage
        newImages[dropIndex] = draggedImage
      } else {
        // 如果目标位置为空，则移动图片到该位置，原位置设为undefined
        newImages[dropIndex] = draggedImage
        newImages[draggedImageIndex] = undefined as any
      }
      
      return newImages
    })

    setDraggedImageIndex(null)
    setDragOverIndex(null)
  }

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null)
    setDragOverIndex(null)
  }

  // 处理特定位置的文件上传
  const handlePositionFileUpload = (targetIndex: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      handleFileUpload(files, targetIndex)
      // 重置input的值，确保同一个文件可以再次选择
      input.value = ''
    }
    input.click()
  }

  const exportImage = async (format: 'png' | 'jpeg' | 'webp' = 'png') => {
    if (!canvasRef.current) return

    try {
      // 动态导入html2canvas-pro（支持 object-fit，避免导出时图片变形）
      const html2canvas = (await import('html2canvas-pro')).default

      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        // JPEG 不支持透明，用背景色填充；PNG/WebP 保留透明
        backgroundColor: format === 'jpeg' ? bgColor : null,
        scale: 2
      })

      const mimeType = `image/${format}`
      const quality = format === 'png' ? undefined : exportQuality
      // JPEG 文件扩展名习惯用 .jpg
      const ext = format === 'jpeg' ? 'jpg' : format

      const link = document.createElement('a')
      link.download = `${mode}-collage-${Date.now()}.${ext}`
      link.href = canvas.toDataURL(mimeType, quality)
      link.click()
      trackToolExport('image_combine', 'download', { format })
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请重试')
    }
  }

  // 画布元素管理函数
  const addCanvasElement = (element: Omit<CanvasElement, 'id'>) => {
    const newElement: CanvasElement = {
      ...element,
      id: nextElementId
    }
    setCanvasElements(prev => [...prev, newElement])
    setNextElementId(prev => prev + 1)
    setSelectedElement(newElement.id)
    
    // 如果是文字元素，自动进入编辑状态
    if (element.type === 'text') {
      setEditingTextId(newElement.id)
      setTimeout(() => {
        const textElement = document.querySelector(`[data-element-id="${newElement.id}"]`) as HTMLDivElement
        if (textElement && textElement.focus) {
          try {
            textElement.focus()
            // 将光标定位到文字末尾
            const range = document.createRange()
            const selection = window.getSelection()
            if (textElement.childNodes.length > 0) {
              range.selectNodeContents(textElement)
              range.collapse(false) // 定位到末尾
              selection?.removeAllRanges()
              selection?.addRange(range)
            }
          } catch (error) {
            console.warn('Focus error:', error)
          }
        }
      }, 100)
    }
  }

  const updateCanvasElement = (id: number, updates: Partial<CanvasElement>) => {
    setCanvasElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    )
  }

  const deleteCanvasElement = (id: number) => {
    setCanvasElements(prev => prev.filter(el => el.id !== id))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const copyCanvasElement = (id: number) => {
    const elementToCopy = canvasElements.find(el => el.id === id)
    if (elementToCopy) {
      const newElement: CanvasElement = {
        ...elementToCopy,
        id: nextElementId,
        x: elementToCopy.x + 20, // 偏移位置
        y: elementToCopy.y + 20
      }
      setCanvasElements(prev => [...prev, newElement])
      setNextElementId(prev => prev + 1)
      setSelectedElement(newElement.id)
    }
  }

  // 获取水印位置样式
  const getWatermarkPositionStyle = (canvasWidth: number, canvasHeight: number) => {
    const margin = 20
    const style: React.CSSProperties = {
      position: 'absolute',
      opacity: watermarkOpacity / 100,
      pointerEvents: 'none',
      zIndex: 1000
    }

    switch (watermarkPosition) {
      case 'top-left':
        return { ...style, top: margin, left: margin }
      case 'top-right':
        return { ...style, top: margin, right: margin }
      case 'bottom-left':
        return { ...style, bottom: margin, left: margin }
      case 'bottom-right':
        return { ...style, bottom: margin, right: margin }
      case 'center':
        return { 
          ...style, 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        }
      default:
        return { ...style, bottom: margin, right: margin }
    }
  }

  // 渲染水印
  const renderWatermark = (canvasWidth: number, canvasHeight: number) => {
    if (!watermarkEnabled) return null

    if (watermarkMode === 'single') {
      // 单个水印模式
      const positionStyle = getWatermarkPositionStyle(canvasWidth, canvasHeight)

      if (watermarkType === 'text') {
        return (
          <div
            style={{
              ...positionStyle,
              fontSize: watermarkSize,
              color: watermarkColor,
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap'
            }}
          >
            {watermarkText}
          </div>
        )
      } else if (watermarkType === 'image' && watermarkImage) {
        return (
          <img
            src={watermarkImage}
            alt="水印"
            style={{
              ...positionStyle,
              maxWidth: Math.min(canvasWidth * 0.3, 200),
              maxHeight: Math.min(canvasHeight * 0.3, 200),
              objectFit: 'contain'
            }}
          />
        )
      }
    } else if (watermarkMode === 'tiled') {
      // 全图平铺水印模式
      const watermarks = []
      // 计算实际内容区域（减去边距）
      const contentWidth = canvasWidth - borderWidths.left - borderWidths.right
      const contentHeight = canvasHeight - borderWidths.top - borderWidths.bottom
      
      const cols = Math.ceil(contentWidth / watermarkSpacing) + 1
      const rows = Math.ceil(contentHeight / watermarkSpacing) + 1

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // 水印位置相对于内容区域，需要加上边距偏移
          const x = col * watermarkSpacing - watermarkSpacing / 2 + borderWidths.left
          const y = row * watermarkSpacing - watermarkSpacing / 2 + borderWidths.top
          
          if (watermarkType === 'text') {
            watermarks.push(
              <div
                key={`${row}-${col}`}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  fontSize: watermarkSize,
                  color: watermarkColor,
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                  opacity: watermarkOpacity / 100,
                  pointerEvents: 'none',
                  transform: `rotate(${watermarkRotation}deg)`,
                  transformOrigin: 'center',
                  userSelect: 'none',
                  zIndex: 1000
                }}
              >
                {watermarkText}
              </div>
            )
          } else if (watermarkType === 'image' && watermarkImage) {
            const imageSize = Math.min(watermarkSize * 3, 60)
            watermarks.push(
              <img
                key={`${row}-${col}`}
                src={watermarkImage}
                alt="水印"
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: imageSize,
                  height: imageSize,
                  opacity: watermarkOpacity / 100,
                  pointerEvents: 'none',
                  transform: `rotate(${watermarkRotation}deg)`,
                  transformOrigin: 'center',
                  objectFit: 'contain',
                  userSelect: 'none',
                  zIndex: 1000
                }}
              />
            )
          }
        }
      }

      return <>{watermarks}</>
    }

    return null
  }

  const handleElementClick = (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedElement(id)
  }

  const handleCanvasClick = () => {
    setSelectedElement(null)
    setEditingTextId(null) // 清除编辑状态
  }

  const handleMouseDown = (id: number, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const element = canvasElements.find(el => el.id === id)
    if (!element) return
    
    setSelectedElement(id)
    
    // 添加延迟来区分点击和拖拽
    const startTime = Date.now()
    const startX = event.clientX
    const startY = event.clientY
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left - element.x,
        y: event.clientY - rect.top - element.y
      })
    }

    // 监听鼠标移动来判断是否开始拖拽
    const handleMouseMoveStart = (e: MouseEvent) => {
      const distance = Math.sqrt(
        Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2)
      )
      
      // 如果移动距离超过5px，则开始拖拽
      if (distance > 5) {
        setIsDragging(true)
        document.removeEventListener('mousemove', handleMouseMoveStart)
      }
    }

    const handleMouseUpStart = () => {
      document.removeEventListener('mousemove', handleMouseMoveStart)
      document.removeEventListener('mouseup', handleMouseUpStart)
    }

    document.addEventListener('mousemove', handleMouseMoveStart)
    document.addEventListener('mouseup', handleMouseUpStart)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    // 处理拖拽移动
    if (isDragging && selectedElement !== null) {
      event.preventDefault()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const newX = event.clientX - rect.left - dragOffset.x
        const newY = event.clientY - rect.top - dragOffset.y
        
        // 使用 requestAnimationFrame 来优化拖拽性能
        requestAnimationFrame(() => {
          updateCanvasElement(selectedElement, {
            x: Math.max(0, newX),
            y: Math.max(0, newY)
          })
        })
      }
    }
    
    // 处理调整大小
    if (isResizing) {
      handleResizeMove(event)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      setDragOffset({ x: 0, y: 0 })
    }
    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
      setResizeStartSize({ width: 0, height: 0 })
    }
  }

  const handleResizeStart = (elementId: number, handle: 'nw' | 'ne' | 'sw' | 'se', event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const element = canvasElements.find(el => el.id === elementId)
    if (!element) return
    
    setSelectedElement(elementId)
    setIsResizing(true)
    setResizeHandle(handle)
    
    // 记录初始大小
    if (element.type === 'text') {
              setResizeStartSize({ width: element.style.fontSize || 24, height: element.style.fontSize || 24 })
    } else {
      setResizeStartSize({ width: element.width || 100, height: element.height || 100 })
    }
  }

  const handleResizeMove = (event: React.MouseEvent) => {
    if (!isResizing || selectedElement === null || !resizeHandle) return
    
    event.preventDefault()
    const element = canvasElements.find(el => el.id === selectedElement)
    if (!element) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    // 计算当前元素的边界
          const currentWidth = element.type === 'text' ? (element.style.fontSize || 24) * 6 : (element.width || 100)
      const currentHeight = element.type === 'text' ? (element.style.fontSize || 24) : (element.height || 100)
    
    let newWidth = currentWidth
    let newHeight = currentHeight
    
    // 根据拖拽的控制点计算新大小
    switch (resizeHandle) {
      case 'nw': // 左上角
        newWidth = Math.max(20, element.x + currentWidth - mouseX)
        newHeight = Math.max(20, element.y + currentHeight - mouseY)
        break
      case 'ne': // 右上角
        newWidth = Math.max(20, mouseX - element.x)
        newHeight = Math.max(20, element.y + currentHeight - mouseY)
        break
      case 'sw': // 左下角
        newWidth = Math.max(20, element.x + currentWidth - mouseX)
        newHeight = Math.max(20, mouseY - element.y)
        break
      case 'se': // 右下角
        newWidth = Math.max(20, mouseX - element.x)
        newHeight = Math.max(20, mouseY - element.y)
        break
    }
    
    // 根据元素类型更新大小
    requestAnimationFrame(() => {
      if (element.type === 'text') {
        // 文字元素调整字体大小，基于宽度计算
        const fontSize = Math.max(8, Math.min(48, Math.round(newWidth / 6)))
        updateCanvasElement(selectedElement, {
          style: { ...element.style, fontSize }
        })
      } else {
        // 图形元素调整宽高
        updateCanvasElement(selectedElement, {
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        })
      }
    })
  }

    // 获取画布的CSS样式（仅用于布局拼图模式）
  const getCanvasStyle = () => {
    let aspectRatioValue = '1 / 1'
    let width = '500px'
    let height = '500px'
    
    switch (aspectRatio) {
      case '1:1':
        aspectRatioValue = '1 / 1'
        width = '500px'
        height = '500px'
        break
      case '16:9':
        aspectRatioValue = '16 / 9'
        width = '500px'
        height = '281px'
        break
      case '9:16':
        aspectRatioValue = '9 / 16'
        width = '281px'
        height = '500px'
        break
      case '16:10':
        aspectRatioValue = '16 / 10'
        width = '500px'
        height = '313px'
        break
      case '4:3':
        aspectRatioValue = '4 / 3'
        width = '500px'
        height = '375px'
        break
      case '3:4':
        aspectRatioValue = '3 / 4'
        width = '375px'
        height = '500px'
        break
      case 'custom':
        const customW = parseInt(customWidth) || 1
        const customH = parseInt(customHeight) || 1
        aspectRatioValue = `${customW} / ${customH}`
        // 计算合适的显示尺寸，基准500px
        const ratio = customW / customH
        if (ratio >= 1) {
          // 横向或正方形
          width = '500px'
          height = `${500 / ratio}px`
        } else {
          // 竖向
          height = '500px'
          width = `${500 * ratio}px`
        }
        break
      default:
        aspectRatioValue = '1 / 1'
        width = '500px'
        height = '500px'
    }
    
    return {
      aspectRatio: aspectRatioValue,
      width: width,
      height: height
    }
  }

  const renderLayoutMode = () => {
    const layout = LAYOUTS[selectedLayout as keyof typeof LAYOUTS]
    if (!layout) return null

    const [rows, cols] = layout.gr
    const cells = (layout as any).c || Array.from({ length: rows * cols }, () => ({ r: 1, c: 1 }))
    
    return (
      <div
        ref={canvasRef}
        className="grid relative bg-card border shadow-sm overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: `${spacing}px`,
          backgroundColor: bgColor,
          borderRadius: `${radius}px`,
          padding: `${borderWidths.top}px ${borderWidths.right}px ${borderWidths.bottom}px ${borderWidths.left}px`,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxSizing: 'border-box',
          ...getCanvasStyle()
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {cells.map((cell: any, index: number) => {
          const image = images[index]
          return (
            <div
              key={index}
              className={`relative rounded-lg overflow-hidden flex items-center justify-center group transition-all duration-200 ${
                image 
                  ? `cursor-move ${draggedImageIndex === index ? 'opacity-50 scale-95' : ''} ${dragOverIndex === index ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''}` 
                  : `border-2 border-dashed border-muted-foreground/30 bg-muted/10 hover:border-primary/50 ${dragOverIndex === index ? 'border-primary bg-primary/10' : ''}`
              }`}
              style={{
                gridRowEnd: `span ${cell.r}`,
                gridColumnEnd: `span ${cell.c}`,
                borderRadius: `${radius}px`,
                ...((cell as any).s && {
                  gridRowStart: (cell as any).s[0],
                  gridColumnStart: (cell as any).s[1]
                })
              }}
              draggable={!!image}
              onDragStart={(e) => image && handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e, index)}
              onDragLeave={handleImageDragLeave}
              onDrop={(e) => handleImageDrop(e, index)}
              onDragEnd={handleImageDragEnd}
            >
              {image ? (
                <>
                  <img
                    src={image.src}
                    alt={`拼图 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => removeImage(image.id)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center text-muted-foreground cursor-pointer w-full h-full"
                  onClick={() => handlePositionFileUpload(index)}
                >
                  <Plus size={24} />
                  <span className="text-xs mt-1">选择图片</span>
                </div>
              )}
            </div>
          )
        })}
        
        {/* 渲染画布元素 */}
        {canvasElements.map((element) => (
          <div
            key={element.id}
            className={`absolute cursor-move select-none group ${selectedElement === element.id ? 'ring-2 ring-primary ring-offset-1' : ''}`}
            style={{
              left: `${element.x}px`,
              top: `${element.y}px`,
              transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              zIndex: selectedElement === element.id ? 20 : 10
            }}
            onMouseDown={(e) => {
              // 如果是文字元素且正在编辑状态，不触发拖拽
              if (element.type === 'text' && editingTextId === element.id) {
                return
              }
              handleMouseDown(element.id, e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (!isDragging) {
                setSelectedElement(element.id)
              }
            }}
          >
            {/* 元素内容 */}
            <div className="relative">
              {element.type === 'text' && (
                <div
                  data-element-id={element.id}
                  style={{
                    color: element.style.color,
                    fontSize: `${element.style.fontSize}px`,
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    minWidth: '20px',
                    minHeight: '20px',
                    outline: 'none',
                    border: selectedElement === element.id ? '1px dashed rgba(59, 130, 246, 0.5)' : 'none',
                    padding: '2px',
                    cursor: editingTextId === element.id ? 'text' : 'move'
                  }}
                  contentEditable={editingTextId === element.id}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newContent = e.target.textContent || ''
                    if (newContent !== element.content) {
                      updateCanvasElement(element.id, { content: newContent })
                    }
                    setEditingTextId(null)
                  }}
                  onInput={(e) => {
                    // 实时更新内容，但不触发重新渲染
                    const target = e.target as HTMLDivElement
                    element.content = target.textContent || ''
                  }}
                  onFocus={(e) => {
                    e.stopPropagation()
                    setSelectedElement(element.id)
                    setEditingTextId(element.id)
                  }}
                  onMouseDown={(e) => {
                    // 如果正在编辑状态，阻止拖拽
                    if (editingTextId === element.id) {
                      e.stopPropagation()
                    }
                    // 如果不在编辑状态，允许拖拽
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (editingTextId !== element.id) {
                      // 单击进入编辑状态
                      setEditingTextId(element.id)
                      setSelectedElement(element.id)
                      // 延迟聚焦，确保contentEditable生效
                      setTimeout(() => {
                        const textElement = e.currentTarget
                        if (textElement && textElement.focus) {
                          try {
                            textElement.focus()
                            // 将光标定位到点击位置或末尾
                            const range = document.createRange()
                            const selection = window.getSelection()
                            if (textElement.childNodes.length > 0) {
                              range.selectNodeContents(textElement)
                              range.collapse(false)
                              selection?.removeAllRanges()
                              selection?.addRange(range)
                            }
                          } catch (error) {
                            console.warn('Focus error:', error)
                          }
                        }
                      }, 10)
                    }
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      e.currentTarget.blur()
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      e.currentTarget.blur()
                    }
                  }}
                >
                  {element.content}
                </div>
              )}
              {element.type === 'arrow' && (
                <svg
                  width={element.width}
                  height={element.height}
                  viewBox={`0 0 ${element.width} ${element.height}`}
                  style={{ 
                    overflow: 'visible', 
                    willChange: 'transform',
                    transform: 'translateZ(0)', // 强制硬件加速
                    backfaceVisibility: 'hidden' // 优化渲染
                  }}
                >
                  {/* 箭头主体线条 */}
                  <line
                    x1="5"
                    y1={element.height! / 2}
                    x2={element.width! - 15}
                    y2={element.height! / 2}
                    stroke={element.style.color}
                    strokeWidth={element.style.strokeWidth}
                  />
                  {/* 箭头头部 - 直接绘制而不使用marker */}
                  <polygon
                    points={`${element.width! - 15},${element.height! / 2 - 5} ${element.width! - 5},${element.height! / 2} ${element.width! - 15},${element.height! / 2 + 5}`}
                    fill={element.style.color}
                    stroke={element.style.color}
                    strokeWidth={element.style.strokeWidth}
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {element.type === 'rectangle' && (
                <div
                  style={{
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    border: `${element.style.strokeWidth}px solid ${element.style.color}`,
                    backgroundColor: 'transparent'
                  }}
                />
              )}
              {element.type === 'circle' && (
                <div
                  style={{
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    border: `${element.style.strokeWidth}px solid ${element.style.color}`,
                    borderRadius: '50%',
                    backgroundColor: 'transparent'
                  }}
                />
              )}
            </div>

            {/* 调整大小控制点 - 仅在选中且未拖拽时显示 */}
            {selectedElement === element.id && !isDragging && !isResizing && (
              <>
                {/* 四个角的调整控制点 */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-nw-resize"
                  style={{ left: '-6px', top: '-6px' }}
                  onMouseDown={(e) => handleResizeStart(element.id, 'nw', e)}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-ne-resize"
                  style={{ right: '-6px', top: '-6px' }}
                  onMouseDown={(e) => handleResizeStart(element.id, 'ne', e)}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-sw-resize"
                  style={{ left: '-6px', bottom: '-6px' }}
                  onMouseDown={(e) => handleResizeStart(element.id, 'sw', e)}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-se-resize"
                  style={{ right: '-6px', bottom: '-6px' }}
                  onMouseDown={(e) => handleResizeStart(element.id, 'se', e)}
                />
              </>
            )}

            {/* 浮动工具栏 - 仅在选中且未拖拽未调整大小时显示 */}
            {selectedElement === element.id && !isDragging && !isResizing && (
              <div 
                className="absolute -top-12 left-0 flex items-center gap-1 bg-white border rounded-lg shadow-lg p-1 z-30"
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
              >
                {/* 字体大小调整 - 仅文字元素显示，放在第一位 */}
                {element.type === 'text' && (
                  <Input
                    type="number"
                    min="8"
                    max="48"
                    value={element.style.fontSize || 24}
                    onChange={(e) => {
                      e.stopPropagation()
                      const inputValue = e.target.value
                      if (inputValue === '') {
                        updateCanvasElement(element.id, {
                          style: { ...element.style, fontSize: 24 }
                        })
                      } else {
                        const numValue = parseInt(inputValue)
                        if (!isNaN(numValue) && numValue >= 8 && numValue <= 48) {
                          updateCanvasElement(element.id, {
                            style: { ...element.style, fontSize: numValue }
                          })
                        }
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="w-12 h-8 text-xs text-center p-1"
                    title="字体大小"
                  />
                )}

                {/* 线条粗细调整 - 仅图形元素显示，放在第一位 */}
                {element.type !== 'text' && (
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={element.style.strokeWidth || 2}
                    onChange={(e) => {
                      e.stopPropagation()
                      const inputValue = e.target.value
                      if (inputValue === '') {
                        updateCanvasElement(element.id, {
                          style: { ...element.style, strokeWidth: 2 }
                        })
                      } else {
                        const numValue = parseInt(inputValue)
                        if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
                          updateCanvasElement(element.id, {
                            style: { ...element.style, strokeWidth: numValue }
                          })
                        }
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="w-12 h-8 text-xs text-center p-1"
                    title="线条粗细"
                  />
                )}

                {/* 颜色选择器 - 所有元素都显示 */}
                <div className="relative">
                  <input
                    type="color"
                    value={element.style.color}
                    onChange={(e) => {
                      e.stopPropagation()
                      updateCanvasElement(element.id, {
                        style: { ...element.style, color: e.target.value }
                      })
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded border cursor-pointer"
                    title="更改颜色"
                  />
                </div>

                {/* 复制按钮 */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyCanvasElement(element.id)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="复制元素"
                >
                  <Copy size={14} />
                </Button>

                {/* 删除按钮 */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCanvasElement(element.id)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  title="删除元素"
                >
                  <X size={14} />
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {/* 渲染水印 */}
        {renderWatermark(parseFloat(getCanvasStyle().width || '500'), parseFloat(getCanvasStyle().height || '500'))}
      </div>
    )
  }

  const renderStitchingMode = () => {
    if (images.length === 0) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center cursor-pointer"
            style={{
              minHeight: '250px',
              minWidth: '400px',
              width: '400px'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center text-muted-foreground">
              <Plus size={48} />
              <p className="mt-2 text-sm">点击选择图片</p>
              <p className="text-xs opacity-70 mt-1">
                {direction === 'horizontal' ? '横向拼接' : '竖向拼接'}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={`relative ${direction === 'horizontal' ? 'w-full overflow-x-auto' : 'w-full overflow-y-auto flex justify-center'}`}
        style={{
          ...(direction === 'vertical' && {
            maxHeight: '784px'
          })
        }}
      >
        <div
          ref={canvasRef}
          className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} rounded-lg relative`}
          style={{
            gap: `${spacing}px`,
            backgroundColor: bgColor,
            borderRadius: `${radius}px`,
            padding: `${borderWidths.top}px ${borderWidths.right}px ${borderWidths.bottom}px ${borderWidths.left}px`,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // 根据拼接方向调整容器尺寸
            ...(direction === 'horizontal' 
              ? { 
                  minHeight: '250px',
                  width: 'fit-content'
                }
              : { 
                  minWidth: '400px',
                  width: '400px',
                  height: 'fit-content'
                }
            )
          }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {images.map((image) => (
          <div 
            key={image.id} 
            className="relative group flex-shrink-0"
            style={{
              // 横向和竖向都使用统一的容器尺寸
              width: '400px', 
              height: '250px'
            }}
          >
            <img
              src={image.src}
              alt="拼接图片"
              className="w-full h-full object-cover"
              style={{
                borderRadius: `${radius}px`
              }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                onClick={() => fileInputRef.current?.click()}
                title="添加图片"
              >
                <Plus size={12} />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-6 w-6 p-0"
                onClick={() => removeImage(image.id)}
                title="删除图片"
              >
                <X size={12} />
              </Button>
            </div>
          </div>
        ))}

        
        {/* 渲染水印 */}
        {renderWatermark(parseFloat(getCanvasStyle().width || '500'), parseFloat(getCanvasStyle().height || '500'))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4">
                       <div className="mb-8 text-center">
                 <h1 className="text-4xl font-bold text-foreground mb-4">
                   图片拼接
                 </h1>
                 <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                   支持多种网格布局和自定义图片拼接，轻松上传图片，调整间距、圆角和背景，创作出个性化的照片拼接作品。
                 </p>
               </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* 左侧布局选择面板 */}
          <div className="col-span-1 lg:col-span-3 order-2 lg:order-1">
            <Card className="flex flex-col h-auto lg:h-[862px]">
              <CardHeader>
                <CardTitle className="text-lg">布局选择</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-hidden">
                <Tabs value={mode} onValueChange={(value) => setMode(value as 'layout' | 'stitching')} className="flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="layout">布局拼接</TabsTrigger>
                    <TabsTrigger value="stitching">长图拼接</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="layout" className="space-y-4 flex-1 overflow-hidden">
                    <div className="space-y-4 overflow-y-auto h-full">
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(count => {
                        const layouts = Object.entries(LAYOUTS).filter(([, layout]) => layout.g === count)
                        if (layouts.length === 0) return null
                        
                        return (
                          <div key={count} className="space-y-2">
                            <h4 className="text-sm font-medium">{count} 张图片</h4>
                            <div className={`grid gap-2 ${count <= 6 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {layouts.map(([layoutId, layout]) => (
                                <Button
                                  key={layoutId}
                                  variant={selectedLayout === layoutId ? "default" : "outline"}
                                  size="sm"
                                  className="h-12 p-1"
                                  onClick={() => setSelectedLayout(layoutId)}
                                >
                                  <div 
                                    className="w-full h-full border rounded bg-muted/20 grid gap-0.5 p-0.5"
                                    style={{
                                      gridTemplateColumns: `repeat(${layout.gr[1]}, 1fr)`,
                                      gridTemplateRows: `repeat(${layout.gr[0]}, 1fr)`
                                    }}
                                  >
                                    {((layout as any).c || Array.from({ length: layout.gr[0] * layout.gr[1] }, () => ({ r: 1, c: 1 }))).map((cell: any, i: number) => (
                                      <div
                                        key={i}
                                        className="bg-primary/30 rounded-sm"
                                        style={{
                                          gridRowEnd: `span ${cell.r}`,
                                          gridColumnEnd: `span ${cell.c}`,
                                          ...((cell as any).s && {
                                            gridRowStart: (cell as any).s[0],
                                            gridColumnStart: (cell as any).s[1]
                                          })
                                        }}
                                      />
                                    ))}
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stitching" className="space-y-4 flex-1 overflow-hidden">
                           <div className="space-y-2">
                             <label className="text-xs font-medium">拼接方向</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={direction === 'horizontal' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDirection('horizontal')}
                          className="text-xs"
                        >
                          横向
                        </Button>
                        <Button
                          variant={direction === 'vertical' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDirection('vertical')}
                          className="text-xs"
                        >
                          竖向
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 中间区域：画布工具 + 画布 */}
          <div className="col-span-1 lg:col-span-6 space-y-4 flex flex-col items-center order-1 lg:order-2">
            {/* 画布工具栏 */}
            <Card className="w-full">
              <CardContent className="p-2 lg:p-4">
                <div className="flex flex-wrap items-center justify-center gap-1 lg:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCanvasElement({
                      type: 'text',
                      x: 50,
                      y: 50,
                      content: '文字',
                      style: { color: '#FF0000', fontSize: 24 }
                    })}
                    className="flex items-center gap-2"
                  >
                    文字
                    <Type size={16} />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCanvasElement({
                      type: 'arrow',
                      x: 30,
                      y: 30,
                      width: 100,
                      height: 20,
                      style: { color: '#FF0000', strokeWidth: 2 }
                    })}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight size={16} />
                    箭头
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCanvasElement({
                      type: 'rectangle',
                      x: 30,
                      y: 30,
                      width: 80,
                      height: 60,
                      style: { color: '#FF0000', strokeWidth: 2 }
                    })}
                    className="flex items-center gap-2"
                  >
                    <Square size={16} />
                    方框
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCanvasElement({
                      type: 'circle',
                      x: 30,
                      y: 30,
                      width: 60,
                      height: 60,
                      style: { color: '#FF0000', strokeWidth: 2 }
                    })}
                    className="flex items-center gap-2"
                  >
                    <Circle size={16} />
                    圆圈
                  </Button>

                  <div className="border-l mx-2 h-6"></div>

                  <Button 
                    onClick={shuffleImages} 
                    variant="outline" 
                    size="sm"
                    disabled={images.length < 2}
                  >
                    随机排序
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setImages([])
                      setCanvasElements([])
                      setSelectedElement(null)
                      setBorderWidths({ top: 10, right: 10, bottom: 10, left: 10 })
                      setBorderInputs({ top: '10', right: '10', bottom: '10', left: '10' })
                      setBackgroundImage(null)
                      setWatermarkEnabled(false)
                      setWatermarkText('水印文字')
                      setWatermarkPosition('bottom-right')
                      setWatermarkOpacity(50)
                      setWatermarkSize(16)
                      setWatermarkColor('#FFFFFF')
                      setWatermarkImage(null)
                      setWatermarkType('text')
                      setWatermarkMode('single')
                      setWatermarkSpacing(150)
                      setWatermarkRotation(-45)
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 画布区域 */}
            <div className="flex justify-center w-full overflow-x-auto">
              {mode === 'layout' ? renderLayoutMode() : renderStitchingMode()}
            </div>
            
            {/* 提示信息 */}
            <div className="flex justify-center mt-2">
              <p className="text-xs text-muted-foreground text-center">
                💡 支持粘贴图片（Ctrl+V / Cmd+V），可以拖拽图片进行位置交换
              </p>
            </div>
          </div>

          {/* 右侧画布设置面板 */}
          <div className="col-span-1 lg:col-span-3 order-3 lg:order-3">
            <Card className="flex flex-col h-auto lg:h-[862px]">
              <CardHeader>
                <CardTitle className="text-lg">画布设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto">
                {/* 画布比例 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">画布比例</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['1:1', '16:9', '9:16', '16:10', '4:3', '3:4'].map((ratio) => (
                      <Button
                        key={ratio}
                        variant={aspectRatio === ratio ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => setAspectRatio(ratio)}
                      >
                        {ratio}
                      </Button>
                    ))}
                  </div>
                  
                  {/* 自定义比例 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">自定义比例</label>
                    <div className="grid grid-cols-4 gap-2 items-center">
                      <Input
                        type="number"
                        min="1"
                        max="9999"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="h-10 text-sm text-center"
                        placeholder="宽"
                      />
                      <div className="flex justify-center px-1">
                        <span className="text-sm text-muted-foreground">:</span>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        max="9999"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="h-10 text-sm text-center"
                        placeholder="高"
                      />
                      <Button
                        size="sm"
                        className="text-xs h-10"
                        onClick={() => setAspectRatio('custom')}
                      >
                        应用
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 边距设置 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">边距 (上/右/下/左) px</label>
                  <div className="grid grid-cols-4 gap-1">
                    <Input
                      type="number"
                      min="0"
                      value={borderInputs.top}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        setBorderInputs(prev => ({ ...prev, top: inputValue }))
                        if (inputValue === '') {
                          setBorderWidths(prev => ({ ...prev, top: 0 }))
                        } else {
                          const numValue = parseInt(inputValue)
                          if (!isNaN(numValue) && numValue >= 0) {
                            setBorderWidths(prev => ({ ...prev, top: numValue }))
                          }
                        }
                      }}
                      placeholder="上"
                      className="text-center text-xs h-8"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={borderInputs.right}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        setBorderInputs(prev => ({ ...prev, right: inputValue }))
                        if (inputValue === '') {
                          setBorderWidths(prev => ({ ...prev, right: 0 }))
                        } else {
                          const numValue = parseInt(inputValue)
                          if (!isNaN(numValue) && numValue >= 0) {
                            setBorderWidths(prev => ({ ...prev, right: numValue }))
                          }
                        }
                      }}
                      placeholder="右"
                      className="text-center text-xs h-8"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={borderInputs.bottom}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        setBorderInputs(prev => ({ ...prev, bottom: inputValue }))
                        if (inputValue === '') {
                          setBorderWidths(prev => ({ ...prev, bottom: 0 }))
                        } else {
                          const numValue = parseInt(inputValue)
                          if (!isNaN(numValue) && numValue >= 0) {
                            setBorderWidths(prev => ({ ...prev, bottom: numValue }))
                          }
                        }
                      }}
                      placeholder="下"
                      className="text-center text-xs h-8"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={borderInputs.left}
                      onChange={(e) => {
                        const inputValue = e.target.value
                        setBorderInputs(prev => ({ ...prev, left: inputValue }))
                        if (inputValue === '') {
                          setBorderWidths(prev => ({ ...prev, left: 0 }))
                        } else {
                          const numValue = parseInt(inputValue)
                          if (!isNaN(numValue) && numValue >= 0) {
                            setBorderWidths(prev => ({ ...prev, left: numValue }))
                          }
                        }
                      }}
                      placeholder="左"
                      className="text-center text-xs h-8"
                    />
                  </div>
                </div>

                {/* 间距 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    间距: {spacing}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={spacing}
                    onChange={(e) => setSpacing(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* 圆角 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    圆角: {radius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* 背景颜色 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">背景颜色</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-8 rounded border"
                  />
                </div>

                {/* 背景图片 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">背景图片</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => document.getElementById('bg-upload')?.click()}
                    >
                      上传图片
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setBackgroundImage(null)}
                      disabled={!backgroundImage}
                    >
                      移除图片
                    </Button>
                  </div>
                  <input
                    id="bg-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setBackgroundImage(event.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </div>

                {/* 水印设置 */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">水印设置</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={watermarkEnabled}
                        onChange={(e) => setWatermarkEnabled(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-muted-foreground">启用</span>
                    </div>
                  </div>

                  {watermarkEnabled && (
                    <div className="space-y-3">
                      {/* 水印类型 */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium">水印类型</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={watermarkType === 'text' ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => setWatermarkType('text')}
                          >
                            文字水印
                          </Button>
                          <Button
                            variant={watermarkType === 'image' ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => setWatermarkType('image')}
                          >
                            图片水印
                          </Button>
                        </div>
                      </div>

                      {/* 水印模式 */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium">水印模式</label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={watermarkMode === 'single' ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => setWatermarkMode('single')}
                          >
                            单个水印
                          </Button>
                          <Button
                            variant={watermarkMode === 'tiled' ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => setWatermarkMode('tiled')}
                          >
                            全图水印
                          </Button>
                        </div>
                      </div>

                      {/* 文字水印设置 */}
                      {watermarkType === 'text' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">水印文字</label>
                            <Input
                              type="text"
                              value={watermarkText}
                              onChange={(e) => setWatermarkText(e.target.value)}
                              placeholder="输入水印文字"
                              className="text-xs h-8"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              字体大小: {watermarkSize}px
                            </label>
                            <input
                              type="range"
                              min="10"
                              max="48"
                              value={watermarkSize}
                              onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">文字颜色</label>
                            <input
                              type="color"
                              value={watermarkColor}
                              onChange={(e) => setWatermarkColor(e.target.value)}
                              className="w-full h-8 rounded border"
                            />
                          </div>
                        </>
                      )}

                      {/* 图片水印设置 */}
                      {watermarkType === 'image' && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium">水印图片</label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => document.getElementById('watermark-upload')?.click()}
                            >
                              上传图片
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => setWatermarkImage(null)}
                              disabled={!watermarkImage}
                            >
                              移除图片
                            </Button>
                          </div>
                          <input
                            id="watermark-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (event) => {
                                  setWatermarkImage(event.target?.result as string)
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                          />
                        </div>
                      )}

                      {/* 单个水印位置设置 */}
                      {watermarkMode === 'single' && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium">水印位置</label>
                          <div className="grid grid-cols-3 gap-1">
                            <Button
                              variant={watermarkPosition === 'top-left' ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setWatermarkPosition('top-left')}
                            >
                              左上
                            </Button>
                            <Button
                              variant={watermarkPosition === 'center' ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setWatermarkPosition('center')}
                            >
                              居中
                            </Button>
                            <Button
                              variant={watermarkPosition === 'top-right' ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setWatermarkPosition('top-right')}
                            >
                              右上
                            </Button>
                            <Button
                              variant={watermarkPosition === 'bottom-left' ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setWatermarkPosition('bottom-left')}
                            >
                              左下
                            </Button>
                            <div></div>
                            <Button
                              variant={watermarkPosition === 'bottom-right' ? "default" : "outline"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setWatermarkPosition('bottom-right')}
                            >
                              右下
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 全图水印设置 */}
                      {watermarkMode === 'tiled' && (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              水印间距: {watermarkSpacing}px
                            </label>
                            <input
                              type="range"
                              min="80"
                              max="300"
                              value={watermarkSpacing}
                              onChange={(e) => setWatermarkSpacing(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              旋转角度: {watermarkRotation}°
                            </label>
                            <input
                              type="range"
                              min="-90"
                              max="90"
                              value={watermarkRotation}
                              onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}

                      {/* 水印透明度 */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium">
                          透明度: {watermarkOpacity}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 导出设置 */}
                <div className="space-y-3 border-t pt-4">
                  <label className="text-sm font-medium">导出图片</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={exportFormat === 'png' ? "default" : "outline"}
                      onClick={() => setExportFormat('png')}
                      className="text-xs h-8"
                      size="sm"
                    >
                      PNG
                    </Button>
                    <Button
                      variant={exportFormat === 'jpeg' ? "default" : "outline"}
                      onClick={() => setExportFormat('jpeg')}
                      className="text-xs h-8"
                      size="sm"
                    >
                      JPEG
                    </Button>
                    <Button
                      variant={exportFormat === 'webp' ? "default" : "outline"}
                      onClick={() => setExportFormat('webp')}
                      className="text-xs h-8"
                      size="sm"
                    >
                      WebP
                    </Button>
                  </div>

                  {/* 质量滑块：仅 JPEG/WebP 有效（PNG 为无损格式） */}
                  {exportFormat !== 'png' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        质量: {exportQuality.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={exportQuality}
                        onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => exportImage(exportFormat)}
                    disabled={images.length === 0}
                    className="flex items-center gap-2 text-xs w-full"
                    size="sm"
                  >
                    <Download size={14} />
                    导出 {exportFormat === 'jpeg' ? 'JPEG' : exportFormat.toUpperCase()}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PNG支持透明背景，JPEG/WebP可调节质量，文件更小
                  </p>
                </div>


              </CardContent>
            </Card>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFileUpload(e.target.files)
            // 重置input的值，确保同一个文件可以再次选择
            if (e.target) {
              e.target.value = ''
            }
          }}
        />
      </div>
    </div>
  )
} 