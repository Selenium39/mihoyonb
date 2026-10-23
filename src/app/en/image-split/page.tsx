import ImageSplitTool from '@/app/(pages)/image-split/ImageSplitTool'

/**
 * 英文页（/en/image-split）：与 /image-split 共用 ImageSplitTool，仅切换 locale。
 */
export default function EnImageSplitPage() {
  return <ImageSplitTool locale="en" />
}
