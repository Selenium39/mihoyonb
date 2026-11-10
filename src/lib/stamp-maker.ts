/**
 * 印章生成器核心：StampState 数据模型 + renderStampSVG 纯函数。
 *
 * 设计要点：
 * - 以 400×400 viewBox 为画布基准，圆形 R=190；导出时按倍率光栅化即可得到高清位图。
 * - 弧形文字用 SVG <textPath>：上弧 sweep=1（左→上→右），下弧 sweep=0（左→底→右，文字正立）；
 *   矩形/三角形退化为水平直线文字。
 * - 经典装饰边（扇贝/光芒/齿轮/绳珠）只支持圆形，全部程序生成 path/circle，无外部资源。
 * - 老化效果用 SVG 滤镜（feTurbulence + feDisplacementMap 毛边 + 高频噪声 mask 做墨迹斑驳），
 *   全部是 SVG 原生能力，导出光栅化时依然有效。
 * - 渲染是纯函数（state → svg string），预览用 dangerouslySetInnerHTML 注入，
 *   导出走同一条渲染管线，保证所见即所得。
 */

export type StampShape = 'circle' | 'ellipse' | 'rect' | 'triangle'
export type BorderStyle = 'single' | 'double' | 'triple' | 'dashed' | 'dotted'
/** 圆形专属经典装饰边 */
export type StampEdge = 'none' | 'scalloped' | 'sunburst' | 'gear' | 'rope'

/** 弧形文字（顶部 / 底部，圆与椭圆沿弧排布，矩形/三角形为直线） */
export interface ArcText {
  enabled: boolean
  text: string
  fontId: string
  size: number
  letterSpacing: number
}

/** 中央多行文字 */
export interface CenterText {
  enabled: boolean
  lines: string
  fontId: string
  size: number
  lineHeight: number
}

/** 中心图标（上传 SVG/PNG 的 dataURL） */
export interface StampIcon {
  enabled: boolean
  src: string | null
  /** 相对内框边长的比例 */
  scale: number
}

export interface StampState {
  shape: StampShape
  /** 墨水颜色 */
  color: string
  border: { style: BorderStyle; width: number }
  /** 圆形装饰边（其他形状渲染时忽略） */
  edge: StampEdge
  top: ArcText
  bottom: ArcText
  center: CenterText
  icon: StampIcon
  /** 0-1，整体不透明度 */
  opacity: number
  /** 0-100，老化磨损强度 */
  aging: number
  /** 物理尺寸（mm），用于 PDF 页面与文件命名 */
  sizeMm: { width: number; height: number }
}

export interface StampFont {
  id: string
  /** css2 请求用的 family 名（冒号后跟权重） */
  query: string
  /** SVG font-family 使用的名字 */
  family: string
  weight: number
  label: string
  /** cjk 字体走 Google Fonts 的 unicode-range 分片 */
  cjk: boolean
}

/**
 * 字体注册表：预览用 <link> 全量加载，导出用 css2 的 text= 参数按需子集内嵌。
 * 中英文各选几款适合印章的字体。
 */
export const STAMP_FONTS: StampFont[] = [
  { id: 'cinzel', query: 'Cinzel:wght@700', family: 'Cinzel', weight: 700, label: 'Cinzel（罗马碑刻）', cjk: false },
  { id: 'playfair', query: 'Playfair+Display:wght@700', family: 'Playfair Display', weight: 700, label: 'Playfair Display（衬线）', cjk: false },
  { id: 'oswald', query: 'Oswald:wght@500', family: 'Oswald', weight: 500, label: 'Oswald（窄无衬线）', cjk: false },
  { id: 'courier', query: 'Courier+Prime:wght@700', family: 'Courier Prime', weight: 700, label: 'Courier Prime（打字机）', cjk: false },
  { id: 'vibes', query: 'Great+Vibes', family: 'Great Vibes', weight: 400, label: 'Great Vibes（手写花体）', cjk: false },
  { id: 'noto-serif-sc', query: 'Noto+Serif+SC:wght@700', family: 'Noto Serif SC', weight: 700, label: '思源宋体', cjk: true },
  { id: 'zcool-xiaowei', query: 'ZCOOL+XiaoWei', family: 'ZCOOL XiaoWei', weight: 400, label: '站酷小薇（公文）', cjk: true },
  { id: 'ma-shan-zheng', query: 'Ma+Shan+Zheng', family: 'Ma Shan Zheng', weight: 400, label: '马善政毛笔', cjk: true },
  { id: 'huangyou', query: 'ZCOOL+QingKe+HuangYou', family: 'ZCOOL QingKe HuangYou', weight: 400, label: '站酷黄油体', cjk: true },
]

