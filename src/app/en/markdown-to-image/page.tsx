import MarkdownToImageTool from '@/app/(pages)/markdown-to-image/MarkdownToImageTool'

/**
 * 英文页（/en/markdown-to-image）：与 /markdown-to-image 共用 MarkdownToImageTool，
 * 仅切换 locale；文案来自同目录 copy.ts。
 */
export default function EnMarkdownToImagePage() {
  return <MarkdownToImageTool locale="en" />
}
