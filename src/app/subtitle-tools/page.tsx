import SubtitleToolsTool from '@/app/zh/subtitle-tools/SubtitleToolsTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/subtitle-tools）：与 /zh/subtitle-tools 共用 SubtitleToolsTool，仅切换 locale。
 * 文案、下载文件名与语言切换链接都由组件内部按 locale 处理。
 */
export default function EnSubtitleToolsPage() {
  return (
    <ToolAdWrapper locale="en">
      <SubtitleToolsTool locale="en" />
    </ToolAdWrapper>
  )
}