export function getStampFont(fontId: string): StampFont {
  return STAMP_FONTS.find((f) => f.id === fontId) ?? STAMP_FONTS[0]
}

/** SVG font-family 栈：webfont + 通用回退，中文字体落到 serif 宋体 */
export function getFontStack(fontId: string): string {
  const f = getStampFont(fontId)
  return f.cjk ? `'${f.family}', 'Noto Serif SC', serif` : `'${f.family}', 'Times New Roman', serif`
}

// ---------------------------------------------------------------------------
// 画布常量与几何
// ---------------------------------------------------------------------------

const VB = 400
const CX = VB / 2
const CY = VB / 2
/** 圆形外框半径 */
export const CIRCLE_R = 190
/** 有装饰边时圆形整体内缩，给装饰环留空间 */
const CIRCLE_R_WITH_EDGE = 177
/** 装饰环参数：内半径基准间隙与厚度 */
const EDGE_GAP = 5
const EDGE_THICKNESS = 9
/** 椭圆半径 */
export const ELLIPSE_RX = 190
export const ELLIPSE_RY = 132
/** 矩形半宽高（圆角 12） */
export const RECT_HW = 190
export const RECT_HH = 132
export const RECT_RADIUS = 12
/** 三角形（等边，质心居中）：高 260 → 顶点 y=200-173，底边 y=287，半宽 150 */
const TRI_H = 260
const TRI_HW = 150
const TRI_APEX_Y = CY - (TRI_H * 2) / 3
const TRI_BASE_Y = CY + TRI_H / 3

export const VIEWBOX = { width: VB, height: VB }

/** 当前 state 下圆形的有效外半径（装饰边占用时内缩） */
function circleBaseR(state: StampState): number {
  return state.shape === 'circle' && state.edge !== 'none' ? CIRCLE_R_WITH_EDGE : CIRCLE_R
}

/** 形状边框的几何参数，按 inset 缩进得到同心边框 */
function borderInsetGeometry(state: StampState, inset: number) {
  const w = state.border.width
  switch (state.shape) {
    case 'circle':
      return { kind: 'circle' as const, r: circleBaseR(state) - inset, w }
    case 'ellipse':
      return { kind: 'ellipse' as const, rx: ELLIPSE_RX - inset, ry: ELLIPSE_RY - inset, w }
    case 'rect':
      return { kind: 'rect' as const, hw: RECT_HW - inset, hh: RECT_HH - inset, w }
    case 'triangle':
      return { kind: 'triangle' as const, inset, w }
  }
}

/** 三角形顶点（等边、质心在画布中心），inset>0 时向质心收缩 */
function trianglePoints(inset: number): Array<[number, number]> {
  const cx = CX
  const cy = CY
  const apex: [number, number] = [cx, TRI_APEX_Y]
  const bl: [number, number] = [cx - TRI_HW, TRI_BASE_Y]
  const br: [number, number] = [cx + TRI_HW, TRI_BASE_Y]
  if (inset <= 0) return [apex, bl, br]
  return [apex, bl, br].map((p) => {
    const dx = cx - p[0]
    const dy = cy - p[1]
    const len = Math.sqrt(dx * dx + dy * dy)
    return [p[0] + (dx / len) * inset * 1.2, p[1] + (dy / len) * inset * 1.2] as [number, number]
  })
}

function borderElement(state: StampState, inset: number): string {
  const g = borderInsetGeometry(state, inset)
  const { width: w } = state.border
  const common = `fill="none" stroke="${state.color}" stroke-width="${w}"`
  switch (g.kind) {
    case 'circle':
      return `<circle cx="${CX}" cy="${CY}" r="${g.r}" ${common}/>`
    case 'ellipse':
      return `<ellipse cx="${CX}" cy="${CY}" rx="${g.rx}" ry="${g.ry}" ${common}/>`
    case 'rect':
      return `<rect x="${CX - g.hw}" y="${CY - g.hh}" width="${g.hw * 2}" height="${g.hh * 2}" rx="${RECT_RADIUS}" ${common}/>`
    case 'triangle': {
      const pts = trianglePoints(g.inset)
        .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
        .join(' ')
      return `<polygon points="${pts}" ${common} stroke-linejoin="round"/>`
    }
  }
}

