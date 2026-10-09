/**
 * Umami 事件埋点工具
 * 官方脚本挂载 window.umami（layout.tsx 已引入）；track 为新版 API，trackEvent 为旧版兜底
 * 上报失败静默忽略，不影响业务逻辑
 */

type UmamiProps = Record<string, string | number | boolean>

declare global {
  interface Window {
    umami?: {
      track?: (name: string, props?: UmamiProps) => void
      trackEvent?: (name: string, props?: UmamiProps) => void
    }
  }
}

/** 工具标识（埋点统一使用下划线命名，与路由对应） */
export type ToolId =
  | 'image_combine'
  | 'markdown_to_image'
  | 'image_split'
  | 'video_frame'
  | 'image_watermark'
  | 'social_resize'
  | 'qr_code'
  | 'subtitle_tools'
  | 'sensitive_words'

/** 核心处理动作完成（转换/切割/截帧/检测等），在动作成功后调用 */
export function trackToolUse(tool: ToolId, action?: string, props?: UmamiProps) {
  track('tool_use', { tool, ...(action ? { action } : {}), ...props })
}

/** 结果导出（下载/打包/复制），在导出成功后调用 */
export function trackToolExport(tool: ToolId, kind: string, props?: UmamiProps) {
  track('tool_export', { tool, kind, ...props })
}

function track(name: string, props: UmamiProps) {
  if (typeof window === 'undefined') return
  try {
    const umami = window.umami
    if (typeof umami?.track === 'function') umami.track(name, props)
    else if (typeof umami?.trackEvent === 'function') umami.trackEvent(name, props)
  } catch {
    // 统计上报失败不影响功能
  }
}
