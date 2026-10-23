/**
 * 长图切割工具的中英文案（/image-split 与 /en/image-split 共用）。
 *
 * 约定：
 * - 中文文案与重构前的实现逐字一致，避免改动已有的排序与收录；
 * - 英文文案按英文市场习惯重写（非直译），围绕 long image splitter /
 *   split image into grid / 9-grid cutter / Instagram grid；
 * - 动态句式用函数表达，保证两种语言的语序与单位都能本地化；
 * - JSX 里不再出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

export interface ImageSplitCopy {
  languageSwitch: {
    label: string
    ariaLabel: string
  }
  hero: {
    title: string
    badge: string
    intro: string
  }
  settings: {
    cardTitle: string
    tabs: {
      grid: string
      vertical: string
      horizontal: string
    }
    grid: {
      presetLabel: string
      presetTitle: (rows: number, cols: number) => string
      rowsLabel: string
      colsLabel: string
      summary: (count: number, width: number, height: number) => string
    }
    vertical: {
      methodLabel: string
      byCount: string
      byHeight: string
      countLabel: string
      countSummary: (width: number, height: number) => string
      heightLabel: string
      heightPlaceholder: string
      heightEstimate: (count: number) => string
      heightWarning: string
    }
    horizontal: {
      countLabel: string
      summary: (width: number, height: number) => string
    }
    export: {
      formatLabel: string
      qualityLabel: string
      zipBusy: string
      zipIdle: (count: number) => string
      filenameHint: (base: string) => string
    }
  }
  upload: {
    idle: string
    decoding: string
    supported: string
    reselectHint: string
    thumbnailAlt: string
    originalSize: (width: number, height: number, sizeLabel: string) => string
    reselect: string
    clear: string
  }
  preview: {
    cardTitle: string
    generating: string
    count: (count: number) => string
    sliceAlt: (index: number) => string
    downloadTitle: (index: number) => string
  }
  features: {
    sectionTitle: string
    items: ReadonlyArray<{ title: string; description: string }>
  }
  scenarios: {
    sectionTitle: string
    items: ReadonlyArray<{ title: string; description: string }>
  }
  faqs: {
    sectionTitle: string
    items: ReadonlyArray<{ question: string; answer: string }>
  }
  errors: {
    invalidType: string
    decodeFailed: string
    exportFailed: string
    zipFailed: string
    /** 共享库（src/lib/image-split.ts）里的中文错误在英文页的对应文案 */
    libErrors: Readonly<Record<string, string>>
  }
  fileNames: {
    zip: (base: string) => string
  }
}

