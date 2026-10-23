import ImageWatermarkTool from '@/app/(pages)/image-watermark/ImageWatermarkTool'

/**
 * 英文页（/en/image-watermark）：与 /image-watermark 共用 ImageWatermarkTool，
 * 仅切换 locale（文案、文件名、语言切换链接随之变化）。
 */
export default function EnImageWatermarkPage() {
  return <ImageWatermarkTool locale="en" />
}
