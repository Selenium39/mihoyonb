/**
 * 拼豆图纸工具的中英文案（/zh/pindou 与 /pindou 共用）。
 *
 * 约定：
 * - 中文文案与重构前的实现逐字一致，避免改动已有的排序与收录；
 * - 英文文案按英文市场习惯重写（非直译），围绕 perler / hama / artkal / fuse beads；
 * - 动态句式用函数表达，保证两种语言的语序与单位都能本地化；
 * - JSX 里不再出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

export interface PindouCopy {
  languageSwitch: {
    label: string
    ariaLabel: string
  }
  hero: {
    title: string
    badge: string
    intro: string
  }
  size: {
    cardTitle: string
    widthLabel: string
    widthAria: string
    originalRatio: string
    squareCrop: string
    heightHint: (rows: number, square: boolean) => string
    heightHintEmpty: string
    heightClamped: (minRows: number, maxRows: number) => string
  }
  color: {
    cardTitle: string
    on: string
    off: string
    removeBackground: string
    removeBackgroundHint: string
    backgroundThreshold: string
    mergeSimilar: string
    mergeThreshold: string
    mergeHint: string
    limitColors: string
    maxColors: string
    paletteLine: (name: string, count: number, note: string) => string
    regenerate: string
  }
  exportCard: {
    cardTitle: string
    downloadPng: string
    csvList: string
    copyText: string
    copied: string
    hint: string
    pngFailedBlob: string
    pngFailed: string
    copyFailed: string
    pngFileName: (cols: number, rows: number) => string
    csvFileName: (cols: number, rows: number) => string
  }
  upload: {
    dropIdle: string
    decoding: string
    supported: string
    unsupportedType: string
    tooLarge: string
    decodeFailed: string
    thumbnailAlt: string
    originalSize: (width: number, height: number, sizeLabel: string, replacing: boolean) => string
    reselect: string
    clear: string
  }
  preview: {
    cardTitle: string
    gridSize: (cols: number, rows: number) => string
    waiting: string
    zoomLabel: string
    codesShown: string
    codesHidden: string
    empty: string
    noPixels: string
    canvasAria: string
    codesHintSmall: string
    codesHintNormal: string
    highlightHint: (code: string) => string
    backgroundReverted: string
    backgroundRemoved: (count: number) => string
  }
  usage: {
    cardTitle: string
    summary: (beads: number, colors: number) => string
    barAria: string
    swatchTitle: (code: string, name: string, count: number) => string
    byCount: string
    byCode: string
  }
  steps: {
    sectionTitle: string
    heading: (index: number) => string
    items: readonly string[]
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
  /** 仅英文页渲染的联盟导购块 */
  affiliate: {
    title: string
    description: string
    brandCta: (brand: string) => string
    disclosure: string
  }
  errors: {
    generateFailed: string
  }
}

