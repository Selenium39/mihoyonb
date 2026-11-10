/**
 * 照片盖章工具的中英文案（/zh/photo-stamp 与 /photo-stamp 共用）。
 *
 * 约定（对齐 stamp-maker/copy.ts）：JSX 里不出现硬编码文案；
 * 中文面向"给照片盖公章/纪念章"场景，英文围绕 add stamp to photo /
 * stamp a photo / photo stamp 高商业意图关键词。
 */

import type { Locale } from '@/lib/i18n'

export interface PhotoStampCopy {
  hero: {
    title: string
    intro: string
  }
  photo: {
    cardTitle: string
    upload: string
    replace: string
    hint: string
  }
  stamp: {
    cardTitle: string
    fromDesign: string
    fromDesignHint: string
    fromDesignMissing: string
    upload: string
    uploadHint: string
    none: string
  }
  transform: {
    cardTitle: string
    position: string
    size: string
    rotation: string
    opacity: string
    blend: string
    blends: { multiply: string; normal: string }
    blendHint: string
  }
  exportSection: {
    cardTitle: string
    jpg: string
    png: string
    busy: string
  }
  errors: {
    photoLoadFailed: string
    exportFailed: string
  }
  features: {
    heading: string
    items: ReadonlyArray<{ title: string; body: string }>
  }
  faqs: {
    heading: string
    items: ReadonlyArray<{ question: string; answer: string }>
  }
}

const zh: PhotoStampCopy = {
  hero: {
    title: '照片盖章',
    intro:
      '把印章盖到照片上：直接带入印章生成器里的设计或上传透明底印章图，点击放置、拖动调整，印泥混合模式让效果像真盖上去的一样。全程浏览器本地处理，照片不上传。',
  },
  photo: {
    cardTitle: '照片',
    upload: '上传照片（JPG / PNG / WebP）',
    replace: '更换照片',
    hint: '导出使用照片原始分辨率，盖章效果与预览一致。',
  },
  stamp: {
    cardTitle: '印章来源',
    fromDesign: '带入印章生成器的设计',
    fromDesignHint: '读取本机保存的印章设计（在印章生成器里编辑后回到本页刷新即可）。',
    fromDesignMissing: '本机还没有印章设计，先去印章生成器做一个，或直接上传印章图。',
    upload: '上传印章图（透明底 PNG 最佳）',
    uploadHint: '支持 PNG / SVG / WebP；透明底的印章叠加效果最好。',
    none: '尚未选择印章',
  },
  transform: {
    cardTitle: '盖章调整',
    position: '在预览中点击或拖动即可放置印章',
    size: '印章大小',
    rotation: '旋转',
    opacity: '不透明度',
    blend: '混合模式',
    blends: {
      multiply: '印泥（正片叠底）',
      normal: '普通叠加',
    },
    blendHint: '印泥模式会保留纸面纹理透过印章的效果，最接近真实盖章。',
  },
  exportSection: {
    cardTitle: '导出',
    jpg: '导出 JPG',
    png: '导出 PNG',
    busy: '正在生成…',
  },
  errors: {
    photoLoadFailed: '照片加载失败，请换一张试试。',
    exportFailed: '导出失败，请重试。',
  },
  features: {
    heading: '为什么用这个照片盖章工具',
    items: [
      {
        title: '真印泥质感',
        body: '正片叠底混合让墨迹与纸面互相透出，而不是一张贴纸浮在照片上，放大看细节也自然。',
      },
      {
        title: '与印章生成器联动',
        body: '在印章生成器里做完设计，回到这里一键带入，字体、做旧效果原样保留，无需来回导出导入。',
      },
      {
        title: '全分辨率导出',
        body: '按照片原始尺寸导出 JPG/PNG，不做二次压缩，发图、打印都够用。',
      },
      {
        title: '照片零上传',
        body: '解码、合成、导出全部在浏览器完成，断网也能用，照片不会离开你的设备。',
      },
    ],
  },
  faqs: {
    heading: '常见问题',
    items: [
      {
        question: '印章从哪里来？',
        answer:
          '两种方式：使用印章生成器保存的设计（本机自动带入，含字体与做旧效果），或上传一张透明底 PNG/SVG 印章图。',
      },
      {
        question: '怎么调整印章位置和大小？',
        answer: '在预览图上点击或按住拖动即可移动印章；右侧滑杆调整大小、旋转角与不透明度。',
      },
      {
        question: '「印泥」混合模式是什么？',
        answer:
          '即正片叠底（multiply）：印章的墨迹与照片底色相乘，浅色部分透出纸面纹理，看起来像真的盖上去，而不是一层贴图。',
      },
      {
        question: '照片会被上传吗？',
        answer: '不会。所有处理都在你的浏览器里完成，导出也在本地生成，断网后同样可用。',
      },
    ],
  },
}

