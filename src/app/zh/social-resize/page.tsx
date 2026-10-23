import SocialResizeTool from './SocialResizeTool'

/**
 * 中文页（/social-resize）：只做语言壳，工具实现统一在 SocialResizeTool 里，
 * 与 /social-resize 共用同一份组件和交互逻辑。
 */
export default function SocialResizePage() {
  return <SocialResizeTool locale="zh" />
}
