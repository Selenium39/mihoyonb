# mihoyonb（原牛）

[English](README.md) | **简体中文**

> 免费、隐私优先的浏览器创作工具。不上传、不注册、不安装。

[在线站点](https://mihoyonb.com) · [英文站](https://mihoyonb.com/en) · [GitHub](https://github.com/Selenium39/mihoyonb)

mihoyonb（原牛）是一个开源的纯前端工具集，覆盖图片、视频、文案与自媒体场景。所有文件都在浏览器标签页内处理，照片、视频和文字不会离开用户设备。站点为中英双语：中文使用根路径，英文放在 `/en` 下。

## 工具列表

| 工具 | 中文路径 | 英文路径 | 功能 |
| --- | --- | --- | --- |
| 拼豆图纸生成器 | `/pindou` | `/en/pindou` | 把照片转成可打印拼豆图纸，匹配 96 色参考色号，统计每种颜色用量，导出高清 PNG 图纸和 CSV 采购清单。 |
| 图片拼接 | `/image-combine` | `/en/image-combine` | 多种网格布局，把多张照片拼成一张图，可调间距、圆角和背景。 |
| 长图切割 | `/image-split` | `/en/image-split` | 按行列或 3×3 九宫格切图，支持批量 ZIP 下载。 |
| 图片加水印 | `/image-watermark` | `/en/image-watermark` | 批量添加文字或 Logo 水印，支持位置、透明度、旋转和平铺。 |
| 尺寸适配 | `/social-resize` | `/en/social-resize` | 一键适配多个平台尺寸，支持居中裁切、完整保留和自定义宽高；中英文版使用各自市场的平台预设。 |
| 敏感词检测 | `/sensitive-words` | `/en/sensitive-words` | 检测广告文案中的高风险表述，高亮标注并支持一键遮罩；中英文版使用各自市场的词库。 |
| Markdown 转图片 | `/markdown-to-image` | `/en/markdown-to-image` | 把 Markdown 渲染成可分享的 PNG，支持实时预览和自定义主题。 |
| 二维码生成 | `/qr-code` | `/en/qr-code` | 自定义颜色、中心 Logo 和透明背景，导出高清二维码。 |
| 视频截帧 | `/video-frame` | `/en/video-frame` | 在浏览器中逐帧截取视频画面，支持快捷键和单张/批量导出。 |
| 字幕工具 | `/subtitle-tools` | `/en/subtitle-tools` | SRT/VTT 互转、时间轴平移、字幕合并与清理。 |

法律页：`/privacy`、`/terms`，英文版为 `/en/privacy`、`/en/terms`。

## 为什么是 mihoyonb

- **隐私优先**：图片、视频和文字通过 Canvas 等浏览器 API 本地处理，没有上传接口，也没有服务器端处理用户文件。
- **中英双语**：每个页面都有中文和英文版本，配有 canonical、双向 `hreflang`、统一 sitemap 和 Header 语言下拉。
- **免费无门槛**：无需注册、无需邮箱，没有付费墙、水印或导出额度。
- **完全开源**：完整 Next.js 代码公开，可自行部署。
- **无需后端**：工具作为静态/客户端应用运行，不需要 API 密钥或数据库。

## 技术栈

- **框架**：Next.js 14（App Router）
- **语言**：TypeScript
- **UI**：React 18、Radix UI、Tailwind CSS、Lucide 图标
- **渲染/导出**：html2canvas-pro、marked、qrcode、JSZip
- **包管理器**：pnpm 10

## 快速开始

### 环境要求

- Node.js 18.17 或更高版本
- pnpm 10（通过 `corepack enable` 启用）

### 安装与启动

```bash
git clone https://github.com/Selenium39/mihoyonb.git
cd mihoyonb
corepack enable
pnpm install
pnpm dev
```

中文站打开 [http://localhost:3000](http://localhost:3000)，英文站打开 [http://localhost:3000/en](http://localhost:3000/en)。

### 生产构建

```bash
pnpm build
pnpm start
```

### 代码检查

```bash
pnpm lint
```

## 项目结构

```text
src/
├── app/
│   ├── (pages)/              # 中文页面（根路径）
│   │   ├── pindou/           # page.tsx + layout.tsx + copy.ts + 工具组件
│   │   ├── image-combine/
│   │   ├── image-split/
│   │   ├── image-watermark/
│   │   ├── social-resize/
│   │   ├── sensitive-words/
│   │   ├── markdown-to-image/
│   │   ├── qr-code/
│   │   ├── video-frame/
│   │   ├── subtitle-tools/
│   │   ├── privacy/
│   │   └── terms/
│   ├── en/                   # 英文页面（/en 前缀）
│   ├── layout.tsx            # 根布局、html lang 与全局元数据
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── HomePage.tsx          # 中英文首页共用布局
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── LanguageSwitcher.tsx
│   ├── LegalPage.tsx
│   ├── ui/                   # 基础 UI 组件
│   └── ...
├── config/
│   ├── site.ts               # 品牌、域名、SEO 与社交链接
│   ├── navigation.ts
│   └── affiliate.ts          # 可选的 Amazon Associates 配置
├── content/
├── hooks/
├── lib/                      # 与框架无关的工具逻辑
│   ├── i18n.ts
│   ├── bead-pattern.ts
│   ├── bead-palette.ts
│   ├── image-split.ts
│   ├── image-watermark.ts
│   ├── markdown-poster.ts
│   ├── sensitive-words.ts
│   ├── sensitive-words-en.ts
│   ├── subtitle.ts
│   └── ...
├── middleware.ts             # 注入 x-pathname，供布局判断语言
└── ...
```

每个工具页的文案放在同目录 `copy.ts`，并复用 `CanvasToolbar`、`ImagePreview`、`MarkdownEditor` 等通用组件。

## 国际化

- 中文页面使用根路径（`/`、`/pindou` 等），英文页面使用 `/en`（`/en`、`/en/pindou` 等）。
- `src/lib/i18n.ts` 定义语言类型、中英路径配对、`localizedPath`、`alternateLocalePath` 和 hreflang 值。
- `src/middleware.ts` 把当前路径传给根布局，由根布局输出正确的 `<html lang>`。
- 每个页面声明自己的 canonical 和双向 `hreflang`（`en`、`zh-CN`、`x-default`），并登记到 `src/app/sitemap.ts`。
- 语言切换入口在 Header 下拉菜单中；Footer 不再重复放置语言切换。
- UI 文案放在各工具的 `copy.ts`。市场相关数据分开维护，例如尺寸预设和英文敏感词库。
- 新增页面遵循 [`AGENTS.md`](AGENTS.md) 的英文优先约定，并参考 [`docs/decisions/`](docs/decisions/) 中的决策记录。

## 隐私与广告

- 用户文件不会上传。图片和视频处理通过 Canvas、`URL.createObjectURL`、Web API 和客户端库在本地完成。
- 没有账号系统，也不追踪用户内容。站点使用无 Cookie 的 Umami 统计聚合访问量。
- 广告由 Google AdSense 提供。EEA、英国和瑞士用户会先看到同意横幅，只有同意后才会加载广告（Google Consent Mode v2）。
- 本地运行工具不需要 API 密钥、环境变量或数据库。

## 配置

| 文件 | 用途 |
| --- | --- |
| `src/config/site.ts` | 品牌名、域名、SEO 默认值、Logo 和社交链接。 |
| `src/config/navigation.ts` | Header 与 Footer 导航。 |
| `src/config/affiliate.ts` | Amazon Associates tag 与拼豆品牌搜索词；tag 为空时联盟区块整体不渲染。 |
| `src/lib/i18n.ts` | 语言路由与中英路径配对。 |
| `src/app/sitemap.ts` | 中英文公开 URL 清单。 |

如果自行部署，请检查 `src/app/layout.tsx` 和 `src/components/AdsScript.tsx` 中的 AdSense 发布商 ID 与统计配置，并替换为自己的 ID。

## 部署

### Docker

项目使用 Next.js 的 `output: 'standalone'`：

```bash
docker build -t mihoyonb .
docker run -p 3000:3000 mihoyonb
```

### Vercel

1. Fork 或推送仓库到 GitHub。
2. 在 Vercel 中导入项目。
3. 使用默认 Next.js 配置部署。

### 任意 Node.js 主机

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

## 参与贡献

欢迎提交 Issue 和 Pull Request。

1. Fork 仓库并创建主题分支。
2. 用户文件处理必须保持在前端；不要为照片、视频或文字添加上传接口。
3. 新工具同时提供中文页和英文页，包括 `copy.ts`、元数据、双向 hreflang 和 sitemap 条目。
4. 提交 PR 前运行 `pnpm lint` 和 `pnpm build`。
5. 不要提交 API 密钥、广告账户 ID 或其他敏感信息。

项目约定见 [`AGENTS.md`](AGENTS.md)。

## 许可证

基于 MIT License 发布。
