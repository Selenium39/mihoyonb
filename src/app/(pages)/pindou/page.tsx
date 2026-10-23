import PindouTool from './PindouTool'

/**
 * 中文页（/pindou）：只做语言壳，工具实现统一在 PindouTool 里，
 * 与 /en/pindou 共用同一份组件和交互逻辑。
 */
export default function PindouPage() {
  return <PindouTool locale="zh" />
}
