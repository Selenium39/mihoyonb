/**
 * 社交平台尺寸适配工具的中英文案（/zh/social-resize 与 /social-resize 共用）。
 *
 * 约定：
 * - 中文文案与重构前逐字一致，页面观感与行为不变；
 * - 英文文案按英文市场重写（非直译），预设改为 Instagram / X / LinkedIn /
 *   YouTube 等英文用户实际使用的规格；
 * - 预设 id 仅供组件内部选择，展示名称全部来自这里；
 * - 动态句式用函数表达，保证两种语言的语序、单位与标点都能本地化。
 */

import type { Locale } from '@/lib/i18n'

export type ExportFormatValue = 'png' | 'jpeg' | 'webp'

export interface SizePreset {
  id: string
  name: string
  ratio: string
  width: number
  height: number
}

export interface SocialResizeCopy {
  hero: {
    title: string
    badge: string
    intro: string
  }
  fit: {
    cardTitle: string
    cover: string
    contain: string
    coverHint: string
    containHint: string
    backgroundModeLabel: string
    colorBackground: string
    blurBackground: string
    backgroundColorLabel: string
    blurHint: string
  }
  export: {
    cardTitle: string
    formatLabel: string
    formats: ReadonlyArray<{ value: ExportFormatValue; label: string }>
    qualityLabel: string
    zipButton: (count: number) => string
    zipping: string
    fileNamingHint: (example: string) => string
    exampleFileName: (base: string | null) => string
  }
  upload: {
    dropTitle: string
    dropHint: string
    decoding: string
    chooseAnother: string
    originalAlt: string
    replace: string
    clear: string
    dimensions: (width: number, height: number) => string
  }
  sizes: {
    cardTitle: string
    selectionCount: (count: number) => string
    customGroupLabel: string
    customName: string
    addLabel: string
    widthPlaceholder: string
    heightPlaceholder: string
    add: string
    rangeHint: (max: number) => string
    removeTitle: string
    previewAlt: (name: string) => string
    downloadTitle: (width: number, height: number) => string
    presets: ReadonlyArray<SizePreset>
    defaultSelectedPresetId: string
  }
  preview: {
    cardTitle: string
    empty: string
    backgroundSolid: string
    backgroundBlur: string
  }
  sections: {
    features: string
    scenarios: string
    faqs: string
  }
  features: ReadonlyArray<{ title: string; description: string }>
  scenarios: ReadonlyArray<{ title: string; description: string }>
  faqs: ReadonlyArray<{ question: string; answer: string }>
  errors: {
    unsupportedType: string
    loadFailed: string
    canvasUnsupported: string
    renderFailed: string
    exportFailed: string
    zipFailed: string
    customSizeInvalid: (max: number) => string
  }
  zipFileName: (base: string) => string
  fallbackBaseName: string
}

