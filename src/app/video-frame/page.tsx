import VideoFrameTool from '@/app/zh/video-frame/VideoFrameTool'

/**
 * 英文页（/video-frame）：与 /zh/video-frame 共用 VideoFrameTool，仅切换 locale。
 */
export default function EnVideoFramePage() {
  return <VideoFrameTool locale="en" />
}
