/**
 * 生成站点 logo 资源：public/logo-512x512.png、public/logo.png、public/logo.ico
 *
 * 设计：蓝色圆角方块 + 白色几何牛头（契合品牌「原牛」）
 * 依赖项目内的 sharp（SVG -> PNG）；ICO 为手写的 PNG 容器格式（16/32/48），
 * 现代浏览器均支持 ICO 内嵌 PNG。
 *
 * 用法：node scripts/generate-logo.mjs
 */
import sharp from 'sharp'

const OUT_DIR = new URL('../public/', import.meta.url).pathname

/**
 * 牛头 logo 的 SVG 源（512 视口，可按任意尺寸渲染）
 * simplified：极小尺寸（favicon 16/32）下去掉鼻吻、鼻孔、眼睛等细节，只留轮廓
 */
export function logoSvg(simplified = false) {
  const details = simplified
    ? ''
    : `
    <!-- 鼻吻：完整收在头部轮廓内，贴近下缘 -->
    <rect x="188" y="286" width="136" height="68" rx="34" fill="#BFDBFE"/>
    <ellipse cx="226" cy="320" rx="8" ry="11" fill="#1E40AF"/>
    <ellipse cx="286" cy="320" rx="8" ry="11" fill="#1E40AF"/>
    <!-- 双眼 -->
    <circle cx="218" cy="244" r="11" fill="#1E40AF"/>
    <circle cx="294" cy="244" r="11" fill="#1E40AF"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#60A5FA"/>
      <stop offset="1" stop-color="#2563EB"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <g>
    <!-- 双角：从太阳叶向外上方弯曲 -->
    <path d="M200 234 C 158 226 130 198 132 148" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/>
    <path d="M312 234 C 354 226 382 198 380 148" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/>
    <!-- 头部：方正敦实 -->
    <path d="M256 176
             C 306 176 344 202 348 242
             C 350 270 347 298 341 320
             C 335 350 304 372 256 372
             C 208 372 177 350 171 320
             C 165 298 162 270 164 242
             C 168 202 206 176 256 176 Z" fill="#fff"/>${details}
  </g>
</svg>`
}

/** 把 PNG 打包成 ICO 文件（每个尺寸一个 ICONDIRENTRY，内嵌完整 PNG） */
function buildIco(pngBuffers) {
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(count, 4)

  const entries = Buffer.alloc(16 * count)
  let offset = header.length + entries.length
  const parts = [header, entries]

  pngBuffers.forEach(({ size, data }, i) => {
    const base = i * 16
    entries.writeUInt8(size, base) // 宽（0 表示 256，这里最大 48）
    entries.writeUInt8(size, base + 1) // 高
    entries.writeUInt8(0, base + 2) // 调色板数
    entries.writeUInt8(0, base + 3) // reserved
    entries.writeUInt16LE(1, base + 4) // color planes
    entries.writeUInt16LE(32, base + 6) // bits per pixel
    entries.writeUInt32LE(data.length, base + 8)
    entries.writeUInt32LE(offset, base + 12)
    parts.push(data)
    offset += data.length
  })

  return Buffer.concat(parts)
}

async function renderPng(size) {
  // 极小尺寸用简化轮廓，避免细节糊成噪点
  const svg = logoSvg(size <= 32)
  return sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer()
}

async function main() {
  const png512 = await renderPng(512)
  const png48 = await renderPng(48)
  const png32 = await renderPng(32)
  const png16 = await renderPng(16)

  await sharp(png512).toFile(`${OUT_DIR}logo-512x512.png`)
  await sharp(png48).toFile(`${OUT_DIR}logo.png`)

  const ico = buildIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
    { size: 48, data: png48 },
  ])
  const { writeFile } = await import('node:fs/promises')
  await writeFile(`${OUT_DIR}logo.ico`, ico)

  console.log('已生成: public/logo-512x512.png, public/logo.png, public/logo.ico')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