const ZH: SocialResizeCopy = {
  hero: {
    title: '尺寸适配',
    badge: '本地处理 · 图片不上传',
    intro: '一张图一键产出多个社交平台尺寸，居中裁切或完整保留任选，批量导出 PNG / JPEG / WebP。',
  },
  fit: {
    cardTitle: '填充模式',
    cover: '居中裁切',
    contain: '完整保留',
    coverHint: '按目标比例放大填满并从四边均匀裁掉多余部分，画面无留白。',
    containHint: '整张图片完整保留，比例不一致时多余区域用下方背景填充。',
    backgroundModeLabel: '背景方式',
    colorBackground: '纯色背景',
    blurBackground: '模糊放大',
    backgroundColorLabel: '背景颜色',
    blurHint: '底图放大裁切铺满画布并施加高斯模糊，再居中叠加完整原图，横图改竖版常用。',
  },
  export: {
    cardTitle: '导出设置',
    formatLabel: '导出格式',
    formats: [
      { value: 'png', label: 'PNG' },
      { value: 'jpeg', label: 'JPEG' },
      { value: 'webp', label: 'WebP' },
    ],
    qualityLabel: '导出质量',
    zipButton: (count) => `打包导出全部 ${count || ''} 张（ZIP）`,
    zipping: '打包中…',
    fileNamingHint: (example) => `文件名格式：${example}，也可在右侧预览中单独下载某个尺寸。`,
    exampleFileName: (base) => (base ? `${base}_1080x1440.png` : '原文件名_宽x高.png'),
  },
  upload: {
    dropTitle: '点击选择或拖拽图片到此处',
    dropHint: '支持 PNG、JPG、WebP 等常见格式',
    decoding: '图片解码中…',
    chooseAnother: '点击重新选择图片',
    originalAlt: '原图缩略',
    replace: '重新选择',
    clear: '清除',
    dimensions: (width, height) => `原图 ${width} × ${height} 像素`,
  },
  sizes: {
    cardTitle: '选择尺寸',
    selectionCount: (count) => `已选 ${count} 个，可多选`,
    customGroupLabel: '自定义尺寸',
    customName: '自定义',
    addLabel: '添加自定义尺寸',
    widthPlaceholder: '宽',
    heightPlaceholder: '高',
    add: '添加',
    rangeHint: (max) => `宽高范围 1–${max} 像素，可添加多个自定义尺寸。`,
    removeTitle: '删除此尺寸',
    previewAlt: (name) => `${name} 预览`,
    downloadTitle: (width, height) => `下载 ${width}×${height}`,
    presets: [
      { id: 'wechat-cover', name: '公众号头图', ratio: '2.35:1', width: 900, height: 383 },
      { id: 'square', name: '方图', ratio: '1:1', width: 1080, height: 1080 },
      { id: 'xiaohongshu', name: '小红书竖图', ratio: '3:4', width: 1080, height: 1440 },
      { id: 'short-video', name: '抖音/视频号竖屏', ratio: '9:16', width: 1080, height: 1920 },
      { id: 'landscape', name: '横屏封面', ratio: '16:9', width: 1920, height: 1080 },
    ],
    defaultSelectedPresetId: 'square',
  },
  preview: {
    cardTitle: '输出预览',
    empty: '请在上方勾选至少一个尺寸，即可在此预览并导出。',
    backgroundSolid: '纯色背景',
    backgroundBlur: '模糊放大',
  },
  sections: {
    features: '功能特性',
    scenarios: '使用场景',
    faqs: '常见问题',
  },
  features: [
    {
      title: '一键多尺寸出图',
      description:
        '一次上传，同时生成公众号头图、方图、小红书竖图、短视频竖屏、横屏封面等常用尺寸。',
    },
    {
      title: '两种填充模式',
      description:
        '居中裁切铺满画面，或完整保留原图；留白背景可选纯色颜色或模糊放大，随手出图都好看。',
    },
    {
      title: '多格式批量导出',
      description: '支持 PNG / JPEG / WebP 导出，可调压缩质量，单个尺寸单独下载，或一键打包 ZIP。',
    },
    {
      title: '本地处理不上传',
      description: '全部处理在浏览器内完成，图片不会上传到服务器，隐私安全，完全免费。',
    },
  ],
  scenarios: [
    {
      title: '公众号配图套装',
      description: '一张图同时产出 2.35:1 头图与正文方图，配图规格统一，排版更整齐。',
    },
    {
      title: '小红书笔记封面',
      description: '方图与 3:4 竖图一键生成，一张素材适配信息流双列与详情页展示。',
    },
    {
      title: '短视频封面',
      description: '抖音、视频号 9:16 竖屏封面快速适配，模糊放大背景让横图秒变竖版封面。',
    },
    {
      title: '一稿多平台分发',
      description: '同一份素材批量适配各平台规格，支持自定义尺寸，一次导出全部搞定。',
    },
  ],
  faqs: [
    {
      question: '居中裁切和完整保留有什么区别？',
      answer:
        '居中裁切（cover）：图片按目标比例放大填满画面，超出部分从四边均匀裁掉，画面无留白；完整保留（contain）：整张图片都在画面内，比例不一至时多余区域用纯色或模糊放大的背景填充。',
    },
    {
      question: '图片会被上传到服务器吗？',
      answer:
        '不会。本工具完全在浏览器本地运行，图片解码、缩放、裁切、打包全部由你设备上的 Canvas API 完成，断网状态下也可以正常使用。',
    },
    {
      question: '导出的图片清晰度够吗？',
      answer:
        '导出按所选尺寸的原始像素生成，PNG 为无损格式，JPEG / WebP 可通过质量滑块控制压缩程度。若原图小于目标尺寸，放大会略有损失，建议使用大于目标尺寸的高清原图。',
    },
    {
      question: '可以自定义尺寸吗？',
      answer:
        '可以。在「选择尺寸」区域输入宽和高即可添加自定义尺寸，支持添加多个，与预设尺寸一起勾选后批量导出，文件名格式为 原文件名_宽x高。',
    },
    {
      question: '模糊放大背景是什么效果？',
      answer:
        '即常见的「背景虚化」效果：先把原图放大裁切铺满画布并施加高斯模糊作为底图，再居中叠加完整原图，常用于横图改竖版时填充上下留白。',
    },
  ],
  errors: {
    unsupportedType: '请选择图片文件（PNG、JPG、WebP 等）',
    loadFailed: '图片加载失败，请更换图片重试',
    canvasUnsupported: '当前浏览器不支持 Canvas，无法处理图片',
    renderFailed: '图片生成失败，请重试',
    exportFailed: '导出失败，请重试',
    zipFailed: '打包导出失败，请重试',
    customSizeInvalid: (max) => `请输入 1–${max} 之间的宽和高`,
  },
  zipFileName: (base) => `${base}_尺寸适配.zip`,
  fallbackBaseName: 'image',
}

