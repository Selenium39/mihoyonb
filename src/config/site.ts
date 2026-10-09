/**
 * 网站配置文件
 * 集中管理网站品牌、域名、SEO等信息
 * 修改此文件即可更换品牌和域名
 */

export const siteConfig = {
  // 基本信息
  name: '原牛',
  domain: 'https://mihoyonb.com',
  
  // SEO 信息
  title: '原牛 - 自媒体纯浏览器工具',
  description: '原牛 - 纯浏览器自媒体工具站，提供图片拼接、Markdown转图片等实用工具。所有处理均在浏览器本地完成，文件不上传服务器，隐私安全，完全免费。',
  keywords: '自媒体工具,图片拼接,照片拼接,Markdown转图片,纯浏览器工具,本地处理,隐私安全,免费工具',
  slogan: '一站式自媒体工具',
  
  // 作者信息
  author: {
    name: 'selenium39',
    twitter: '@yuxing39',
    twitterUrl: 'https://x.com/yuxing39',
    email: 'openminimax@gmail.com',
  },

  // 外部链接
  links: {
    github: 'https://github.com/Selenium39/mihoyonb',
  },
  
  // Logo 和图片
  logo: {
    src: '/logo.png',
    ico: '/logo.ico',
    apple: '/logo-512x512.png',
    og: '/og.png',
  },
  
  // 分析工具
  analytics: {
    umami: {
      src: 'https://umami.selenium39.me/script.js',
      websiteId: '27bf8427-c410-46a2-ad3f-404560e9ce6a',
    },
  },
  
  // 页面配置
  pages: {
    home: {
      title: '原牛 - 自媒体纯浏览器工具',
      description: '提供图片拼接、Markdown转图片等纯浏览器工具，所有文件本地处理不上传，隐私安全，免费使用',
    },
    imageCombine: {
      title: '图片拼接',
      description: '支持多种网格布局和自定义图片拼接，纯浏览器本地处理，轻松调整间距、圆角和背景，创作出个性化的照片拼接作品',
      keywords: '图片拼接,照片拼接,图片合成,网格布局,长图拼接,拼图工具',
    },
    markdownToImage: {
      title: 'Markdown转图片',
      description: '将Markdown文本转换为精美图片，纯浏览器本地渲染，支持多种样式主题，适合社交媒体分享、技术文档截图、笔记导出等场景',
      keywords: 'Markdown转图片,MD转图片,文档转图片,笔记转图片,代码截图,Markdown工具',
    },
    imageSplit: {
      title: '长图切割',
      description: '将长图切割为多张图片或一键切成九宫格，适合微博、朋友圈分享，纯浏览器本地处理，图片不上传，免费好用',
      keywords: '长图切割,九宫格切图,图片切割,切图工具,长图分割,九宫格,图片切片',
    },
    videoFrame: {
      title: '视频截帧',
      description: '在线从视频中截取帧保存为图片，支持逐帧查看与批量导出，纯浏览器本地处理，视频不上传服务器，免费使用',
      keywords: '视频截帧,视频截图,视频转图片,提取视频帧,逐帧截图,视频帧提取,免费截帧',
    },
    imageWatermark: {
      title: '图片加水印',
      description: '批量给图片添加文字或图片水印，支持位置、透明度、大小自定义，纯浏览器本地处理，图片不上传，永久免费',
      keywords: '图片加水印,批量加水印,文字水印,图片水印,水印工具,照片加水印,防盗图水印',
    },
    socialResize: {
      title: '尺寸适配',
      description: '一键将图片适配各社交平台尺寸，涵盖公众号、小红书、抖音封面等常用规格，纯浏览器本地处理，免费在线调整',
      keywords: '图片尺寸,尺寸适配,社交平台图片,一键裁剪,图片缩放,封面尺寸,小红书尺寸,公众号封面',
    },
    qrCode: {
      title: '二维码生成',
      description: '免费在线生成二维码，支持自定义颜色、尺寸与容错率，可导出高清图片，纯浏览器本地生成，内容不上传，安全可靠',
      keywords: '二维码生成,在线二维码,二维码制作,QR码生成,链接转二维码,二维码工具,免费二维码',
    },
    subtitleTools: {
      title: '字幕工具',
      description: '在线处理SRT/VTT字幕文件，支持格式互转、时间轴调整、字幕合并与分割，纯浏览器本地处理，文件不上传，完全免费',
      keywords: '字幕工具,SRT转换,VTT转换,字幕格式转换,时间轴调整,字幕编辑,SRT转VTT,免费字幕工具',
    },
    sensitiveWords: {
      title: '敏感词检测',
      description: '快速检测文本中的敏感词并高亮标记，支持一键替换与自定义词库，纯浏览器本地检测，文本不上传，免费又安全',
      keywords: '敏感词检测,违禁词检测,文字过滤,敏感词过滤,广告法违禁词,文案检测,敏感词替换',
    },
    terms: {
      title: '服务条款',
      description: '服务条款，使用本网站服务前请仔细阅读相关条款和条件',
    },
    privacy: {
      title: '隐私政策',
      description: '隐私政策，了解我们如何收集、使用和保护您的个人信息',
    },
  },
}

// 工具函数：获取完整页面标题
export function getPageTitle(pageTitle?: string): string {
  if (!pageTitle) return siteConfig.title
  return `${pageTitle} - ${siteConfig.name}`
}

// 工具函数：获取页面URL
export function getPageUrl(path: string = ''): string {
  return `${siteConfig.domain}${path}`
}
