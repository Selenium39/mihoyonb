import SocialResizeTool from '@/app/(pages)/social-resize/SocialResizeTool'

/**
 * 英文页（/en/social-resize）：与 /social-resize 共用 SocialResizeTool，仅切换 locale。
 */
export default function EnSocialResizePage() {
  return <SocialResizeTool locale="en" />
}
