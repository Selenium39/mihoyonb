/**
 * 图片加水印工具的中英文案（/image-watermark 与 /en/image-watermark 共用）。
 *
 * 约定：
 * - 中文文案与重构前的实现逐字一致（含标点、空格、括号），避免改动已有的排序与收录；
 * - 英文文案按英文市场习惯重写（非直译），围绕 watermark images / batch watermark /
 *   text watermark / logo watermark 等搜索意图；
 * - 动态句式用函数表达，保证两种语言的语序与单位都能本地化；
 * - JSX 里不再出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'
import type { WatermarkPosition } from '@/lib/image-watermark'

export interface ImageWatermarkCopy {
  languageSwitch: {
    label: string
    ariaLabel: string
  }
  hero: {
    title: string
    intro: string
  }
  upload: {
    cardTitle: string
    summary: (count: number, sizeLabel: string) => string
    clear: string
    dropTitle: string
    dropHint: string
    imageAlt: (index: number) => string
    previewBadge: string
    removeAria: string
  }
  preview: {
    cardTitle: string
    loadFailed: string
    empty: string
  }
  settings: {
    cardTitle: string
    textTab: string
    imageTab: string
    textLabel: string
    textPlaceholder: string
    /** 文字水印的默认内容 */
    defaultText: string
    fontScaleLabel: string
    colorLabel: string
    opacityLabel: string
    rotationLabel: string
    tileModeLabel: string
    single: string
    tiled: string
    tileGapXLabel: string
    tileGapYLabel: string
    positionLabel: string
    /** 九宫格按钮文案，键与 POSITION_OPTIONS 的 value 一一对应 */
    positions: Record<WatermarkPosition, string>
    imageLabel: string
    uploadImage: string
    removeImage: string
    watermarkImageAlt: string
    imageHint: string
    imageLoadFailed: string
    scaleLabel: string
  }
  exportCard: {
    cardTitle: string
    formatLabel: string
    fillWhiteHint: string
    qualityLabel: string
    processing: (progress: string) => string
    exportAll: string
    progressLine: (done: number, total: number) => string
    allFailed: string
    zipFailed: string
    summary: (ok: number, failed: number) => string
    emptyTextHint: string
    zipFileName: (timestamp: number) => string
  }
  sections: {
    features: string
    scenarios: string
    faqs: string
  }
  features: ReadonlyArray<{ title: string; description: string }>
  scenarios: ReadonlyArray<{ title: string; description: string }>
  faqs: ReadonlyArray<{ question: string; answer: string }>
}

