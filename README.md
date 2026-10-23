# mihoyonb

**English** | [简体中文](README.zh-CN.md)

> Free, privacy-first browser tools for creators. No uploads, no accounts, no install.

[Live site](https://mihoyonb.com) · [English site](https://mihoyonb.com/en) · [GitHub](https://github.com/Selenium39/mihoyonb)

mihoyonb (原牛) is an open-source collection of client-side tools for images, video, text and social media. Every file is processed inside the browser tab — photos, videos and text never leave the user's device. The site is bilingual: Chinese at the root URLs and English under `/en`.

## Tools

| Tool | Chinese | English | What it does |
| --- | --- | --- | --- |
| Perler Bead Pattern Generator | `/pindou` | `/en/pindou` | Converts a photo into a printable bead pattern with a 96-color reference palette, per-color bead counts, a high-resolution PNG blueprint and a CSV shopping list. |
| Photo Collage | `/image-combine` | `/en/image-combine` | Combines multiple photos into one image with grid layouts, adjustable spacing, corner radius and background. |
| Image Splitter | `/image-split` | `/en/image-split` | Splits long images into rows/columns or a 3×3 grid, with batch ZIP download. |
| Image Watermark | `/image-watermark` | `/en/image-watermark` | Adds text or logo watermarks in bulk, with position, opacity, rotation and tiling controls. |
| Social Media Image Resizer | `/social-resize` | `/en/social-resize` | Resizes one image for multiple platforms with cover/contain modes and custom dimensions. Chinese and English versions ship market-specific presets. |
| Sensitive Word Checker | `/sensitive-words` | `/en/sensitive-words` | Scans copy for risky advertising claims, highlights matches and can mask them in one click. Chinese and English versions use separate, market-appropriate word lists. |
| Markdown to Image | `/markdown-to-image` | `/en/markdown-to-image` | Renders Markdown into a shareable PNG with live preview and custom themes. |
| QR Code Generator | `/qr-code` | `/en/qr-code` | Generates customizable QR codes with colors, a center logo and transparent-background export. |
| Video Frame Extractor | `/video-frame` | `/en/video-frame` | Captures still frames from a video frame by frame, with keyboard shortcuts and single or batch export. |
| Subtitle Converter | `/subtitle-tools` | `/en/subtitle-tools` | Converts SRT/VTT, shifts timing, merges subtitle files and cleans up formatting. |

Legal pages are available at `/privacy`, `/terms` and `/en/privacy`, `/en/terms`.

## Why mihoyonb

- **Private by design** — images, videos and text are processed with browser APIs such as Canvas; there is no upload endpoint and no server-side processing of user files.
- **Bilingual by design** — every page has a Chinese and an English version, with canonical URLs, reciprocal `hreflang` tags, a shared sitemap and a language switcher in the header.
- **Free and frictionless** — no account, no email, no paywall, no watermarks and no export quotas.
- **Open source** — the full Next.js codebase is public and can be self-hosted.
- **No backend required** — the tools work as a static/client-rendered app; no API keys or database are needed.

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI:** React 18, Radix UI primitives, Tailwind CSS, Lucide icons
- **Rendering/export:** html2canvas-pro, marked, qrcode, JSZip
- **Package manager:** pnpm 10

## Getting started

### Requirements

- Node.js 18.17 or newer
- pnpm 10 (enable it with `corepack enable`)

### Install and run

```bash
git clone https://github.com/Selenium39/mihoyonb.git
cd mihoyonb
corepack enable
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the Chinese site, or [http://localhost:3000/en](http://localhost:3000/en) for English.

### Production build

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

## Project structure

```text
src/
├── app/
│   ├── (pages)/              # Chinese routes at the root
│   │   ├── pindou/           # page.tsx + layout.tsx + copy.ts + tool component
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
│   ├── en/                   # English routes under /en
│   ├── layout.tsx            # Root layout, html lang and metadata
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── HomePage.tsx          # Shared bilingual home layout
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── LanguageSwitcher.tsx
│   ├── LegalPage.tsx
│   ├── ui/                   # Reusable UI primitives
│   └── ...
├── config/
│   ├── site.ts               # Brand, domain, SEO and social links
│   ├── navigation.ts
│   └── affiliate.ts          # Optional Amazon Associates configuration
├── content/
├── hooks/
├── lib/                      # Framework-free tool logic
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
├── middleware.ts             # Injects x-pathname for locale-aware layout
└── ...
```

Each tool keeps its copy in a local `copy.ts` and shares reusable controls (`CanvasToolbar`, `ImagePreview`, `MarkdownEditor`, etc.) with the rest of the site.

## Internationalization

- Chinese pages use the root paths (`/`, `/pindou`, …). English pages use `/en` (`/en`, `/en/pindou`, …).
- `src/lib/i18n.ts` defines the locale type, translated path pairs, `localizedPath`, `alternateLocalePath` and hreflang values.
- `src/middleware.ts` passes the current pathname to the root layout, which sets the correct `<html lang>`.
- Every page declares its own canonical URL and reciprocal `hreflang` links (`en`, `zh-CN`, `x-default`), and is listed in `src/app/sitemap.ts`.
- The header contains the language dropdown. A duplicate switch is intentionally not rendered in the footer.
- UI copy lives in per-tool `copy.ts` files. Market-specific data sets are kept separate — for example, social media presets and the English sensitive-word library.
- New pages should follow the English-first workflow described in [`AGENTS.md`](AGENTS.md) and the decision log in [`docs/decisions/`](docs/decisions/).

## Privacy and advertising

- User files are never uploaded. Image and video processing happens locally through Canvas, `URL.createObjectURL`, Web APIs and client-side libraries.
- There are no accounts and no content tracking. The site uses cookieless Umami analytics for aggregate page views.
- Advertising is served by Google AdSense. For visitors in the EEA, UK and Switzerland, ads are loaded only after consent through a custom consent banner and Google Consent Mode v2.
- No API keys, environment variables or database are required to run the tools locally.

## Configuration

| File | Purpose |
| --- | --- |
| `src/config/site.ts` | Brand name, domain, SEO defaults, logo and social links. |
| `src/config/navigation.ts` | Header and footer navigation. |
| `src/config/affiliate.ts` | Amazon Associates tag and bead-brand search terms. The affiliate block is hidden while the tag is empty. |
| `src/lib/i18n.ts` | Locale routing and translated path pairs. |
| `src/app/sitemap.ts` | Public URL inventory for both languages. |

If you self-host the project, review the AdSense publisher ID and analytics configuration in `src/app/layout.tsx` and `src/components/AdsScript.tsx`, and use your own IDs.

## Deployment

### Docker

The project uses Next.js `output: 'standalone'`.

```bash
docker build -t mihoyonb .
docker run -p 3000:3000 mihoyonb
```

### Vercel

1. Fork or push the repository to GitHub.
2. Import the project in Vercel.
3. Deploy with the default Next.js settings.

### Any Node.js host

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

## Contributing

Issues and pull requests are welcome.

1. Fork the repository and create a topic branch.
2. Keep user-file processing client-side; do not add upload endpoints for photos, videos or text.
3. Add both a Chinese page and an English page for new tools, including `copy.ts`, metadata, reciprocal hreflang and a sitemap entry.
4. Run `pnpm lint` and `pnpm build` before opening a pull request.
5. Never commit API keys, ad account IDs or other secrets.

For project conventions, see [`AGENTS.md`](AGENTS.md).

## License

Released under the MIT License.
