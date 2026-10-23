import { LegalPage } from '@/components/LegalPage'
import { termsContent } from '@/content/legal'

/** English terms of service (/en/terms), same substance as /terms */
export default function EnTermsPage() {
  return <LegalPage doc={termsContent.en} locale="en" altHref="/terms" />
}
