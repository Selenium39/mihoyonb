/**
 * 字幕工具的中英文案（/subtitle-tools 与 /en/subtitle-tools 共用）。
 *
 * 约定：
 * - 中文文案与重构前的 page.tsx 逐字一致（含标点、空格、括号），避免影响已有收录；
 * - 英文文案按英文搜索习惯重写（subtitle converter、srt to vtt、shift subtitles、merge srt），
 *   不是逐句直译；
 * - 动态句式一律用函数表达，两种语言的语序、单位都能各自本地化；
 * - JSX 里不再出现硬编码文案，全部从这里按 locale 取。
 */

import type { Locale } from '@/lib/i18n'

export interface SubtitleToolsCopy {
  languageSwitch: {
    label: string
    ariaLabel: string
  }
  hero: {
    title: string
    intro: string
  }
  input: {
    cardTitle: string
    waiting: string
    noCues: string
    recognized: (format: string, count: number) => string
    placeholder: string
    upload: string
    clear: string
    acceptHint: string
    warningPrefix: string
  }
  output: {
    cardTitle: string
    placeholder: string
    copy: string
    copied: string
    download: (extension: string) => string
    fileName: (extension: string) => string
  }
  functionCard: {
    cardTitle: string
    tabs: {
      convert: string
      shift: string
      merge: string
      clean: string
    }
  }
  formatPicker: {
    label: string
    followSource: (format: string) => string
  }
  convert: {
    description: string
    srtToVtt: string
    vttToSrt: string
    noValidCues: string
  }
  shift: {
    description: string
    unit: string
    apply: string
    invalidInline: string
    preview: (
      offsetLabel: string,
      firstBefore: string,
      firstAfter: string,
      lastBefore: string,
      lastAfter: string,
    ) => string
  }
  merge: {
    description: string
    secondTitle: string
    placeholder: string
    shiftToEnd: string
    submit: string
  }
  clean: {
    description: string
    autoFix: string
    submit: string
    overlapFound: (count: number) => string
    overlapItem: (
      prevIndex: number,
      prevEnd: string,
      nextIndex: number,
      nextStart: string,
    ) => string
    overlapNone: string
  }
  messagePrefix: {
    error: string
    info: string
  }
  messages: {
    needFirst: string
    invalidInput: string
    converted: (source: string, target: string) => string
    invalidOffset: string
    shifted: (seconds: string, later: boolean) => string
    needSecond: string
    invalidSecond: string
    merged: (first: number, second: number) => string
    cleanLabel: (fixedCount: number | null) => string
    overlapHint: (count: number) => string
    outputMeta: (label: string, count: number) => string
  }
  sections: {
    featuresTitle: string
    features: ReadonlyArray<{ title: string; description: string }>
    scenariosTitle: string
    scenarios: ReadonlyArray<{ title: string; description: string }>
    faqTitle: string
    faqs: ReadonlyArray<{ question: string; answer: string }>
  }
}

