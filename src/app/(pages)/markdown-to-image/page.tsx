import MarkdownToImageTool from './MarkdownToImageTool'

/**
 * 中文页（/markdown-to-image）：只做语言壳，工具实现统一在 MarkdownToImageTool 里，
 * 与 /en/markdown-to-image 共用同一份组件和交互逻辑。
 */
export default function MarkdownToImagePage() {
  return <MarkdownToImageTool locale="zh" />
}
