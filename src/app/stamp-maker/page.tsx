import StampMakerTool from '@/app/zh/stamp-maker/StampMakerTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/stamp-maker）：与 /zh/stamp-maker 共用 StampMakerTool，仅切换 locale。
 */
export default function EnStampMakerPage() {
  return (
    <ToolAdWrapper locale="en">
      <StampMakerTool locale="en" />
    </ToolAdWrapper>
  )
}