/** 各边框样式的 stroke 属性与同心层数 */
function borderLayers(state: StampState): string[] {
  const { style, width: w } = state.border
  switch (style) {
    case 'single':
      return [borderElement(state, w / 2)]
    case 'double': {
      const gap = Math.max(w * 1.6, 7)
      return [borderElement(state, w / 2), borderElement(state, w / 2 + gap)]
    }
    case 'triple': {
      const gap = Math.max(w * 1.4, 6)
      return [
        borderElement(state, w / 2),
        borderElement(state, w / 2 + gap + w),
        borderElement(state, w / 2 + gap * 2 + w * 2),
      ]
    }
    case 'dashed':
      return [
        borderElement(state, w / 2).replace('/>', ' stroke-dasharray="14 10"/>'),
      ]
    case 'dotted':
      return [
        borderElement(state, w / 2).replace('/>', ' stroke-dasharray="0.5 12" stroke-linecap="round" stroke-width="' + Math.max(w, 3) + '"/>'),
      ]
  }
}

// ---------------------------------------------------------------------------
// 装饰边（圆形专属，程序生成）
// ---------------------------------------------------------------------------

function polar(cx: number, cy: number, r: number, theta: number): [number, number] {
  return [cx + r * Math.cos(theta), cy + r * Math.sin(theta)]
}

/** 扇贝边：n 段外凸半圆拼成的闭合环 */
function scallopRing(color: string, rInner: number): string {
  const n = 26
  const rOuter = rInner + EDGE_THICKNESS
  const chord = 2 * rInner * Math.sin(Math.PI / n)
  const rArc = chord / 2 + 0.6
  let d = ''
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * Math.PI * 2 - Math.PI / 2
    const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2
    const p1 = polar(CX, CY, rInner, a1)
    const p2 = polar(CX, CY, rInner, a2)
    // 起点后每段一个大弧凸出（sweep=1 顺时针，凸向外）
    d += `${i === 0 ? `M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}` : ''} A ${rArc.toFixed(2)} ${rArc.toFixed(2)} 0 0 1 ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `
    void rOuter
  }
  return `<path d="${d}Z" fill="${color}" stroke="none"/>`
}

/** 齿状环（光芒/齿轮通用）：n 齿多边形，齿顶比例 tip 控制粗细 */
function teethRing(color: string, rInner: number, n: number, tip: number): string {
  const rOuter = rInner + EDGE_THICKNESS
  let d = ''
  const step = (Math.PI * 2) / n
  for (let i = 0; i < n; i++) {
    const a = i * step - Math.PI / 2
    const p1 = polar(CX, CY, rInner, a)
    const p2 = polar(CX, CY, rOuter, a + step * tip)
    const p3 = polar(CX, CY, rInner, a + step * tip * 2)
    d += `${i === 0 ? `M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}` : ''} L ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} L ${p3[0].toFixed(2)} ${p3[1].toFixed(2)} `
  }
  return `<path d="${d}Z" fill="${color}" stroke="none"/>`
}

/** 绳珠边：交替大小的圆点环 */
function ropeRing(color: string, rMid: number): string {
  const n = 54
  let out = ''
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    const p = polar(CX, CY, rMid, a)
    const r = i % 2 === 0 ? 2.2 : 3.4
    out += `<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${r}" fill="${color}" stroke="none"/>`
  }
  return out
}

/** 装饰环组；仅圆形渲染，其他形状返回空。
 *  半径基准：有装饰边时 circleBaseR=177，装饰环 [191, 200] 恰好贴画布不溢出。 */
function edgeRing(state: StampState): string {
  if (state.shape !== 'circle' || state.edge === 'none') return ''
  const rInner = circleBaseR(state) + 14
  const rMid = rInner + EDGE_THICKNESS / 2
  switch (state.edge) {
    case 'scalloped':
      return scallopRing(state.color, rInner)
    case 'sunburst':
      return teethRing(state.color, rInner, 56, 0.34)
    case 'gear':
      return teethRing(state.color, rInner, 22, 0.5)
    case 'rope':
      return ropeRing(state.color, rMid)
  }
}

// ---------------------------------------------------------------------------
// 文字
// ---------------------------------------------------------------------------

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 文字基线路径：
 * - circle：上弧 sweep=1 / 下弧 sweep=0（下弧文字正立）
 * - ellipse：椭圆弧同理
 * - rect / triangle：直线
 */
