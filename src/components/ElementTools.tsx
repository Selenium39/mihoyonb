import { Button } from '@/components/ui/button'
import { Type, ArrowRight, Square, Circle } from 'lucide-react'

interface ElementToolsProps {
  onAddText: () => void
  onAddArrow: () => void
  onAddRectangle: () => void
  onAddEllipse: () => void
}

export function ElementTools({ 
  onAddText, 
  onAddArrow, 
  onAddRectangle, 
  onAddEllipse 
}: ElementToolsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">添加元素</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddText}
          className="flex items-center gap-2 text-xs h-9"
        >
          <Type size={14} />
          文字
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onAddArrow}
          className="flex items-center gap-2 text-xs h-9"
        >
          <ArrowRight size={14} />
          箭头
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onAddRectangle}
          className="flex items-center gap-2 text-xs h-9"
        >
          <Square size={14} />
          方框
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onAddEllipse}
          className="flex items-center gap-2 text-xs h-9"
        >
          <Circle size={14} />
          圆圈
        </Button>
      </div>
    </div>
  )
} 