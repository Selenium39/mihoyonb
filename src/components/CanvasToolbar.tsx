import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Type, ArrowRight, Square, Circle, Move, RotateCw, Trash2 } from 'lucide-react'
import { useState } from 'react'

export interface CanvasElement {
  id: number
  type: 'text' | 'arrow' | 'rectangle' | 'circle'
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  content?: string
  style: {
    color: string
    fontSize?: number
    strokeWidth?: number
    backgroundColor?: string
  }
}

interface CanvasToolbarProps {
  elements: CanvasElement[]
  selectedElement: number | null
  onAddElement: (element: Omit<CanvasElement, 'id'>) => void
  onUpdateElement: (id: number, updates: Partial<CanvasElement>) => void
  onDeleteElement: (id: number) => void
  onSelectElement: (id: number | null) => void
}

export function CanvasToolbar({ 
  elements, 
  selectedElement, 
  onAddElement, 
  onUpdateElement, 
  onDeleteElement,
  onSelectElement 
}: CanvasToolbarProps) {
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentFontSize, setCurrentFontSize] = useState(16)
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2)

  const addText = () => {
    onAddElement({
      type: 'text',
      x: 50,
      y: 50,
      content: '双击编辑文字',
      style: {
        color: currentColor,
        fontSize: currentFontSize
      }
    })
  }

  const addArrow = () => {
    onAddElement({
      type: 'arrow',
      x: 30,
      y: 30,
      width: 100,
      height: 20,
      style: {
        color: currentColor,
        strokeWidth: currentStrokeWidth
      }
    })
  }

  const addRectangle = () => {
    onAddElement({
      type: 'rectangle',
      x: 30,
      y: 30,
      width: 80,
      height: 60,
      style: {
        color: currentColor,
        strokeWidth: currentStrokeWidth
      }
    })
  }

  const addCircle = () => {
    onAddElement({
      type: 'circle',
      x: 30,
      y: 30,
      width: 60,
      height: 60,
      style: {
        color: currentColor,
        strokeWidth: currentStrokeWidth
      }
    })
  }

  const selectedEl = selectedElement ? elements.find(el => el.id === selectedElement) : null

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">画布工具</h3>
        {selectedElement && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectElement(null)}
            className="h-6 px-2 text-xs"
          >
            取消选择
          </Button>
        )}
      </div>

      {/* 添加元素工具 */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addText}
          className="flex flex-col items-center gap-1 h-12 p-1"
        >
          <Type size={16} />
          <span className="text-xs">文字</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={addArrow}
          className="flex flex-col items-center gap-1 h-12 p-1"
        >
          <ArrowRight size={16} />
          <span className="text-xs">箭头</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={addRectangle}
          className="flex flex-col items-center gap-1 h-12 p-1"
        >
          <Square size={16} />
          <span className="text-xs">方框</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={addCircle}
          className="flex flex-col items-center gap-1 h-12 p-1"
        >
          <Circle size={16} />
          <span className="text-xs">圆圈</span>
        </Button>
      </div>

      {/* 样式控制 */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">颜色</label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-full h-8 rounded border cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">字体大小</label>
            <Input
              type="number"
              min="8"
              max="48"
              value={currentFontSize}
              onChange={(e) => setCurrentFontSize(parseInt(e.target.value) || 16)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            线条粗细: {currentStrokeWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={currentStrokeWidth}
            onChange={(e) => setCurrentStrokeWidth(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* 选中元素的编辑面板 */}
      {selectedEl && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">编辑元素</span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteElement(selectedEl.id)}
              className="h-6 w-6 p-0"
            >
              <Trash2 size={12} />
            </Button>
          </div>

          {selectedEl.type === 'text' && (
            <div className="space-y-2">
              <Input
                placeholder="输入文字内容"
                value={selectedEl.content || ''}
                onChange={(e) => onUpdateElement(selectedEl.id, { content: e.target.value })}
                className="text-xs h-8"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">字体大小</label>
                  <Input
                    type="number"
                    min="8"
                    max="48"
                    value={selectedEl.style.fontSize || 16}
                    onChange={(e) => onUpdateElement(selectedEl.id, {
                      style: { ...selectedEl.style, fontSize: parseInt(e.target.value) || 16 }
                    })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">颜色</label>
                  <input
                    type="color"
                    value={selectedEl.style.color}
                    onChange={(e) => onUpdateElement(selectedEl.id, {
                      style: { ...selectedEl.style, color: e.target.value }
                    })}
                    className="w-full h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {(selectedEl.type === 'arrow' || selectedEl.type === 'rectangle' || selectedEl.type === 'circle') && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">颜色</label>
                  <input
                    type="color"
                    value={selectedEl.style.color}
                    onChange={(e) => onUpdateElement(selectedEl.id, {
                      style: { ...selectedEl.style, color: e.target.value }
                    })}
                    className="w-full h-8 rounded border cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">线条粗细</label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={selectedEl.style.strokeWidth || 2}
                    onChange={(e) => onUpdateElement(selectedEl.id, {
                      style: { ...selectedEl.style, strokeWidth: parseInt(e.target.value) || 2 }
                    })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              旋转: {selectedEl.rotation || 0}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedEl.rotation || 0}
              onChange={(e) => onUpdateElement(selectedEl.id, { rotation: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
} 