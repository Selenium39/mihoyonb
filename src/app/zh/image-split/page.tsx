import ImageSplitTool from './ImageSplitTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/image-split）：只做语言壳，工具实现统一在 ImageSplitTool 里，
 * 与 /image-split 共用同一份组件和交互逻辑。
 */
export default function ImageSplitPage() {
  return (
    <ToolAdWrapper locale="zh">
      <ImageSplitTool locale="zh" />
    </ToolAdWrapper>
  )
}