const ZH: ImageWatermarkCopy = {
  languageSwitch: {
    label: 'English',
    ariaLabel: '切换到英文版',
  },
  hero: {
    title: '图片加水印',
    intro:
      '批量给图片添加文字或 Logo 水印，位置、透明度、旋转自由调节，实时预览一键打包下载。全部本地处理，图片不上传。',
  },
  upload: {
    cardTitle: '上传图片',
    summary: (count, sizeLabel) => `共 ${count} 张 · ${sizeLabel}`,
    clear: '清空',
    dropTitle: '点击选择或拖拽图片到此处（支持多选）',
    dropHint: '支持 PNG、JPG、WebP 等浏览器可打开的图片格式',
    imageAlt: (index) => `图片 ${index}`,
    previewBadge: '预览图',
    removeAria: '删除图片',
  },
  preview: {
    cardTitle: '实时预览（第一张图）',
    loadFailed: '预览图加载失败，请更换图片',
    empty: '上传图片后，可在此实时预览水印效果，参数调整即时生效',
  },
  settings: {
    cardTitle: '水印设置',
    textTab: '文字水印',
    imageTab: '图片水印',
    textLabel: '水印内容',
    textPlaceholder: '输入水印文字，如 @我的自媒体',
    defaultText: '@我的自媒体',
    fontScaleLabel: '字号（相对图片宽度）',
    colorLabel: '文字颜色',
    opacityLabel: '透明度',
    rotationLabel: '旋转角度',
    tileModeLabel: '平铺模式',
    single: '单个水印',
    tiled: '平铺全图',
    tileGapXLabel: '列间距（相对图片宽度）',
    tileGapYLabel: '行间距（相对图片宽度）',
    positionLabel: '水印位置',
    positions: {
      'top-left': '左上',
      'top-center': '上中',
      'top-right': '右上',
      'middle-left': '左中',
      'middle-center': '居中',
      'middle-right': '右中',
      'bottom-left': '左下',
      'bottom-center': '下中',
      'bottom-right': '右下',
    },
    imageLabel: '水印图片（建议 PNG 透明底）',
    uploadImage: '上传水印图片',
    removeImage: '移除',
    watermarkImageAlt: '水印图片',
    imageHint: '请先上传水印图片，才能使用图片水印',
    imageLoadFailed: '水印图片加载失败，请更换图片',
    scaleLabel: '缩放比例（相对图片宽度）',
  },
  exportCard: {
    cardTitle: '应用并导出',
    formatLabel: '导出格式',
    fillWhiteHint: 'JPEG / WebP 会先用白色填充透明背景',
    qualityLabel: '导出质量',
    processing: (progress) => `正在处理 ${progress}`,
    exportAll: '应用到全部并打包下载',
    progressLine: (done, total) => `正在合成第 ${done} / ${total} 张…`,
    allFailed: '全部图片处理失败，请确认图片文件完好后重试',
    zipFailed: '打包下载失败，请重试',
    summary: (ok, failed) =>
      `已完成：成功 ${ok} 张${failed > 0 ? `，失败 ${failed} 张（已跳过）` : ''}，ZIP 已开始下载`,
    emptyTextHint: '请输入水印内容后再导出',
    zipFileName: (timestamp) => `watermarked-images-${timestamp}.zip`,
  },
  sections: {
    features: '功能特性',
    scenarios: '使用场景',
    faqs: '常见问题',
  },
  features: [
    {
      title: '文字水印自由定制',
      description:
        '水印内容、字号、颜色、透明度、旋转角度随意调整，九宫格快速定位，还可开启平铺模式覆盖全图防盗裁剪。',
    },
    {
      title: '品牌 Logo 水印',
      description:
        '上传 PNG 透明底 Logo，按图片宽度比例缩放，配合透明度与九宫格位置，轻松打造统一品牌形象。',
    },
    {
      title: '批量处理一键打包',
      description:
        '多选、拖拽批量上传，实时预览第一张效果，全部应用后自动打包 ZIP 下载，支持 PNG / JPEG / WebP 导出。',
    },
    {
      title: '本地处理不上传',
      description: '水印合成全部在浏览器内由 Canvas 完成，图片不会上传到服务器，隐私安全，完全免费。',
    },
  ],
  scenarios: [
    {
      title: '自媒体图片防盗',
      description: '给文章配图、小红书笔记统一加上 @账号 水印，转载传播时也能带走你的署名。',
    },
    {
      title: '摄影作品展示',
      description: '作品分享前铺上半透明签名水印，既不影响观感，又能防止原图被盗用。',
    },
    {
      title: '电商产品图',
      description: '批量给产品图、详情图加盖店铺 Logo，统一视觉的同时防止同行盗图。',
    },
    {
      title: '团队品牌统一',
      description: '活动照片、社群素材批量加水印分发，品牌曝光更规范，整理归档更高效。',
    },
  ],
  faqs: [
    {
      question: '图片会被上传到服务器吗？',
      answer:
        '不会。本工具完全在浏览器本地运行，图片解码、水印合成、ZIP 打包全部由你设备上的 Canvas API 完成，断网状态下也可以正常使用。',
    },
    {
      question: '水印字号和平铺间距是按什么计算的？',
      answer:
        '字号与间距均按「底图宽度比例」计算。这样批量处理不同尺寸的图片时，每张图上水印的相对大小和密度保持一致，不会出现有的图水印过大、有的过小的情况。',
    },
    {
      question: '为什么导出 JPEG 后透明背景变白了？',
      answer:
        'JPEG 格式本身不支持透明像素，导出前会自动用白色填充透明背景；WebP 导出同样会铺白底以保证各端显示一致。如需保留透明背景，请选择 PNG 格式。',
    },
    {
      question: '批量图片里有同名文件怎么办？',
      answer:
        '打包时如遇同名文件，会自动在文件名后追加序号（如 photo_1、photo_2），确保 ZIP 内每张图片都被保留。',
    },
    {
      question: '水印加错了还能去掉吗？',
      answer:
        '水印与原图是合成为一体的，导出后无法直接还原。建议保留原始图片，仅对导出副本加水印；调整参数时可在左侧预览区实时确认效果后再导出。',
    },
  ],
}

