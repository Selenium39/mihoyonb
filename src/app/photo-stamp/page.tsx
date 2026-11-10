import PhotoStampTool from '@/app/zh/photo-stamp/PhotoStampTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/photo-stamp）：与 /zh/photo-stamp 共用 PhotoStampTool，仅切换 locale。
 */
export default function EnPhotoStampPage() {
  return (
    <ToolAdWrapper locale="en">
      <PhotoStampTool locale="en" />
    </ToolAdWrapper>
  )
}