const en: PhotoStampCopy = {
  hero: {
    title: 'Add a Stamp to a Photo',
    intro:
      'Stamp your photos: pull in a design from the stamp maker or upload a transparent PNG, click to place, drag to fine-tune, and use the ink blend mode for a realistic stamped look. Everything runs locally — your photo is never uploaded.',
  },
  photo: {
    cardTitle: 'Photo',
    upload: 'Upload photo (JPG / PNG / WebP)',
    replace: 'Replace photo',
    hint: 'Exports use the photo’s original resolution, matching the preview.',
  },
  stamp: {
    cardTitle: 'Stamp source',
    fromDesign: 'Use my stamp maker design',
    fromDesignHint: 'Reads the design saved on this device (edit it in the stamp maker, then come back).',
    fromDesignMissing: 'No saved stamp design on this device yet — make one in the stamp maker, or upload a stamp image.',
    upload: 'Upload stamp image (transparent PNG works best)',
    uploadHint: 'Supports PNG / SVG / WebP; transparent backgrounds composite best.',
    none: 'No stamp selected yet',
  },
  transform: {
    cardTitle: 'Placement',
    position: 'Click or drag on the preview to position the stamp',
    size: 'Stamp size',
    rotation: 'Rotation',
    opacity: 'Opacity',
    blend: 'Blend mode',
    blends: {
      multiply: 'Ink (multiply)',
      normal: 'Normal',
    },
    blendHint: 'Ink mode lets the paper texture show through the ink — closest to a real stamp.',
  },
  exportSection: {
    cardTitle: 'Export',
    jpg: 'Export JPG',
    png: 'Export PNG',
    busy: 'Generating…',
  },
  errors: {
    photoLoadFailed: 'Failed to load the photo. Please try another file.',
    exportFailed: 'Export failed. Please retry.',
  },
  features: {
    heading: 'Why this photo stamp tool',
    items: [
      {
        title: 'Real ink texture',
        body: 'Multiply blending makes the ink interact with the paper texture instead of floating on top — natural even when zoomed in.',
      },
      {
        title: 'Stamp maker integration',
        body: 'Finish a design in the stamp maker and pull it in here with fonts and aging intact — no export/import round-trips.',
      },
      {
        title: 'Full-resolution export',
        body: 'JPG/PNG export at the photo’s original resolution, no extra compression — ready for sharing or printing.',
      },
      {
        title: 'Zero uploads',
        body: 'Decoding, compositing and exporting all happen in your browser. Works offline; your photos never leave the device.',
      },
    ],
  },
  faqs: {
    heading: 'FAQ',
    items: [
      {
        question: 'Where does the stamp come from?',
        answer:
          'Two ways: use a design saved from the stamp maker (auto-loaded on this device, fonts and aging included), or upload a transparent PNG/SVG stamp image.',
      },
      {
        question: 'How do I move and resize the stamp?',
        answer: 'Click or drag on the preview to move the stamp; use the sliders for size, rotation and opacity.',
      },
      {
        question: 'What is the “Ink” blend mode?',
        answer:
          'It’s multiply blending: the ink multiplies with the photo’s colors so light areas show the paper through the ink — like a real stamp rather than a sticker.',
      },
      {
        question: 'Are my photos uploaded?',
        answer: 'No. All processing happens in your browser and exports are generated locally. It even works offline.',
      },
    ],
  },
}

export function getPhotoStampCopy(locale: Locale): PhotoStampCopy {
  return locale === 'zh' ? zh : en
}
