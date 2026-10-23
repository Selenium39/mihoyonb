import ImageWatermarkTool from './ImageWatermarkTool'

/**
 * 中文页（/image-watermark）：只做语言壳，工具实现统一在 ImageWatermarkTool 里，
 * 与 /en/image-watermark 共用同一份组件和交互逻辑。
 */
export default function ImageWatermarkPage() {
  return <ImageWatermarkTool locale="zh" />
}
