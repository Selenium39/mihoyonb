/** @type {import('next').NextConfig} */
const nextConfig = {
  // 纯静态导出，托管在 Cloudflare Pages（2026-11 自 standalone node server 迁移，
  // 与姊妹站 gpxconverter / iloveepub 同架构）。全站无 API route、无 middleware，
  // 工具全部客户端执行，「零上传」隐私主张由架构保证。
  //
  // 原 standalone 时代的 headers()/redirects() 与 force-dynamic 均已迁出：
  // - 缓存分层 → public/_headers（Pages 内置 HTML 协商缓存替代原 force-dynamic 防缓存）
  // - 301 矩阵 → public/_redirects（/en 前缀剥离 + 下线工具收敛）
  output: 'export',
  // 站内 next/image 仅用于小 logo，关闭图片优化（静态导出无优化服务）
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
