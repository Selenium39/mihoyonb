import AiWatermarkTool from '@/app/zh/ai-watermark-checker/AiWatermarkTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/ai-watermark-checker）：与 /zh/ai-watermark-checker 共用工具，
 * 只切换 locale。文案、示例和语言切换链接随之变化。
 */
export default function EnAiWatermarkCheckerPage() {
  return (
    <ToolAdWrapper locale="en">
      <AiWatermarkTool locale="en" />
    </ToolAdWrapper>
  )
}