const ZH: PindouCopy = {
  languageSwitch: {
    label: 'English',
    ariaLabel: '切换到英文版',
  },
  hero: {
    title: '拼豆图纸生成器',
    badge: '本地处理 · 图片不上传',
    intro:
      '免费把照片转成可打印的拼豆图纸。上传图片后在浏览器本地完成图片转拼豆、色号对照和用量统计，不经过任何上传接口。',
  },
  size: {
    cardTitle: '图纸尺寸',
    widthLabel: '宽度（格）',
    widthAria: '图纸宽度格数',
    originalRatio: '按原图比例',
    squareCrop: '正方形裁剪',
    heightHint: (rows, square) =>
      `高度 ${rows} 格${square ? '，取画面中心的正方形。' : '，按原图比例计算。'}`,
    heightHintEmpty:
      '上传图片后按比例计算高度。宽度建议：小挂件 24 格左右，照片 48–72 格。',
    heightClamped: (minRows, maxRows) =>
      `原图太高或太扁，高度已限制在 ${minRows}–${maxRows} 格，画面比例会有一点变化。`,
  },
  color: {
    cardTitle: '颜色',
    on: '已开启',
    off: '关闭',
    removeBackground: '简单去背景',
    removeBackgroundHint:
      '从边缘向内去掉接近边缘主色的区域，适合白底或纯色底。空白格不计入颗数。',
    backgroundThreshold: '去背景强度',
    mergeSimilar: '合并相近色',
    mergeThreshold: '合并阈值',
    mergeHint: '数值越大，越容易把邻近色号并到一起。',
    limitColors: '颜色数上限',
    maxColors: '最多色号',
    paletteLine: (name, count, note) => `当前色板：${name}（共 ${count} 色）。${note}`,
    regenerate: '重新生成',
  },
  exportCard: {
    cardTitle: '导出',
    downloadPng: '下载高清 PNG',
    csvList: 'CSV 清单',
    copyText: '复制文本',
    copied: '已复制',
    hint: 'PNG 带网格、色号、坐标和用量图例，适合彩色打印。CSV 按颗数从多到少排列，方便采购。',
    pngFailedBlob: '导出 PNG 失败，请降低图纸宽度后再试',
    pngFailed: '导出 PNG 失败',
    copyFailed: '复制失败，请改用 CSV 下载',
    pngFileName: (cols, rows) => `拼豆图纸-${cols}x${rows}.png`,
    csvFileName: (cols, rows) => `拼豆用量-${cols}x${rows}.csv`,
  },
  upload: {
    dropIdle: '点击选择或拖拽图片到此处',
    decoding: '图片解码中…',
    supported: '支持 JPG、PNG、WebP，仅在本地处理',
    unsupportedType: '请上传 JPG、PNG 或 WebP 图片',
    tooLarge: '图片超过 40MB，请先压缩后再试',
    decodeFailed: '这张图片无法解码，请换一张 JPG、PNG 或 WebP',
    thumbnailAlt: '原图缩略',
    originalSize: (width, height, sizeLabel, replacing) =>
      `原图 ${width} × ${height} 像素${sizeLabel ? ` · ${sizeLabel}` : ''}${
        replacing ? ' · 正在更换图片…' : ''
      }`,
    reselect: '重新选择',
    clear: '清除',
  },
  preview: {
    cardTitle: '图纸预览',
    gridSize: (cols, rows) => `${cols} × ${rows} 格`,
    waiting: '等待图片',
    zoomLabel: '放大预览',
    codesShown: '色号已显示',
    codesHidden: '显示色号',
    empty: '还没有图片。上传后会在这里生成拼豆网格、色号和用量。',
    noPixels: '这张图没有可用的像素。如果开了去背景，先把它关掉再试。',
    canvasAria: '拼豆图纸预览',
    codesHintSmall: '当前格子较小，色号会在放大后显示。导出的 PNG 始终带色号。',
    codesHintNormal: '格子中央是色号。棋盘格是空白，不需要拼。',
    highlightHint: (code) => ` 正在只看 ${code}。再点一次用量列表可取消。`,
    backgroundReverted: '去背景范围太大，几乎整张图都被去掉了，这次已保留原图。请把强度调低。',
    backgroundRemoved: (count) => `已去除背景 ${count} 格，这些位置不计入用量。`,
  },
  usage: {
    cardTitle: '用量统计',
    summary: (beads, colors) => `${beads} 颗 · ${colors} 色`,
    barAria: '色号用量比例',
    swatchTitle: (code, name, count) => `${code} ${name} ${count} 颗`,
    byCount: '按颗数',
    byCode: '按色号',
  },
  steps: {
    sectionTitle: '怎么把图片转成拼豆图纸',
    heading: (index) => `第 ${index} 步`,
    items: [
      '上传 JPG、PNG 或 WebP。文件只留在浏览器里，不上传服务器。',
      '设置宽度格数。高度按比例生成，也可以锁定正方形裁剪。',
      '看色号和用量，导出带网格的高清 PNG，或下载 CSV 采购清单。',
    ],
  },
  features: {
    sectionTitle: '功能特性',
    items: [
      {
        title: '照片转拼豆图纸',
        description: '上传 JPG、PNG 或 WebP，按格数采样成方格图，适合直接对照着拼。',
      },
      {
        title: '感知色差配色',
        description: '每格先取平均色，再用 CIE Lab 色差匹配 96 色数字参考色里最接近的色号。',
      },
      {
        title: '色号与用量',
        description: '预览网格标出色号，并统计每个色号要买多少颗，可导出 CSV 或复制文本清单。',
      },
      {
        title: '本地处理不上传',
        description: '解码、配色、出图都在浏览器里完成，图片不经过服务器，断网也能用，完全免费。',
      },
    ],
  },
  scenarios: {
    sectionTitle: '使用场景',
    items: [
      {
        title: '钥匙扣和冰箱贴',
        description: '宽度设在 16–32 格，颜色再收一收，小挂件一下午就能拼完。',
      },
      {
        title: '照片人像',
        description: '人像常用 40–72 格宽。打开颜色上限，肤色会更整、更好买齐。',
      },
      {
        title: '可打印图纸',
        description: 'PNG 自带网格、坐标、色号和用量图例，彩色打印后就可以上板。',
      },
      {
        title: '纯色背景的素材',
        description: '白底、纯色底可以试试边缘去背景，空白格不计入颗数。',
      },
    ],
  },
  faqs: {
    sectionTitle: '常见问题',
    items: [
      {
        question: '这是免费的拼豆图纸生成器吗？图片会上传吗？',
        answer:
          '免费，也不用注册。上传的 JPG、PNG、WebP 只在你的浏览器里用 Canvas 处理，没有上传接口，服务器拿不到原图。',
      },
      {
        question: '色号是官方 MARD 色卡吗？',
        answer:
          '色板是本站整理的 96 色数字参考色，色号用了拼豆圈常见的字母加数字写法，HEX 是屏幕近似值，用来把照片转成可对照的图纸和用量。它不是某一品牌的官方色卡，下单前请拿实物色卡再对一次。',
      },
      {
        question: '图纸宽度怎么选？',
        answer:
          '宽度是横向格数，范围 16–128，默认 48。高度按原图比例自动算。小挂件用 24 格左右，照片人像用 48–72 格。格数越多越像原图，也越费珠子。',
      },
      {
        question: '锁定正方形裁剪会怎样？',
        answer:
          '打开后高度等于宽度，并取原图正中的正方形。适合头像、表情包这类本来就想做成方图的素材。',
      },
      {
        question: '背景去除怎么用？',
        answer:
          '它从画面边缘向里找和边缘主色接近的连通区域，把这些格子变成空白，不计入用量。适合白底或纯色底。主体贴着边缘、或背景和主体颜色很近时，可能会多去掉一块，把阈值调小即可。阈值大到几乎整张图都被去掉时，会自动放弃这次去除。',
      },
      {
        question: '颜色上限和合并相近色有什么区别？',
        answer:
          '合并相近色会把色差小于阈值的两个色号并成用量更多的那个，适合收掉几乎一样的邻近色。颜色上限则只保留用量最多的若干色，其余格子按原图颜色重新就近匹配。可以两个一起开：先合并，再按颗数封顶。',
      },
      {
        question: '导出的 PNG 怎么打印？',
        answer:
          'PNG 里有网格、色号、行列坐标和用量图例。用系统图片查看或浏览器打开后彩色打印。格子很多时选“适合页面”，想按珠子尺寸估大小时再按实际尺寸打印。CSV 和文本清单用来对着用量表采购。',
      },
    ],
  },
  affiliate: {
    title: '拼豆哪里买',
    description: '按图纸上统计的色号和颗数去挑拼豆套装，省得买错颜色。',
    brandCta: (brand) => `在 Amazon 购买 ${brand} 拼豆`,
    disclosure: '作为 Amazon Associates 成员，我们会从符合条件的购买中获得佣金。',
  },
  errors: {
    generateFailed: '生成图纸失败',
  },
}

