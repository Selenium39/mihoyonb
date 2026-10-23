import ImageWatermarkTool from '@/app/zh/image-watermark/ImageWatermarkTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/image-watermark）：与 /zh/image-watermark 共用 ImageWatermarkTool，
 * 仅切换 locale（文案、文件名、语言切换链接随之变化）。
 */
export default function EnImageWatermarkPage() {
  return (
    <ToolAdWrapper locale="en">
      <ImageWatermarkTool locale="en" />
    </ToolAdWrapper>
  )
}
