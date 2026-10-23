/**
 * 图片拼接工具的中英文案（/zh/image-combine 与 /image-combine 共用）。
 *
 * 约定：
 * - 中文文案与重构前的实现逐字一致（标点、空格、括号都不动），避免改动已有收录；
 * - 英文文案按英文搜索习惯撰写，围绕 photo collage maker / combine images /
 *   image grid / photo grid 等关键词，不直译中文句式；
 * - 带数字/单位的句式用函数表达，保证两种语言的语序与单位都能本地化；
 * - JSX 里不再出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

export interface ImageCombineCopy {
  languageSwitch: {
    label: string
    ariaLabel: string
  }
  hero: {
    title: string
    intro: string
  }
  layoutPanel: {
    cardTitle: string
    tabs: {
      layout: string
      stitching: string
    }
    imagesCount: (count: number) => string
    stitchDirection: string
    horizontal: string
    vertical: string
  }
  canvas: {
    text: string
    arrow: string
    rectangle: string
    circle: string
    shuffle: string
    clear: string
    selectImage: string
    imageAlt: (index: number) => string
    pasteHint: string
    emptyUploadTitle: string
    emptyUploadHorizontal: string
    emptyUploadVertical: string
    stitchedImageAlt: string
    addImage: string
    removeImage: string
  }
  elements: {
    defaultText: string
    defaultWatermarkText: string
    watermarkAlt: string
    fontSize: string
    strokeWidth: string
    changeColor: string
    copyElement: string
    deleteElement: string
  }
  settings: {
    cardTitle: string
    aspectRatio: string
    customRatio: string
    widthPlaceholder: string
    heightPlaceholder: string
    apply: string
    marginLabel: string
    marginTop: string
    marginRight: string
    marginBottom: string
    marginLeft: string
    spacing: (px: number) => string
    radius: (px: number) => string
    backgroundColor: string
    backgroundImage: string
    uploadImage: string
    removeImage: string
    watermark: {
      title: string
      enable: string
      type: string
      typeText: string
      typeImage: string
      mode: string
      modeSingle: string
      modeTiled: string
      text: string
      textPlaceholder: string
      fontSize: (px: number) => string
      color: string
      image: string
      position: string
      positionTopLeft: string
      positionCenter: string
      positionTopRight: string
      positionBottomLeft: string
      positionBottomRight: string
      spacing: (px: number) => string
      rotation: (deg: number) => string
      opacity: (percent: number) => string
    }
    export: {
      title: string
      quality: (quality: string) => string
      button: (formatLabel: string) => string
      hint: string
      failed: string
      fileName: (mode: 'layout' | 'stitching', ext: string, stamp: number) => string
    }
  }
}

export const ZH: ImageCombineCopy = {
  languageSwitch: {
    label: 'English',
    ariaLabel: '切换到英文版',
  },
  hero: {
    title: '图片拼接',
    intro:
      '支持多种网格布局和自定义图片拼接，轻松上传图片，调整间距、圆角和背景，创作出个性化的照片拼接作品。',
  },
  layoutPanel: {
    cardTitle: '布局选择',
    tabs: {
      layout: '布局拼接',
      stitching: '长图拼接',
    },
    imagesCount: (count) => `${count} 张图片`,
    stitchDirection: '拼接方向',
    horizontal: '横向',
    vertical: '竖向',
  },
  canvas: {
    text: '文字',
    arrow: '箭头',
    rectangle: '方框',
    circle: '圆圈',
    shuffle: '随机排序',
    clear: '清空',
    selectImage: '选择图片',
    imageAlt: (index) => `拼图 ${index}`,
    pasteHint: '💡 支持粘贴图片（Ctrl+V / Cmd+V），可以拖拽图片进行位置交换',
    emptyUploadTitle: '点击选择图片',
    emptyUploadHorizontal: '横向拼接',
    emptyUploadVertical: '竖向拼接',
    stitchedImageAlt: '拼接图片',
    addImage: '添加图片',
    removeImage: '删除图片',
  },
  elements: {
    defaultText: '文字',
    defaultWatermarkText: '水印文字',
    watermarkAlt: '水印',
    fontSize: '字体大小',
    strokeWidth: '线条粗细',
    changeColor: '更改颜色',
    copyElement: '复制元素',
    deleteElement: '删除元素',
  },
  settings: {
    cardTitle: '画布设置',
    aspectRatio: '画布比例',
    customRatio: '自定义比例',
    widthPlaceholder: '宽',
    heightPlaceholder: '高',
    apply: '应用',
    marginLabel: '边距 (上/右/下/左) px',
    marginTop: '上',
    marginRight: '右',
    marginBottom: '下',
    marginLeft: '左',
    spacing: (px) => `间距: ${px}px`,
    radius: (px) => `圆角: ${px}px`,
    backgroundColor: '背景颜色',
    backgroundImage: '背景图片',
    uploadImage: '上传图片',
    removeImage: '移除图片',
    watermark: {
      title: '水印设置',
      enable: '启用',
      type: '水印类型',
      typeText: '文字水印',
      typeImage: '图片水印',
      mode: '水印模式',
      modeSingle: '单个水印',
      modeTiled: '全图水印',
      text: '水印文字',
      textPlaceholder: '输入水印文字',
      fontSize: (px) => `字体大小: ${px}px`,
      color: '文字颜色',
      image: '水印图片',
      position: '水印位置',
      positionTopLeft: '左上',
      positionCenter: '居中',
      positionTopRight: '右上',
      positionBottomLeft: '左下',
      positionBottomRight: '右下',
      spacing: (px) => `水印间距: ${px}px`,
      rotation: (deg) => `旋转角度: ${deg}°`,
      opacity: (percent) => `透明度: ${percent}%`,
    },
    export: {
      title: '导出图片',
      quality: (quality) => `质量: ${quality}`,
      button: (formatLabel) => `导出 ${formatLabel}`,
      hint: 'PNG支持透明背景，JPEG/WebP可调节质量，文件更小',
      failed: '导出失败，请重试',
      fileName: (mode, ext, stamp) => `${mode}-collage-${stamp}.${ext}`,
    },
  },
}

export const EN: ImageCombineCopy = {
  languageSwitch: {
    label: '中文',
    ariaLabel: 'Switch to Chinese',
  },
  hero: {
    title: 'Photo Collage Maker',
    intro:
      'Combine several photos into one picture with ready-made grid layouts. Upload your images, then fine-tune spacing, rounded corners and background colors — everything runs in your browser.',
  },
  layoutPanel: {
    cardTitle: 'Layouts',
    tabs: {
      layout: 'Grid collage',
      stitching: 'Long image stitch',
    },
    imagesCount: (count) => `${count} ${count === 1 ? 'photo' : 'photos'}`,
    stitchDirection: 'Stitch direction',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
  },
  canvas: {
    text: 'Text',
    arrow: 'Arrow',
    rectangle: 'Rectangle',
    circle: 'Circle',
    shuffle: 'Shuffle',
    clear: 'Clear',
    selectImage: 'Choose photo',
    imageAlt: (index) => `Collage photo ${index}`,
    pasteHint: '💡 Paste images with Ctrl+V / Cmd+V, or drag a photo onto another cell to swap them',
    emptyUploadTitle: 'Click to choose photos',
    emptyUploadHorizontal: 'Stitch horizontally',
    emptyUploadVertical: 'Stitch vertically',
    stitchedImageAlt: 'Stitched image',
    addImage: 'Add image',
    removeImage: 'Remove image',
  },
  elements: {
    defaultText: 'Text',
    defaultWatermarkText: 'WATERMARK',
    watermarkAlt: 'Watermark',
    fontSize: 'Font size',
    strokeWidth: 'Line width',
    changeColor: 'Change color',
    copyElement: 'Duplicate element',
    deleteElement: 'Delete element',
  },
  settings: {
    cardTitle: 'Canvas settings',
    aspectRatio: 'Canvas ratio',
    customRatio: 'Custom ratio',
    widthPlaceholder: 'W',
    heightPlaceholder: 'H',
    apply: 'Apply',
    marginLabel: 'Margins (top/right/bottom/left) px',
    marginTop: 'Top',
    marginRight: 'Right',
    marginBottom: 'Bottom',
    marginLeft: 'Left',
    spacing: (px) => `Spacing: ${px}px`,
    radius: (px) => `Corner radius: ${px}px`,
    backgroundColor: 'Background color',
    backgroundImage: 'Background image',
    uploadImage: 'Upload image',
    removeImage: 'Remove image',
    watermark: {
      title: 'Watermark',
      enable: 'Enable',
      type: 'Watermark type',
      typeText: 'Text watermark',
      typeImage: 'Image watermark',
      mode: 'Watermark mode',
      modeSingle: 'Single watermark',
      modeTiled: 'Tiled watermark',
      text: 'Watermark text',
      textPlaceholder: 'Enter watermark text',
      fontSize: (px) => `Font size: ${px}px`,
      color: 'Text color',
      image: 'Watermark image',
      position: 'Watermark position',
      positionTopLeft: 'Top left',
      positionCenter: 'Center',
      positionTopRight: 'Top right',
      positionBottomLeft: 'Bottom left',
      positionBottomRight: 'Bottom right',
      spacing: (px) => `Watermark spacing: ${px}px`,
      rotation: (deg) => `Rotation: ${deg}°`,
      opacity: (percent) => `Opacity: ${percent}%`,
    },
    export: {
      title: 'Export image',
      quality: (quality) => `Quality: ${quality}`,
      button: (formatLabel) => `Export ${formatLabel}`,
      hint: 'PNG keeps a transparent background; JPEG and WebP let you lower the quality for a smaller file.',
      failed: 'Export failed. Please try again.',
      fileName: (mode, ext, stamp) =>
        `${mode === 'layout' ? 'photo-collage' : 'long-image'}-${stamp}.${ext}`,
    },
  },
}

const COPIES: Record<Locale, ImageCombineCopy> = { zh: ZH, en: EN }

export function getImageCombineCopy(locale: Locale): ImageCombineCopy {
  return COPIES[locale] ?? ZH
}
