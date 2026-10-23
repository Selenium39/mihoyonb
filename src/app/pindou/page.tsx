import PindouTool from '@/app/zh/pindou/PindouTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/pindou）：与 /zh/pindou 共用 PindouTool，仅切换 locale。
 * 英文专属的 Amazon 联盟导购块由 PindouTool 内部按 locale 渲染。
 */
export default function EnPindouPage() {
  return (
    <ToolAdWrapper locale="en">
      <PindouTool locale="en" />
    </ToolAdWrapper>
  )
}
