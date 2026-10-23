import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 把当前请求路径写入 `x-pathname` 请求头。
 *
 * App Router 的 layout 里拿不到 pathname，根布局只能通过请求头判断语言，
 * 用于输出正确的 `<html lang>` 并决定 Header/Footer 的语言版本。
 *
 * 只处理页面请求：Next 内部资源（_next/static、_next/image、favicon）与
 * 常见静态资源扩展名由下方 matcher 排除，避免无谓开销。
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // 尽力透传托管商的地理国家码，用于 EEA/UK/CH 的广告同意判断。
  // 没有这些头时，客户端会退回时区/语言判断。
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code') ||
    request.headers.get('x-geo-country')
  if (country) {
    requestHeaders.set('x-geo-country', country.toUpperCase())
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * 匹配除以下之外的所有路径：
     * - _next/static、_next/image（构建产物与图片优化端点）
     * - favicon（图标）
     * - 带常见静态资源扩展名的文件（图片/图标/样式/脚本/字体/媒体/数据文件）
     */
    '/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|bmp|tiff|css|js|mjs|map|json|txt|xml|webmanifest|woff|woff2|ttf|otf|eot|mp4|webm|mp3|wav|pdf|zip|gzip)$).*)',
  ],
}
