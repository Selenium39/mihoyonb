/**
 * 印章字体：预览加载 + 导出时按需子集内嵌。
 *
 * 为什么导出必须内嵌字体：SVG 放进 <img> 再画到 canvas 时处于"静态模式"，
 * 不会加载任何外部资源（包括 webfont），文字会回退默认字体。
 * 解法：导出前用 Google Fonts css2 的 `&text=` 参数请求只覆盖当前所用字符的
 * 子集字体（woff2，通常几 KB～几十 KB），fetch 后转 base64 以 @font-face
 * 内嵌进 SVG <defs>，光栅化和 SVG 下载都能保持字体一致。
 *
 * fonts.googleapis.com / fonts.gstatic.com 均返回 `Access-Control-Allow-Origin: *`，
 * 浏览器 fetch 与 canvas 均不会被污染。
 */

import { STAMP_FONTS, getStampFont, type StampState } from './stamp-maker'

/** 预览用的全量 css2 链接（StampMakerTool 挂载时注入 <link>） */
export function stampFontCssUrl(): string {
  const families = STAMP_FONTS.map((f) => `family=${f.query}`).join('&')
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}

/** 收集 state 里实际用到的字符（去重），按 fontId 分组 */
export function collectUsedCharacters(state: StampState): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  const push = (fontId: string, text: string) => {
    if (!text) return
    const font = getStampFont(fontId)
    let set = map.get(font.id)
    if (!set) {
      set = new Set()
      map.set(font.id, set)
    }
    for (const ch of text) set.add(ch)
  }
  if (state.top.enabled) push(state.top.fontId, state.top.text)
  if (state.bottom.enabled) push(state.bottom.fontId, state.bottom.text)
  if (state.center.enabled) push(state.center.fontId, state.center.lines)
  return map
}

/** arrayBuffer → base64（FileReader 方式，避免 TypedArray 展开的 downlevelIteration 限制） */
async function bufferToBase64(buf: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(new Error('font file read failed'))
    reader.readAsDataURL(new Blob([buf]))
  })
}

/** (fontId, 字符集) → 内嵌 CSS 的缓存，避免重复导出反复下载 */
const embedCache = new Map<string, string>()

/**
 * 生成导出用 SVG 的 <style> 内容：为每个用到的字体内嵌子集 @font-face。
 * 单个字体失败时跳过（回退系统字体），不阻断导出。
 */
export async function buildEmbeddedFontCSS(state: StampState): Promise<string> {
  const used = collectUsedCharacters(state)
  const parts: string[] = []
  // target es5 无 downlevelIteration，Map 不能直接 for-of，先转数组
  const entries: Array<[string, Set<string>]> = []
  used.forEach((chars, fontId) => entries.push([fontId, chars]))
  for (const entry of entries) {
    const fontId = entry[0]
    const chars = entry[1]
    if (chars.size === 0) continue
    const font = getStampFont(fontId)
    const charsArr: string[] = []
    chars.forEach((c) => charsArr.push(c))
    const text = charsArr.join('')
    const cacheKey = `${fontId}|${text}`
    const cached = embedCache.get(cacheKey)
    if (cached !== undefined) {
      if (cached) parts.push(cached)
      continue
    }
    try {
      const css = await fetchSubsetCss(font.query, text)
      const blocks = await Promise.all(
        css.split('@font-face').slice(1).map((block) => embedFontFaceBlock(block)),
      )
      const embedded = blocks.filter(Boolean).join('\n')
      embedCache.set(cacheKey, embedded)
      if (embedded) parts.push(embedded)
    } catch {
      // 网络失败等：缓存空串，导出继续（系统字体回退）
      embedCache.set(cacheKey, '')
    }
  }
  return parts.join('\n')
}

/** 请求 css2 子集 CSS（带 text= 参数时 Google 只返回覆盖这些字符的字体文件） */
async function fetchSubsetCss(query: string, text: string): Promise<string> {
  const url =
    `https://fonts.googleapis.com/css2?family=${query}` +
    `&text=${encodeURIComponent(text)}&display=swap`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`font css ${res.status}`)
  return res.text()
}

/** 把一个 @font-face 块里的远程 url(...) 换成 base64 data URI */
async function embedFontFaceBlock(block: string): Promise<string> {
  const urlMatch = block.match(/url\((https:\/\/[^)]+)\)/)
  if (!urlMatch) return ''
  const fontUrl = urlMatch[1]
  const formatMatch = block.match(/format\('([^']+)'\)/)
  const format = formatMatch ? formatMatch[1] : 'woff2'
  const fontRes = await fetch(fontUrl)
  if (!fontRes.ok) throw new Error(`font file ${fontRes.status}`)
  const b64 = await bufferToBase64(await fontRes.arrayBuffer())
  // 去掉 font-display:swap —— SVG 作为 <img> 光栅化是一次性渲染，
  // swap 会让 data URI 字体被跳过、直接用回退字体（实测踩坑）
  return (
    `@font-face${block
      .slice(0, block.indexOf('}'))
      .replace(/font-display:[^;]+;/, '')
      .replace(/src:[^;]+;/, `src:url(data:font/${format};base64,${b64}) format('${format}');`)}}`
  )
}
