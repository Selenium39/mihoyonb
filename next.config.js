/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 站内 next/image 仅用于小 logo，关闭服务端图片优化，
  // standalone 运行时无需 sharp（否则 Next 14 生产模式强制要求）
  images: {
    unoptimized: true,
  },
  // appDir is now stable in Next.js 14, no need for experimental flag
  // 页面 HTML 禁止 CDN 长缓存（平台默认 s-maxage 一年会导致部署后长时间看到旧版）
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        // 构建产物带内容哈希，可永久缓存
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/blog/:path*', destination: '/', statusCode: 301 },
      { source: '/pan-search', destination: '/', statusCode: 301 },
      { source: '/video-watermark', destination: '/', statusCode: 301 },
      { source: '/subtitle-translate', destination: '/', statusCode: 301 },
      { source: '/voice-to-text', destination: '/', statusCode: 301 },
      { source: '/text-to-speech', destination: '/', statusCode: 301 },
      { source: '/text-to-mindmap', destination: '/', statusCode: 301 },
    ]
  },
}

module.exports = nextConfig 