/**
 * 96 色数字参考色板（MARD 风格色号）
 *
 * 色号、中文名与 HEX 均为本站自行整理的屏幕近似值，方便照片映射和用量统计。
 * 不是任何品牌的官方色卡，也未从 GPL/AGPL 项目拷贝色值表。
 * 实物珠子有批次色差，采购前请用品牌色卡核对。
 */

export interface Lab {
  L: number
  a: number
  b: number
}

export interface BeadColor {
  /** 字母+数字，风格接近常见拼豆色号，仅作数字参考 */
  code: string
  name: string
  hex: string
  family: string
}

export interface PaletteColor extends BeadColor {
  r: number
  g: number
  b: number
  lab: Lab
}

export const PALETTE_NAME = '96 色数字参考色'
export const PALETTE_NOTE =
  '色号为 MARD 风格的数字参考色（字母+数字），HEX 为本站整理的屏幕近似值。采购前请以实物色卡为准。'

const RAW: readonly BeadColor[] = [
  { code: 'A1', name: '纯白', hex: '#FFFFFF', family: '白黄' },
  { code: 'A2', name: '象牙', hex: '#F6E7C1', family: '白黄' },
  { code: 'A3', name: '奶油', hex: '#FFE8A3', family: '白黄' },
  { code: 'A4', name: '浅黄', hex: '#FFE14A', family: '白黄' },
  { code: 'A5', name: '柠檬', hex: '#FFD000', family: '白黄' },
  { code: 'A6', name: '金黄', hex: '#F0B400', family: '白黄' },
  { code: 'A7', name: '琥珀', hex: '#D89200', family: '白黄' },
  { code: 'A8', name: '深金', hex: '#B86E00', family: '白黄' },
  { code: 'A9', name: '芥末', hex: '#C6A000', family: '白黄' },
  { code: 'A10', name: '杏橙', hex: '#FFB35C', family: '白黄' },
  { code: 'A11', name: '橙', hex: '#F08618', family: '白黄' },
  { code: 'A12', name: '深橙', hex: '#D85A00', family: '白黄' },

  { code: 'B1', name: '浅珊瑚', hex: '#FFC7B8', family: '红粉' },
  { code: 'B2', name: '珊瑚', hex: '#FF816C', family: '红粉' },
  { code: 'B3', name: '番茄', hex: '#F24832', family: '红粉' },
  { code: 'B4', name: '正红', hex: '#D00000', family: '红粉' },
  { code: 'B5', name: '深红', hex: '#9E0018', family: '红粉' },
  { code: 'B6', name: '酒红', hex: '#6C1024', family: '红粉' },
  { code: 'B7', name: '浅粉', hex: '#FFD4E2', family: '红粉' },
  { code: 'B8', name: '粉', hex: '#FF9BC0', family: '红粉' },
  { code: 'B9', name: '玫瑰', hex: '#F04B8C', family: '红粉' },
  { code: 'B10', name: '玫红', hex: '#D01260', family: '红粉' },
  { code: 'B11', name: '深玫', hex: '#8E0C48', family: '红粉' },
  { code: 'B12', name: '胭脂', hex: '#C43B5C', family: '红粉' },
  { code: 'B13', name: '赤陶', hex: '#C85A3A', family: '红粉' },
  { code: 'B14', name: '砖红', hex: '#9A3A30', family: '红粉' },
  { code: 'B15', name: '豆沙', hex: '#C98B8E', family: '红粉' },
  { code: 'B16', name: '浆果', hex: '#7A2E48', family: '红粉' },

  { code: 'C1', name: '薄荷', hex: '#D7F5D0', family: '绿' },
  { code: 'C2', name: '浅绿', hex: '#A5E09A', family: '绿' },
  { code: 'C3', name: '黄绿', hex: '#C6E04A', family: '绿' },
  { code: 'C4', name: '草绿', hex: '#7CB342', family: '绿' },
  { code: 'C5', name: '正绿', hex: '#2E9E44', family: '绿' },
  { code: 'C6', name: '翠绿', hex: '#1B7A38', family: '绿' },
  { code: 'C7', name: '深绿', hex: '#0E5A30', family: '绿' },
  { code: 'C8', name: '墨绿', hex: '#163628', family: '绿' },
  { code: 'C9', name: '橄榄', hex: '#6E8B2E', family: '绿' },
  { code: 'C10', name: '苔绿', hex: '#4E6B3C', family: '绿' },
  { code: 'C11', name: '青绿', hex: '#1F8A72', family: '绿' },
  { code: 'C12', name: '深青', hex: '#0F5E52', family: '绿' },
  { code: 'C13', name: '浅青', hex: '#8FE0CC', family: '绿' },
  { code: 'C14', name: '黄绿暗', hex: '#8A9A22', family: '绿' },
  { code: 'C15', name: '军绿', hex: '#5C6B32', family: '绿' },
  { code: 'C16', name: '灰绿', hex: '#8AAB9E', family: '绿' },

  { code: 'D1', name: '冰蓝', hex: '#E4F4FF', family: '蓝青' },
  { code: 'D2', name: '天蓝', hex: '#8ED4F8', family: '蓝青' },
  { code: 'D3', name: '晴空', hex: '#3AACE8', family: '蓝青' },
  { code: 'D4', name: '正蓝', hex: '#1A78D4', family: '蓝青' },
  { code: 'D5', name: '宝蓝', hex: '#154EAE', family: '蓝青' },
  { code: 'D6', name: '深蓝', hex: '#0C2F78', family: '蓝青' },
  { code: 'D7', name: '海军', hex: '#071428', family: '蓝青' },
  { code: 'D8', name: '青', hex: '#2EC4D6', family: '蓝青' },
  { code: 'D9', name: '浅青', hex: '#A8E8F2', family: '蓝青' },
  { code: 'D10', name: '湖蓝', hex: '#1E90B0', family: '蓝青' },
  { code: 'D11', name: '蓝绿', hex: '#165E86', family: '蓝青' },
  { code: 'D12', name: '靛蓝', hex: '#3A46B0', family: '蓝青' },
  { code: 'D13', name: '群青', hex: '#3C2A9A', family: '蓝青' },
  { code: 'D14', name: '雾蓝', hex: '#C5D6EE', family: '蓝青' },
  { code: 'D15', name: '灰蓝', hex: '#7E96B4', family: '蓝青' },
  { code: 'D16', name: '石板蓝', hex: '#3D5A73', family: '蓝青' },

  { code: 'E1', name: '薰衣草', hex: '#E8D8F8', family: '紫' },
  { code: 'E2', name: '浅紫', hex: '#C9A4EA', family: '紫' },
  { code: 'E3', name: '紫', hex: '#8A56C8', family: '紫' },
  { code: 'E4', name: '葡萄', hex: '#642890', family: '紫' },
  { code: 'E5', name: '深紫', hex: '#45185F', family: '紫' },
  { code: 'E6', name: '紫红', hex: '#A33B8C', family: '紫' },
  { code: 'E7', name: '梅红', hex: '#C86AAD', family: '紫' },
  { code: 'E8', name: '丁香', hex: '#B7A4CC', family: '紫' },
  { code: 'E9', name: '蓝紫', hex: '#544888', family: '紫' },
  { code: 'E10', name: '茄色', hex: '#5C2848', family: '紫' },

  { code: 'F1', name: '浅肤', hex: '#FDE0D0', family: '棕肤' },
  { code: 'F2', name: '肤色', hex: '#F3C2A4', family: '棕肤' },
  { code: 'F3', name: '小麦', hex: '#E0A67A', family: '棕肤' },
  { code: 'F4', name: '深肤', hex: '#C8845A', family: '棕肤' },
  { code: 'F5', name: '棕肤', hex: '#A8623C', family: '棕肤' },
  { code: 'F6', name: '深棕肤', hex: '#8A3E28', family: '棕肤' },
  { code: 'F7', name: '浅卡其', hex: '#D9C48A', family: '棕肤' },
  { code: 'F8', name: '卡其', hex: '#C4A15A', family: '棕肤' },
  { code: 'F9', name: '浅棕', hex: '#A67B45', family: '棕肤' },
  { code: 'F10', name: '棕', hex: '#7C5318', family: '棕肤' },
  { code: 'F11', name: '咖啡', hex: '#6B3A22', family: '棕肤' },
  { code: 'F12', name: '深咖', hex: '#3E2414', family: '棕肤' },
  { code: 'F13', name: '米色', hex: '#E7D3B0', family: '棕肤' },
  { code: 'F14', name: '沙色', hex: '#CDB892', family: '棕肤' },
  { code: 'F15', name: '红棕', hex: '#7A3024', family: '棕肤' },
  { code: 'F16', name: '灰褐', hex: '#6E5346', family: '棕肤' },

  { code: 'G1', name: '浅灰', hex: '#D8D8D8', family: '中性' },
  { code: 'G2', name: '银灰', hex: '#B4B4B4', family: '中性' },
  { code: 'G3', name: '中灰', hex: '#8A8A8A', family: '中性' },
  { code: 'G4', name: '深灰', hex: '#5A5A5A', family: '中性' },
  { code: 'G5', name: '炭灰', hex: '#3A3A3A', family: '中性' },
  { code: 'G6', name: '黑', hex: '#1A1A1A', family: '中性' },
  { code: 'G7', name: '暖灰', hex: '#C8C0B4', family: '中性' },
  { code: 'G8', name: '冷灰', hex: '#9AABBA', family: '中性' },
  { code: 'G9', name: '蓝黑', hex: '#1C2A38', family: '中性' },
  { code: 'G10', name: '珍珠', hex: '#DDD4C6', family: '中性' },
]

