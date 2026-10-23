import QrCodeTool from '@/app/zh/qr-code/QrCodeTool'

/**
 * 英文页（/qr-code）：与 /zh/qr-code 共用 QrCodeTool，仅切换 locale。
 */
export default function EnQrCodePage() {
  return <QrCodeTool locale="en" />
}
