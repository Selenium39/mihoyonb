import ScreenshotStitchTool from '@/app/zh/screenshot-stitch/ScreenshotStitchTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/screenshot-stitch）：与 /zh/screenshot-stitch 共用工具，只切换 locale。
 */
export default function EnScreenshotStitchPage() {
  return (
    <ToolAdWrapper locale="en">
      <ScreenshotStitchTool locale="en" />
    </ToolAdWrapper>
  )
}
