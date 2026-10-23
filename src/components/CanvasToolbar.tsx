import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Type, ArrowRight, Square, Circle, Move, RotateCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Locale } from '@/lib/i18n'

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
  /** 界面语言，默认中文；默认路径的文案与重构前完全一致 */
  locale?: Locale
}

/** 组件内部文案（仅此组件使用，故就近维护，不进入页面级 copy.ts） */
const TOOLBAR_COPY = {
  zh: {
    title: '画布工具',
    deselect: '取消选择',
    text: '文字',
    arrow: '箭头',
    rectangle: '方框',
    circle: '圆圈',
    color: '颜色',
    fontSizeLabel: '字体大小',
    strokeWidthLabel: '线条粗细',
    strokeWidth: (px: number) => `线条粗细: ${px}px`,
    editElement: '编辑元素',
    deleteElement: '删除元素',
    textPlaceholder: '输入文字内容',
    rotation: (deg: number) => `旋转: ${deg}°`,
    defaultText: '双击编辑文字',
  },
  en: {
    title: 'Canvas tools',
    deselect: 'Deselect',
    text: 'Text',
    arrow: 'Arrow',
    rectangle: 'Rectangle',
    circle: 'Circle',
    color: 'Color',
    fontSizeLabel: 'Font size',
    strokeWidthLabel: 'Line width',
    strokeWidth: (px: number) => `Line width: ${px}px`,
    editElement: 'Edit element',
    deleteElement: 'Delete element',
    textPlaceholder: 'Enter text',
    rotation: (deg: number) => `Rotation: ${deg}°`,
    defaultText: 'Double-click to edit',
  },
} as const

export function CanvasToolbar({
  elements,
  selectedElement,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onSelectElement,
  locale = 'zh',
}: CanvasToolbarProps) {
  const t = TOOLBAR_COPY[locale] ?? TOOLBAR_COPY.zh
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentFontSize, setCurrentFontSize] = useState(16)
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2)

  const addText = () => {
    onAddElement({
      type: 'text',
      x: 50,
      y: 50,
      content: t.defaultText,
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
        <h3 className="text-sm font-medium">{t.title}</h3>
        {selectedElement && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectElement(null)}
            className="h-6 px-2 text-xs"
          >
            {t.deselect}
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
          <span className="text-xs">{t.text}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={addArrow}
          className="flex flex-col items-center gap-1 h-12 p-1"
        >
          <ArrowRight size={16} />
          <span className="text-xs">{t.arrow}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={addRectangle}
          className="flex flex-col items-center gap-1 h-12 p-1"
        >
          <Square size={16} />
          <span className="text-xs">{t.rectangle}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={addCircle}
          className="flex flex-col items-center gap-1 h-12 p-1"
        >
          <Circle size={16} />
          <span className="text-xs">{t.circle}</span>
        </Button>
      </div>

      {/* 样式控制 */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t.color}</label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-full h-8 rounded border cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t.fontSizeLabel}</label>
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
            {t.strokeWidth(currentStrokeWidth)}
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
            <span className="text-xs font-medium">{t.editElement}</span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteElement(selectedEl.id)}
              className="h-6 w-6 p-0"
              aria-label={t.deleteElement}
              title={t.deleteElement}
            >
              <Trash2 size={12} />
            </Button>
          </div>

          {selectedEl.type === 'text' && (
            <div className="space-y-2">
              <Input
                placeholder={t.textPlaceholder}
                value={selectedEl.content || ''}
                onChange={(e) => onUpdateElement(selectedEl.id, { content: e.target.value })}
                className="text-xs h-8"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t.fontSizeLabel}</label>
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
                  <label className="text-xs text-muted-foreground">{t.color}</label>
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
                  <label className="text-xs text-muted-foreground">{t.color}</label>
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
                  <label className="text-xs text-muted-foreground">{t.strokeWidthLabel}</label>
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
              {t.rotation(selectedEl.rotation || 0)}
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
