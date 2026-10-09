# 项目说明

「原牛」(mihoyonb.com) —— 基于 Next.js 的纯浏览器自媒体工具站。所有文件处理均在浏览器本地完成，不上传服务器，隐私安全。

## 功能特性

### 图片工具

- 🧩 **图片拼接** (`/image-combine`): 多图在线拼接，支持多种布局与样式，自由调整间距、圆角和背景
- ✂️ **长图切割** (`/image-split`): 长图按网格/切片切割，一键九宫格，批量导出
- 🏷️ **图片加水印** (`/image-watermark`): 批量添加文字或图片水印，支持位置、透明度、旋转与平铺
- 🖼️ **尺寸适配** (`/social-resize`): 一键适配公众号、小红书、抖音等平台封面尺寸，支持自定义宽高
- 🔗 **二维码生成** (`/qr-code`): 自定义颜色与尺寸生成二维码，导出高清图片

### 视频工具

- 🎬 **视频截帧** (`/video-frame`): 上传视频逐帧定位，精准截取画面并导出图片

### 文案工具

- 📝 **Markdown 转图片** (`/markdown-to-image`): Markdown 渲染导出为精美图片，适合公众号/社交媒体配图
- 💬 **字幕工具** (`/subtitle-tools`): SRT/VTT 双向转换、时间轴平移、字幕合并与清理修复
- 🛡️ **敏感词检测** (`/sensitive-words`): 内置广告法极限词与平台违规词双词库，检测高亮并一键遮罩

### 通用特性

- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🔒 **隐私安全**: 工具全部在浏览器端运行，文件不上传服务器，无需配置任何 API 密钥

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI库**: Radix UI
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **图标**: Lucide React
- **渲染/处理**: html2canvas-pro / marked / qrcode / jszip

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 3. 构建生产版本

```bash
pnpm build
pnpm start
```

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── (pages)/                # 功能页面
│   │   ├── image-combine/      # 图片拼接
│   │   ├── image-split/        # 长图切割
│   │   ├── image-watermark/    # 图片加水印
│   │   ├── social-resize/      # 尺寸适配
│   │   ├── qr-code/            # 二维码生成
│   │   ├── video-frame/        # 视频截帧
│   │   ├── markdown-to-image/  # Markdown 转图片
│   │   ├── subtitle-tools/     # 字幕工具
│   │   ├── sensitive-words/    # 敏感词检测
│   │   ├── privacy/            # 隐私政策
│   │   └── terms/              # 服务条款
│   ├── globals.css             # 全局样式
│   ├── layout.tsx              # 根布局
│   ├── robots.ts               # 爬虫协议
│   └── sitemap.ts              # 站点地图
├── components/                 # React 组件
│   ├── ui/                     # UI 基础组件
│   └── ...                     # Header/Footer 与工具页组件
├── config/
│   └── site.ts                 # 品牌/域名/SEO 配置
└── lib/                        # 工具核心逻辑（纯函数）
    ├── image-split.ts          # 长图切割
    ├── image-watermark.ts      # 水印合成
    ├── markdown-poster.ts      # Markdown 海报样式
    ├── wechat-themes.ts        # 公众号排版主题
    ├── subtitle.ts             # 字幕解析/转换
    ├── sensitive-words.ts      # 敏感词库与检测
    └── utils.ts                # 通用工具函数
```

## 开发

### 添加新的 UI 组件

本项目使用 Radix UI 作为基础组件库。要添加新的 UI 组件：

1. 在 `src/components/ui/` 目录下创建新组件
2. 基于 Radix UI 原语构建
3. 使用 Tailwind CSS 进行样式定制
4. 遵循现有的设计系统

### 自定义样式

- 主要颜色变量定义在 `src/app/globals.css` 中
- 使用 CSS 变量支持深色模式
- Tailwind 配置在 `tailwind.config.js` 中

### 站点配置

品牌、域名、SEO 等信息集中在 `src/config/site.ts`，修改该文件即可更换品牌。

## 部署

### Docker

项目包含 `Dockerfile`，使用 `output: 'standalone'` 构建：

```bash
docker build -t mihoyonb .
docker run -p 3000:3000 mihoyonb
```

### Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署

## 许可证

MIT License