function textPathD(state: StampState, zone: 'top' | 'bottom', radiusShrink: number): string {
  switch (state.shape) {
    case 'circle': {
      const r = circleBaseR(state) - radiusShrink
      const sweep = zone === 'top' ? 1 : 0
      return `M ${CX - r} ${CY} A ${r} ${r} 0 1 ${sweep} ${CX + r} ${CY}`
    }
    case 'ellipse': {
      const rx = ELLIPSE_RX - radiusShrink
      const ry = ELLIPSE_RY - radiusShrink * (ELLIPSE_RY / ELLIPSE_RX)
      const sweep = zone === 'top' ? 1 : 0
      return `M ${CX - rx} ${CY} A ${rx} ${ry} 0 1 ${sweep} ${CX + rx} ${CY}`
    }
    case 'rect': {
      const inset = 26 + radiusShrink
      const y = zone === 'top' ? CY - RECT_HH + inset : CY + RECT_HH - inset + 4
      const x1 = CX - RECT_HW + inset
      const x2 = CX + RECT_HW - inset
      return `M ${x1} ${y} L ${x2} ${y}`
    }
    case 'triangle': {
      // 上部文字带放在三角上 1/3 下方（该高度处三角形半宽约 71），底部文字贴底边上方
      if (zone === 'top') {
        const y = CY - TRI_H * 0.18
        const half = 70
        return `M ${CX - half} ${y} L ${CX + half} ${y}`
      }
      const y = TRI_BASE_Y - 26
      const half = 122
      return `M ${CX - half} ${y} L ${CX + half} ${y}`
    }
  }
}

/** 顶部 / 底部弧形文字：返回 <defs> 里的 path 与可见的 <text> */
function arcText(state: StampState, zone: 'top' | 'bottom', uid: string): { defs: string; body: string } {
  const t = zone === 'top' ? state.top : state.bottom
  if (!t.enabled || !t.text.trim()) return { defs: '', body: '' }
  const f = getStampFont(t.fontId)
  // 文字带在边框内侧：上弧字形向外长（基线 + 0.75size），下弧字形向内长（基线即外缘）
  const shrink =
    zone === 'top'
      ? state.border.width + 8 + t.size * 0.75
      : state.border.width + 6
  const pid = `${uid}-${zone}-path`
  const d = textPathD(state, zone, shrink)
  const spacing = t.letterSpacing !== 0 ? ` letter-spacing="${t.letterSpacing}"` : ''
  return {
    defs: `<path id="${pid}" d="${d}" fill="none"/>`,
    body:
      `<text font-family="${getFontStack(t.fontId)}" font-size="${t.size}" font-weight="${f.weight}" fill="${state.color}" text-anchor="middle"${spacing}>` +
      `<textPath href="#${pid}" startOffset="50%">${escapeXml(t.text)}</textPath>` +
      `</text>`,
  }
}

/** 中央文字与图标的布局：两者共存时 icon 在上、文字在下 */
function centerBlock(state: StampState): string {
  const c = state.center
  const hasText = c.enabled && c.lines.trim().length > 0
  const hasIcon = state.icon.enabled && !!state.icon.src
  if (!hasText && !hasIcon) return ''

  // 内框边长（约）：圆形用有效半径，其他形状用半宽高的较小值
  const baseR =
    state.shape === 'circle'
      ? circleBaseR(state)
      : Math.min(state.shape === 'ellipse' ? ELLIPSE_RY : state.shape === 'rect' ? RECT_HH : TRI_H * 0.4, 190)
  const innerBox = (baseR - state.border.width * 2 - 12) * 2

  const parts: string[] = []
  const lines = hasText ? c.lines.split('\n').filter((l) => l.trim().length > 0) : []
  const lh = c.size * c.lineHeight
  const textH = lines.length * lh
  const iconH = hasIcon ? innerBox * state.icon.scale : 0
  const totalH = iconH + (hasText ? textH : 0)
  const topY = CY - totalH / 2

  if (hasIcon) {
    const src = state.icon.src as string
    const w = iconH
    const h = iconH
    parts.push(
      `<image href="${escapeXml(src)}" x="${CX - w / 2}" y="${topY}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`,
    )
  }
  if (hasText) {
    const f = getStampFont(c.fontId)
    const firstBaseline = topY + iconH + textH / 2 - ((lines.length - 1) * lh) / 2 + c.size * 0.35
    const spans = lines
      .map((line, i) => `<tspan x="${CX}" y="${(firstBaseline + i * lh).toFixed(1)}">${escapeXml(line)}</tspan>`)
      .join('')
    parts.push(
      `<text font-family="${getFontStack(c.fontId)}" font-size="${c.size}" font-weight="${f.weight}" ` +
        `fill="${state.color}" text-anchor="middle">${spans}</text>`,
    )
  }
  return parts.join('')
}

