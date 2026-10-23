import { LegalPage } from '@/components/LegalPage'
import { privacyContent } from '@/content/legal'

/** English privacy policy (/privacy), same substance as /zh/privacy */
export default function EnPrivacyPage() {
  return <LegalPage doc={privacyContent.en} locale="en" />
}
