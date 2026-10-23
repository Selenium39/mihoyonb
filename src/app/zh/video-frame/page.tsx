import VideoFrameTool from './VideoFrameTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/video-frame）：只做语言壳，工具实现统一在 VideoFrameTool 里，
 * 与 /video-frame 共用同一份组件和交互逻辑。
 */
export default function VideoFramePage() {
  return (
    <ToolAdWrapper locale="zh">
      <VideoFrameTool locale="zh" />
    </ToolAdWrapper>
  )
}
