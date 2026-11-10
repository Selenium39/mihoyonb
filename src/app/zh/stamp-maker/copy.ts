/**
 * 印章生成器的中英文案（/zh/stamp-maker 与 /stamp-maker 共用）。
 *
 * 约定（对齐 qr-code/copy.ts）：
 * - 中文面向中文办公场景（公章/财务章/签名章），英文围绕 stamp maker /
 *   custom stamp / seal maker 高 RPM 关键词；
 * - 模板名称在 stamp-maker.ts 的 STAMP_TEMPLATES（nameEn/nameZh）；
 * - JSX 里不出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

export interface StampMakerCopy {
  hero: {
    title: string
    intro: string
  }
  preview: {
    cardTitle: string
    hint: string
    undo: string
    redo: string
    reset: string
    sizeLabel: string
  }
  templates: {
    cardTitle: string
  }
  shape: {
    cardTitle: string
    circle: string
    ellipse: string
    rect: string
    triangle: string
    borderStyle: string
    borderWidth: string
    styles: Record<string, string>
    edge: string
    edgeHint: string
    edges: Record<string, string>
  }
  textSections: {
    cardTitle: string
    top: string
    bottom: string
    center: string
    enabled: string
    topPlaceholder: string
    bottomPlaceholder: string
    centerPlaceholder: string
    font: string
    fontSize: string
    letterSpacing: string
    lineHeight: string
    symbols: string
  }
  icon: {
    cardTitle: string
    upload: string
    remove: string
    scale: string
    hint: string
    onlyWith?: string
  }
  appearance: {
    cardTitle: string
    color: string
    customColor: string
    opacity: string
    aging: string
    agingHint: string
  }
  sizeSection: {
    cardTitle: string
    width: string
    height: string
    hint: string
  }
  exportSection: {
    cardTitle: string
    intro: string
    png1x: string
    png3x: string
    png10x: string
    jpg: string
    svg: string
    pdf: string
    tiff: string
    docx: string
    zip: string
    busy: string
  }
  errors: {
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

const zh: StampMakerCopy = {
  hero: {
    title: '在线印章生成器',
    intro:
      '浏览器里设计圆章、椭圆章、矩形章：弧形文字、多种边框、做旧磨损效果，导出 PNG / JPG / SVG / PDF。全程本地处理，不注册、不上传。',
  },
  preview: {
    cardTitle: '印章预览',
    hint: '左侧为实时预览，导出与预览同一条渲染管线，所见即所得。',
    undo: '撤销',
    redo: '重做',
    reset: '重置',
    sizeLabel: '物理尺寸',
  },
  templates: {
    cardTitle: '快速模板',
  },
  shape: {
    cardTitle: '形状与边框',
    circle: '圆形',
    ellipse: '椭圆',
    rect: '矩形',
    triangle: '三角',
    borderStyle: '边框样式',
    borderWidth: '边框粗细',
    styles: {
      single: '单线',
      double: '双线',
      triple: '三线',
      dashed: '虚线',
      dotted: '点线',
    },
    edge: '装饰边',
    edgeHint: '仅圆形支持：扇贝、光芒、齿轮、绳珠等经典封边。',
    edges: {
      none: '无',
      scalloped: '扇贝边',
      sunburst: '光芒边',
      gear: '齿轮边',
      rope: '绳珠边',
    },
  },
  textSections: {
    cardTitle: '文字内容',
    top: '顶部文字（沿弧排布）',
    bottom: '底部文字（正立排布）',
    center: '中央文字（支持多行）',
    enabled: '启用',
    topPlaceholder: '公司名称',
    bottomPlaceholder: '专用章 / INCORPORATED',
    centerPlaceholder: '每行一句\n例如：合同专用章',
    font: '字体',
    fontSize: '字号',
    letterSpacing: '字距',
    lineHeight: '行距',
    symbols: '插入符号',
  },
  icon: {
    cardTitle: '中心图标',
    upload: '上传图标（SVG / PNG）',
    remove: '移除',
    scale: '图标大小',
    hint: '图标与中央文字共存时自动上下排布，原图颜色保留。',
  },
  appearance: {
    cardTitle: '外观',
    color: '墨水颜色',
    customColor: '自定义',
    opacity: '不透明度',
    aging: '做旧磨损',
    agingHint: '模拟真实印章的毛边与缺墨，0 为全新效果。',
  },
  sizeSection: {
    cardTitle: '物理尺寸（毫米）',
    width: '宽',
    height: '高',
    hint: '用于 PDF 页面尺寸与打印；圆形建议宽高一致。',
  },
  exportSection: {
    cardTitle: '导出',
    intro: '导出前会自动把所用字体子集内嵌进文件，任何设备打开字体一致。',
    png1x: 'PNG 400px',
    png3x: 'PNG 1200px',
    png10x: 'PNG 4000px',
    jpg: 'JPG（白底）',
    svg: 'SVG 矢量',
    pdf: 'PDF（按毫米）',
    tiff: 'TIFF 无损',
    docx: 'Word 文档',
    zip: '全部格式打包',
    busy: '正在生成…',
  },
  errors: {
    exportFailed: '导出失败，请重试；若反复失败请检查网络（字体需要访问 Google Fonts）。',
  },
  features: {
    heading: '为什么用这个印章生成器',
    items: [
      {
        title: '纯浏览器，零上传',
        body: '编辑、渲染、导出全部在本地完成，文字与设计不离开设备，断网后仍可继续（字体首次加载需联网）。',
      },
      {
        title: '专业弧形排版',
        body: '顶部文字沿圆弧排布、底部文字自动正立，字距字号可调，中英文与多款印章字体可选。',
      },
      {
        title: '真实感做旧',
        body: '毛边与缺墨的磨损滤镜可调强度，一步得到接近真实盖章的质感，而不是"电脑味"的圆圈。',
      },
      {
        title: '全套导出格式',
        body: 'PNG 三档倍率、白底 JPG、可再编辑的 SVG 矢量、按毫米定尺寸的 PDF，或一键打包全部格式。',
      },
    ],
  },
  faqs: {
    heading: '常见问题',
    items: [
      {
        question: '这个印章生成器免费吗？',
        answer: '免费，无水印、无注册、无导出次数限制。站点通过广告维持运营。',
      },
      {
        question: '设计会被上传到服务器吗？',
        answer: '不会。所有渲染与导出都在浏览器内完成；自动保存也只存在本机 localStorage，可随时用"重置"清除。',
      },
      {
        question: '导出的 PDF 尺寸准确吗？',
        answer: 'PDF 页面尺寸即你填写的毫米尺寸（如 40×40mm），10 倍率位图（约 300+ DPI）铺满页面，直接打印就是实际大小。',
      },
      {
        question: '做出来的章能用于正式文件吗？',
        answer: '本工具用于设计稿、模板、教具、包装与个人创意场景。公司公章、备案章等法定印章须依当地法规刻制，请勿将生成的图案用于伪造或欺诈用途。',
      },
      {
        question: '为什么导出时需要联网？',
        answer: '导出前会把所用字体按需子集内嵌进文件，需要访问 Google Fonts；预览完成后断网仍可编辑并导出（字体回退系统字）。',
      },
    ],
  },
}

const en: StampMakerCopy = {
  hero: {
    title: 'Online Stamp Maker',
    intro:
      'Design round, oval and rectangular rubber stamps in your browser: curved text, classic borders and a realistic aging effect. Export PNG / JPG / SVG / PDF — no signup, no uploads, everything runs locally.',
  },
  preview: {
    cardTitle: 'Stamp preview',
    hint: 'Live preview. Exports use the same rendering pipeline, so what you see is what you get.',
    undo: 'Undo',
    redo: 'Redo',
    reset: 'Reset',
    sizeLabel: 'Physical size',
  },
  templates: {
    cardTitle: 'Quick templates',
  },
  shape: {
    cardTitle: 'Shape & border',
    circle: 'Round',
    ellipse: 'Oval',
    rect: 'Rect',
    triangle: 'Triangle',
    borderStyle: 'Border style',
    borderWidth: 'Border width',
    styles: {
      single: 'Single line',
      double: 'Double line',
      triple: 'Triple line',
      dashed: 'Dashed',
      dotted: 'Dotted',
    },
    edge: 'Decorative edge',
    edgeHint: 'Round stamps only: scalloped, sunburst, gear and rope edges.',
    edges: {
      none: 'None',
      scalloped: 'Scalloped',
      sunburst: 'Sunburst',
      gear: 'Gear',
      rope: 'Rope',
    },
  },
  textSections: {
    cardTitle: 'Text',
    top: 'Top text (curved)',
    bottom: 'Bottom text (upright)',
    center: 'Center text (multi-line)',
    enabled: 'Enabled',
    topPlaceholder: 'Company name',
    bottomPlaceholder: 'INCORPORATED',
    centerPlaceholder: 'One line each\nExample: APPROVED',
    font: 'Font',
    fontSize: 'Size',
    letterSpacing: 'Letter spacing',
    lineHeight: 'Line height',
    symbols: 'Insert symbol',
  },
  icon: {
    cardTitle: 'Center icon',
    upload: 'Upload icon (SVG / PNG)',
    remove: 'Remove',
    scale: 'Icon size',
    hint: 'The icon stacks above center text automatically; original colors are kept.',
  },
  appearance: {
    cardTitle: 'Appearance',
    color: 'Ink color',
    customColor: 'Custom',
    opacity: 'Opacity',
    aging: 'Aging effect',
    agingHint: 'Adds rough edges and ink erosion like a real stamp. 0 = brand new.',
  },
  sizeSection: {
    cardTitle: 'Physical size (mm)',
    width: 'Width',
    height: 'Height',
    hint: 'Used for the PDF page size and printing. Keep both equal for round stamps.',
  },
  exportSection: {
    cardTitle: 'Export',
    intro: 'Fonts are embedded into the file before export, so it looks identical on any device.',
    png1x: 'PNG 400px',
    png3x: 'PNG 1200px',
    png10x: 'PNG 4000px',
    jpg: 'JPG (white bg)',
    svg: 'SVG vector',
    pdf: 'PDF (mm-sized)',
    tiff: 'TIFF lossless',
    docx: 'Word document',
    zip: 'All formats (ZIP)',
    busy: 'Generating…',
  },
  errors: {
    exportFailed:
      'Export failed. Please retry; if it keeps failing, check your network (fonts are fetched from Google Fonts).',
  },
  features: {
    heading: 'Why this stamp maker',
    items: [
      {
        title: 'Browser-only, zero uploads',
        body: 'Editing, rendering and exporting all happen on your device. Your text never leaves the browser, and the tool keeps working offline after fonts load.',
      },
      {
        title: 'Professional curved text',
        body: 'Top text follows the arc, bottom text stays upright, with adjustable spacing — plus stamp-grade fonts for English and Chinese.',
      },
      {
        title: 'Realistic aging effect',
        body: 'A tunable filter adds rough edges and missing ink, turning a clean vector circle into something that looks actually stamped.',
      },
      {
        title: 'Every format you need',
        body: 'PNG in three resolutions, white-background JPG, editable SVG vectors, a PDF sized in millimeters, or everything in one ZIP.',
      },
    ],
  },
  faqs: {
    heading: 'FAQ',
    items: [
      {
        question: 'Is this stamp maker really free?',
        answer: 'Yes — no watermarks, no signup, no export limits. The site is supported by ads.',
      },
      {
        question: 'Are my designs uploaded anywhere?',
        answer: 'No. All processing happens in your browser, and autosave lives in your browser localStorage. Reset clears it anytime.',
      },
      {
        question: 'Is the exported PDF print-accurate?',
        answer: 'The PDF page equals your millimeter size (e.g. 40×40mm) with a 10× raster (300+ DPI) filling it, so printing gives the exact physical size.',
      },
      {
        question: 'Can I use it for official documents?',
        answer: 'This tool is for mockups, templates, teaching materials, packaging and personal projects. Legal company seals must be produced under local regulations — do not use generated artwork to forge or misrepresent official stamps.',
      },
      {
        question: 'Why does exporting need internet?',
        answer: 'Before exporting, the fonts you used are subset-embedded from Google Fonts. Preview works offline after the first load; exports fall back to system fonts if offline.',
      },
    ],
  },
}

export function getStampMakerCopy(locale: Locale): StampMakerCopy {
  return locale === 'zh' ? zh : en
}
