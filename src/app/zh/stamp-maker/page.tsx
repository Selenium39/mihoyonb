import StampMakerTool from './StampMakerTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/zh/stamp-maker）：只做语言壳，工具实现统一在 StampMakerTool 里，
 * 与 /stamp-maker 共用同一份组件和交互逻辑。
 */
export default function StampMakerPage() {
  return (
    <ToolAdWrapper locale="zh">
      <StampMakerTool locale="zh" />
    </ToolAdWrapper>
  )
}