const EN: ImageWatermarkCopy = {
  languageSwitch: {
    label: '中文',
    ariaLabel: 'Switch to Chinese',
  },
  hero: {
    title: 'Watermark Images Online',
    intro:
      'Add a text or logo watermark to a whole batch of images and control the position, opacity, size, rotation and tiling. Every change previews live, then download all the watermarked images in one ZIP. Everything runs in your browser — your photos are never uploaded.',
  },
  upload: {
    cardTitle: 'Upload images',
    summary: (count, sizeLabel) =>
      `${count} ${count === 1 ? 'image' : 'images'} · ${sizeLabel}`,
    clear: 'Clear all',
    dropTitle: 'Click to choose images, or drag and drop them here (multiple files welcome)',
    dropHint: 'PNG, JPG, WebP and any other image format your browser can open',
    imageAlt: (index) => `Image ${index}`,
    previewBadge: 'Preview',
    removeAria: 'Remove image',
  },
  preview: {
    cardTitle: 'Live preview (first image)',
    loadFailed: 'Could not load the preview image. Please try another file.',
    empty:
      'Upload an image and its watermarked preview appears here — every setting updates it in real time.',
  },
  settings: {
    cardTitle: 'Watermark settings',
    textTab: 'Text watermark',
    imageTab: 'Logo watermark',
    textLabel: 'Watermark text',
    textPlaceholder: 'Enter your watermark text, e.g. @yourhandle',
    defaultText: '@yourhandle',
    fontScaleLabel: 'Font size (relative to image width)',
    colorLabel: 'Text color',
    opacityLabel: 'Opacity',
    rotationLabel: 'Rotation',
    tileModeLabel: 'Tile mode',
    single: 'Single watermark',
    tiled: 'Tile whole image',
    tileGapXLabel: 'Column spacing (relative to image width)',
    tileGapYLabel: 'Row spacing (relative to image width)',
    positionLabel: 'Position',
    positions: {
      'top-left': 'Top left',
      'top-center': 'Top center',
      'top-right': 'Top right',
      'middle-left': 'Middle left',
      'middle-center': 'Center',
      'middle-right': 'Middle right',
      'bottom-left': 'Bottom left',
      'bottom-center': 'Bottom center',
      'bottom-right': 'Bottom right',
    },
    imageLabel: 'Watermark image (transparent PNG recommended)',
    uploadImage: 'Upload watermark image',
    removeImage: 'Remove',
    watermarkImageAlt: 'Watermark image',
    imageHint: 'Upload a watermark image first to use the logo watermark',
    imageLoadFailed: 'Could not load that watermark image. Please try another file.',
    scaleLabel: 'Scale (relative to image width)',
  },
  exportCard: {
    cardTitle: 'Apply and export',
    formatLabel: 'Export format',
    fillWhiteHint: 'JPEG and WebP are flattened onto a white background',
    qualityLabel: 'Export quality',
    processing: (progress) => `Processing ${progress}`,
    exportAll: 'Apply to all and download ZIP',
    progressLine: (done, total) => `Watermarking image ${done} of ${total}…`,
    allFailed: 'Every image failed to process. Please check the files and try again.',
    zipFailed: 'Could not build the ZIP download. Please try again.',
    summary: (ok, failed) =>
      `Done: ${ok} ${ok === 1 ? 'image' : 'images'} exported${
        failed > 0 ? `, ${failed} skipped` : ''
      }. Your ZIP download has started.`,
    emptyTextHint: 'Enter watermark text before exporting',
    zipFileName: (timestamp) => `watermarked-images-${timestamp}.zip`,
  },
  sections: {
    features: 'Features',
    scenarios: 'Use cases',
    faqs: 'Frequently asked questions',
  },
  features: [
    {
      title: 'Custom text watermarks',
      description:
        'Set the text, font size, color, opacity and rotation, snap the watermark to any of nine anchor points, or tile it across the whole image so a crop cannot strip it off.',
    },
    {
      title: 'Logo watermarks',
      description:
        'Upload a transparent PNG logo and it scales with the image width — combine it with opacity and the nine-point grid for consistent branding across every photo.',
    },
    {
      title: 'Batch processing in one ZIP',
      description:
        'Select or drop many files at once, preview the first image live, then watermark them all and download a single ZIP in PNG, JPEG or WebP.',
    },
    {
      title: 'Local, private, free',
      description:
        'Watermarks are composited with the Canvas API inside your browser. Your images never touch a server, the tool works offline, and it is completely free.',
    },
  ],
  scenarios: [
    {
      title: 'Protect social posts',
      description:
        'Stamp your @handle on blog images and social notes so the credit travels with every repost and screenshot.',
    },
    {
      title: 'Photography portfolios',
      description:
        'Lay a semi-transparent signature over your shots before sharing — visible enough to deter theft, subtle enough to keep the photo clean.',
    },
    {
      title: 'E-commerce product photos',
      description:
        'Watermark product and detail shots with your store logo in bulk to keep the catalog consistent and stop copycats.',
    },
    {
      title: 'Team branding',
      description:
        'Watermark event photos and community assets before sharing them out, so every image carries the same branding.',
    },
  ],
  faqs: [
    {
      question: 'Are my images uploaded to a server?',
      answer:
        'No. The whole tool runs locally: decoding, watermark compositing and ZIP packaging all happen through the Canvas API on your own device. There is no upload endpoint, and it keeps working offline.',
    },
    {
      question: 'How are font size and tile spacing calculated?',
      answer:
        'Both are relative to the width of each source image, so a batch of differently sized photos gets watermarks of the same relative size and density — no oversized watermark on one image and a tiny one on the next.',
    },
    {
      question: 'Why does a JPEG export have a white background?',
      answer:
        'JPEG cannot store transparency, so transparent areas are filled with white before export. WebP exports are flattened the same way for consistent rendering everywhere. Choose PNG if you need to keep transparency.',
    },
    {
      question: 'What if two files in the batch share the same name?',
      answer:
        'When packaging, duplicates get a number appended (photo_1, photo_2 and so on) so every watermarked image is kept inside the ZIP.',
    },
    {
      question: 'Can a watermark be removed afterwards?',
      answer:
        'The watermark is composited into the pixels, so it cannot be undone from the exported file. Keep your originals and watermark copies only; use the live preview to confirm the result before exporting.',
    },
  ],
}

export const IMAGE_WATERMARK_COPY: Record<Locale, ImageWatermarkCopy> = {
  zh: ZH,
  en: EN,
}

export function getImageWatermarkCopy(locale: Locale): ImageWatermarkCopy {
  return IMAGE_WATERMARK_COPY[locale] ?? ZH
}
