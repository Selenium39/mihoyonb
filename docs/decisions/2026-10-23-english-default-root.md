# 决策记录：英文改为默认语言（根路径）

- 日期：2026-10-23
- 决策人：站主
- 状态：已确认，立即生效；替代此前“中文在根路径、英文在 `/en`”的 URL 方案

## 背景

- 站点主攻英文市场，英文流量的 AdSense RPM 明显高于中文。
- 此前英文站在 `/en` 前缀下，根域名默认显示中文；对外分享与 OG 卡片也会出现 `/en`，与“英文优先”的定位不一致。
- 站主要求 `mihoyonb.com` 默认就是英文，OG 图直接显示 `mihoyonb.com`。

## 决策

1. **英文为默认语言，使用根路径**：`/`、`/pindou`、`/image-combine` 等。
2. **中文迁到 `/zh` 前缀**：`/zh`、`/zh/pindou` 等。
3. 旧英文 `/en`、`/en/*` 永久 301 到对应的根路径。
4. `canonical`、`hreflang`、`x-default`、sitemap 全部按新结构重写；`x-default` 指向英文根路径。
5. 英文 OG 图作为主 `og.png`，直接显示 `mihoyonb.com`；中文 OG 图改为 `og-zh.png`，供 `/zh` 页面使用。
6. 语言切换仍走 Header（桌面 + 移动菜单）与工具页/法律页顶部下拉；切换目标为 `/` ↔ `/zh` 的配对路径。

## URL 映射

| 中文旧路径 | 中文新路径 | 英文旧路径 | 英文新路径 |
| --- | --- | --- | --- |
| `/` | `/zh` | `/en` | `/` |
| `/pindou` | `/zh/pindou` | `/en/pindou` | `/pindou` |
| `/image-combine` | `/zh/image-combine` | `/en/image-combine` | `/image-combine` |
| `/privacy` | `/zh/privacy` | `/en/privacy` | `/privacy` |

其余工具页同理。

## SEO 取舍

- 旧英文 `/en/*` 有 301，权重可转移到新英文根路径。
- 中文旧 URL（根路径）现在直接返回英文内容，无法同时保留中文页面；这是“英文默认”的必然取舍。中文 SEO 需要以 `/zh` 重新积累收录。
- 部署后应在 Google Search Console / Bing Webmaster 重新提交 `https://mihoyonb.com/sitemap.xml`，并对主要 `/zh` 页面请求收录。
- 站内旧中文链接、外部已分享链接若仍指向根路径，会看到英文页；不按 `Accept-Language` 做自动跳转，避免同一 URL 返回不同语言、影响抓取与 canonical。

## 实施清单

- 路由：英文页面移到 `src/app/*`，中文页面移到 `src/app/zh/*`。
- 站点元数据：根布局为英文默认；`src/app/zh/layout.tsx` 提供中文站点级元数据。
- i18n：`DEFAULT_LOCALE = 'en'`，`isChinesePath` 判断 `/zh`；`alternateLocalePath` 更新配对。
- 导航：中文 Header/Footer/首页链接加 `/zh`，英文链接去 `/en`。
- 重定向：`next.config.js` 增加 `/en` 与 `/en/:path*` 的 301。
- OG：`public/og.png` 为英文主图（`mihoyonb.com`），`public/og-zh.png` 为中文图；英文页面用 `logo.og`，中文页面用 `logo.ogZh`。
- 文档：README 双语版本、AGENTS.md 同步更新。
