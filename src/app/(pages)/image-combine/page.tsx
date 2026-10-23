import ImageCombineTool from './ImageCombineTool'

/**
 * 中文页（/image-combine）：只做语言壳，工具实现统一在 ImageCombineTool 里，
 * 与 /en/image-combine 共用同一份组件和交互逻辑。
 */
export default function ImageCombinePage() {
  return <ImageCombineTool locale="zh" />
}
