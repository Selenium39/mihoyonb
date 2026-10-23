/**
 * 96 色数字参考色板（MARD 风格色号）
 *
 * 色号、中文名与 HEX 均为本站自行整理的屏幕近似值，方便照片映射和用量统计。
 * 不是任何品牌的官方色卡，也未从 GPL/AGPL 项目拷贝色值表。
 * 实物珠子有批次色差，采购前请用品牌色卡核对。
 *
 * 中文名/色系用于 /zh/pindou，nameEn/familyEn 用于 /pindou。
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
  /** 英文色名，供英文站与英文导出使用 */
  nameEn: string
  hex: string
  family: string
  /** 英文色系，供英文站与英文导出使用 */
  familyEn: string
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
export const PALETTE_NAME_EN = '96-color numeric reference palette'
export const PALETTE_NOTE_EN =
  'Color codes are MARD-style numeric references (letter + number). HEX values are screen approximations curated by this site. Please check against a physical color card before ordering.'

const RAW: readonly BeadColor[] = [
  { code: 'A1', name: '纯白', nameEn: 'Pure White', hex: '#FFFFFF', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A2', name: '象牙', nameEn: 'Ivory', hex: '#F6E7C1', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A3', name: '奶油', nameEn: 'Cream', hex: '#FFE8A3', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A4', name: '浅黄', nameEn: 'Light Yellow', hex: '#FFE14A', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A5', name: '柠檬', nameEn: 'Lemon', hex: '#FFD000', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A6', name: '金黄', nameEn: 'Golden Yellow', hex: '#F0B400', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A7', name: '琥珀', nameEn: 'Amber', hex: '#D89200', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A8', name: '深金', nameEn: 'Dark Gold', hex: '#B86E00', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A9', name: '芥末', nameEn: 'Mustard', hex: '#C6A000', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A10', name: '杏橙', nameEn: 'Apricot Orange', hex: '#FFB35C', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A11', name: '橙', nameEn: 'Orange', hex: '#F08618', family: '白黄', familyEn: 'White/Yellow' },
  { code: 'A12', name: '深橙', nameEn: 'Dark Orange', hex: '#D85A00', family: '白黄', familyEn: 'White/Yellow' },

  { code: 'B1', name: '浅珊瑚', nameEn: 'Light Coral', hex: '#FFC7B8', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B2', name: '珊瑚', nameEn: 'Coral', hex: '#FF816C', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B3', name: '番茄', nameEn: 'Tomato', hex: '#F24832', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B4', name: '正红', nameEn: 'True Red', hex: '#D00000', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B5', name: '深红', nameEn: 'Deep Red', hex: '#9E0018', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B6', name: '酒红', nameEn: 'Wine Red', hex: '#6C1024', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B7', name: '浅粉', nameEn: 'Light Pink', hex: '#FFD4E2', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B8', name: '粉', nameEn: 'Pink', hex: '#FF9BC0', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B9', name: '玫瑰', nameEn: 'Rose', hex: '#F04B8C', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B10', name: '玫红', nameEn: 'Rose Red', hex: '#D01260', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B11', name: '深玫', nameEn: 'Deep Rose', hex: '#8E0C48', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B12', name: '胭脂', nameEn: 'Rouge', hex: '#C43B5C', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B13', name: '赤陶', nameEn: 'Terracotta', hex: '#C85A3A', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B14', name: '砖红', nameEn: 'Brick Red', hex: '#9A3A30', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B15', name: '豆沙', nameEn: 'Dusty Rose', hex: '#C98B8E', family: '红粉', familyEn: 'Red/Pink' },
  { code: 'B16', name: '浆果', nameEn: 'Berry', hex: '#7A2E48', family: '红粉', familyEn: 'Red/Pink' },

  { code: 'C1', name: '薄荷', nameEn: 'Mint', hex: '#D7F5D0', family: '绿', familyEn: 'Green' },
  { code: 'C2', name: '浅绿', nameEn: 'Light Green', hex: '#A5E09A', family: '绿', familyEn: 'Green' },
  { code: 'C3', name: '黄绿', nameEn: 'Yellow Green', hex: '#C6E04A', family: '绿', familyEn: 'Green' },
  { code: 'C4', name: '草绿', nameEn: 'Grass Green', hex: '#7CB342', family: '绿', familyEn: 'Green' },
  { code: 'C5', name: '正绿', nameEn: 'True Green', hex: '#2E9E44', family: '绿', familyEn: 'Green' },
  { code: 'C6', name: '翠绿', nameEn: 'Emerald Green', hex: '#1B7A38', family: '绿', familyEn: 'Green' },
  { code: 'C7', name: '深绿', nameEn: 'Dark Green', hex: '#0E5A30', family: '绿', familyEn: 'Green' },
  { code: 'C8', name: '墨绿', nameEn: 'Pine Green', hex: '#163628', family: '绿', familyEn: 'Green' },
  { code: 'C9', name: '橄榄', nameEn: 'Olive', hex: '#6E8B2E', family: '绿', familyEn: 'Green' },
  { code: 'C10', name: '苔绿', nameEn: 'Moss Green', hex: '#4E6B3C', family: '绿', familyEn: 'Green' },
  { code: 'C11', name: '青绿', nameEn: 'Teal Green', hex: '#1F8A72', family: '绿', familyEn: 'Green' },
  { code: 'C12', name: '深青', nameEn: 'Deep Teal', hex: '#0F5E52', family: '绿', familyEn: 'Green' },
  { code: 'C13', name: '浅青', nameEn: 'Light Teal', hex: '#8FE0CC', family: '绿', familyEn: 'Green' },
  { code: 'C14', name: '黄绿暗', nameEn: 'Dark Yellow Green', hex: '#8A9A22', family: '绿', familyEn: 'Green' },
  { code: 'C15', name: '军绿', nameEn: 'Army Green', hex: '#5C6B32', family: '绿', familyEn: 'Green' },
  { code: 'C16', name: '灰绿', nameEn: 'Sage Green', hex: '#8AAB9E', family: '绿', familyEn: 'Green' },

  { code: 'D1', name: '冰蓝', nameEn: 'Ice Blue', hex: '#E4F4FF', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D2', name: '天蓝', nameEn: 'Sky Blue', hex: '#8ED4F8', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D3', name: '晴空', nameEn: 'Azure', hex: '#3AACE8', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D4', name: '正蓝', nameEn: 'True Blue', hex: '#1A78D4', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D5', name: '宝蓝', nameEn: 'Royal Blue', hex: '#154EAE', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D6', name: '深蓝', nameEn: 'Dark Blue', hex: '#0C2F78', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D7', name: '海军', nameEn: 'Navy', hex: '#071428', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D8', name: '青', nameEn: 'Cyan', hex: '#2EC4D6', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D9', name: '浅青', nameEn: 'Light Cyan', hex: '#A8E8F2', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D10', name: '湖蓝', nameEn: 'Lake Blue', hex: '#1E90B0', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D11', name: '蓝绿', nameEn: 'Blue Green', hex: '#165E86', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D12', name: '靛蓝', nameEn: 'Indigo', hex: '#3A46B0', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D13', name: '群青', nameEn: 'Ultramarine', hex: '#3C2A9A', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D14', name: '雾蓝', nameEn: 'Mist Blue', hex: '#C5D6EE', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D15', name: '灰蓝', nameEn: 'Gray Blue', hex: '#7E96B4', family: '蓝青', familyEn: 'Blue/Cyan' },
  { code: 'D16', name: '石板蓝', nameEn: 'Slate Blue', hex: '#3D5A73', family: '蓝青', familyEn: 'Blue/Cyan' },

  { code: 'E1', name: '薰衣草', nameEn: 'Lavender', hex: '#E8D8F8', family: '紫', familyEn: 'Purple' },
  { code: 'E2', name: '浅紫', nameEn: 'Light Purple', hex: '#C9A4EA', family: '紫', familyEn: 'Purple' },
  { code: 'E3', name: '紫', nameEn: 'Purple', hex: '#8A56C8', family: '紫', familyEn: 'Purple' },
  { code: 'E4', name: '葡萄', nameEn: 'Grape', hex: '#642890', family: '紫', familyEn: 'Purple' },
  { code: 'E5', name: '深紫', nameEn: 'Deep Purple', hex: '#45185F', family: '紫', familyEn: 'Purple' },
  { code: 'E6', name: '紫红', nameEn: 'Purple Red', hex: '#A33B8C', family: '紫', familyEn: 'Purple' },
  { code: 'E7', name: '梅红', nameEn: 'Plum Pink', hex: '#C86AAD', family: '紫', familyEn: 'Purple' },
  { code: 'E8', name: '丁香', nameEn: 'Lilac', hex: '#B7A4CC', family: '紫', familyEn: 'Purple' },
  { code: 'E9', name: '蓝紫', nameEn: 'Blue Violet', hex: '#544888', family: '紫', familyEn: 'Purple' },
  { code: 'E10', name: '茄色', nameEn: 'Eggplant', hex: '#5C2848', family: '紫', familyEn: 'Purple' },

  { code: 'F1', name: '浅肤', nameEn: 'Light Skin', hex: '#FDE0D0', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F2', name: '肤色', nameEn: 'Skin Tone', hex: '#F3C2A4', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F3', name: '小麦', nameEn: 'Wheat', hex: '#E0A67A', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F4', name: '深肤', nameEn: 'Deep Skin', hex: '#C8845A', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F5', name: '棕肤', nameEn: 'Tan', hex: '#A8623C', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F6', name: '深棕肤', nameEn: 'Dark Tan', hex: '#8A3E28', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F7', name: '浅卡其', nameEn: 'Light Khaki', hex: '#D9C48A', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F8', name: '卡其', nameEn: 'Khaki', hex: '#C4A15A', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F9', name: '浅棕', nameEn: 'Light Brown', hex: '#A67B45', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F10', name: '棕', nameEn: 'Brown', hex: '#7C5318', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F11', name: '咖啡', nameEn: 'Coffee', hex: '#6B3A22', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F12', name: '深咖', nameEn: 'Espresso', hex: '#3E2414', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F13', name: '米色', nameEn: 'Beige', hex: '#E7D3B0', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F14', name: '沙色', nameEn: 'Sand', hex: '#CDB892', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F15', name: '红棕', nameEn: 'Red Brown', hex: '#7A3024', family: '棕肤', familyEn: 'Brown/Skin' },
  { code: 'F16', name: '灰褐', nameEn: 'Taupe', hex: '#6E5346', family: '棕肤', familyEn: 'Brown/Skin' },

  { code: 'G1', name: '浅灰', nameEn: 'Light Gray', hex: '#D8D8D8', family: '中性', familyEn: 'Neutral' },
  { code: 'G2', name: '银灰', nameEn: 'Silver Gray', hex: '#B4B4B4', family: '中性', familyEn: 'Neutral' },
  { code: 'G3', name: '中灰', nameEn: 'Medium Gray', hex: '#8A8A8A', family: '中性', familyEn: 'Neutral' },
  { code: 'G4', name: '深灰', nameEn: 'Dark Gray', hex: '#5A5A5A', family: '中性', familyEn: 'Neutral' },
  { code: 'G5', name: '炭灰', nameEn: 'Charcoal Gray', hex: '#3A3A3A', family: '中性', familyEn: 'Neutral' },
  { code: 'G6', name: '黑', nameEn: 'Black', hex: '#1A1A1A', family: '中性', familyEn: 'Neutral' },
  { code: 'G7', name: '暖灰', nameEn: 'Warm Gray', hex: '#C8C0B4', family: '中性', familyEn: 'Neutral' },
  { code: 'G8', name: '冷灰', nameEn: 'Cool Gray', hex: '#9AABBA', family: '中性', familyEn: 'Neutral' },
  { code: 'G9', name: '蓝黑', nameEn: 'Blue Black', hex: '#1C2A38', family: '中性', familyEn: 'Neutral' },
  { code: 'G10', name: '珍珠', nameEn: 'Pearl', hex: '#DDD4C6', family: '中性', familyEn: 'Neutral' },
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
  if (h.length !== 6) throw new Error(`Invalid HEX: ${hex}`)
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  }
}

function buildPalette(): readonly PaletteColor[] {
  const codes = new Set<string>()
  return RAW.map((color) => {
    if (codes.has(color.code)) throw new Error(`Duplicate color code: ${color.code}`)
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