const ZH: ImageSplitCopy = {
  languageSwitch: {
    label: 'English',
    ariaLabel: '切换到英文版',
  },
  hero: {
    title: '长图切割',
    badge: '本地处理 · 图片不上传',
    intro: '把一张图片切成多张：九宫格、长图分段、横向等分都支持，单张下载或一键打包 ZIP。',
  },
  settings: {
    cardTitle: '切割设置',
    tabs: {
      grid: '网格',
      vertical: '纵向切片',
      horizontal: '横向切片',
    },
    grid: {
      presetLabel: '快捷方式',
      presetTitle: (rows, cols) => `${rows} 行 × ${cols} 列`,
      rowsLabel: '行数（竖向分段）',
      colsLabel: '列数（横向分段）',
      summary: (count, width, height) => `共 ${count} 片，每片约 ${width} × ${height} 像素`,
    },
    vertical: {
      methodLabel: '切割方式',
      byCount: '按片数',
      byHeight: '按每片高度',
      countLabel: '切片数量',
      countSummary: (width, height) => `每片约 ${width} × ${height} 像素`,
      heightLabel: '每片高度（px）',
      heightPlaceholder: '如 1200',
      heightEstimate: (count) => `预计切 ${count} 片，最后一片自动取剩余高度`,
      heightWarning: '（片数较多，预览与导出耗时较长）',
    },
    horizontal: {
      countLabel: '切片数量（等分宽度）',
      summary: (width, height) => `每片约 ${width} × ${height} 像素`,
    },
    export: {
      formatLabel: '导出格式',
      qualityLabel: '导出质量',
      zipBusy: '打包中…',
      zipIdle: (count) => `打包下载全部 ${count || ''} 片（ZIP）`,
      filenameHint: (base) =>
        `文件名格式：${base ? `${base}_01、${base}_02…` : '原文件名_01、_02…'}`,
    },
  },
  upload: {
    idle: '点击选择或拖拽图片到此处',
    decoding: '图片解码中…',
    supported: '支持 PNG、JPG、WebP 等常见格式',
    reselectHint: '点击重新选择图片',
    thumbnailAlt: '原图缩略',
    originalSize: (width, height, sizeLabel) =>
      `原图 ${width} × ${height} 像素${sizeLabel ? ` · ${sizeLabel}` : ''}`,
    reselect: '重新选择',
    clear: '清除',
  },
  preview: {
    cardTitle: '切片预览',
    generating: '缩略图生成中…',
    count: (count) => `共 ${count} 片`,
    sliceAlt: (index) => `切片 ${index}`,
    downloadTitle: (index) => `下载切片 ${index}`,
  },
  features: {
    sectionTitle: '功能特性',
    items: [
      {
        title: '九宫格一键切割',
        description: '默认 3×3 九宫格，行×列在 1–10 间自由调节，发朋友圈、微博九宫格不用再装 App。',
      },
      {
        title: '长图自由分段',
        description: '纵向按片数或自定义每片高度切割长图，横向按片数等分宽度，最后一片自动取剩余部分。',
      },
      {
        title: '多格式导出',
        description: '支持 PNG / JPEG / WebP 导出，JPEG 与 WebP 可调节质量，单张下载或一键打包 ZIP。',
      },
      {
        title: '本地处理不上传',
        description: '切割全部在浏览器内完成，图片不会上传到服务器，隐私安全，完全免费。',
      },
    ],
  },
  scenarios: {
    sectionTitle: '使用场景',
    items: [
      {
        title: '朋友圈九宫格',
        description: '把一张方形照片切成 3×3 九张，按顺序发布，收获整齐的朋友宫格墙。',
      },
      {
        title: '小红书长图分段',
        description: '笔记长图超过发布限制时，按固定高度切成多张，连续上传不丢内容。',
      },
      {
        title: '公众号配图裁切',
        description: '一张大图快速切成多组配图，规格统一，排版更整齐。',
      },
      {
        title: '聊天截图分页',
        description: '超长聊天记录截图切成多段，逐张发送或存档，阅读更轻松。',
      },
    ],
  },
  faqs: {
    sectionTitle: '常见问题',
    items: [
      {
        question: '切割后图片质量会下降吗？',
        answer:
          '不会。切割只是把原图像素区域分开裁出，不缩放、不重采样。导出 PNG 为无损；选择 JPEG 或 WebP 时可通过质量滑块控制压缩程度，默认 0.9 接近原图观感。',
      },
      {
        question: '支持哪些图片格式？',
        answer:
          '支持浏览器能够打开的主流图片格式，包括 PNG、JPG/JPEG、WebP、GIF（取静态首帧）、BMP 等。导出格式可独立选择 PNG、JPEG 或 WebP。',
      },
      {
        question: '图片会被上传到服务器吗？',
        answer:
          '不会。本工具完全在浏览器本地运行，图片解码、切割、打包全部由你设备上的 Canvas API 完成，断网状态下也可以正常使用。',
      },
      {
        question: '九宫格切完后怎么发朋友圈？',
        answer:
          '上传正方形图片后保持默认 3×3 设置，点击「打包下载 ZIP」，解压后按文件名 _01 到 _09 的顺序依次选图发布即可。',
      },
      {
        question: '最多能切成多少片？',
        answer:
          '网格切割最多 10×10 共 100 片；纵向/横向按片数切割最多 100 片；按每片高度切割的片数取决于图片高度。片数越多预览与导出耗时越长，建议按需切割。',
      },
    ],
  },
  errors: {
    invalidType: '请选择图片文件（PNG、JPG、WebP 等）',
    decodeFailed: '图片加载失败，请更换图片重试',
    exportFailed: '导出失败，请重试',
    zipFailed: '打包导出失败，请重试',
    libErrors: {},
  },
  fileNames: {
    zip: (base) => `${base}_切割.zip`,
  },
}

