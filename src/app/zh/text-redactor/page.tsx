import TextRedactorTool from './TextRedactorTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/zh/text-redactor）：只做语言壳，工具实现统一在 TextRedactorTool 里，
 * 与 /text-redactor 共用同一份组件和交互逻辑。
 */
export default function TextRedactorPage() {
  return (
    <ToolAdWrapper locale="zh">
      <TextRedactorTool locale="zh" />
    </ToolAdWrapper>
  )
}
