import { LegalPage } from '@/components/LegalPage'
import { privacyContent } from '@/content/legal'

/** 中文隐私政策（/zh/privacy），内容与英文版 /privacy 保持同一口径 */
export default function PrivacyPage() {
  return <LegalPage doc={privacyContent.zh} locale="zh" />
}
