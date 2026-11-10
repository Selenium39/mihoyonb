import { ToolAdWrapper } from '@/components/ToolAdWrapper'
import AiWatermarkTool from './AiWatermarkTool'

/**
 * 中文页（/zh/ai-watermark-checker）：工具实现与英文页共用。
 */
export default function AiWatermarkCheckerPage() {
  return (
    <ToolAdWrapper locale="zh">
      <AiWatermarkTool locale="zh" />
    </ToolAdWrapper>
  )
}
