import { AdSlot } from '@/components/AdSlot'
import { AD_SLOT_TOOL_BOTTOM } from '@/config/ads'
import type { Locale } from '@/lib/i18n'

/**
 * 工具页外壳：工具本体 + 底部一个手动广告位。
 * 每个工具页只放这一个位置，避免自动广告时代的密集插页。
 */
export function ToolAdWrapper({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <div className="container mx-auto px-4">
        <AdSlot
          slot={AD_SLOT_TOOL_BOTTOM}
          label={locale === 'zh' ? '广告' : 'Advertisement'}
        />
      </div>
    </>
  )
}
