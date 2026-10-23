import SocialResizeTool from '@/app/zh/social-resize/SocialResizeTool'

/**
 * 英文页（/social-resize）：与 /zh/social-resize 共用 SocialResizeTool，仅切换 locale。
 */
export default function EnSocialResizePage() {
  return <SocialResizeTool locale="en" />
}
