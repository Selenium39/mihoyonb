import SensitiveWordsTool from '@/app/zh/sensitive-words/SensitiveWordsTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/sensitive-words）：与 /zh/sensitive-words 共用 SensitiveWordsTool，
 * 仅切换 locale（英文词库、英文文案与英文词边界检测）。
 */
export default function EnSensitiveWordsPage() {
  return (
    <ToolAdWrapper locale="en">
      <SensitiveWordsTool locale="en" />
    </ToolAdWrapper>
  )
}
