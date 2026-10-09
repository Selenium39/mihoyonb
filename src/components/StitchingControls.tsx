import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'
import { useRef } from 'react'

interface StitchingControlsProps {
  direction: 'horizontal' | 'vertical'
  onDirectionChange: (direction: 'horizontal' | 'vertical') => void
  onFilesSelect: (files: FileList) => void
}

export function StitchingControls({ 
  direction, 
  onDirectionChange, 
  onFilesSelect 
}: StitchingControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onFilesSelect(files)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">拼接设置</h3>
      
      {/* 拼接方向 */}
      <div className="space-y-2">
        <label className="text-xs font-medium">拼接方向</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={direction === 'horizontal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDirectionChange('horizontal')}
            className="text-xs"
          >
            横向
          </Button>
          <Button
            variant={direction === 'vertical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDirectionChange('vertical')}
            className="text-xs"
          >
            竖向
          </Button>
        </div>
      </div>

      {/* 选择图片 */}
      <div className="space-y-2">
        <label className="text-xs font-medium">选择图片</label>
        <Button
          variant="outline"
          onClick={handleUploadClick}
          className="w-full flex items-center gap-2 text-xs"
        >
          <Upload size={14} />
          点击选择或拖拽图片
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
} 