import PindouTool from '@/app/(pages)/pindou/PindouTool'

/**
 * 英文页（/en/pindou）：与 /pindou 共用 PindouTool，仅切换 locale。
 * 英文专属的 Amazon 联盟导购块由 PindouTool 内部按 locale 渲染。
 */
export default function EnPindouPage() {
  return <PindouTool locale="en" />
}