const ZH: SubtitleToolsCopy = {
  languageSwitch: {
    label: 'English',
    ariaLabel: '切换到英文版',
  },
  hero: {
    title: '字幕工具',
    intro:
      'SRT / VTT 字幕在线转换、时间轴平移、合并与清理修复，纯浏览器本地处理，文件不上传，完全免费',
  },
  input: {
    cardTitle: '输入字幕',
    waiting: '等待输入',
    noCues: '未识别到有效字幕',
    recognized: (format, count) => `已识别 ${format} · ${count} 条`,
    placeholder:
      '粘贴 SRT / VTT 字幕文本，或点击下方按钮上传文件\n\n例如：\n1\n00:00:01,000 --> 00:00:03,000\n你好，世界！',
    upload: '上传文件',
    clear: '清空',
    acceptHint: '支持 .srt / .vtt',
    warningPrefix: '提示：',
  },
  output: {
    cardTitle: '处理结果',
    placeholder: '处理结果将显示在这里，可一键复制或下载为字幕文件',
    copy: '复制',
    copied: '已复制',
    download: (extension) => `下载 .${extension}`,
    fileName: (extension) => `subtitle-${Date.now()}.${extension}`,
  },
  functionCard: {
    cardTitle: '选择功能',
    tabs: {
      convert: '格式转换',
      shift: '时间轴平移',
      merge: '字幕合并',
      clean: '清理修复',
    },
  },
  formatPicker: {
    label: '输出格式',
    followSource: (format) => `跟随源（${format}）`,
  },
  convert: {
    description:
      '在 SRT 与 VTT 之间双向转换：VTT 输出自动添加 WEBVTT 头，时间码分隔符 00:00:01,000 ↔ 00:00:01.000，序号统一保留。',
    srtToVtt: 'SRT → VTT',
    vttToSrt: 'VTT → SRT',
    noValidCues: '当前输入未识别到有效字幕条目',
  },
  shift: {
    description:
      '整体提前或延后全部字幕：输入秒数（支持负数，如 -0.5、1.200），平移后时间不允许为负，会截为 0。',
    unit: '秒',
    apply: '应用平移',
    invalidInline: '偏移量格式无效，请输入如 -0.5 或 1.200 的秒数',
    preview: (offsetLabel, firstBefore, firstAfter, lastBefore, lastAfter) =>
      `偏移 ${offsetLabel}：首条开始 ${firstBefore} → ${firstAfter}｜末条结束 ${lastBefore} → ${lastAfter}`,
  },
  merge: {
    description:
      '将第二份字幕顺序拼接到第一份后面，序号自动重排；可选择把第二份整体后移到第一份结束时刻，避免时间重叠。',
    secondTitle: '第二份字幕',
    placeholder: '粘贴或上传第二份 SRT / VTT 字幕...',
    shiftToEnd: '第二份整体后移到第一份结束时刻',
    submit: '合并字幕',
  },
  clean: {
    description:
      '去除多余空行、重排序号；检测相邻条目的时间码重叠（上一条结束晚于下一条开始），可选自动修正为顺序衔接。',
    autoFix: '自动修正时间重叠',
    submit: '开始清理',
    overlapFound: (count) => `检测到 ${count} 处时间码重叠`,
    overlapItem: (prevIndex, prevEnd, nextIndex, nextStart) =>
      `第 ${prevIndex} 条结束 ${prevEnd} 晚于第 ${nextIndex} 条开始 ${nextStart}`,
    overlapNone: '未检测到时间码重叠',
  },
  messagePrefix: {
    error: '错误：',
    info: '提示：',
  },
  messages: {
    needFirst: '请先在上方粘贴或上传第一份字幕',
    invalidInput: '未解析到任何字幕条目，请检查内容是否为有效的 SRT / VTT',
    converted: (source, target) => `已转换 ${source} → ${target}`,
    invalidOffset: '偏移量格式无效，请输入秒数（支持负数），如 -0.5 或 1.200',
    shifted: (seconds, later) => `已整体${later ? '延后' : '提前'} ${seconds} 秒`,
    needSecond: '请先粘贴或上传第二份字幕',
    invalidSecond: '第二份字幕未解析到任何条目，请检查内容格式',
    merged: (first, second) => `已合并两份字幕（${first} + ${second} 条）`,
    cleanLabel: (fixedCount) =>
      fixedCount === null
        ? '已清理：去空行 + 重排序号'
        : `已清理：去空行 + 重排序号，修正 ${fixedCount} 处重叠`,
    overlapHint: (count) =>
      `检测到 ${count} 处时间码重叠，可勾选「自动修正时间重叠」后再次清理`,
    outputMeta: (label, count) => `${label}，共 ${count} 条`,
  },
  sections: {
    featuresTitle: '功能特性',
    features: [
      {
        title: 'SRT / VTT 双向转换',
        description: '时间码精确到毫秒无损互转，VTT 自动添加 WEBVTT 头，序号统一保留重排',
      },
      {
        title: '时间轴整体平移',
        description:
          '按秒整体提前或延后（支持 -0.5、1.200 这类精度），负时间自动截为 0，附首末时间预览',
      },
      {
        title: '多份字幕合并',
        description: '顺序拼接两份字幕并自动重排序号，可选将第二份整体后移到第一份结束时刻',
      },
      {
        title: '本地处理隐私安全',
        description: '所有解析与转换均在浏览器内完成，字幕文件不上传服务器，免费无限制',
      },
    ],
    scenariosTitle: '使用场景',
    scenarios: [
      {
        title: '播放器兼容适配',
        description: '部分播放器只认 SRT，而 HTML5 网页播放器只认 VTT，一键互转即可两边通用',
      },
      {
        title: '字幕时机校准',
        description: '下载的字幕整体偏早或偏晚时，输入秒数一键平移，无需逐条手改时间码',
      },
      {
        title: '分段字幕合并',
        description: '将分卷翻译、分段压制的字幕拼成完整一份，时间轴自动顺延不重叠',
      },
      {
        title: '下载字幕修复',
        description: '修复序号错乱、多余空行、时间码重叠等常见问题，输出规范字幕文件',
      },
    ],
    faqTitle: '常见问题',
    faqs: [
      {
        question: '支持哪些字幕格式？',
        answer:
          '支持 SRT（.srt）与 WebVTT（.vtt）两种最常见的纯文本字幕格式，并可互相转换。ASS / SSA 等带样式的字幕格式暂不支持。',
      },
      {
        question: '转换后时间码会有误差吗？',
        answer:
          '不会。时间码解析为毫秒整数后再生成的另一格式，SRT 与 VTT 之间往返转换时间码完全无损，仅分隔符在「,」与「.」之间切换。',
      },
      {
        question: '时间轴平移时输入负数会怎样？',
        answer:
          '输入负数表示整体提前，如 -0.5 即提前 0.5 秒。平移后时间不允许为负，任何条目若被移到 0 之前，其开始/结束时间会被截为 0。',
      },
      {
        question: 'VTT 里的 NOTE、STYLE 块会保留吗？',
        answer:
          '转换时会自动剥离 NOTE / STYLE / REGION 等注释与样式块，只保留字幕正文；需要自定义样式的 VTT 可在转换后手动补回 STYLE 块。',
      },
      {
        question: '我的字幕文件会被上传吗？',
        answer:
          '不会。本工具完全在浏览器本地运行，解析、转换、合并全部在本机内存中完成，文件不会离开你的设备，请放心使用。',
      },
    ],
  },
}

