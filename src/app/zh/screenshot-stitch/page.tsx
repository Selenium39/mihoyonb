import { ToolAdWrapper } from '@/components/ToolAdWrapper'
import ScreenshotStitchTool from './ScreenshotStitchTool'

/** 中文页（/zh/screenshot-stitch）：工具实现与英文页共用。 */
export default function ScreenshotStitchPage() {
  return (
    <ToolAdWrapper locale="zh">
      <ScreenshotStitchTool locale="zh" />
    </ToolAdWrapper>
  )
}
