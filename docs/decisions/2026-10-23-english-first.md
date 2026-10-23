# 决策记录：主攻英文市场（English-first）

- 日期：2026-10-23
- 决策人：站主
- 状态：已确认，长期生效

## 背景

- 站点目前仅靠 Google AdSense 变现，月收入约 $1–3；30 天 PV 约 2,847、UV 约 1,566，其中中国流量约 74%。
- 中文 RPM ≈ $0.62，美区 RPM ≈ $4.59（调研报告实测/公开数据），约 7 倍差距；纯前端工具站做双语边际成本低。
- 现有工具中 `social-resize`（公众号/小红书）、`sensitive-words`（广告法）等是中文市场专属，不做英文版。

## 决策

**后续主攻英文市场，英文优先。** 具体执行口径：

1. 中文站保留根路径，不改已有 URL；英文站放 `/en` 前缀。
2. 新工具 / 功能改造先出英文页面与英文 SEO 文案，再补中文。
3. 英文页必须配 canonical + hreflang 互指、sitemap、正确的 `<html lang>`。
4. 英文页优先接入高价值变现方式（Amazon Associates 等联盟），AdSense 作为兜底。
5. 中文专属工具不翻译，避免无效投入。

## 首批范围（试点）

- **`/en/pindou`（Perler bead pattern generator）**：全球通用需求 + 自带耗材清单，可接 Perler/Hama/Artkal 耗材联盟链接。
- 英文壳（Header/Footer/语言切换）+ `/en` 落地页，保证 `/en` 下页面体验完整。
- 试点验证指标（8–12 周）：英文页自然流量、每千 PV 收入 vs 中文页、联盟点击。

## 后续路线（验证通过后）

1. 按“通用工具优先”逐个英文化：image-combine / image-split / markdown-to-image / video-frame / qr-code / subtitle-tools。
2. 英文博客 / 教程内容、目录站提交（AlternativeTo、SaaSHub、Toolify）、Reddit / Product Hunt 分发。
3. 视流量升级广告层（Ezoic/Media.net）与联盟组合。

## 执行备注（2026-10-23，站主确认）

- 当前**暂不填写 Amazon Associates tag**，`src/config/affiliate.ts` 保持空字符串；
  `/en/pindou` 的 “Where to buy beads” 区块在 tag 为空时整体不渲染（避免虚假佣金披露），后续启用时只需填 tag 并重建。
- 英文站先跑流量与 SEO，变现仍以 AdSense 为主。

## 实施进度（2026-10-23）

- 已完成英文版工具页：`/en/pindou`、`/en/image-combine`、`/en/image-split`、`/en/image-watermark`、`/en/markdown-to-image`、`/en/qr-code`、`/en/subtitle-tools`、`/en/video-frame`；法律页 `/en/privacy`、`/en/terms` 同步为英文。
- 共享组件 `MarkdownEditor`、`CustomizeDialog`、`WechatCopyDialog`、`ImagePreview`、`CanvasToolbar` 支持可选 `locale`（默认中文），英文页传 `en`。
- 按上文决策，`social-resize`（中文平台规格）与 `sensitive-words`（中文广告法词库）保留中文版，不做英文翻译。
- EEA/UK/CH：自建同意横幅 + Google Consent Mode v2；拒绝时不加载 AdSense，页脚「Cookie settings」可随时撤回。当前不是 Google 认证 CMP，后续可评估 Funding Choices。

## 追加决策（2026-10-23，站主确认）

**全站页面统一提供英文版，不再保留“中文专属工具”。** 此前“`social-resize` / `sensitive-words` 不做英文版”的备注作废，按以下口径执行：

- `social-resize` 英文版使用英文市场平台规格（Instagram / X / LinkedIn / YouTube），中文版保留公众号、小红书、抖音等原规格。
- `sensitive-words` 英文版使用英文广告合规词库（绝对化宣称、仿品、赌博、毒品、武器等），并按英文词边界匹配；中文词库与匹配逻辑保持不变。
- 语言切换统一为下拉选择（Header、Footer、工具页、法律页），不再使用“点一下跳转”的单链按钮。
- 新增页面仍须满足 canonical + hreflang 互指、sitemap、`<html lang>` 三项要求。

### 实施进度（2026-10-23 追加）

- 已新增 `/en/social-resize`、`/en/sensitive-words`，全部 13 个中文页面均有对应英文页。
- 语言下拉覆盖 Header 桌面/移动菜单、Footer、工具页右上角、法律页右上角；当前语言高亮，选择后跳转到配对路由。
- sitemap 共 26 条 URL；英文首页工具卡片增至 10 个（含 2 个新工具），Footer 英文导航同步。

### 追加修正（2026-10-23，站主确认）

- 语言切换只保留页面顶部：Header 桌面端、Header 移动菜单，以及工具页/法律页内容顶部的下拉；**Footer 不再放语言切换**，避免重复入口。
