/**
 * 截图拼接的中英文案。
 * 英文页 /screenshot-stitch 与中文页 /zh/screenshot-stitch 共用。
 * 可见正文和 JSON-LD 都从这里取，避免两套说法。
 */

import { localizedPath, type Locale } from '@/lib/i18n'

export interface ScreenshotStitchCopy {
  breadcrumb: { label: string; home: string; current: string }
  hero: { title: string; intro: string; badges: readonly string[] }
  honesty: string
  noscript: string
  drop: {
    title: string
    browse: string
    paste: string
    hint: string
    aria: string
  }
  examples: { shots: string; clip: string; failed: string }
  list: {
    title: (count: number, included: number) => string
    empty: string
    sort: string
    clear: string
    remove: string
    moveUp: string
    moveDown: string
    include: string
  }
  controls: {
    title: string
    modeBand: string
    modeFull: string
    band: string
    top: string
    height: string
    redetect: string
    keepFirst: string
    width: string
    widths: { source: string; w720: string; w1080: string; w1440: string }
    scale: string
    scale1: string
    scale2: string
    time: string
    timeHint: string
    copyTimes: string
    copied: string
    copyFailed: string
    export: string
    exporting: string
  }
  preview: { title: string; empty: string; alt: string }
  status: {
    reading: (done: number, total: number) => string
    sampling: (done: number, total: number) => string
    imagesReady: (count: number) => string
    videoReady: (lines: number, samples: number) => string
    bandFallback: string
    lowConfidence: string
    needShots: string
    readFailed: string
    videoFailed: string
    videoIgnoredImages: string
    nothingIncluded: string
    capped: string
    exported: string
    exampleShots: string
    exampleClip: string
  }
  howTo: { title: string; intro: string; steps: readonly { title: string; body: string }[] }
  article: { title: string; paragraphs: readonly string[] }
  compare: {
    title: string
    intro: string
    columns: { job: string; keeps: string; when: string }
    rows: readonly { job: string; keeps: string; when: string }[]
  }
  sections: { features: string; scenarios: string; faqs: string; related: string }
  features: readonly { title: string; description: string }[]
  scenarios: readonly { title: string; description: string }[]
  faqs: readonly { question: string; answer: string }[]
  related: readonly { href: string; title: string; description: string }[]
}

