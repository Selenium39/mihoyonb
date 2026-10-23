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
