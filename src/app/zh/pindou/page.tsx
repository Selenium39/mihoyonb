import PindouTool from './PindouTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/pindou）：只做语言壳，工具实现统一在 PindouTool 里，
 * 与 /pindou 共用同一份组件和交互逻辑。
 */
export default function PindouPage() {
  return (
    <ToolAdWrapper locale="zh">
      <PindouTool locale="zh" />
    </ToolAdWrapper>
  )
}
