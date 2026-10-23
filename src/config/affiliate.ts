/**
 * 联盟变现配置（英文站优先）。
 *
 * perler / hama / artkal 这类拼豆耗材是拼豆图纸工具的天然下游商品，
 * 购买意图强，联盟佣金远高于展示广告。
 *
 * 当前阶段先不接联盟：amazonAssociatesTag 保持空字符串，
 * 页面上的「Where to buy beads」区块会整体不渲染，避免在没有
 * Associates 账号时展示虚假的佣金披露。
 *
 * 以后要启用时，把 amazonAssociatesTag 换成自己的 Amazon Associates ID
 * （例如 'mihoyonb-20'），重建后联盟块会自动出现并带上 tag。
 */
export const affiliateConfig = {
  amazonAssociatesTag: '',
  /** 拼豆品牌与 Amazon 搜索词 */
  brands: [
    { id: 'perler', name: 'Perler', searchQuery: 'perler beads' },
    { id: 'hama', name: 'Hama', searchQuery: 'hama beads' },
    { id: 'artkal', name: 'Artkal', searchQuery: 'artkal beads' },
  ],
} as const

export type AffiliateBrand = (typeof affiliateConfig.brands)[number]

/** tag 为空时不渲染联盟区块（也不做 Associates 披露） */
export function isAffiliateEnabled(): boolean {
  return affiliateConfig.amazonAssociatesTag.trim().length > 0
}

export function amazonSearchUrl(query: string): string {
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
  const tag = affiliateConfig.amazonAssociatesTag.trim()
  return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base
}
