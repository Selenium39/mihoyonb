import MarkdownToImageTool from '@/app/zh/markdown-to-image/MarkdownToImageTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/markdown-to-image）：与 /zh/markdown-to-image 共用 MarkdownToImageTool，
 * 仅切换 locale；文案来自同目录 copy.ts。
 */
export default function EnMarkdownToImagePage() {
  return (
    <ToolAdWrapper locale="en">
      <MarkdownToImageTool locale="en" />
    </ToolAdWrapper>
  )
}
