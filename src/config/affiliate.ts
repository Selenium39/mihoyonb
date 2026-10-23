/**
 * 联盟变现配置（英文站优先）。
 *
 * perler / hama / artkal 这类拼豆耗材是拼豆图纸工具的天然下游商品，
 * 购买意图强，联盟佣金远高于展示广告。
 *
 * 上线前把 amazonAssociatesTag 换成自己的 Amazon Associates ID（例如 'mihoyonb-20'）。
 * tag 为空时仍会生成正常的 Amazon 搜索链接，只是不产生佣金。
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

export function amazonSearchUrl(query: string): string {
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
  const tag = affiliateConfig.amazonAssociatesTag.trim()
  return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base
}
