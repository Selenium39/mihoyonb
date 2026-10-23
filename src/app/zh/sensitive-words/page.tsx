import SensitiveWordsTool from './SensitiveWordsTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/sensitive-words）：只做语言壳，工具实现统一在 SensitiveWordsTool 里，
 * 与 /sensitive-words 共用同一份组件和交互逻辑。
 */
export default function SensitiveWordsPage() {
  return (
    <ToolAdWrapper locale="zh">
      <SensitiveWordsTool locale="zh" />
    </ToolAdWrapper>
  )
}
