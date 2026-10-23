import { LegalPage } from '@/components/LegalPage'
import { termsContent } from '@/content/legal'

/** English terms of service (/terms), same substance as /zh/terms */
export default function EnTermsPage() {
  return <LegalPage doc={termsContent.en} locale="en" />
}
