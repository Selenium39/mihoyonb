# AGENTS.md — mihoyonb（原牛）项目约定

本文件给所有后续协作的 AI / 开发者看，优先于默认习惯。

## 站主已确认的长期方向（2026-10-23）

- **主攻英文市场**：英文流量的 AdSense RPM 显著高于中文（约 7 倍量级），后续新功能、SEO 文案、外链与分发**英文优先**。
- 中文站保留在根路径（`/`、`/pindou`…），英文站放在 `/en` 前缀下（`/en`、`/en/pindou`）。不改中文 URL，避免损伤已有收录。
- 新增/改造功能时默认“英文优先”：先写英文 SEO 标题/描述/FAQ/页面文案，再补中文。
- 所有对外页面（工具页、法律页）都必须有对应英文版；语言切换统一走 `src/components/LanguageSwitcher.tsx` 下拉，不再新增单链切换按钮。
- 决策记录在 `docs/decisions/`，只追加、不修改历史记录；方向调整时新增一份决策文件。

## 工程约定

- Next.js 14 App Router + TypeScript + Tailwind；工具页全部纯前端，**文件不上传服务器**。
- 语言判断统一走 `src/lib/i18n.ts`（`Locale`、`localizedPath`、`alternateLocalePath`、`hreflang`）。
- 每个工具页的中英文文案放在同目录 `copy.ts`，不要在 JSX 里散落硬编码中文/英文。
- 新增英文页面必须做到：
  1. `<html lang>` 正确（由 `src/middleware.ts` 注入 `x-pathname` + 根布局读取）；
  2. canonical 与 hreflang 双向互指（中英页面各自声明对方）；
  3. 加入 `src/app/sitemap.ts`。
- 联盟/广告配置集中在 `src/config/affiliate.ts`、AdSense 在 `src/app/layout.tsx`；不要把 Amazon tag 之类密钥散落在页面里。
- 提交前跑 `corepack pnpm lint` 和 `corepack pnpm build`。

## Git 约定

- 本地开发分支 `dev`，部署分支 `master`（push master 触发 byos-deploy 自动部署）。
- 不要在未确认的情况下 push 共享分支；本地 commit 可以。
