import VideoFrameTool from '@/app/(pages)/video-frame/VideoFrameTool'

/**
 * 英文页（/en/video-frame）：与 /video-frame 共用 VideoFrameTool，仅切换 locale。
 */
export default function EnVideoFramePage() {
  return <VideoFrameTool locale="en" />
}