const EN: ScreenshotStitchCopy = {
  breadcrumb: { label: 'Breadcrumb', home: 'Home', current: 'Screenshot stitcher' },
  hero: {
    title: 'Combine screenshots into one long image',
    intro:
      'Drop a run of screenshots, or a video with burned-in captions. The stitcher measures the rows that actually change, keeps the first frame whole, and exports one tall PNG. Nothing is uploaded.',
    badges: ['No sign-up', 'No watermark', 'Stays on your device', 'Video in'],
  },
  honesty:
    'The strip is measured from pixels. This page does not read the words in a caption, and it does not open SRT or VTT files. A very short line can fall between two video samples.',
  noscript: 'This stitcher needs JavaScript. It runs entirely in your browser after the page loads.',
  drop: {
    title: 'Drop screenshots or a video',
    browse: 'Choose files',
    paste: 'You can also paste with Ctrl+V or ⌘V.',
    hint: 'PNG, JPG, WEBP, or one MP4, MOV, or WEBM.',
    aria: 'Add screenshots or a video',
  },
  examples: {
    shots: 'Try example screenshots',
    clip: 'Try an example clip',
    failed: 'The example could not be created in this browser.',
  },
  list: {
    title: (count, included) => `${included} of ${count} included`,
    empty: 'Shots show up here, in the order they will be stacked.',
    sort: 'Sort by name',
    clear: 'Clear',
    remove: 'Remove',
    moveUp: 'Move up',
    moveDown: 'Move down',
    include: 'Include in the long image',
  },
  controls: {
    title: 'Strip and export',
    modeBand: 'Measured strip',
    modeFull: 'Full frames',
    band: 'Detected strip',
    top: 'Top',
    height: 'Height',
    redetect: 'Measure again',
    keepFirst: 'Keep the first frame whole',
    width: 'Width',
    widths: {
      source: 'Original width',
      w720: '720 px',
      w1080: '1080 px',
      w1440: '1440 px',
    },
    scale: 'Scale',
    scale1: '1×',
    scale2: '2×',
    time: 'Print the source time under video rows',
    timeHint: 'Times come from the video clock. Screenshot rows have none.',
    copyTimes: 'Copy times',
    copied: 'Times copied',
    copyFailed: 'Could not copy. Select the times from the list instead.',
    export: 'Download PNG',
    exporting: 'Drawing…',
  },
  preview: {
    title: 'Preview',
    empty: 'Add at least one image to see the long image.',
    alt: 'Preview of the stitched long image',
  },
  status: {
    reading: (done, total) => `Reading ${done} of ${total}…`,
    sampling: (done, total) => `Sampling the video, ${done} of ${total}…`,
    imagesReady: (count) => `${count} screenshots ready. The strip is measured from the rows that changed.`,
    videoReady: (lines, samples) =>
      `${lines} caption changes kept from ${samples} samples. Untick a row to leave it out.`,
    bandFallback:
      'No stable caption strip stood out, so the band starts near the bottom. Drag it if this clip puts captions somewhere else.',
    lowConfidence: 'The rows look similar from top to bottom. Nudge the strip, or switch to full frames.',
    needShots: 'Add two or more screenshots to measure a strip. One image is exported as it is.',
    readFailed: 'One of those files could not be read. The rest are still here.',
    videoFailed: 'This browser could not read that video. Try MP4 or WEBM, or export screenshots and drop those.',
    videoIgnoredImages: 'A video was in the drop, so the screenshots in the same drop were left out.',
    nothingIncluded: 'Tick at least one row before exporting.',
    capped: 'The long image was scaled down so the browser could draw it.',
    exported: 'PNG downloaded.',
    exampleShots: 'Example chat screenshots loaded. The header and the message box repeat; the strip is the conversation.',
    exampleClip: 'Example clip loaded. Each caption change should be its own row.',
  },
  howTo: {
    title: 'How to stitch screenshots into one image',
    intro: 'You bring the shots. The page finds the strip that changed and stacks it.',
    steps: [
      {
        title: 'Add the shots or a video',
        body: 'Drop files, browse, or paste from the clipboard. Screenshots taken in order can be sorted by filename. A video is sampled for you, up to 320 points.',
      },
      {
        title: 'Check the strip',
        body: 'Measured strip keeps the first frame whole and crops the rest to the rows that changed. Drag Top and Height if you want it tighter. Full frames stacks every shot unchanged.',
      },
      {
        title: 'Export a PNG',
        body: 'Pick a width and 1× or 2×, then download. There is no watermark and no account. Video rows can print the source time underneath, or you can copy the times as text.',
      },
    ],
  },
  article: {
    title: 'What the stitcher keeps',
    paragraphs: [
      'A chat, a long page, or a scene often takes several screenshots. Stacking those shots unchanged repeats the header and the footer in the middle of the picture, so the join is a wall of chrome instead of the part that moved.',
      'This page compares every row across the shots you added. Rows that stay put, such as a status bar or a message box, score low. Rows that change score high. The continuous run with the strongest score is the strip, and one correction moves that strip on every later frame. The first frame stays whole so the result still has context.',
      'That measurement is a different job from sliding one scrolling screenshot over the next until the overlap matches. Overlap matching needs the bottom of one shot to repeat the top of the next. A dialogue still does not have that seam: the picture is almost the same and one band of text changes. Use full frames when you want every pixel, and the measured strip when only one band is new.',
      'Dropping a video skips the pause-and-screenshot step. The page samples the clip, looks for rows with dense horizontal edges, and keeps one frame each time the shape of those strokes changes. It never turns the captions into text. If the words already live in an SRT or VTT file, the subtitle converter is the tool that edits them.',
    ],
  },
  compare: {
    title: 'Three ways to stack the same shots',
    intro: 'Pick the one that matches what actually changed between frames.',
    columns: { job: 'Mode', keeps: 'What stays', when: 'Use it when' },
    rows: [
      {
        job: 'Full frames',
        keeps: 'Every screenshot, edge to edge.',
        when: 'The shots are different pictures and should all be visible.',
      },
      {
        job: 'Measured strip',
        keeps: 'The first frame whole, then the rows that changed.',
        when: 'A chat, a page, or dialogue repeats the same chrome.',
      },
      {
        job: 'Video lines',
        keeps: 'One frame per caption change, with an optional time.',
        when: 'The captions are burned into the picture and you still have the file.',
      },
    ],
  },
  sections: {
    features: 'What you can do',
    scenarios: 'What people stitch',
    faqs: 'Frequently asked questions',
    related: 'Related tools',
  },
  features: [
    {
      title: 'A strip measured from your frames',
      description: 'No fixed percentage. The rows that change become the crop, and you can still nudge them.',
    },
    {
      title: 'A video file as the input',
      description: 'MP4, MOV, and WEBM are sampled in the browser. Untick any row you do not want.',
    },
    {
      title: 'Private by default',
      description: 'Decoding, measuring, and export use the Canvas API. The files never leave this tab.',
    },
    {
      title: 'A plain PNG',
      description: '1× or 2×, at the original width or 720, 1080, or 1440. No watermark and no sign-up.',
    },
  ],
  scenarios: [
    {
      title: 'Chat threads',
      description: 'The header and the input bar repeat on every shot. The strip that changes is the conversation.',
    },
    {
      title: 'Pages you scrolled',
      description:
        'When the bars stay put and each shot is roughly a new screen, the new section is the strip. Tiny overlaps are a different problem; full frames keeps them intact.',
    },
    {
      title: 'Tutorial notes',
      description: 'Stack a lesson or a slide run into one image you can scroll, without retyping it.',
    },
    {
      title: 'Dialogue stills',
      description: 'Line-by-line frames from one scene become a column. A video file can supply the frames.',
    },
  ],
  faqs: [
    {
      question: 'How do I stitch screenshots into one long image?',
      answer:
        'Drop the screenshots into the box at the top of the page. They stack from top to bottom. Measured strip keeps the first image whole and crops every image after it to the rows that changed, so the join is the new part rather than a repeated header.',
    },
    {
      question: 'Is this screenshot stitcher free, and does it add a watermark?',
      answer:
        'It is free, it does not ask for an account, and the PNG has no watermark. The work happens in your browser.',
    },
    {
      question: 'Are my screenshots or videos uploaded?',
      answer:
        'No. The page reads the files with the browser File and Canvas APIs, holds them in memory, and writes a download. There is no upload request for the pictures or the video.',
    },
    {
      question: 'Can I stitch screenshots on iPhone or Android?',
      answer:
        'Yes. Open this page in Safari or Chrome, tap the drop area, and pick the shots from your photos. The long image downloads to the device. Very long results use less memory at 1×.',
    },
    {
      question: 'How many screenshots can I stitch at once?',
      answer:
        'There is no fixed count. The limit is the memory of the device and the size of canvas a browser will draw. A few dozen full-size screenshots is a normal run. If the result would be too tall, the export is scaled down and the page says so.',
    },
    {
      question: 'Can I stitch chat screenshots into one image?',
      answer:
        'Yes. Screenshot each screen and drop them in. The header, the input bar, and the status bar land in the low-change rows and are dropped after the first frame. What remains is the part of the thread that moved.',
    },
    {
      question: 'Can I build a subtitle image from a video file?',
      answer:
        'Yes, when the captions are burned into the picture. Drop an MP4, MOV, or WEBM. The page samples up to 320 points, finds the sharp horizontal band, and keeps one frame each time the strokes change. You can untick a row and print the source time under the ones you keep.',
    },
    {
      question: 'Does the stitcher read SRT or VTT files?',
      answer:
        'No. It works on pictures and on burned-in captions. To convert, shift, or merge an SRT or VTT file, use the subtitle converter on this site.',
    },
    {
      question: 'Is this the same as a phone scrolling screenshot?',
      answer:
        'No. A system long screenshot is the phone capturing one page as it scrolls. This page joins screenshots you already have, and it can drop the strip that repeats. It does not drive the scroll for you.',
    },
    {
      question: 'What if the strip is in the wrong place?',
      answer:
        'Drag Top and Height. The same band is applied to every frame after the first, which is what you want for one scene and the wrong tool if each frame needs its own crop. Full frames turns the crop off. Measure again restores the automatic band.',
    },
  ],
  related: [
    {
      href: '/image-combine',
      title: 'Photo collage',
      description: 'Grid layouts and a plain vertical stack when every photo should stay whole.',
    },
    {
      href: '/image-split',
      title: 'Image splitter',
      description: 'Cut one long image into slices or a 3×3 grid after you have stitched it.',
    },
    {
      href: '/video-frame',
      title: 'Video frame extractor',
      description: 'Step through a video yourself and save the exact frames you want.',
    },
    {
      href: '/subtitle-tools',
      title: 'Subtitle converter',
      description: 'Convert, shift, and merge SRT and VTT files. This stitcher does not edit those files.',
    },
  ],
}