const EN: SubtitleToolsCopy = {
  languageSwitch: {
    label: '中文',
    ariaLabel: 'Switch to Chinese',
  },
  hero: {
    title: 'Subtitle Converter',
    intro:
      'Convert SRT to VTT and back, shift subtitle timing, merge two subtitle files and clean up overlapping timecodes — free, no signup, and every file stays in your browser.',
  },
  input: {
    cardTitle: 'Input subtitles',
    waiting: 'Waiting for input',
    noCues: 'No valid cues found',
    recognized: (format, count) => `${format} · ${count} cues detected`,
    placeholder:
      'Paste SRT or VTT subtitle text, or upload a file with the button below\n\nExample:\n1\n00:00:01,000 --> 00:00:03,000\nHello, world!',
    upload: 'Upload file',
    clear: 'Clear',
    acceptHint: 'Accepts .srt / .vtt',
    warningPrefix: 'Note: ',
  },
  output: {
    cardTitle: 'Result',
    placeholder:
      'Your converted subtitles will appear here — copy them or download them as a subtitle file.',
    copy: 'Copy',
    copied: 'Copied',
    download: (extension) => `Download .${extension}`,
    fileName: (extension) => `subtitles-${Date.now()}.${extension}`,
  },
  functionCard: {
    cardTitle: 'Choose an action',
    tabs: {
      convert: 'Convert',
      shift: 'Shift timing',
      merge: 'Merge',
      clean: 'Clean up',
    },
  },
  formatPicker: {
    label: 'Output format',
    followSource: (format) => `Keep source (${format})`,
  },
  convert: {
    description:
      'Convert both ways between SRT and VTT: VTT output gets the WEBVTT header, the timecode separator switches between 00:00:01,000 and 00:00:01.000, and cue numbers are kept.',
    srtToVtt: 'SRT → VTT',
    vttToSrt: 'VTT → SRT',
    noValidCues: 'The current input has no valid subtitle cues',
  },
  shift: {
    description:
      'Move every cue earlier or later by a number of seconds (negatives allowed, e.g. -0.5 or 1.200). Times never go below zero — anything pushed before 0 is clamped to 0.',
    unit: 'sec',
    apply: 'Shift subtitles',
    invalidInline: 'That offset is not valid — enter a number of seconds such as -0.5 or 1.200',
    preview: (offsetLabel, firstBefore, firstAfter, lastBefore, lastAfter) =>
      `Offset ${offsetLabel}: first cue ${firstBefore} → ${firstAfter} · last cue ${lastBefore} → ${lastAfter}`,
  },
  merge: {
    description:
      'Append the second subtitle file after the first and renumber every cue. Optionally shift the whole second file to start where the first one ends, so the two never overlap.',
    secondTitle: 'Second subtitle file',
    placeholder: 'Paste or upload the second SRT / VTT file…',
    shiftToEnd: 'Shift the second file to the end of the first',
    submit: 'Merge subtitles',
  },
  clean: {
    description:
      'Strip extra blank lines and renumber the cues. Overlapping timecodes between neighbours (a cue that ends after the next one starts) are detected and can be fixed automatically.',
    autoFix: 'Fix overlapping timecodes automatically',
    submit: 'Clean up subtitles',
    overlapFound: (count) => `${count} overlapping timecodes found`,
    overlapItem: (prevIndex, prevEnd, nextIndex, nextStart) =>
      `Cue ${prevIndex} ends at ${prevEnd}, after cue ${nextIndex} starts at ${nextStart}`,
    overlapNone: 'No overlapping timecodes found',
  },
  messagePrefix: {
    error: 'Error: ',
    info: 'Note: ',
  },
  messages: {
    needFirst: 'Paste or upload the first subtitle file above first',
    invalidInput: 'No subtitle cues were parsed — check that the content is valid SRT / VTT',
    converted: (source, target) => `Converted ${source} → ${target}`,
    invalidOffset:
      'That offset is not valid — enter a number of seconds (negatives allowed), such as -0.5 or 1.200',
    shifted: (seconds, later) => `Shifted every cue ${seconds}s ${later ? 'later' : 'earlier'}`,
    needSecond: 'Paste or upload the second subtitle file first',
    invalidSecond: 'The second file has no subtitle cues — check its format',
    merged: (first, second) => `Merged both files (${first} + ${second} cues)`,
    cleanLabel: (fixedCount) =>
      fixedCount === null
        ? 'Cleaned up: blank lines removed and cues renumbered'
        : `Cleaned up: blank lines removed, cues renumbered, ${fixedCount} overlaps fixed`,
    overlapHint: (count) =>
      `${count} overlapping timecodes found — tick “Fix overlapping timecodes automatically” and clean up again`,
    outputMeta: (label, count) => `${label} · ${count} cues`,
  },
  sections: {
    featuresTitle: 'Features',
    features: [
      {
        title: 'SRT ↔ VTT conversion',
        description:
          'Millisecond-accurate conversion in both directions, with the WEBVTT header added automatically and cue numbers kept and renumbered.',
      },
      {
        title: 'Shift the whole timeline',
        description:
          'Move every cue earlier or later by seconds (down to -0.5 or 1.200 precision), clamp negative times to 0, and preview the first and last cue before you apply.',
      },
      {
        title: 'Merge subtitle files',
        description:
          'Join two subtitle tracks in order with automatic renumbering, or shift the second one to the end of the first so nothing overlaps.',
      },
      {
        title: 'Private, local processing',
        description:
          'Parsing and conversion run inside your browser, so subtitle files are never uploaded to a server. Free, with no limits.',
      },
    ],
    scenariosTitle: 'What you can use it for',
    scenarios: [
      {
        title: 'Player compatibility',
        description:
          'Some players only read SRT while HTML5 video only reads VTT — convert once and the same subtitle works in both.',
      },
      {
        title: 'Fix out-of-sync subtitles',
        description:
          'When a downloaded subtitle track runs early or late, enter an offset in seconds instead of editing every timecode by hand.',
      },
      {
        title: 'Combine split subtitles',
        description:
          'Stitch subtitles from separate parts or releases into one file, with the timeline shifted so the cues never collide.',
      },
      {
        title: 'Repair messy subtitle files',
        description:
          'Fix broken numbering, stray blank lines and overlapping timecodes, then export a clean, standard subtitle file.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        question: 'Which subtitle formats are supported?',
        answer:
          'SRT (.srt) and WebVTT (.vtt) — the two most common plain-text subtitle formats — and you can convert between them in either direction. Styled formats such as ASS / SSA are not supported yet.',
      },
      {
        question: 'Does converting change my timecodes?',
        answer:
          'No. Every timecode is parsed into whole milliseconds before the output is written, so SRT → VTT → SRT is completely lossless; only the separator switches between a comma and a full stop.',
      },
      {
        question: 'What happens if I shift by a negative number?',
        answer:
          'A negative offset moves the subtitles earlier: -0.5 means half a second earlier. Times are never allowed to go negative, so any cue pushed before 0 has its start and end clamped to 0.',
      },
      {
        question: 'Are NOTE and STYLE blocks in VTT kept?',
        answer:
          'NOTE, STYLE and REGION blocks are stripped during conversion so only the cue text survives. If you need custom styling, add the STYLE block back to the VTT afterwards.',
      },
      {
        question: 'Are my subtitle files uploaded anywhere?',
        answer:
          'No. The tool runs entirely in your browser — parsing, conversion and merging all happen in local memory, so your files never leave your device and nothing is sent to a server.',
      },
    ],
  },
}

export const SUBTITLE_TOOLS_COPY: Record<Locale, SubtitleToolsCopy> = {
  zh: ZH,
  en: EN,
}

export function getSubtitleToolsCopy(locale: Locale): SubtitleToolsCopy {
  return SUBTITLE_TOOLS_COPY[locale] ?? ZH
}
