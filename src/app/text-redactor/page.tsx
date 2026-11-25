import TextRedactorTool from '@/app/zh/text-redactor/TextRedactorTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/text-redactor）：与 /zh/text-redactor 共用 TextRedactorTool，
 * 仅切换 locale（英文文案与本地化句式）。
 */
export default function EnTextRedactorPage() {
  return (
    <ToolAdWrapper locale="en">
      <TextRedactorTool locale="en" />
    </ToolAdWrapper>
  )
}
