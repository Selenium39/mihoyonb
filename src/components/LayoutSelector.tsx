import { Button } from '@/components/ui/button'

// 布局定义，从原始代码中提取的完整布局配置
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
}

interface LayoutSelectorProps {
  selectedLayout: string
  onLayoutChange: (layoutId: string) => void
}

export function LayoutSelector({ selectedLayout, onLayoutChange }: LayoutSelectorProps) {
  // 按图片数量分组
  const groupedLayouts = Object.entries(LAYOUTS).reduce((acc, [id, layout]) => {
    const count = layout.g
    if (!acc[count]) acc[count] = []
    acc[count].push({ id, ...layout })
    return acc
  }, {} as Record<number, Array<{ id: string } & typeof LAYOUTS[keyof typeof LAYOUTS]>>)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">布局选择</h3>
      
      {Object.entries(groupedLayouts)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([count, layouts]) => (
          <div key={count} className="space-y-2">
            <h4 className="text-xs text-muted-foreground font-medium">
              {count} 张图片
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {layouts.map((layout) => (
                <Button
                  key={layout.id}
                  variant={selectedLayout === layout.id ? "default" : "outline"}
                  size="sm"
                  className="h-auto p-2"
                  onClick={() => onLayoutChange(layout.id)}
                >
                  <LayoutThumbnail layout={layout} />
                </Button>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

interface LayoutThumbnailProps {
  layout: { id: string; gr: number[]; c?: Array<{ r: number; c: number; s?: number[] }> }
}

function LayoutThumbnail({ layout }: LayoutThumbnailProps) {
  const [rows, cols] = layout.gr
  const cells = layout.c || Array.from({ length: rows * cols }, () => ({ r: 1, c: 1 }))

  return (
    <div 
      className="w-full aspect-square border rounded bg-muted/20"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '1px'
      }}
    >
      {cells.map((cell, index) => (
        <div
          key={index}
          className="bg-primary/20 rounded-sm"
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
  )
} 