const ZH: ScreenshotStitchCopy = {
  breadcrumb: { label: '面包屑', home: '首页', current: '截图拼接' },
  hero: {
    title: '把多张截图拼成一张长图',
    intro:
      '放进一串截图，或一段画面里已经烧了字幕的视频。页面量出真正变化的那些行，第一张留整幅，导出一张长 PNG。文件不上传。',
    badges: ['无需注册', '无水印', '不出本机', '可放视频'],
  },
  honesty:
    '条带是按像素量出来的。这一页不识别字幕写了什么，也不打开 SRT 或 VTT。特别短的一句可能落在两个视频采样点之间。',
  noscript: '拼接需要 JavaScript。页面打开之后，处理完全在你的浏览器里进行。',
  drop: {
    title: '把截图或视频拖进来',
    browse: '选择文件',
    paste: '也可以按 Ctrl+V 或 ⌘V 粘贴。',
    hint: 'PNG、JPG、WEBP，或一个 MP4、MOV、WEBM。',
    aria: '添加截图或视频',
  },
  examples: {
    shots: '试试示例截图',
    clip: '试试示例短片',
    failed: '这个浏览器没能生成示例。',
  },
  list: {
    title: (count, included) => `已选 ${included} / ${count}`,
    empty: '截图会出现在这里，顺序就是从上到下的拼接顺序。',
    sort: '按文件名排序',
    clear: '清空',
    remove: '移除',
    moveUp: '上移',
    moveDown: '下移',
    include: '放进长图',
  },
  controls: {
    title: '条带与导出',
    modeBand: '变化条带',
    modeFull: '整幅堆叠',
    band: '量到的条带',
    top: '顶部',
    height: '高度',
    redetect: '重新测量',
    keepFirst: '第一张保留整幅',
    width: '宽度',
    widths: {
      source: '原始宽度',
      w720: '720 像素',
      w1080: '1080 像素',
      w1440: '1440 像素',
    },
    scale: '倍率',
    scale1: '1×',
    scale2: '2×',
    time: '在视频行下方印上来源时间',
    timeHint: '时间来自视频进度。截图行没有时间。',
    copyTimes: '复制时间',
    copied: '时间已复制',
    copyFailed: '没能写入剪贴板。可以从列表里查看时间。',
    export: '下载 PNG',
    exporting: '正在绘制…',
  },
  preview: {
    title: '预览',
    empty: '至少放入一张图，才能看到长图。',
    alt: '拼接长图的预览',
  },
  status: {
    reading: (done, total) => `正在读取 ${done} / ${total}…`,
    sampling: (done, total) => `正在采样视频 ${done} / ${total}…`,
    imagesReady: (count) => `已放入 ${count} 张截图。条带按变化的那些行量出。`,
    videoReady: (lines, samples) => `从 ${samples} 个采样里留下 ${lines} 处字幕变化。不想要的行可以取消勾选。`,
    bandFallback: '没有量出稳定的字幕带，所以先放在靠近底部的位置。这部片子的字幕若在别处，拖动滑块即可。',
    lowConfidence: '从上到下的行差不太多。可以拖动条带，或改成整幅堆叠。',
    needShots: '放进两张或更多截图才能量条带。只有一张时按原图导出。',
    readFailed: '有一个文件没能读出来，其余的已经留下。',
    videoFailed: '这个浏览器读不了该视频。可以换 MP4 或 WEBM，或先截图再拖进来。',
    videoIgnoredImages: '这一批里有视频，所以同时拖进来的截图没有加入。',
    nothingIncluded: '导出前至少勾选一行。',
    capped: '长图被缩小了，以便浏览器能画出来。',
    exported: 'PNG 已下载。',
    exampleShots: '已载入示例聊天截图。顶栏和输入栏是重复的，条带是对话本身。',
    exampleClip: '已载入示例短片。字幕每换一句，应当单独成行。',
  },
  howTo: {
    title: '怎么把多张截图拼成一张长图',
    intro: '图由你来。页面找出变化的那一条，再把它接起来。',
    steps: [
      {
        title: '放入截图或视频',
        body: '拖进来、点选，或从剪贴板粘贴。按顺序截的图可以按文件名排好。视频由页面自己采样，最多 320 个点。',
      },
      {
        title: '看一下条带',
        body: '变化条带会把第一张留整幅，后面每张只留变化的那些行。想裁紧一点就拖顶部和高度。整幅堆叠则一张不裁。',
      },
      {
        title: '导出 PNG',
        body: '选宽度和 1× 或 2×，然后下载。没有水印，也不用注册。视频行可以把来源时间印在下面，或把时间复制成文本。',
      },
    ],
  },
  article: {
    title: '长图里留下的是哪一部分',
    paragraphs: [
      '一段聊天、一页长内容或一场戏，常常要截好几张。若是原样往下叠，顶栏和底栏会重复出现在画面中间，接缝就变成一截一截的界面，而不是真正往下走的内容。',
      '这一页把你放进来的每一张，按行比较。状态栏、输入框这种不动的行分数低，内容变了的行分数高。分数最高的连续区域就是条带，拖一次，后面每一张都跟着动。第一张留整幅，是为了让成品自己还能看懂。',
      '这和「把上一张的底部对准下一张的顶部、扣掉重叠」不是同一件事。重叠对齐要求两张图在接缝处有一段相同像素。台词截图通常没有这种接缝：画面几乎一样，只有一条字在变。想留住每一个像素，用整幅堆叠；只有一条是新的，用变化条带。',
      '直接放入视频，就不用在播放器里暂停、一句一句截。页面采样整段，寻找横向边缘特别密的那些行，并在笔画形状换成下一句时留下一帧。它不会把字幕变成文字。字如果已经在 SRT 或 VTT 里，该用的是本站的字幕工具。',
    ],
  },
  compare: {
    title: '同一批图的三种叠法',
    intro: '看帧与帧之间到底是哪里变了，再选一种。',
    columns: { job: '方式', keeps: '留下什么', when: '适合' },
    rows: [
      {
        job: '整幅堆叠',
        keeps: '每张图从顶到底都保留。',
        when: '这些图本来就是不同的画面，都要看见。',
      },
      {
        job: '变化条带',
        keeps: '第一张整幅，之后只留变化的行。',
        when: '聊天、网页或台词的外框在每张里重复。',
      },
      {
        job: '视频换句',
        keeps: '字幕每变一次留一帧，可选时间。',
        when: '字幕烧在画面里，而且你还有视频文件。',
      },
    ],
  },
  sections: {
    features: '能做什么',
    scenarios: '适合拼什么',
    faqs: '常见问题',
    related: '相关工具',
  },
  features: [
    {
      title: '条带从你的图里量',
      description: '不用填一个固定百分比。变化的行成为裁切，之后仍可以拖。',
    },
    {
      title: '视频可以直接放',
      description: 'MP4、MOV、WEBM 在浏览器里采样。不想要的行取消勾选。',
    },
    {
      title: '默认留在本机',
      description: '解码、测量和导出都走 Canvas。文件不会离开这个标签页。',
    },
    {
      title: '一张普通 PNG',
      description: '1× 或 2×，原始宽度或 720、1080、1440。无水印，无需注册。',
    },
  ],
  scenarios: [
    {
      title: '聊天记录',
      description: '顶栏和输入栏每张都在。真正变化的那一条，是对话本身。',
    },
    {
      title: '往下滚的页面',
      description: '外框不动、每次大约滚过一屏时，新出来的那段就是条带。只重叠一点点的情况不同，整幅堆叠会把它们原样留下。',
    },
    {
      title: '教程笔记',
      description: '把一节课或一组幻灯片接成一张可以往下翻的图，不用再打一遍字。',
    },
    {
      title: '影视台词',
      description: '同一场戏的逐张截图可以接成一列。有视频文件时，也可以由它抽帧。',
    },
  ],
  faqs: [
    {
      question: '怎么把多张截图拼成一张长图？',
      answer:
        '把截图拖进页面上方的区域，它们会从上到下接成一张。变化条带把第一张留整幅，后面每张只保留变化的那些行，所以接缝是新出现的内容，而不是重复的顶栏。',
    },
    {
      question: '拼接要收费吗？会加水印吗？',
      answer: '免费，不需要账号，导出的 PNG 也没有水印。处理在你的浏览器里完成。',
    },
    {
      question: '截图或视频会被上传吗？',
      answer: '不会。页面用浏览器的文件和 Canvas 接口读取，放在内存里，再写出一个下载。图片和视频没有上传请求。',
    },
    {
      question: 'iPhone 或安卓上能拼吗？',
      answer: '可以。用 Safari 或 Chrome 打开本页，点一下投放区，从相册选择截图。长图会下载到设备上。特别长的结果用 1× 更省内存。',
    },
    {
      question: '一次最多能拼多少张？',
      answer:
        '没有固定张数。上限是设备内存，以及浏览器愿意绘制的画布大小。几十张原尺寸截图是常见的一次用量。结果太高时，导出会自动缩小，并在页面上说明。',
    },
    {
      question: '能把聊天记录截图拼成一张吗？',
      answer: '可以。把每一屏分别截下来再拖进来。顶栏、输入栏和状态栏落在变化很少的行里，第一张之后会被去掉。留下来的是对话里真正往下走的部分。',
    },
    {
      question: '能用视频做成字幕长图吗？',
      answer:
        '可以，前提是字幕已经烧在画面里。放入 MP4、MOV 或 WEBM。页面最多取 320 个采样，找到锐利的横向条带，并在笔画换成下一句时留一帧。你可以取消某一行，也可以把来源时间印在留下的行下面。',
    },
    {
      question: '支持 SRT 或 VTT 字幕文件吗？',
      answer: '不支持。这里处理的是图片，以及烧在画面里的字幕。要转换、平移或合并 SRT、VTT，用本站的字幕工具。',
    },
    {
      question: '这和手机自带的滚动长截图一样吗？',
      answer: '不一样。系统长截图是手机自己一边滚一边截一整页。这一页是把你已经截好的图接起来，并且可以去掉重复的那一条。它不会替你去滚页面。',
    },
    {
      question: '条带位置不对怎么办？',
      answer:
        '拖动顶部和高度。同一条会用在第一张之后的每一帧上，同一场戏适合这样，每张都要不同裁法时则不适合。整幅堆叠会关掉裁切。重新测量会回到自动结果。',
    },
  ],
  related: [
    {
      href: '/zh/image-combine',
      title: '图片拼接',
      description: '网格排版，以及每张都要完整保留时的纵向堆叠。',
    },
    {
      href: '/zh/image-split',
      title: '长图切割',
      description: '拼好之后，把一张长图切成多片或 3×3 九宫格。',
    },
    {
      href: '/zh/video-frame',
      title: '视频截帧',
      description: '自己逐帧看视频，保存你指定的那一帧。',
    },
    {
      href: '/zh/subtitle-tools',
      title: '字幕工具',
      description: '转换、平移、合并 SRT 和 VTT。截图拼接不编辑这些文件。',
    },
  ],
}

export function getScreenshotStitchCopy(locale: Locale): ScreenshotStitchCopy {
  const copy = locale === 'zh' ? ZH : EN
  return {
    ...copy,
    related: copy.related.map((item) => ({
      ...item,
      href: localizedPath(locale, item.href.replace(/^\/zh/, '') || '/'),
    })),
  }
}