const EN: SocialResizeCopy = {
  hero: {
    title: 'Social Media Image Resizer',
    badge: 'On-device · Nothing uploaded',
    intro:
      'One upload, every size you post. Resize a single image for Instagram, X (Twitter), LinkedIn and YouTube, crop or fit it exactly, then export PNG, JPEG or WebP — one at a time or all in a ZIP.',
  },
  fit: {
    cardTitle: 'Fit & fill',
    cover: 'Crop to fill',
    contain: 'Fit whole image',
    coverHint:
      'Scales the photo until it covers the canvas, then trims the overflow evenly from every edge. No borders, no letterboxing.',
    containHint:
      'Keeps the entire photo visible. Any leftover space is filled with the background you pick below.',
    backgroundModeLabel: 'Background',
    colorBackground: 'Solid color',
    blurBackground: 'Blurred image',
    backgroundColorLabel: 'Background color',
    blurHint:
      'The photo is scaled to cover the canvas and blurred as a backdrop, with the full image layered on top. The quickest way to turn a landscape shot into a vertical one.',
  },
  export: {
    cardTitle: 'Export',
    formatLabel: 'Format',
    formats: [
      { value: 'png', label: 'PNG' },
      { value: 'jpeg', label: 'JPEG' },
      { value: 'webp', label: 'WebP' },
    ],
    qualityLabel: 'Quality',
    zipButton: (count) => (count ? `Download all ${count} sizes (ZIP)` : 'Download all sizes (ZIP)'),
    zipping: 'Zipping…',
    fileNamingHint: (example) =>
      `Files are named like ${example}. You can also download any single size from the previews.`,
    exampleFileName: (base) => `${base ?? 'your-photo'}_1080x1440.png`,
  },
  upload: {
    dropTitle: 'Click to choose an image, or drop it here',
    dropHint: 'PNG, JPG, WebP and other common formats',
    decoding: 'Decoding image…',
    chooseAnother: 'Click to choose another image',
    originalAlt: 'Original image preview',
    replace: 'Replace',
    clear: 'Remove',
    dimensions: (width, height) => `Original ${width} × ${height} px`,
  },
  sizes: {
    cardTitle: 'Sizes',
    selectionCount: (count) => `${count} selected — pick as many as you like`,
    customGroupLabel: 'Custom sizes',
    customName: 'Custom',
    addLabel: 'Add a custom size',
    widthPlaceholder: 'Width',
    heightPlaceholder: 'Height',
    add: 'Add',
    rangeHint: (max) => `Width and height from 1 to ${max} px. Add as many custom sizes as you need.`,
    removeTitle: 'Remove this size',
    previewAlt: (name) => `${name} preview`,
    downloadTitle: (width, height) => `Download ${width}×${height}`,
    presets: [
      { id: 'instagram-post', name: 'Instagram Post', ratio: '1:1', width: 1080, height: 1080 },
      {
        id: 'instagram-story',
        name: 'Instagram Story / Reel',
        ratio: '9:16',
        width: 1080,
        height: 1920,
      },
      { id: 'x-post', name: 'X (Twitter) Post', ratio: '16:9', width: 1600, height: 900 },
      { id: 'linkedin-post', name: 'LinkedIn Post', ratio: '1.91:1', width: 1200, height: 627 },
      {
        id: 'youtube-thumbnail',
        name: 'YouTube Thumbnail',
        ratio: '16:9',
        width: 1280,
        height: 720,
      },
    ],
    defaultSelectedPresetId: 'instagram-post',
  },
  preview: {
    cardTitle: 'Preview and download',
    empty: 'Tick at least one size above to preview and download it here.',
    backgroundSolid: 'solid background',
    backgroundBlur: 'blurred background',
  },
  sections: {
    features: 'Features',
    scenarios: 'What you can use it for',
    faqs: 'Frequently asked questions',
  },
  features: [
    {
      title: 'Every size at once',
      description:
        'Upload one image and get Instagram post, Story/Reel, X post, LinkedIn post and YouTube thumbnail versions — plus any custom size you add.',
    },
    {
      title: 'Crop or fit, your call',
      description:
        'Fill the frame with a center crop, or keep the whole photo and pad the extra space with a solid color or a blurred blow-up of the shot.',
    },
    {
      title: 'Batch export in three formats',
      description:
        'Export PNG, JPEG or WebP with an adjustable quality slider. Grab one size on its own or download every file as a single ZIP.',
    },
    {
      title: 'Nothing leaves your device',
      description:
        'Decoding, resizing, cropping and zipping all run in your browser. No uploads, no sign-up, no watermark — and it is free.',
    },
  ],
  scenarios: [
    {
      title: 'One photo, every feed',
      description:
        'Turn a single shot into the right dimensions for Instagram, X and LinkedIn, so your feed stays consistent without a reshoot.',
    },
    {
      title: 'Stories and Reels',
      description:
        'Get a clean 1080 × 1920 vertical cut for Stories and Reels. The blurred background turns a landscape photo into a vertical canvas.',
    },
    {
      title: 'Thumbnails that get clicks',
      description:
        'Export YouTube thumbnails at 1280 × 720 and LinkedIn link previews at 1200 × 627 from the same source image.',
    },
    {
      title: 'Publish everywhere, once',
      description:
        'Prep a whole campaign in one pass: pick every size you need, add custom dimensions, then download the set in a single ZIP.',
    },
  ],
  faqs: [
    {
      question: 'What is the difference between crop and fit?',
      answer:
        'Crop to fill (cover) scales the image until it covers the whole canvas and trims the overflow evenly from the edges, so there are no borders. Fit whole image (contain) keeps the entire photo visible and fills the leftover space with your chosen solid color or a blurred, zoomed copy of the image.',
    },
    {
      question: 'Are my images uploaded to a server?',
      answer:
        'No. The image is decoded, resized, cropped and zipped entirely inside your browser using the Canvas API. Nothing is sent anywhere, and the tool keeps working with your connection turned off.',
    },
    {
      question: 'Will the exported files be sharp enough?',
      answer:
        'Exports are rendered at the exact pixel dimensions of the size you picked. PNG is lossless, and JPEG/WebP compression is controlled by the quality slider. If your source image is smaller than the target size it will be upscaled and lose some detail, so start with a photo at least as large as the biggest size you need.',
    },
    {
      question: 'Can I use a size that is not in the list?',
      answer:
        'Yes. Enter a width and height in the custom size box, add as many as you need, then tick them alongside the presets and export everything together. Files are named original-name_widthxheight.',
    },
    {
      question: 'How does the blurred background work?',
      answer:
        'It is the classic blurred-backdrop look: the photo is scaled to cover the canvas and blurred as a base layer, then the full uncropped image is composited on top. It is the fastest way to fill empty space when you turn a landscape shot into a vertical Story.',
    },
  ],
  errors: {
    unsupportedType: 'Please choose an image file (PNG, JPG, WebP and similar)',
    loadFailed: 'Could not load that image. Try a different file.',
    canvasUnsupported: 'This browser cannot process images because Canvas is unavailable',
    renderFailed: 'Could not render the image. Please try again.',
    exportFailed: 'Export failed. Please try again.',
    zipFailed: 'Could not build the ZIP. Please try again.',
    customSizeInvalid: (max) => `Enter a width and height between 1 and ${max} px`,
  },
  zipFileName: (base) => `${base}_social-sizes.zip`,
  fallbackBaseName: 'image',
}

export const SOCIAL_RESIZE_COPY: Record<Locale, SocialResizeCopy> = {
  zh: ZH,
  en: EN,
}

export function getSocialResizeCopy(locale: Locale): SocialResizeCopy {
  return SOCIAL_RESIZE_COPY[locale] ?? ZH
}
