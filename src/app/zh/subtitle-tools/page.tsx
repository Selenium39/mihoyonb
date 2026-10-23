import SubtitleToolsTool from './SubtitleToolsTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/subtitle-tools）：只做语言壳，工具实现统一在 SubtitleToolsTool 里，
 * 与 /subtitle-tools 共用同一份组件和交互逻辑。
 */
export default function SubtitleToolsPage() {
  return (
    <ToolAdWrapper locale="zh">
      <SubtitleToolsTool locale="zh" />
    </ToolAdWrapper>
  )
}