const EN: PindouCopy = {
  languageSwitch: {
    label: '中文',
    ariaLabel: 'Switch to Chinese',
  },
  hero: {
    title: 'Perler Bead Pattern Generator',
    badge: 'Runs in your browser · Image never uploaded',
    intro:
      'Turn any photo into a printable perler bead pattern — free, no signup and no upload. Pick a grid size, match every cell to the closest bead color, then export a PNG blueprint with bead codes plus a CSV shopping list. Works with Perler, Hama, Artkal and any other 5 mm fuse beads, and your image is processed locally so it never leaves your device.',
  },
  size: {
    cardTitle: 'Pattern size',
    widthLabel: 'Width (beads)',
    widthAria: 'Pattern width in beads',
    originalRatio: 'Keep photo ratio',
    squareCrop: 'Square crop',
    heightHint: (rows, square) =>
      square
        ? `Height ${rows} beads — the center square of your photo is used.`
        : `Height ${rows} beads, scaled from your photo.`,
    heightHintEmpty:
      'Upload a photo and the height is calculated for you. A good starting point: about 24 beads wide for keychains, 48–72 for portrait photos.',
    heightClamped: (minRows, maxRows) =>
      `Your photo is very tall or very wide, so the height has been limited to ${minRows}–${maxRows} beads. The proportions will shift slightly.`,
  },
  color: {
    cardTitle: 'Colors',
    on: 'On',
    off: 'Off',
    removeBackground: 'Simple background remover',
    removeBackgroundHint:
      'Removes the areas close to the border color, working inward from the edges — ideal for white or solid backgrounds. Removed cells are not counted as beads.',
    backgroundThreshold: 'Removal strength',
    mergeSimilar: 'Merge similar colors',
    mergeThreshold: 'Merge threshold',
    mergeHint: 'Higher values merge neighboring bead codes more aggressively.',
    limitColors: 'Color limit',
    maxColors: 'Max colors',
    paletteLine: (name, count, note) => `Current palette: ${name} (${count} colors). ${note}`,
    regenerate: 'Regenerate pattern',
  },
  exportCard: {
    cardTitle: 'Export',
    downloadPng: 'Download HD PNG',
    csvList: 'CSV list',
    copyText: 'Copy text list',
    copied: 'Copied',
    hint: 'The PNG includes the grid, bead codes, row and column coordinates and a usage legend — great for color printing. The CSV is sorted by bead count, ready for your shopping trip.',
    pngFailedBlob: 'PNG export failed. Try a smaller grid width and export again.',
    pngFailed: 'PNG export failed',
    copyFailed: 'Copy failed — please download the CSV instead.',
    pngFileName: (cols, rows) => `perler-bead-pattern-${cols}x${rows}.png`,
    csvFileName: (cols, rows) => `perler-bead-shopping-list-${cols}x${rows}.csv`,
  },
  upload: {
    dropIdle: 'Click to choose a photo, or drag and drop it here',
    decoding: 'Decoding image…',
    supported: 'JPG, PNG or WebP · processed locally',
    unsupportedType: 'Please upload a JPG, PNG or WebP image',
    tooLarge: 'This image is over 40 MB — compress it and try again',
    decodeFailed: 'This image could not be decoded. Please try another JPG, PNG or WebP.',
    thumbnailAlt: 'Original photo thumbnail',
    originalSize: (width, height, sizeLabel, replacing) =>
      `Original ${width} × ${height} px${sizeLabel ? ` · ${sizeLabel}` : ''}${
        replacing ? ' · Replacing image…' : ''
      }`,
    reselect: 'Choose another',
    clear: 'Clear',
  },
  preview: {
    cardTitle: 'Pattern preview',
    gridSize: (cols, rows) => `${cols} × ${rows} beads`,
    waiting: 'Waiting for image',
    zoomLabel: 'Zoom preview',
    codesShown: 'Codes shown',
    codesHidden: 'Show codes',
    empty:
      'No image yet. Upload one and the bead grid, color codes and bead counts will appear here.',
    noPixels:
      'This image has no usable pixels. If background removal is on, turn it off and try again.',
    canvasAria: 'Perler bead pattern preview',
    codesHintSmall:
      'Cells are small at this zoom, so bead codes appear when you zoom in. The exported PNG always includes them.',
    codesHintNormal:
      'The code in each cell is the bead color. Checkerboard cells are empty and not part of the pattern.',
    highlightHint: (code) => ` Showing only ${code}. Click the usage list again to clear.`,
    backgroundReverted:
      'Background removal covered almost the whole image, so the original was kept. Lower the strength and try again.',
    backgroundRemoved: (count) =>
      `Removed ${count} background cells — these are not counted in the usage.`,
  },
  usage: {
    cardTitle: 'Bead usage',
    summary: (beads, colors) => `${beads} beads · ${colors} colors`,
    barAria: 'Share of beads by color',
    swatchTitle: (code, name, count) => `${code} ${name} ${count} beads`,
    byCount: 'By count',
    byCode: 'By code',
  },
  steps: {
    sectionTitle: 'How to turn a photo into a bead pattern',
    heading: (index) => `Step ${index}`,
    items: [
      'Upload a JPG, PNG or WebP. The file stays in your browser and is never sent to a server.',
      'Set the width in beads. The height follows your photo, or lock it to a square crop.',
      'Review the bead codes and counts, then export a high-resolution PNG with grid lines or download the CSV shopping list.',
    ],
  },
  features: {
    sectionTitle: 'Features',
    items: [
      {
        title: 'Photo to bead pattern',
        description:
          'Upload a JPG, PNG or WebP and it is sampled into a tidy fuse bead grid you can follow cell by cell.',
      },
      {
        title: 'Perceptual color matching',
        description:
          'Each cell is averaged and then matched to the closest code in a 96-color numeric chart using CIE Lab color difference.',
      },
      {
        title: 'Bead codes and counts',
        description:
          'Every cell is labeled with its code, and each color is totaled so you know how many beads to buy — export as CSV or copy as text.',
      },
      {
        title: 'Private, free, offline',
        description:
          'Decoding, matching and rendering all run in your browser. Your image never reaches a server, it works offline, and it is completely free.',
      },
    ],
  },
  scenarios: {
    sectionTitle: 'What you can make',
    items: [
      {
        title: 'Keychains and magnets',
        description:
          'Set the width to 16–32 beads and trim the colors — a small charm is an afternoon project.',
      },
      {
        title: 'Portrait photos',
        description:
          'Portraits usually work best at 40–72 beads wide. Raise the color limit so skin tones stay smooth and easy to buy.',
      },
      {
        title: 'Printable patterns',
        description:
          'The PNG ships with a grid, coordinates, bead codes and a usage legend — print it in color and start placing beads.',
      },
      {
        title: 'Solid-background artwork',
        description:
          'For white or flat backgrounds, try the background remover. Empty cells are never counted as beads.',
      },
    ],
  },
  faqs: {
    sectionTitle: 'Frequently asked questions',
    items: [
      {
        question: 'Is this perler bead pattern generator really free? Do I need to sign up?',
        answer:
          'Yes — it is completely free, with no account, no email and no watermark. There is no upload endpoint either: your JPG, PNG or WebP is read with Canvas inside your browser, so the original photo never reaches our server.',
      },
      {
        question: 'Are these official Perler, Hama or Artkal color codes?',
        answer:
          'The palette is our own 96-color numeric reference chart. Codes use the letter-plus-number style common in bead crafts, and the HEX values are screen approximations chosen to turn a photo into a pattern you can follow and count. It is not any brand’s official color chart — check your physical beads or a brand swatch card before ordering.',
      },
      {
        question: 'How wide should my bead pattern be?',
        answer:
          'Width is the number of beads across, from 16 to 128, and defaults to 48. The height follows your photo automatically. Keychains and small charms are usually about 24 beads wide, portrait photos 48–72. More beads means more detail and more beads to buy.',
      },
      {
        question: 'What does the square crop option do?',
        answer:
          'It locks the height to the width and keeps the center square of your photo, which suits avatars, stickers and any image you already want as a square.',
      },
      {
        question: 'How does the background remover work?',
        answer:
          'It searches inward from the image border for connected areas close to the dominant border color and turns those cells into empty squares, which are not counted toward your bead totals. It works best on white or solid backgrounds. If your subject touches the edge, or the background resembles the subject, lower the strength; if almost the whole image would be removed, the tool keeps the original instead.',
      },
      {
        question: 'What is the difference between the color limit and merging similar colors?',
        answer:
          'Merging similar colors folds two bead codes closer than the threshold into the one used more often, which cleans up near-identical neighbors. The color limit keeps only the most-used colors and remaps the rest to their nearest match. You can use both: merge first, then cap by bead count.',
      },
      {
        question: 'How do I print the exported PNG, and what is the CSV for?',
        answer:
          'The PNG includes the grid, bead codes, row and column coordinates and a usage legend. Open it in any image viewer or browser and print in color: choose “fit to page” for large grids, or print at actual size to estimate the finished piece. The CSV and text list are the shopping list — they pair every bead code with the number of beads you need.',
      },
    ],
  },
  affiliate: {
    title: 'Where to buy beads',
    description:
      'Need the beads for your pattern? These searches open Amazon results for beads from these brands — compare them with the codes and counts above so you buy the colors and amounts you actually need.',
    brandCta: (brand) => `Shop ${brand} beads on Amazon`,
    disclosure: 'As an Amazon Associate we earn from qualifying purchases.',
  },
  errors: {
    generateFailed: 'Could not generate the pattern',
  },
}

export const PINDOU_COPY: Record<Locale, PindouCopy> = {
  zh: ZH,
  en: EN,
}

export function getPindouCopy(locale: Locale): PindouCopy {
  return PINDOU_COPY[locale] ?? ZH
}
