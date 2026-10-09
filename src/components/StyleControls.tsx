import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StyleConfig } from '@/hooks/useImageCombine'

interface StyleControlsProps {
  config: StyleConfig
  onChange: (config: StyleConfig) => void
}

export function StyleControls({ config, onChange }: StyleControlsProps) {
  const handleInputChange = (field: keyof StyleConfig, value: any) => {
    onChange({ ...config, [field]: value })
  }

  const handleBorderChange = (side: keyof StyleConfig['borderWidths'], value: number) => {
    onChange({
      ...config,
      borderWidths: {
        ...config.borderWidths,
        [side]: value
      }
    })
  }

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange({ ...config, backgroundImage: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">样式调整</h3>
      
      {/* 画布比例 */}
      <div className="space-y-2">
        <label className="text-xs font-medium">画布比例</label>
        <div className="grid grid-cols-3 gap-1">
          {['1/1', '16/9', '9/16', '16/10', '4/3', '3/4'].map((ratio) => (
            <Button
              key={ratio}
              variant="outline"
              size="sm"
              className="text-xs h-8"
            >
              {ratio}
            </Button>
          ))}
        </div>
      </div>

      {/* 边框设置 */}
      <div className="space-y-2">
        <label className="text-xs font-medium">边框 (上/右/下/左) px</label>
        <div className="grid grid-cols-4 gap-1">
          <Input
            type="number"
            placeholder="0"
            min="0"
            value={config.borderWidths.top}
            onChange={(e) => handleBorderChange('top', parseInt(e.target.value) || 0)}
            className="text-center text-xs h-8"
          />
          <Input
            type="number"
            placeholder="0"
            min="0"
            value={config.borderWidths.right}
            onChange={(e) => handleBorderChange('right', parseInt(e.target.value) || 0)}
            className="text-center text-xs h-8"
          />
          <Input
            type="number"
            placeholder="0"
            min="0"
            value={config.borderWidths.bottom}
            onChange={(e) => handleBorderChange('bottom', parseInt(e.target.value) || 0)}
            className="text-center text-xs h-8"
          />
          <Input
            type="number"
            placeholder="0"
            min="0"
            value={config.borderWidths.left}
            onChange={(e) => handleBorderChange('left', parseInt(e.target.value) || 0)}
            className="text-center text-xs h-8"
          />
        </div>
      </div>

      {/* 间距 */}
      <div className="space-y-2">
        <label className="text-xs font-medium">
          间距: {config.spacing}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={config.spacing}
          onChange={(e) => handleInputChange('spacing', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* 圆角 */}
      <div className="space-y-2">
        <label className="text-xs font-medium">
          圆角: {config.radius}px
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={config.radius}
          onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* 背景颜色 */}
      <div className="space-y-2">
        <label className="text-xs font-medium">背景颜色</label>
        <input
          type="color"
          value={config.bgColor}
          onChange={(e) => handleInputChange('bgColor', e.target.value)}
          className="w-full h-8 rounded border"
        />
      </div>

      {/* 背景图片 */}
      <div className="space-y-2">
        <label className="text-xs font-medium">背景图片</label>
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
            onClick={() => handleInputChange('backgroundImage', null)}
          >
            移除图片
          </Button>
        </div>
        <input
          id="bg-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBackgroundImageUpload}
        />
      </div>
    </div>
  )
} 