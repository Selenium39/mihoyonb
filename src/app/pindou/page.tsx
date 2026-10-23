import PindouTool from '@/app/zh/pindou/PindouTool'

/**
 * 英文页（/pindou）：与 /zh/pindou 共用 PindouTool，仅切换 locale。
 * 英文专属的 Amazon 联盟导购块由 PindouTool 内部按 locale 渲染。
 */
export default function EnPindouPage() {
  return <PindouTool locale="en" />
}