// ---------------------------------------------------------------------------
// 老化滤镜
// ---------------------------------------------------------------------------

/**
 * 磨损效果：低频噪声让边缘起毛（displacement），高频噪声做墨迹斑驳的 alpha mask。
 * strength 0-100：0 时退化为恒等滤镜（不产生视觉差异）。
 */
function agingFilter(uid: string, strength: number): string {
  const s = Math.max(0, Math.min(100, strength))
  const erosion = s / 100
  const disp = (erosion * 7).toFixed(2)
  // 斑驳阈值：alpha_out = slope·a + intercept，噪声 a 低于阈值处出现缺墨。
  // erosion=0 → intercept=1（全不透明，无斑驳）；越大 slope 越陡、intercept 越低，缺口越多。
  const slope = (1 + erosion * 3).toFixed(3)
  const intercept = (1 - erosion * 1.05).toFixed(3)
  return `<filter id="${uid}-aging" x="-8%" y="-8%" width="116%" height="116%">
  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="${disp}" result="warped"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.17" numOctaves="2" seed="23" result="grain"/>
  <feColorMatrix in="grain" type="matrix" result="gmask"
    values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${slope} 0 0 0 ${intercept}"/>
  <feComposite in="warped" in2="gmask" operator="in"/>
</filter>`
}

// ---------------------------------------------------------------------------
// 主渲染函数
// ---------------------------------------------------------------------------

export interface RenderOptions {
  /** 唯一 id 前缀，避免同页多个 SVG 的 filter/path id 冲突 */
  uid?: string
  /** 根元素附加 class（预览容器可用） */
  className?: string
}

export function renderStampSVG(state: StampState, opts: RenderOptions = {}): string {
  const uid = opts.uid ?? 'stamp'
  const top = arcText(state, 'top', uid)
  const bottom = arcText(state, 'bottom', uid)
  const defsParts: string[] = [top.defs, bottom.defs]
  let bodyParts: string[] = [
    edgeRing(state),
    ...borderLayers(state),
    top.body,
    bottom.body,
    centerBlock(state),
  ]

  if (state.aging > 0) {
    defsParts.push(agingFilter(uid, state.aging))
    bodyParts = bodyParts.map((p) => (p ? `<g filter="url(#${uid}-aging)">${p}</g>` : p))
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB} ${VB}" width="${VB}" height="${VB}"` +
    (opts.className ? ` class="${opts.className}"` : '') +
    `>` +
    `<defs>${defsParts.join('')}</defs>` +
    `<g opacity="${state.opacity}">${bodyParts.join('')}</g>` +
    `</svg>`
  )
}

// ---------------------------------------------------------------------------
// 预置模板
// ---------------------------------------------------------------------------

export interface StampTemplate {
  id: string
  nameEn: string
  nameZh: string
  state: StampState
}

function baseState(): StampState {
  return {
    shape: 'circle',
    color: '#c8102e',
    border: { style: 'single', width: 4 },
    edge: 'none',
    top: { enabled: true, text: 'YOUR COMPANY NAME', fontId: 'cinzel', size: 30, letterSpacing: 0.12 },
    bottom: { enabled: true, text: 'INCORPORATED', fontId: 'cinzel', size: 24, letterSpacing: 0.14 },
    center: { enabled: true, lines: '★', fontId: 'cinzel', size: 60, lineHeight: 1.15 },
    icon: { enabled: false, src: null, scale: 0.5 },
    opacity: 0.92,
    aging: 18,
    sizeMm: { width: 40, height: 40 },
  }
}

