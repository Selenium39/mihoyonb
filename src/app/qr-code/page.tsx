import QrCodeTool from '@/app/zh/qr-code/QrCodeTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 英文页（/qr-code）：与 /zh/qr-code 共用 QrCodeTool，仅切换 locale。
 */
export default function EnQrCodePage() {
  return (
    <ToolAdWrapper locale="en">
      <QrCodeTool locale="en" />
    </ToolAdWrapper>
  )
}
