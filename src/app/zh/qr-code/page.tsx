import QrCodeTool from './QrCodeTool'
import { ToolAdWrapper } from '@/components/ToolAdWrapper'

/**
 * 中文页（/qr-code）：只做语言壳，工具实现统一在 QrCodeTool 里，
 * 与 /qr-code 共用同一份组件和交互逻辑。
 */
export default function QrCodePage() {
  return (
    <ToolAdWrapper locale="zh">
      <QrCodeTool locale="zh" />
    </ToolAdWrapper>
  )
}
