import { LegalPage } from '@/components/LegalPage'
import { termsContent } from '@/content/legal'

/** 中文服务条款（/zh/terms），内容与英文版 /terms 保持同一口径 */
export default function TermsPage() {
  return <LegalPage doc={termsContent.zh} locale="zh" />
}