const EN: ImageSplitCopy = {
  languageSwitch: {
    label: '中文',
    ariaLabel: 'Switch to Chinese',
  },
  hero: {
    title: 'Long Image Splitter & Grid Cutter',
    badge: 'Runs in your browser · Images never uploaded',
    intro:
      'Split one image into as many pieces as you need: slice a long screenshot into equal parts, divide a photo into columns, or make an Instagram-ready 3×3 grid. Download slices one by one or grab them all as a single ZIP.',
  },
  settings: {
    cardTitle: 'Split settings',
    tabs: {
      grid: 'Grid',
      vertical: 'Vertical',
      horizontal: 'Horizontal',
    },
    grid: {
      presetLabel: 'Presets',
      presetTitle: (rows, cols) =>
        `${rows} row${rows === 1 ? '' : 's'} × ${cols} column${cols === 1 ? '' : 's'}`,
      rowsLabel: 'Rows (split vertically)',
      colsLabel: 'Columns (split horizontally)',
      summary: (count, width, height) =>
        `${count} slice${count === 1 ? '' : 's'}, about ${width} × ${height} px each`,
    },
    vertical: {
      methodLabel: 'Split by',
      byCount: 'Number of slices',
      byHeight: 'Height per slice',
      countLabel: 'Slices',
      countSummary: (width, height) => `About ${width} × ${height} px each`,
      heightLabel: 'Height per slice (px)',
      heightPlaceholder: 'e.g. 1200',
      heightEstimate: (count) =>
        `${count} slice${count === 1 ? '' : 's'} — the last one takes whatever height is left`,
      heightWarning: ' (many slices: previews and exports will take longer)',
    },
    horizontal: {
      countLabel: 'Slices (equal widths)',
      summary: (width, height) => `About ${width} × ${height} px each`,
    },
    export: {
      formatLabel: 'Export format',
      qualityLabel: 'Export quality',
      zipBusy: 'Zipping…',
      zipIdle: (count) => `Download all ${count || ''} slices as ZIP`,
      filenameHint: (base) =>
        `File names: ${base ? `${base}_01, ${base}_02, …` : 'original-name_01, _02, …'}`,
    },
  },
  upload: {
    idle: 'Click to choose an image, or drag and drop it here',
    decoding: 'Decoding image…',
    supported: 'PNG, JPG, WebP and other common formats',
    reselectHint: 'Click to choose another image',
    thumbnailAlt: 'Original image thumbnail',
    originalSize: (width, height, sizeLabel) =>
      `Original ${width} × ${height} px${sizeLabel ? ` · ${sizeLabel}` : ''}`,
    reselect: 'Choose another',
    clear: 'Clear',
  },
  preview: {
    cardTitle: 'Slice preview',
    generating: 'Generating thumbnails…',
    count: (count) => `${count} slice${count === 1 ? '' : 's'}`,
    sliceAlt: (index) => `Slice ${index}`,
    downloadTitle: (index) => `Download slice ${index}`,
  },
  features: {
    sectionTitle: 'Features',
    items: [
      {
        title: 'One-click 3×3 grid',
        description:
          'The default 3×3 layout turns a square photo into nine tiles, and rows × columns adjust freely from 1 to 10 — no app needed for your next Instagram or WeChat grid.',
      },
      {
        title: 'Long images, any slice height',
        description:
          'Split a tall screenshot by number of slices or by a fixed height per slice, or divide the width into equal columns. The last slice always takes the remainder.',
      },
      {
        title: 'PNG, JPEG and WebP export',
        description:
          'Pick the output format and, for JPEG or WebP, the compression quality. Download a single slice or package every slice into one ZIP.',
      },
      {
        title: 'Private, local, free',
        description:
          'Every cut runs in your browser with the Canvas API. Images are never uploaded, the tool works offline, and it is completely free.',
      },
    ],
  },
  scenarios: {
    sectionTitle: 'What you can split',
    items: [
      {
        title: 'Instagram 3×3 grid',
        description:
          'Cut one square photo into nine tiles and post them in order to build a seamless grid across your profile.',
      },
      {
        title: 'Long screenshots and chat logs',
        description:
          'When a screenshot is too tall to share, split it into even chunks you can upload one after another without losing any content.',
      },
      {
        title: 'Blog and social images',
        description:
          'Cut one big graphic into a set of matching images so every section of your post lines up neatly.',
      },
      {
        title: 'Stories and carousels',
        description:
          'Slice a poster or carousel frame into equal parts for platforms with strict size limits or slide counts.',
      },
    ],
  },
  faqs: {
    sectionTitle: 'Frequently asked questions',
    items: [
      {
        question: 'Does splitting an image reduce its quality?',
        answer:
          'No. Slicing only crops the original pixels into separate regions — nothing is resized or resampled. PNG export is lossless, and for JPEG or WebP the quality slider controls compression; the default 0.9 looks very close to the original.',
      },
      {
        question: 'Which image formats can I upload?',
        answer:
          'Any format your browser can open, including PNG, JPG/JPEG, WebP, GIF (first frame) and BMP. The export format is selected separately: PNG, JPEG or WebP.',
      },
      {
        question: 'Are my images uploaded to a server?',
        answer:
          'Never. The tool runs entirely in your browser: decoding, slicing and zipping are all done by the Canvas API on your own device, so it keeps working with no internet connection.',
      },
      {
        question: 'How do I post a 3×3 grid to Instagram?',
        answer:
          'Upload a square image, keep the default 3×3 setting and click “Download all slices as ZIP”. Unzip the archive and post the files in _01 to _09 order — the numbering already matches the grid.',
      },
      {
        question: 'How many slices can I make?',
        answer:
          'Grid mode goes up to 10×10, or 100 tiles. Vertical and horizontal splitting support up to 100 slices, and height-based cutting depends on your image height. The more slices you make, the longer previews and exports take, so slice only as much as you need.',
      },
    ],
  },
  errors: {
    invalidType: 'Please choose an image file (PNG, JPG, WebP and so on)',
    decodeFailed: 'Could not load this image — please try another one',
    exportFailed: 'Export failed — please try again',
    zipFailed: 'ZIP export failed — please try again',
    libErrors: {
      '图片加载失败，请检查文件格式': 'Could not load this image — please check the file format',
      '图片导出失败，请重试': 'Image export failed — please try again',
      '无法创建画布上下文，请更换浏览器重试':
        'Could not create a canvas context — please try another browser',
    },
  },
  fileNames: {
    zip: (base) => `${base}-split.zip`,
  },
}

export const IMAGE_SPLIT_COPY: Record<Locale, ImageSplitCopy> = {
  zh: ZH,
  en: EN,
}

export function getImageSplitCopy(locale: Locale): ImageSplitCopy {
  return IMAGE_SPLIT_COPY[locale] ?? ZH
}
