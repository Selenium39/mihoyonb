import { useRef, useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react'
import { 
  ImageData, 
  ElementData, 
  LayoutConfig, 
  StyleConfig, 
  Mode 
} from '@/hooks/useImageCombine'

// 从原始代码提取的完整布局定义
const LAYOUTS = {
  // 2张图片
  "2-t1b1": { g: 2, gr: [2, 1], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }] },
  "2-l1r1": { g: 2, gr: [1, 2], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 3张图片
  "3-t1b2": { g: 3, gr: [2, 2], c: [{ r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "3-t2b1": { g: 3, gr: [2, 2], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }] },
  "3-l1r2": { g: 3, gr: [2, 2], c: [{ r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "3-l2r1": { g: 3, gr: [2, 2], c: [{ r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 1 }] },
  "3-l1rr": { g: 3, gr: [3, 3], c: [{ r: 3, c: 2 }, { r: 1, c: 1 }, { r: 2, c: 1 }] },
  "3-t1bb": { g: 3, gr: [3, 3], c: [{ r: 2, c: 3 }, { r: 1, c: 1 }, { r: 1, c: 2 }] },
  
  // 4张图片
  "4-grid": { g: 4, gr: [2, 2] },
  "4-t1b3": { g: 4, gr: [2, 3], c: [{ r: 1, c: 3 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "4-b1t3": { g: 4, gr: [2, 3], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 3 }] },
  "4-l1r3": { g: 4, gr: [3, 2], c: [{ r: 3, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "4-l-feat": { g: 4, gr: [2, 3], c: [{ r: 2, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "4-r-feat": { g: 4, gr: [2, 3], c: [{ r: 1, c: 2 }, { r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1, s: [2, 1] }] },
  "4-121": { g: 4, gr: [3, 2], c: [{ r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }] },
  "4-212": { g: 4, gr: [2, 3], c: [{ r: 2, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 1 }] },
  
  // 5张图片
  "5-center": { g: 5, gr: [3, 3], c: [{ r: 1, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }] },
  "5-l3r2": { g: 5, gr: [3, 3], c: [{ r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 1 }, { r: 2, c: 2 }, { r: 1, c: 1 }] },
  "5-131": { g: 5, gr: [3, 3], c: [{ r: 3, c: 1 }, { r: 1, c: 1 }, { r: 3, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "5-l2r3": { g: 5, gr: [3, 2], c: [{ r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "5-t2b3": { g: 5, gr: [2, 3], c: [{ r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 6张图片
  "6-g3x2": { g: 6, gr: [3, 2] },
  "6-g2x3": { g: 6, gr: [2, 3] },
  "6-center": { g: 6, gr: [4, 4], c: [{ r: 1, c: 3 }, { r: 2, c: 1 }, { r: 3, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 1 }, { r: 1, c: 2 }] },
  "6-123": { g: 6, gr: [3, 6], c: [{ r: 1, c: 6 }, { r: 1, c: 3 }, { r: 1, c: 3 }, { r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 2 }] },
  "6-321": { g: 6, gr: [3, 6], c: [{ r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 3 }, { r: 1, c: 6 }] },
  "6-231": { g: 6, gr: [3, 6], c: [{ r: 1, c: 3 }, { r: 1, c: 3 }, { r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 6 }] },
  
  // 7张图片
  "7-main": { g: 7, gr: [4, 4], c: [{ r: 2, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "7-h-center-band": { g: 7, gr: [3, 3], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 3 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "7-w-center-band": { g: 7, gr: [3, 3], c: [{ r: 1, c: 1 }, { r: 3, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 8张图片
  "8-g4x2": { g: 8, gr: [4, 2] },
  "8-g2x4": { g: 8, gr: [2, 4] },
  "8-222": { g: 8, gr: [4, 4], c: [{ r: 1, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 2 }] },
  
  // 9张图片
  "9-grid": { g: 9, gr: [3, 3] },
  "9-144-grid": { g: 9, gr: [3, 4], c: [{ r: 1, c: 4 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "9-414-grid": { g: 9, gr: [3, 4], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 4 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  "9-441-grid": { g: 9, gr: [3, 4], c: [{ r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 4 }] },
  
  // 10张图片
  "10-g5x2": { g: 10, gr: [5, 2] },
  "10-t2b8-grid": { g: 10, gr: [3, 4], c: [{ r: 1, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 1 }] },
  
  // 12张图片
  "12-g4x3": { g: 12, gr: [4, 3] },
  "12-g3x4": { g: 12, gr: [3, 4] },
  
  // 16张图片
  "16-g4x4": { g: 16, gr: [4, 4] }
} as const

interface ImageGridProps {
  mode: Mode
  layoutConfig: LayoutConfig
  styleConfig: StyleConfig
  images: ImageData[]
  onImagesChange: (images: ImageData[]) => void
  elements: ElementData[]
  onElementsChange: (elements: ElementData[]) => void
  selectedElement: number | null
  onElementSelect: (id: number | null) => void
}

export function ImageGrid({
  mode,
  layoutConfig,
  styleConfig,
  images,
  onImagesChange,
  elements,
  onElementsChange,
  selectedElement,
  onElementSelect
}: ImageGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draggedImage, setDraggedImage] = useState<string | null>(null)

  const handleFileUpload = useCallback((files: FileList | null, cellIndex?: number) => {
    if (!files) return

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    imageFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const newImage: ImageData = {
            id: `${Date.now()}-${index}`,
            src: e.target?.result as string,
            position: '50% 50%',
            scale: 1,
            width: img.naturalWidth,
            height: img.naturalHeight
          }

          if (mode === 'stitching') {
            onImagesChange([...images, newImage])
          } else {
            // 布局模式：替换指定位置或添加到空位置
            const newImages = [...images]
            if (cellIndex !== undefined) {
              newImages[cellIndex] = newImage
            } else {
              const emptyIndex = newImages.findIndex(img => !img)
              if (emptyIndex !== -1) {
                newImages[emptyIndex] = newImage
              } else {
                newImages.push(newImage)
              }
            }
            onImagesChange(newImages)
          }
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }, [images, mode, onImagesChange])

  const handleDrop = useCallback((e: React.DragEvent, cellIndex?: number) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileUpload(files, cellIndex)
    setDraggedImage(null)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeImage = useCallback((index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  const renderLayoutMode = () => {
    const layout = LAYOUTS[layoutConfig.layoutId as keyof typeof LAYOUTS]
    if (!layout) return null

    const [rows, cols] = layout.gr
    const cells = (layout as any).c || Array.from({ length: rows * cols }, () => ({ r: 1, c: 1 }))

    return (
      <div
        className="grid gap-2 w-full h-96 border-2 border-dashed border-muted-foreground/20 rounded-lg p-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: `${styleConfig.spacing}px`,
          backgroundColor: styleConfig.bgColor,
          backgroundImage: styleConfig.backgroundImage ? `url(${styleConfig.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: `${styleConfig.borderWidths.top}px ${styleConfig.borderWidths.right}px ${styleConfig.borderWidths.bottom}px ${styleConfig.borderWidths.left}px`
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {cells.map((cell: any, index: number) => {
          const image = images[index]
          return (
            <div
              key={index}
              className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-muted/10 flex items-center justify-center group hover:border-primary/50 transition-colors"
              style={{
                gridRowEnd: `span ${cell.r}`,
                gridColumnEnd: `span ${cell.c}`,
                borderRadius: `${styleConfig.radius}px`,
                ...((cell as any).s && {
                  gridRowStart: (cell as any).s[0],
                  gridColumnStart: (cell as any).s[1]
                })
              }}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
            >
              {image ? (
                <>
                  <img
                    src={image.src}
                    alt={`拼图 ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: image.position,
                      transform: `scale(${image.scale})`
                    }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center text-muted-foreground cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={24} />
                  <span className="text-xs mt-1">添加图片</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderStitchingMode = () => {
    if (images.length === 0) {
      return (
        <div
          className="w-full h-96 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="text-center text-muted-foreground">
            <Plus size={48} />
            <p className="mt-2">点击选择图片</p>
          </div>
        </div>
      )
    }

    return (
      <div
        className={`flex ${layoutConfig.stitchingDirection === 'horizontal' ? 'flex-row' : 'flex-col'} w-full border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 overflow-auto`}
        style={{
          gap: `${styleConfig.spacing}px`,
          backgroundColor: styleConfig.bgColor,
          backgroundImage: styleConfig.backgroundImage ? `url(${styleConfig.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: `${styleConfig.borderWidths.top}px ${styleConfig.borderWidths.right}px ${styleConfig.borderWidths.bottom}px ${styleConfig.borderWidths.left}px`
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {images.map((image, index) => (
          <div key={image.id} className="relative group flex-shrink-0">
            <img
              src={image.src}
              alt={`拼接图片 ${index + 1}`}
              className="max-w-none"
              style={{
                borderRadius: `${styleConfig.radius}px`,
                height: layoutConfig.stitchingDirection === 'horizontal' ? '200px' : 'auto',
                width: layoutConfig.stitchingDirection === 'vertical' ? '100%' : 'auto'
              }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="destructive"
                className="h-6 w-6 p-0"
                onClick={() => removeImage(index)}
              >
                <X size={12} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        id="image-grid-container"
        ref={containerRef}
        className="relative"
      >
        {mode === 'layout' ? renderLayoutMode() : renderStitchingMode()}
        
        {/* 渲染元素 */}
        {elements.map((element) => (
          <div
            key={element.id}
            className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-primary' : ''}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined
            }}
            onClick={() => onElementSelect(element.id)}
          >
            {element.type === 'text' && (
              <div
                style={{
                  color: element.style.color,
                  fontSize: `${element.style.fontSize}px`
                }}
                contentEditable
                suppressContentEditableWarning
              >
                {element.content}
              </div>
            )}
            {element.type === 'arrow' && (
              <svg
                width="100"
                height="20"
                viewBox="0 0 100 20"
                className="pointer-events-none"
              >
                <defs>
                  <marker
                    id={`arrowhead-${element.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill={element.style.color}
                    />
                  </marker>
                </defs>
                <line
                  x1="10"
                  y1="10"
                  x2="90"
                  y2="10"
                  stroke={element.style.color}
                  strokeWidth={element.style.strokeWidth}
                  markerEnd={`url(#arrowhead-${element.id})`}
                />
              </svg>
            )}
            {element.type === 'rectangle' && (
              <div
                style={{
                  width: `${element.width}%`,
                  height: `${element.height}%`,
                  border: `${element.style.strokeWidth}px solid ${element.style.color}`,
                  borderRadius: '4px'
                }}
              />
            )}
            {element.type === 'ellipse' && (
              <div
                style={{
                  width: `${element.width}%`,
                  height: `${element.height}%`,
                  border: `${element.style.strokeWidth}px solid ${element.style.color}`,
                  borderRadius: '50%'
                }}
              />
            )}
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />
    </div>
  )
} 