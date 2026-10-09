/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // appDir is now stable in Next.js 14, no need for experimental flag
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