const DELTA = 6 / 29
const DELTA_SQ = DELTA * DELTA
const DELTA_CU = DELTA_SQ * DELTA

function pivotLab(t: number): number {
  return t > DELTA_CU ? Math.cbrt(t) : t / (3 * DELTA_SQ) + 4 / 29
}

/** sRGB 0–255 → CIE Lab（D65），供最近色与色差使用 */
export function rgbToLab(r: number, g: number, b: number): Lab {
  const rl = srgbToLinear(r / 255)
  const gl = srgbToLinear(g / 255)
  const bl = srgbToLinear(b / 255)
  const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175
  const z = (rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041) / 1.08883
  const fx = pivotLab(x)
  const fy = pivotLab(y)
  const fz = pivotLab(z)
  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  }
}

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

/** CIE76，Lab 空间欧氏距离，数值越大颜色差得越明显 */
export function deltaE76(c1: Lab, c2: Lab): number {
  const dL = c1.L - c2.L
  const da = c1.a - c2.a
  const db = c1.b - c2.b
  return Math.sqrt(dL * dL + da * da + db * db)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  if (h.length !== 6) throw new Error(`非法 HEX：${hex}`)
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  }
}

function buildPalette(): readonly PaletteColor[] {
  const codes = new Set<string>()
  return RAW.map((color) => {
    if (codes.has(color.code)) throw new Error(`重复色号 ${color.code}`)
    codes.add(color.code)
    const { r, g, b } = hexToRgb(color.hex)
    return { ...color, r, g, b, lab: rgbToLab(r, g, b) }
  })
}

export const PALETTE: readonly PaletteColor[] = buildPalette()

/**
 * 在色板（或给定子集）里找 CIE76 最近色。
 * allowed 为色板下标列表；不传则搜索整板。
 */
export function nearestPaletteIndex(
  L: number,
  a: number,
  b: number,
  allowed?: ArrayLike<number> | null,
): number {
  const useSubset = allowed != null && allowed.length > 0
  let best = useSubset ? allowed[0] : 0
  let bestD = Number.POSITIVE_INFINITY
  const total = useSubset ? allowed.length : PALETTE.length
  for (let k = 0; k < total; k++) {
    const index = useSubset ? allowed[k] : k
    const lab = PALETTE[index].lab
    const dL = L - lab.L
    const da = a - lab.a
    const db = b - lab.b
    const dist = dL * dL + da * da + db * db
    if (dist < bestD) {
      bestD = dist
      best = index
    }
  }
  return best
}

/** 浅色格子用深字，深色格子用白字 */
export function inkForLab(lab: Lab): string {
  return lab.L >= 62 ? '#1a1a1a' : '#ffffff'
}
