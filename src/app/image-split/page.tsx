import ImageSplitTool from '@/app/zh/image-split/ImageSplitTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/image-split）：与 /zh/image-split 共用 ImageSplitTool，仅切换 locale。
 */
export default function EnImageSplitPage() {
  return (
    <ToolAdWrapper locale="en">
      <ImageSplitTool locale="en" />
    </ToolAdWrapper>
  )
}
