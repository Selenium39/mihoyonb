/**
 * 视频截帧工具的中英文案（/video-frame 与 /en/video-frame 共用）。
 *
 * 约定：
 * - 中文文案与重构前的实现逐字一致（含标点、空格、括号），避免改动已有页面；
 * - 英文文案按英文市场习惯重写（非直译），围绕 video frame extractor /
 *   extract frames from video / video to image / capture frame；
 * - 动态句式用函数表达，保证两种语言的语序、单位与标点都能本地化；
 * - JSX 里不再出现硬编码文案，一律从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

export interface VideoFrameCopy {
  languageSwitch: {
    label: string
    ariaLabel: string
  }
  hero: {
    title: string
    intro: string
  }
  exportSettings: {
    cardTitle: string
    formatLabel: string
    formatHint: string
    quality: (percent: number) => string
    batchTitle: string
    intervalLabel: (value: string) => string
    estimated: (frames: number) => string
    estimatedWarning: string
    progress: (current: number, total: number) => string
    startZip: string
  }
  upload: {
    dropIdle: string
    supported: string
    localOnly: string
    decodeFailed: string
    reselect: string
  }
  player: {
    playTitle: string
    pauseTitle: string
    prevFrameTitle: string
    nextFrameTitle: string
    captureTitle: string
    capture: string
    shortcutHint: string
    removeVideo: string
    frameAlt: (time: string) => string
  }
  frames: {
    cardTitle: (count: number) => string
    clear: string
    emptyTitle: string
    emptyHint: string
    downloadTitle: string
    deleteTitle: string
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
    notVideo: string
    frameCapture: string
    confirmBatch: (total: number) => string
    partial: (failed: number) => string
    batchFailed: (message: string) => string
    retry: string
    batchFailedLog: string
  }
  files: {
    singleFrame: (time: number, ext: string) => string
    batchZip: (timestamp: string) => string
  }
}

export const ZH: VideoFrameCopy = {
  languageSwitch: {
    label: 'English',
    ariaLabel: '切换到英文版',
  },
  hero: {
    title: '视频截帧',
    intro:
      '在浏览器中直接从本地视频截取画面，支持逐帧定位、单帧导出与按间隔批量抽帧打包，视频不上传，隐私安全。',
  },
  exportSettings: {
    cardTitle: '导出设置',
    formatLabel: '导出格式',
    formatHint: 'PNG 无损；JPEG/WebP 体积更小',
    quality: (percent) => `质量：${percent}%`,
    batchTitle: '批量自动抽帧',
    intervalLabel: (value) => `抽帧间隔：${value} 秒`,
    estimated: (frames) => `预计抽取 ${frames} 帧`,
    estimatedWarning: '，数量较多，处理可能耗时较长',
    progress: (current, total) => `正在抽帧 ${current}/${total}`,
    startZip: '开始抽帧并打包 ZIP',
  },
  upload: {
    dropIdle: '点击选择或拖拽视频到此处',
    supported: '支持 MP4、WebM 等浏览器可播放的格式',
    localOnly: '视频仅在本地处理，不会上传服务器',
    decodeFailed: '当前浏览器无法解码该视频，请更换 MP4 / WebM 等常用格式',
    reselect: '重新选择视频',
  },
  player: {
    playTitle: '播放（空格）',
    pauseTitle: '暂停（空格）',
    prevFrameTitle: '上一帧（←）',
    nextFrameTitle: '下一帧（→）',
    captureTitle: '截取当前帧',
    capture: '截帧',
    shortcutHint: '快捷键：空格 播放/暂停 · ←/→ 逐帧',
    removeVideo: '移除视频',
    frameAlt: (time) => `截帧 ${time}`,
  },
  frames: {
    cardTitle: (count) => `截帧列表（${count}）`,
    clear: '清空',
    emptyTitle: '暂无截帧',
    emptyHint: '播放视频到目标画面后，点击「截帧」按钮保存当前帧',
    downloadTitle: '下载此帧',
    deleteTitle: '删除此帧',
  },
  features: {
    sectionTitle: '功能特性',
    items: [
      {
        title: '逐帧精确定位',
        description: '播放、暂停配合方向键逐帧步进（约 1/25 秒），精准停在想要的画面',
      },
      {
        title: '高清原始分辨率导出',
        description: '按视频原始分辨率截取，不缩水，支持 PNG / JPEG / WebP 与质量调节',
      },
      {
        title: '按间隔批量抽帧',
        description: '设置秒数间隔自动抽取全片帧画面，一键打包 ZIP 下载，附实时进度',
      },
      {
        title: '本地处理隐私安全',
        description: '所有操作在浏览器内完成，视频不上传服务器，免费无限制',
      },
    ],
  },
  scenarios: {
    sectionTitle: '使用场景',
    items: [
      {
        title: '视频封面制作',
        description: '从素材中逐帧挑选光线、表情最理想的瞬间，导出作为视频封面或宣传图',
      },
      {
        title: '动画与运动研究',
        description: '逐帧查看动画、体育动作或舞蹈分解，观察每一帧的细节变化',
      },
      {
        title: '教程与文档配图',
        description: '把操作录屏的关键步骤截成图片，插入图文教程，步骤一目了然',
      },
      {
        title: '镜头与内容分析',
        description: '批量抽帧快速浏览整支视频的镜头节奏与画面构成，辅助剪辑策划',
      },
    ],
  },
  faqs: {
    sectionTitle: '常见问题',
    items: [
      {
        question: '支持哪些视频格式？',
        answer:
          '取决于浏览器自身的能力，通常支持 MP4（H.264）、WebM（VP8/VP9）等主流格式。若提示无法解码，请将视频转换为 MP4 后重试。',
      },
      {
        question: '逐帧步进的精度是多少？',
        answer:
          '由于浏览器无法直接读取视频帧率，逐帧步进按每秒 25 帧（即 0.04 秒）计算，可满足绝大多数精确定位需求。',
      },
      {
        question: '批量抽帧会损失画质吗？',
        answer:
          'PNG 为无损格式，画质与视频原始画面一致；JPEG / WebP 为有损压缩，可通过质量滑块在体积与画质之间权衡。',
      },
      {
        question: '长视频批量抽帧很慢怎么办？',
        answer:
          '抽帧需要在浏览器中逐个时间点定位并绘制画面，视频越长帧数越多耗时越久。建议先增大抽帧间隔（如 5 秒以上）再开始，或分段截取。',
      },
      {
        question: '我的视频会被上传吗？',
        answer:
          '不会。本工具完全在浏览器本地运行，视频文件不会离开你的设备，关闭页面后即释放，请放心使用。',
      },
    ],
  },
  errors: {
    notVideo: '请选择视频文件（如 MP4、WebM 等）',
    frameCapture:
      '截帧失败：当前浏览器无法捕获此视频的画面（可能为 HDR/HEVC 等特殊编码），建议使用最新版 Chrome 或 Safari 重试',
    confirmBatch: (total) =>
      `按当前间隔预计抽取 ${total} 帧，处理可能耗时较长（视频越长越慢），是否继续？`,
    partial: (failed) => `已完成，其中 ${failed} 帧捕获失败已跳过`,
    batchFailed: (message) => `批量抽帧失败：${message}`,
    retry: '请重试',
    batchFailedLog: '批量抽帧失败:',
  },
  files: {
    singleFrame: (time, ext) => `frame_${time.toFixed(2).replace('.', '_')}.${ext}`,
    batchZip: (timestamp) => `video-frames-${timestamp}.zip`,
  },
}

export const EN: VideoFrameCopy = {
  languageSwitch: {
    label: '中文',
    ariaLabel: 'Switch to Chinese',
  },
  hero: {
    title: 'Video Frame Extractor',
    intro:
      'Capture still images from a video right in your browser. Step through frame by frame, save a single frame, or extract frames at a fixed interval and download them all as a ZIP. Your video is processed locally and never uploaded.',
  },
  exportSettings: {
    cardTitle: 'Export settings',
    formatLabel: 'Export format',
    formatHint: 'PNG is lossless; JPEG and WebP produce smaller files',
    quality: (percent) => `Quality: ${percent}%`,
    batchTitle: 'Batch frame extraction',
    intervalLabel: (value) => `Interval: ${value} s`,
    estimated: (frames) => `About ${frames} frames will be extracted`,
    estimatedWarning: ' — that is a lot, so it may take a while',
    progress: (current, total) => `Extracting ${current}/${total}`,
    startZip: 'Extract frames & download ZIP',
  },
  upload: {
    dropIdle: 'Click to choose a video, or drag and drop it here',
    supported: 'Supports MP4, WebM and other formats your browser can play',
    localOnly: 'Your video is processed locally and never uploaded',
    decodeFailed:
      'This browser cannot decode this video. Please try a common format such as MP4 or WebM.',
    reselect: 'Choose another video',
  },
  player: {
    playTitle: 'Play (Space)',
    pauseTitle: 'Pause (Space)',
    prevFrameTitle: 'Previous frame (←)',
    nextFrameTitle: 'Next frame (→)',
    captureTitle: 'Capture the current frame',
    capture: 'Capture frame',
    shortcutHint: 'Shortcuts: Space play/pause · ←/→ step one frame',
    removeVideo: 'Remove video',
    frameAlt: (time) => `Frame at ${time}`,
  },
  frames: {
    cardTitle: (count) => `Captured frames (${count})`,
    clear: 'Clear',
    emptyTitle: 'No frames yet',
    emptyHint:
      'Play the video to the moment you want, then click “Capture frame” to save that still.',
    downloadTitle: 'Download this frame',
    deleteTitle: 'Delete this frame',
  },
  features: {
    sectionTitle: 'Features',
    items: [
      {
        title: 'Frame-accurate scrubbing',
        description:
          'Play, pause and step one frame at a time with the arrow keys (about 1/25 s) to land exactly on the moment you need.',
      },
      {
        title: 'Full-resolution export',
        description:
          'Frames are captured at the source resolution with no downscaling, in PNG, JPEG or WebP with an adjustable quality slider.',
      },
      {
        title: 'Batch extraction to ZIP',
        description:
          'Set an interval in seconds to extract frames across the whole clip, then download every frame in one ZIP with live progress.',
      },
      {
        title: 'Private, free and unlimited',
        description:
          'Everything runs inside your browser. The video is never uploaded, and there are no limits, watermarks or signups.',
      },
    ],
  },
  scenarios: {
    sectionTitle: 'What you can do with it',
    items: [
      {
        title: 'Video thumbnails',
        description:
          'Scrub through footage to find the best light and expression, then export that frame as a cover or promo image.',
      },
      {
        title: 'Animation and motion study',
        description:
          'Step through animation, sports or dance footage frame by frame to see exactly how each moment changes.',
      },
      {
        title: 'Tutorial screenshots',
        description:
          'Turn key moments from a screen recording into stills for step-by-step guides, docs and knowledge bases.',
      },
      {
        title: 'Shot and content analysis',
        description:
          'Extract frames in bulk to review pacing, shot composition and visual consistency across an entire clip.',
      },
    ],
  },
  faqs: {
    sectionTitle: 'Frequently asked questions',
    items: [
      {
        question: 'Which video formats can I use?',
        answer:
          'Support depends on your browser. MP4 (H.264) and WebM (VP8/VP9) usually work. If a video will not decode, convert it to MP4 and try again.',
      },
      {
        question: 'How precise is frame-by-frame stepping?',
        answer:
          'Browsers do not expose a video’s frame rate, so stepping uses 25 frames per second (0.04 s). That is precise enough for almost any still you need to pull.',
      },
      {
        question: 'Does batch extraction reduce quality?',
        answer:
          'PNG is lossless, so exported frames match the original video image. JPEG and WebP are lossy — use the quality slider to balance file size against image quality.',
      },
      {
        question: 'Why is batch extraction slow on long videos?',
        answer:
          'Each frame has to be seeked and drawn one at a time in the browser, so longer videos take longer. Increase the interval (5 seconds or more) or extract the video in segments.',
      },
      {
        question: 'Is my video uploaded anywhere?',
        answer:
          'No. This tool runs entirely in your browser. Your video never leaves your device and is released as soon as you close the page.',
      },
    ],
  },
  errors: {
    notVideo: 'Please choose a video file (MP4, WebM, etc.)',
    frameCapture:
      'Could not capture this frame: your browser cannot read the video image, which may use an unusual codec such as HDR/HEVC. Try the latest Chrome or Safari.',
    confirmBatch: (total) =>
      `About ${total} frames will be extracted at this interval. This may take a while — longer videos take longer. Continue?`,
    partial: (failed) => `Done — ${failed} frames could not be captured and were skipped`,
    batchFailed: (message) => `Frame extraction failed: ${message}`,
    retry: 'Please try again.',
    batchFailedLog: 'Batch frame extraction failed:',
  },
  files: {
    singleFrame: (time, ext) => `frame_${time.toFixed(2).replace('.', '_')}.${ext}`,
    batchZip: (timestamp) => `video-frames-${timestamp}.zip`,
  },
}

export const VIDEO_FRAME_COPY: Record<Locale, VideoFrameCopy> = {
  zh: ZH,
  en: EN,
}

export function getVideoFrameCopy(locale: Locale): VideoFrameCopy {
  return VIDEO_FRAME_COPY[locale] ?? ZH
}
