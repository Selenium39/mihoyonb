import { LegalPage } from '@/components/LegalPage'
import { privacyContent } from '@/content/legal'

/** English privacy policy (/en/privacy), same substance as /privacy */
export default function EnPrivacyPage() {
  return <LegalPage doc={privacyContent.en} locale="en" altHref="/privacy" />
}