export const STAMP_TEMPLATES: StampTemplate[] = [
  {
    id: 'company-round',
    nameEn: 'Company Seal (Round)',
    nameZh: '公司圆章',
    state: {
      ...baseState(),
      color: '#c8102e',
      border: { style: 'double', width: 4 },
      top: { enabled: true, text: 'YOUR COMPANY NAME', fontId: 'cinzel', size: 30, letterSpacing: 0.1 },
      bottom: { enabled: true, text: 'INCORPORATED', fontId: 'cinzel', size: 23, letterSpacing: 0.14 },
      center: { enabled: true, lines: '★', fontId: 'cinzel', size: 64, lineHeight: 1.15 },
    },
  },
  {
    id: 'cn-official',
    nameEn: 'CN Official Seal',
    nameZh: '中文公章',
    state: {
      ...baseState(),
      color: '#d0021b',
      border: { style: 'double', width: 5 },
      top: { enabled: true, text: '某某科技有限公司', fontId: 'noto-serif-sc', size: 34, letterSpacing: 0.18 },
      bottom: { enabled: true, text: '合同专用章', fontId: 'noto-serif-sc', size: 30, letterSpacing: 0.22 },
      center: { enabled: true, lines: '★', fontId: 'noto-serif-sc', size: 66, lineHeight: 1.15 },
      sizeMm: { width: 40, height: 40 },
    },
  },
  {
    id: 'certified',
    nameEn: 'Certified Original',
    nameZh: 'CERTIFIED 认证章',
    state: {
      ...baseState(),
      color: '#1a7f37',
      border: { style: 'double', width: 5 },
      top: { enabled: true, text: 'CERTIFIED', fontId: 'oswald', size: 34, letterSpacing: 0.2 },
      bottom: { enabled: true, text: 'ORIGINAL DOCUMENT', fontId: 'oswald', size: 20, letterSpacing: 0.16 },
      center: { enabled: true, lines: 'CERTIFIED', fontId: 'oswald', size: 40, lineHeight: 1.1 },
    },
  },
  {
    id: 'approved-rect',
    nameEn: 'Approved (Rect)',
    nameZh: 'APPROVED 矩形章',
    state: {
      ...baseState(),
      shape: 'rect',
      color: '#c8102e',
      border: { style: 'single', width: 4 },
      top: { enabled: true, text: 'DEPARTMENT APPROVAL', fontId: 'oswald', size: 22, letterSpacing: 0.1 },
      bottom: { enabled: true, text: '', fontId: 'oswald', size: 20, letterSpacing: 0.1 },
      center: { enabled: true, lines: 'APPROVED', fontId: 'oswald', size: 62, lineHeight: 1.1 },
      aging: 26,
      sizeMm: { width: 60, height: 40 },
    },
  },
  {
    id: 'received-ellipse',
    nameEn: 'Received (Ellipse)',
    nameZh: 'RECEIVED 椭圆章',
    state: {
      ...baseState(),
      shape: 'ellipse',
      color: '#0b4f9e',
      border: { style: 'double', width: 4 },
      top: { enabled: true, text: 'RECEIVED WITH THANKS', fontId: 'courier', size: 22, letterSpacing: 0.08 },
      bottom: { enabled: true, text: 'DATE ____________', fontId: 'courier', size: 20, letterSpacing: 0.08 },
      center: { enabled: true, lines: 'RECEIVED', fontId: 'courier', size: 44, lineHeight: 1.1 },
      sizeMm: { width: 60, height: 40 },
    },
  },
  {
    id: 'cn-date',
    nameEn: 'CN Date Seal',
    nameZh: '中文日期章',
    state: {
      ...baseState(),
      shape: 'ellipse',
      color: '#0b4f9e',
      border: { style: 'single', width: 4 },
      top: { enabled: true, text: '财务专用', fontId: 'zcool-xiaowei', size: 28, letterSpacing: 0.2 },
      bottom: { enabled: true, text: '仅供报销使用', fontId: 'zcool-xiaowei', size: 22, letterSpacing: 0.18 },
      center: { enabled: true, lines: '2026.11.10', fontId: 'zcool-xiaowei', size: 34, lineHeight: 1.1 },
      sizeMm: { width: 55, height: 36 },
    },
  },
  {
    id: 'signature-brush',
    nameEn: 'Brush Signature',
    nameZh: '毛笔签名章',
    state: {
      ...baseState(),
      shape: 'rect',
      color: '#b4222d',
      border: { style: 'single', width: 3 },
      top: { enabled: false, text: '', fontId: 'ma-shan-zheng', size: 24, letterSpacing: 0.1 },
      bottom: { enabled: false, text: '', fontId: 'ma-shan-zheng', size: 24, letterSpacing: 0.1 },
      center: { enabled: true, lines: '王羲之\n之印', fontId: 'ma-shan-zheng', size: 64, lineHeight: 1.05 },
      aging: 30,
      sizeMm: { width: 30, height: 30 },
    },
  },
  {
    id: 'paid',
    nameEn: 'PAID Stamp',
    nameZh: 'PAID 付讫章',
    state: {
      ...baseState(),
      shape: 'rect',
      color: '#6b21a8',
      border: { style: 'dashed', width: 4 },
      top: { enabled: true, text: 'ACCOUNTS DEPARTMENT', fontId: 'courier', size: 20, letterSpacing: 0.1 },
      bottom: { enabled: true, text: 'PAYMENT VERIFIED', fontId: 'courier', size: 18, letterSpacing: 0.1 },
      center: { enabled: true, lines: 'PAID', fontId: 'oswald', size: 68, lineHeight: 1.1 },
      sizeMm: { width: 60, height: 40 },
    },
  },
  {
    id: 'notary-scalloped',
    nameEn: 'Notary (Scalloped Edge)',
    nameZh: '公证章（扇贝边）',
    state: {
      ...baseState(),
      color: '#9d0f1c',
      border: { style: 'single', width: 3.5 },
      edge: 'scalloped',
      top: { enabled: true, text: 'NOTARY PUBLIC', fontId: 'playfair', size: 27, letterSpacing: 0.14 },
      bottom: { enabled: true, text: 'COUNTY OF EXAMPLE', fontId: 'playfair', size: 20, letterSpacing: 0.12 },
      center: { enabled: true, lines: 'OFFICIAL\nSEAL', fontId: 'playfair', size: 34, lineHeight: 1.15 },
      aging: 14,
      sizeMm: { width: 45, height: 45 },
    },
  },
  {
    id: 'gear-certified',
    nameEn: 'Gear Edge Seal',
    nameZh: '齿轮边印章',
    state: {
      ...baseState(),
      color: '#1a3a6b',
      border: { style: 'double', width: 3.5 },
      edge: 'gear',
      top: { enabled: true, text: 'CERTIFIED TRUE COPY', fontId: 'oswald', size: 24, letterSpacing: 0.1 },
      bottom: { enabled: true, text: 'REGISTRATION NO. 2026', fontId: 'oswald', size: 17, letterSpacing: 0.1 },
      center: { enabled: true, lines: 'TRUE\nCOPY', fontId: 'oswald', size: 38, lineHeight: 1.1 },
      aging: 12,
      sizeMm: { width: 45, height: 45 },
    },
  },
  {
    id: 'qc-triangle',
    nameEn: 'QC Triangle',
    nameZh: '三角检验章',
    state: {
      ...baseState(),
      shape: 'triangle',
      color: '#1a7f37',
      border: { style: 'single', width: 4 },
      top: { enabled: true, text: 'QUALITY INSPECTED', fontId: 'oswald', size: 18, letterSpacing: 0.08 },
      bottom: { enabled: true, text: 'BATCH NO. 0000', fontId: 'oswald', size: 18, letterSpacing: 0.08 },
      center: { enabled: true, lines: 'QC\nPASSED', fontId: 'oswald', size: 34, lineHeight: 1.15 },
      aging: 22,
      sizeMm: { width: 45, height: 40 },
    },
  },
  {
    id: 'rope-library',
    nameEn: 'Rope Edge Seal',
    nameZh: '绳珠边印章',
    state: {
      ...baseState(),
      color: '#6b21a8',
      border: { style: 'single', width: 3.5 },
      edge: 'rope',
      top: { enabled: true, text: 'CITY LIBRARY', fontId: 'cinzel', size: 26, letterSpacing: 0.12 },
      bottom: { enabled: true, text: 'PROPERTY OF', fontId: 'cinzel', size: 20, letterSpacing: 0.14 },
      center: { enabled: true, lines: 'LIBRARY\n★', fontId: 'cinzel', size: 36, lineHeight: 1.15 },
      aging: 16,
      sizeMm: { width: 42, height: 42 },
    },
  },
]

export function defaultStampState(): StampState {
  return structuredClone(STAMP_TEMPLATES[0].state)
}

/** 深拷贝工具：模板应用 / 撤销栈快照 */
export function cloneState(s: StampState): StampState {
  return structuredClone(s)
}
