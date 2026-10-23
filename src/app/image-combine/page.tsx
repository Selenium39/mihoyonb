import ImageCombineTool from '@/app/zh/image-combine/ImageCombineTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/image-combine）：与 /zh/image-combine 共用 ImageCombineTool，仅切换 locale。
 * 页面文案在 (pages)/image-combine/copy.ts 里按语言取。
 */
export default function EnImageCombinePage() {
  return (
    <ToolAdWrapper locale="en">
      <ImageCombineTool locale="en" />
    </ToolAdWrapper>
  )
}
