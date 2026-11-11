/**
 * 腾讯云 CPS 联盟推广配置（成交返佣，非 AdSense）。
 *
 * 链接与文案取自腾讯云控制台「推广素材」，中英两站各挂一个产品：
 * - zh（/zh）：WorkBuddy 全场景 AI 办公工作台（国内站 redirect=6871）
 * - en（根路径）：国际站热门返佣产品专属页（tencentcloud.com）
 * cps_key / intl_cps_key 为账号专属返佣参数；更换推广产品时
 * 更新对应条目即可，返佣效果见控制台「推广效果」页。
 */
import type { Locale } from '@/lib/i18n'

export type PromoEntry = {
  /** 角标文案，标识这是推广位 */
  tag: string
  /** 推广文案 */
  text: string
  /** 带追踪参数的推广链接 */
  href: string
}

export const CPS_PROMO: Record<Locale, PromoEntry> = {
  zh: {
    tag: '推广',
    text: '腾讯云 WorkBuddy 全场景 AI 办公工作台 · 团队旗舰版低至 198 元/月',
    href: 'https://cloud.tencent.com/act/cps/redirect?redirect=6871&cps_key=638bb157d3459281b3b3ff43488dd453&from=console',
  },
  en: {
    tag: 'Promo',
    text: 'Tencent Cloud International — hot cloud products on sale',
    href: 'https://www.tencentcloud.com/act/pro/cps?intl_cps_key=638bb157d3459281b3b3ff43488dd453',
  },
}
