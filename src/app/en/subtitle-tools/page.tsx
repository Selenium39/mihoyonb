import SubtitleToolsTool from '@/app/(pages)/subtitle-tools/SubtitleToolsTool'

/**
 * 英文页（/en/subtitle-tools）：与 /subtitle-tools 共用 SubtitleToolsTool，仅切换 locale。
 * 文案、下载文件名与语言切换链接都由组件内部按 locale 处理。
 */
export default function EnSubtitleToolsPage() {
  return <SubtitleToolsTool locale="en" />
}
