import ImageCombineTool from './ImageCombineTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/image-combine）：只做语言壳，工具实现统一在 ImageCombineTool 里，
 * 与 /image-combine 共用同一份组件和交互逻辑。
 */
export default function ImageCombinePage() {
  return (
    <ToolAdWrapper locale="zh">
      <ImageCombineTool locale="zh" />
    </ToolAdWrapper>
  )
}
