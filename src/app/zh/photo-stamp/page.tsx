import PhotoStampTool from './PhotoStampTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/zh/photo-stamp）：只做语言壳，工具实现统一在 PhotoStampTool 里，
 * 与 /photo-stamp 共用同一份组件和交互逻辑。
 */
export default function PhotoStampPage() {
  return (
    <ToolAdWrapper locale="zh">
      <PhotoStampTool locale="zh" />
    </ToolAdWrapper>
  )
}
