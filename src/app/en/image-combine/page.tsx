import ImageCombineTool from '@/app/(pages)/image-combine/ImageCombineTool'

/**
 * 英文页（/en/image-combine）：与 /image-combine 共用 ImageCombineTool，仅切换 locale。
 * 页面文案在 (pages)/image-combine/copy.ts 里按语言取。
 */
export default function EnImageCombinePage() {
  return <ImageCombineTool locale="en" />
}
