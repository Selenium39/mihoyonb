import QrCodeTool from '@/app/(pages)/qr-code/QrCodeTool'

/**
 * 英文页（/en/qr-code）：与 /qr-code 共用 QrCodeTool，仅切换 locale。
 */
export default function EnQrCodePage() {
  return <QrCodeTool locale="en" />
}
