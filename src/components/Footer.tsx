import { Mail, Twitter, Heart } from 'lucide-react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* 移动端：垂直布局，桌面端：网格布局 */}
        <div className="flex flex-col space-y-8 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-8 lg:gap-12 md:space-y-0">

          {/* 品牌和版权信息 - 移动端置顶 */}
          <div className="text-center md:text-left md:col-span-3 lg:col-span-1">
            <div className="flex flex-col space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center justify-center md:justify-start space-x-2">
                <span>{siteConfig.name}</span>
                <Heart size={16} className="text-red-500" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {siteConfig.slogan}，<br className="hidden sm:inline" />
                助力您的内容创作
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                所有工具均在浏览器本地运行，文件不上传服务器，隐私安全，完全免费。
              </p>
              <p className="text-xs text-muted-foreground/80">
                © {currentYear} {siteConfig.name}. All rights reserved.
              </p>
            </div>
          </div>

          {/* 快捷导航 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-semibold text-foreground text-center md:text-left">
              快捷导航
            </h4>
            {/* 桌面端两列网格，避免链接过多导致该栏过长 */}
            <div className="flex flex-col space-y-3 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-3 md:space-y-0">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                首页
              </Link>
              <Link
                href="/image-combine"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                图片拼接
              </Link>
              <Link
                href="/image-split"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                长图切割
              </Link>
              <Link
                href="/image-watermark"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                图片加水印
              </Link>
              <Link
                href="/social-resize"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                尺寸适配
              </Link>
              <Link
                href="/qr-code"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                二维码生成
              </Link>
              <Link
                href="/video-frame"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                视频截帧
              </Link>
              <Link
                href="/markdown-to-image"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                Markdown转图片
              </Link>
              <Link
                href="/subtitle-tools"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                字幕工具
              </Link>
              <Link
                href="/sensitive-words"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                敏感词检测
              </Link>
            </div>
          </div>

          {/* 联系方式 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-semibold text-foreground text-center md:text-left">
              联系我们
            </h4>
            <div className="flex flex-col space-y-3">
              <a 
                href={`mailto:${siteConfig.author.email}`}
                className="group text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center md:justify-start space-x-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm">{siteConfig.author.email}</span>
              </a>
              <a 
                href={siteConfig.author.twitterUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="group text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center md:justify-start space-x-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 group-hover:bg-sky-200 dark:group-hover:bg-sky-900/50 transition-colors">
                  <Twitter size={16} className="text-sky-600 dark:text-sky-400" />
                </div>
                <span className="text-sm">{siteConfig.author.twitter}</span>
              </a>
            </div>
          </div>

          {/* 法律链接 */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-semibold text-foreground text-center md:text-left">
              法律条款
            </h4>
            <div className="flex flex-col space-y-3">
              <Link 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                服务条款
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50 text-center md:text-left"
              >
                隐私政策
              </Link>
            </div>
          </div>
        </div>


      </div>
    </footer>
  )
} 