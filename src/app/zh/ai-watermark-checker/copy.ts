/**
 * AI 水印检测（隐藏字符检查）的中英文案。
 * 英文页 /ai-watermark-checker 与中文页 /zh/ai-watermark-checker 共用。
 * JSX 不写死文案，规则说明和 FAQ 都从这里取，保证页面正文和结构化数据一致。
 */

import type { Locale } from '@/lib/i18n'
import type { CleanOptionKey, RuleId } from '@/lib/ai-watermark'

type RuleCopy = Record<RuleId, { name: string; note: string }>

export interface AiWatermarkCopy {
  breadcrumb: { label: string; home: string; current: string }
  hero: { title: string; intro: string; badges: readonly string[] }
  honesty: string
  noscript: string
  options: {
    title: string
    hint: string
    labels: Record<CleanOptionKey, string>
  }
  input: {
    title: string
    placeholder: string
    aria: string
    paste: string
    example: string
    exampleLoaded: string
    clear: string
    reveal: string
    editing: string
    pasteBlocked: string
    emptyReveal: string
    truncated: string
    revealLabel: string
    markTitle: (name: string, label: string) => string
    wordTitle: string
  }
  output: {
    title: string
    placeholder: string
    aria: string
    copy: string
    copied: string
    copyFailed: string
    download: string
  }
  counts: (chars: string, words: string) => string
  audit: {
    idle: string
    clean: string
    hidden: (count: string) => string
    mixed: (count: string) => string
    more: (count: number) => string
    mixedChip: (count: string, examples: string) => string
    typographic: (count: string) => string
    newlines: (count: string) => string
    removed: (count: string) => string
    replaced: (count: string) => string
    cleanedPrefix: string
    formattingOnly: string
    alreadyClean: string
  }
  howTo: {
    title: string
    intro: string
    steps: readonly { title: string; body: string }[]
  }
  article: { title: string; paragraphs: readonly string[] }
  table: {
    title: string
    intro: string
    caption: string
    columns: { code: string; name: string; action: string; why: string; toggle: string }
    toggleLabel: Record<CleanOptionKey | 'always', string>
    footnotes: readonly string[]
  }
  rules: RuleCopy
  actionLabel: {
    strip: string
    space: string
    newline: string
    straightDouble: string
    straightSingle: string
    hyphen: string
    dots: string
  }
  sections: { features: string; scenarios: string; faqs: string; related: string }
  features: readonly { title: string; description: string }[]
  scenarios: readonly { title: string; description: string }[]
  faqs: readonly { question: string; answer: string }[]
  related: readonly { href: string; title: string; description: string }[]
  sample: string
}

const EN_RULES = {
  zwsp: {
    name: 'Zero-width space',
    note: 'Takes no width, so it can split a word that still looks like one word on screen.',
  },
  zwnj: {
    name: 'Zero-width non-joiner',
    note: 'Invisible in English. It is meaningful in Persian and Hindi, so turn invisible-character removal off for those languages.',
  },
  zwj: {
    name: 'Zero-width joiner',
    note: 'Glues emoji into one glyph. Joiners inside emoji are kept; a joiner in ordinary text is removed.',
  },
  wj: {
    name: 'Word joiner',
    note: 'Invisible glue that stops a line from breaking, without showing a space.',
  },
  bom: {
    name: 'Byte order mark',
    note: 'A hidden marker some editors put at the start of a file. In the middle of text, it breaks parsers.',
  },
  shy: {
    name: 'Soft hyphen',
    note: 'Stays invisible until a line wraps there, then appears as a hyphen nobody typed.',
  },
  cgj: {
    name: 'Combining grapheme joiner',
    note: 'An invisible control that almost never belongs in prose pasted from a chat window.',
  },
  bidi: {
    name: 'Direction marks and overrides',
    note: 'Can show characters in a different order from the order they are stored. Needed for Arabic and Hebrew, and also used in Trojan Source attacks. Turn this off for real bidirectional text.',
  },
  mong: {
    name: 'Mongolian separators',
    note: 'Mongolian variation selectors and the vowel separator. They are invisible in Latin or CJK text.',
  },
  imath: {
    name: 'Invisible math operators',
    note: 'Invisible times, plus, separator and function-apply characters left by math layout.',
  },
  shape: {
    name: 'Deprecated shaping controls',
    note: 'Old Unicode controls for Arabic letter shaping. Current text does not need them.',
  },
  filler: {
    name: 'Hangul fillers',
    note: 'Hangul and halfwidth fillers that render as a blank and are used to fake an empty string.',
  },
  khmer: {
    name: 'Khmer inherent vowels',
    note: 'Deprecated Khmer vowel signs that take no visible space.',
  },
  anno: {
    name: 'Annotation and object marks',
    note: 'Interlinear annotation controls, plus the object-replacement character.',
  },
  vs: {
    name: 'Variation selectors',
    note: 'Invisible switches between text style and emoji style. Selectors that belong to an emoji are kept.',
  },
  ivs: {
    name: 'Ideographic variation selectors',
    note: 'Choose a glyph for a CJK character. Kept when they follow an ideograph, removed when they do not.',
  },
  tag: {
    name: 'Invisible tag characters',
    note: 'A hidden alphabet. It can carry a message the reader never sees.',
  },
  ctrl: {
    name: 'Control characters',
    note: 'C0 and C1 controls other than tab and line feed. They do not belong in pasted prose.',
  },
  nnbsp: {
    name: 'Narrow no-break space',
    note: 'U+202F. This is the character widely called the ChatGPT watermark in April 2025. It is also correct French spacing before ; : ! ? %.',
  },
  nbsp: {
    name: 'No-break space',
    note: 'Looks like a space and will not wrap. Very common in text copied from the web or from Word.',
  },
  tspace: {
    name: 'Typographic spaces',
    note: 'En, em, thin, hair and the other fixed-width spaces from U+2000 through U+200A.',
  },
  mmsp: {
    name: 'Medium mathematical space',
    note: 'A math-typesetting space that is easy to mistake for a normal one.',
  },
  ogham: {
    name: 'Ogham space mark',
    note: 'The space from Ogham, an early Irish script. Some fonts draw it like a dash.',
  },
  idsp: {
    name: 'Ideographic space',
    note: 'U+3000, the full-width space used in Chinese, Japanese and Korean. Turn special-space normalization off to keep it.',
  },
  braille: {
    name: 'Braille blank',
    note: 'The empty braille cell. It looks like a space and slips past filters that only know U+0020.',
  },
  cr: {
    name: 'Carriage return',
    note: 'The Windows half of a CRLF line ending. A CRLF pair becomes one line feed.',
  },
  nel: {
    name: 'Next line',
    note: 'U+0085, a legacy line break from older mainframe systems.',
  },
  lsps: {
    name: 'Line and paragraph separators',
    note: 'U+2028 and U+2029. They break JavaScript string literals and some JSON parsers.',
  },
  dquo: {
    name: 'Smart double quotes',
    note: 'Curly quotes, low-9 quotes and guillemets, replaced with a straight quotation mark.',
  },
  squo: {
    name: 'Smart single quotes',
    note: 'Curly apostrophes and primes, replaced with a straight apostrophe.',
  },
  dash: {
    name: 'Em and en dashes',
    note: 'Em dashes, en dashes, minus signs and non-breaking hyphens become a plain hyphen. An em dash is a writing choice, not proof that a model wrote the sentence.',
  },
  ellip: {
    name: 'Horizontal ellipsis',
    note: 'The single ellipsis character becomes three periods.',
  },
} satisfies RuleCopy

const ZH_RULES = {
  zwsp: {
    name: '零宽空格',
    note: '不占宽度，可以插在一个看起来完整的词中间，搜索和变量名都会对不上。',
  },
  zwnj: {
    name: '零宽非连接符',
    note: '英文里看不见。波斯语和印地语里它有实际作用，处理这些语言时请关掉「删除不可见字符」。',
  },
  zwj: {
    name: '零宽连接符',
    note: '用来把多个 emoji 拼成一个。emoji 内部的连接符会保留，普通文字里的会被删掉。',
  },
  wj: {
    name: '单词连接符',
    note: '看不见的禁断标记，不显示空格，但会阻止在这里换行。',
  },
  bom: {
    name: '字节顺序标记',
    note: '有些编辑器会在文件开头塞进这个隐藏标记。出现在正文中间时，解析器会报错。',
  },
  shy: {
    name: '软连字符',
    note: '平时看不见，只有在它这里换行时才显示成连字符。',
  },
  cgj: {
    name: '组合字素连接符',
    note: '几乎不会出现在正常句子里的不可见控制符。',
  },
  bidi: {
    name: '方向标记与覆盖',
    note: '可以让字符的视觉顺序和存储顺序不一致。阿拉伯语、希伯来语需要它，它也是 Trojan Source 攻击用的字符。处理真正的双向文本时请关掉。',
  },
  mong: {
    name: '蒙古文分隔符',
    note: '蒙古文变体选择符和元音分隔符。在中文或英文里不会显示。',
  },
  imath: {
    name: '不可见数学运算符',
    note: '数学排版留下的不可见乘号、加号、分隔符和应用符。',
  },
  shape: {
    name: '已弃用的塑形控制符',
    note: '早期阿拉伯文塑形用的控制符，现在的文本不需要。',
  },
  filler: {
    name: '韩文填充符',
    note: '显示成空白，常被拿来伪造一个看起来是空的字符串。',
  },
  khmer: {
    name: '高棉文固有元音',
    note: '已弃用的高棉文元音符号，不占可见位置。',
  },
  anno: {
    name: '注释与对象标记',
    note: '行间注释控制符，以及对象替换字符。',
  },
  vs: {
    name: '变体选择符',
    note: '在文字样式和 emoji 样式之间切换，本身不显示。emoji 内部的选择符会保留。',
  },
  ivs: {
    name: '表意文字变体选择符',
    note: '用来指定汉字的某个字形。紧跟在汉字后面时保留，单独出现时删除。',
  },
  tag: {
    name: '不可见标签字符',
    note: '一整套看不见的字母，可以把一段读者看不到的文字藏进正文。',
  },
  ctrl: {
    name: '控制字符',
    note: '除制表符和换行以外的 C0/C1 控制符，粘贴来的正文里不该有。',
  },
  nnbsp: {
    name: '窄不换行空格',
    note: 'U+202F。2025 年 4 月被很多人称作 ChatGPT 水印的就是它。法语在 ; : ! ? % 前面也会正规使用。',
  },
  nbsp: {
    name: '不换行空格',
    note: '看起来是空格，但不会在这里换行。从网页或 Word 复制的文字里非常常见。',
  },
  tspace: {
    name: '排版空格',
    note: 'U+2000 到 U+200A，包括 en、em、细空格、发丝空格等不同宽度。',
  },
  mmsp: {
    name: '中等数学空格',
    note: '数学排版留下的空格，很容易当成普通空格。',
  },
  ogham: {
    name: '欧甘文空格',
    note: '古爱尔兰欧甘文的空格，有些字体把它画成一条短线。',
  },
  idsp: {
    name: '表意文字空格',
    note: 'U+3000，中文、日文、韩文里的全角空格。想保留它时，请关掉「规范特殊空格」。',
  },
  braille: {
    name: '盲文空位',
    note: '空的盲文点位。看起来像空格，只检查普通空格的过滤器会漏掉它。',
  },
  cr: {
    name: '回车符',
    note: 'Windows 换行 CRLF 里的那一半，会和后面的换行合并成一个换行。',
  },
  nel: {
    name: '下一行',
    note: 'U+0085，早期大型机使用的换行符。',
  },
  lsps: {
    name: '行分隔符与段分隔符',
    note: 'U+2028 和 U+2029。放进 JavaScript 字符串或某些 JSON 解析器会直接出错。',
  },
  dquo: {
    name: '弯双引号',
    note: '弯引号、低位引号和书名号式引号，换成直引号。',
  },
  squo: {
    name: '弯单引号',
    note: '弯撇号和撇号式素数，换成直撇号。',
  },
  dash: {
    name: '长破折号与短破折号',
    note: '长破折号、短破折号、减号和不换行连字符，统一成半角连字符。破折号是写法选择，不能拿来证明文字是 AI 写的。',
  },
  ellip: {
    name: '省略号',
    note: '把一个省略号字符换成三个句点。',
  },
} satisfies RuleCopy

const EN: AiWatermarkCopy = {
  breadcrumb: { label: 'Breadcrumb', home: 'Home', current: 'AI Watermark Checker' },
  hero: {
    title: 'AI Watermark Checker',
    intro:
      'Paste text from a chat, a doc or a web page. This checker finds zero-width spaces, the U+202F narrow space, smart quotes and other invisible Unicode, then lets you copy plain text. Free, in your browser, and the text is not uploaded.',
    badges: ['Free, no signup', 'Text stays in this tab', 'Works after the page loads'],
  },
  honesty:
    'These are typography and formatting characters, not a cryptographic watermark. Cleaning them does not make a piece of writing undetectable, and it does not remove statistical watermarks such as SynthID-Text.',
  noscript:
    'The checker needs JavaScript because it runs in your browser. The character list and the answers below are still readable without it.',
  options: {
    title: 'What to clean',
    hint: 'Emoji sequences are kept. Turn off special spaces for French text, and turn off invisible characters for Arabic, Hebrew, Persian or Hindi.',
    labels: {
      invisibles: 'Remove invisible characters',
      spaces: 'Normalize special spaces',
      quotes: 'Straighten smart quotes',
      dashes: 'Turn dashes into hyphens',
      ellipsis: 'Ellipsis to three dots',
      markdown: 'Strip Markdown',
      whitespace: 'Tidy whitespace',
      homoglyphs: 'Replace lookalike letters',
      emoji: 'Remove emoji',
    },
  },
  input: {
    title: 'Your text',
    placeholder: 'Paste text from ChatGPT, Claude, Gemini, Word, a CMS or a source file…',
    aria: 'Text to check for hidden characters',
    paste: 'Paste',
    example: 'Try example',
    exampleLoaded: 'Example loaded. Hidden characters are marked in the preview.',
    clear: 'Clear',
    reveal: 'Reveal hidden characters',
    editing: 'Back to editing',
    pasteBlocked: 'The browser blocked clipboard reading. Click the box and press Ctrl or Cmd+V.',
    emptyReveal: 'Nothing to reveal yet. Paste some text first.',
    truncated:
      'Preview truncated. The counts above still cover the full text; only the marked preview is shortened.',
    revealLabel: 'Text with hidden characters revealed',
    markTitle: (name, label) => `${name} (${label})`,
    wordTitle: 'This word mixes Latin letters with lookalike Cyrillic or Greek letters.',
  },
  output: {
    title: 'Clean text',
    placeholder: 'Plain text shows up here as you paste.',
    aria: 'Cleaned text',
    copy: 'Copy clean text',
    copied: 'Copied',
    copyFailed: 'Copy failed. Select the text and copy it manually.',
    download: 'Download .txt',
  },
  counts: (chars, words) => `${chars} characters · ${words} words`,
  audit: {
    idle: 'Paste text to check it.',
    clean: 'No hidden characters found.',
    hidden: (count) => `${count} hidden character${count === '1' ? '' : 's'} found`,
    mixed: (count) => `${count} mixed-script word${count === '1' ? '' : 's'}`,
    more: (count) => `+${count} more`,
    mixedChip: (count, examples) =>
      `${count} mixed-script word${count === '1' ? '' : 's'} (possible lookalike letters): ${examples}`,
    typographic: (count) =>
      `${count} typographic character${count === '1' ? '' : 's'} can be normalized (quotes, dashes, ellipses)`,
    newlines: (count) => `${count} non-standard line ending${count === '1' ? '' : 's'}`,
    removed: (count) => `removed ${count} hidden character${count === '1' ? '' : 's'}`,
    replaced: (count) => `replaced ${count} character${count === '1' ? '' : 's'}`,
    cleanedPrefix: 'Cleaned',
    formattingOnly: 'Cleaned: formatting and whitespace only.',
    alreadyClean: 'Already clean. Nothing to change.',
  },
  howTo: {
    title: 'How to check text for hidden characters',
    intro: 'The report updates as you paste. The text is not sent to a server.',
    steps: [
      {
        title: 'Paste the text',
        body: 'Copy from a chat window, Word, a CMS or a source file. The example contains a zero-width space, a narrow space, curly quotes, a soft hyphen and an emoji, if you want to see the report before using your own text.',
      },
      {
        title: 'Read the report',
        body: 'Hidden characters are counted by type, with the Unicode code point beside the name. Reveal hidden characters to put a label where an invisible or ambiguous character sits. Quotes and dashes are listed separately, because you can see them.',
      },
      {
        title: 'Copy the plain text',
        body: 'The second box is the cleaned version. Copy it or download a .txt file. Untick a group first if you want to keep those characters — French spacing, an em dash, or Markdown you still need.',
      },
    ],
  },
  article: {
    title: 'Why pasted text picks up hidden characters',
    paragraphs: [
      'In April 2025, people reading ChatGPT o3 and o4-mini answers noticed narrow no-break spaces (U+202F) scattered through long replies. The character looks like an ordinary space. The finding spread under the name “ChatGPT watermark.” OpenAI described it as a side effect of training, not a mark they had planted, and that particular pattern stopped appearing soon after. The searches stayed, because the practical problem is older than that story.',
      'Text copied from a chat, a word processor or a web page often contains characters the writer did not choose. Curly quotes, em dashes, non-breaking spaces, Markdown asterisks and, less often, genuinely invisible Unicode — zero-width spaces, joiners, byte order marks, direction overrides — all survive a copy and paste. None of that is a cryptographic watermark. A character checker can see all of it. Some of it also breaks code, spreadsheets, search-and-replace and content systems in ways that look like a file is haunted.',
      'On 2 August 2026, Article 50 of the EU AI Act started requiring providers of generative systems to mark synthetic content in a machine-readable way. Whatever form that mark takes across products, people are already pasting drafts into checkers and asking what is in the clipboard. A character checker answers the clipboard question. It cannot see a statistical watermark such as Google SynthID-Text, which is encoded in which words a model picked, and it cannot rewrite a paragraph so that a style-based detector changes its score.',
      'That limit is the product. The page lists each special character, shows where the invisible ones sit, and hands back plain text. The sentences stay the sentences. Every group of rules can be switched off, so a French draft can keep its narrow spaces, and a bilingual document can keep its direction marks.',
    ],
  },
  table: {
    title: 'Characters this checker detects',
    intro:
      'This is the checklist the cleaner runs. If a character is in the table, the checker looks for it. The toggles above the text boxes turn whole groups on or off. Line endings are always normalized.',
    caption: 'Unicode characters the AI watermark checker detects and how each one is cleaned',
    columns: {
      code: 'Code point',
      name: 'Name',
      action: 'What the cleaner does',
      why: 'Why it matters',
      toggle: 'Controlled by',
    },
    toggleLabel: {
      invisibles: 'Remove invisible characters',
      spaces: 'Normalize special spaces',
      quotes: 'Straighten smart quotes',
      dashes: 'Turn dashes into hyphens',
      ellipsis: 'Ellipsis to three dots',
      markdown: 'Strip Markdown',
      whitespace: 'Tidy whitespace',
      homoglyphs: 'Replace lookalike letters',
      emoji: 'Remove emoji',
      always: 'Always on',
    },
    footnotes: [
      'U+202F is correct French typography before ; : ! ? %. If the text is French, untick “Normalize special spaces.”',
      'Direction marks are legitimate in Arabic and Hebrew, and they are also the characters used in Trojan Source attacks. Untick “Remove invisible characters” for real bidirectional text.',
      'U+3000 is the standard full-width space in Chinese, Japanese and Korean. U+200C, the zero-width non-joiner, matters in Persian and Hindi. Both can be kept with the toggles above.',
      'Emoji are protected. Joiners and variation selectors that belong to an emoji, including family sequences and skin tones, are not removed. The same characters outside an emoji are removed.',
    ],
  },
  rules: EN_RULES,
  actionLabel: {
    strip: 'Removed',
    space: 'Replaced with a normal space',
    newline: 'Normalized to a line break',
    straightDouble: 'Replaced with a straight double quote',
    straightSingle: 'Replaced with a straight apostrophe',
    hyphen: 'Replaced with a hyphen',
    dots: 'Replaced with three dots',
  },
  sections: {
    features: 'What you can do with it',
    scenarios: 'When people paste text in here',
    faqs: 'Frequently asked questions',
    related: 'Related browser tools',
  },
  features: [
    {
      title: 'A live character report',
      description:
        'Matches are counted as you type, grouped by character, with the Unicode code point next to the name.',
    },
    {
      title: 'Plain text in one click',
      description:
        'Invisible characters are deleted, special spaces become normal spaces, and curly punctuation becomes straight punctuation. The words are not rewritten.',
    },
    {
      title: 'Stays in this tab',
      description:
        'Checking and cleaning run in your browser. The text you paste is not uploaded to mihoyonb.',
    },
    {
      title: 'Emoji stay intact',
      description:
        'Family emoji, skin tones and variation selectors inside an emoji are left alone. A joiner floating in ordinary text is still removed.',
    },
  ],
  scenarios: [
    {
      title: 'Drafts copied from a chat',
      description:
        'Editors who paste a model draft into a CMS, an email or a doc and want the invisible leftovers gone before anyone else opens the file.',
    },
    {
      title: 'Code and config that will not parse',
      description:
        'A zero-width space in an identifier, a byte order mark at the top of a config file, or a non-breaking space in a command. The line looks right, and the tool still rejects it.',
    },
    {
      title: 'Spreadsheets and duplicate checks',
      description:
        'Two cells that look identical and fail an equality check, because one of them contains U+00A0 or U+202F instead of a normal space.',
    },
    {
      title: 'French, Arabic and CJK text',
      description:
        'The same characters are correct typography in some languages. The toggles let you clean an English draft without flattening French spacing, full-width spaces or bidirectional text.',
    },
  ],
  faqs: [
    {
      question: 'What does an AI watermark checker look for?',
      answer:
        'In the way people use the phrase, an AI watermark checker looks for hidden and special characters that show up in text copied from chatbots and word processors: zero-width spaces, the narrow no-break space U+202F, no-break spaces, curly quotes, em dashes and other invisible Unicode. This page does that check in your browser and can remove the characters. It does not detect statistical watermarks that live in word choice.',
    },
    {
      question: 'Did ChatGPT watermark its text with a hidden space?',
      answer:
        'In April 2025, readers found narrow no-break spaces (U+202F) spread through answers from the o3 and o4-mini models, and the character was widely called a watermark. OpenAI said it was a training artifact, not a watermark, and that particular pattern disappeared soon after. What is still true is more ordinary: copied text often contains curly quotes, dashes, odd spaces and sometimes invisible Unicode. This checker shows those characters. It does not prove that a model wrote the paragraph.',
    },
    {
      question: 'Will cleaning change my wording?',
      answer:
        'No. The cleaner never rephrases, summarizes or rewrites a draft. It deletes invisible characters, turns special spaces into normal spaces, straightens quotes and dashes when those options are on, and can strip Markdown marks. Every rule can be turned off, and the report lists what it found before you copy.',
    },
    {
      question: 'Is the text I paste uploaded?',
      answer:
        'No. Checking and cleaning run in your browser tab. mihoyonb does not receive the text you paste, and there is no account. The page may still load the site’s ordinary ads and analytics scripts; those scripts do not receive the contents of the text box.',
    },
    {
      question: 'Will this make AI-written text pass a detector?',
      answer:
        'No. Removing hidden characters does not defeat a detector that scores writing style, and it does not remove a statistical watermark such as SynthID-Text. A character cleaner cannot do either of those things.',
    },
    {
      question: 'Is an em dash proof that a text was generated?',
      answer:
        'No. The em dash is a normal punctuation mark, and it is also common in model output, which is why some editors treat a stack of them as a hint. The dash option is there if you want hyphens instead. Leaving the option off keeps the em dash.',
    },
    {
      question: 'Why do invisible characters break code, spreadsheets and CMSs?',
      answer:
        'A zero-width space inside a name, a byte order mark at the start of a file, or a no-break space in a command looks identical to the character you expected and compares as a different value. Compilers, search, deduplication and databases then fail in ways that are hard to see. Cleaning the paste fixes that class of bug whether or not you care where the text came from.',
    },
    {
      question: 'Which characters can I keep?',
      answer:
        'Turn off “Normalize special spaces” to keep U+202F, including French spacing, and the full-width CJK space U+3000. Turn off “Remove invisible characters” to keep direction marks in Arabic or Hebrew and the zero-width non-joiner used in Persian and Hindi. Emoji are kept by default. The table on this page is the full list the checker uses.',
    },
  ],
  related: [
    {
      href: '/sensitive-words',
      title: 'Sensitive Word Checker',
      description: 'Scan ad copy for risky claims in the same browser tab, with nothing uploaded.',
    },
    {
      href: '/subtitle-tools',
      title: 'Subtitle Converter',
      description: 'Convert SRT and VTT, shift timing and clean subtitle files locally.',
    },
    {
      href: '/markdown-to-image',
      title: 'Markdown to Image',
      description: 'Turn a cleaned Markdown note into a shareable PNG without leaving the browser.',
    },
  ],
  sample:
    '\uFEFF# Launch notes\u200B\n\n**Ship the update**\u2014then tell people what changed\u2026\n\n> \u201CInvisible characters show up when a build breaks, not when you read the sentence.\u201D\n\n* A zero\u200Bwidth space can sit inside an identifier\n* French spacing before a percent sign: 10\u202F%\n* This\u00A0gap is a no-break space\n* Emoji should stay: \u{1F44D}\u{1F3FD} \u{1F468}\u200D\u{1F469}\u200D\u{1F467} \u2764\uFE0F\n* A lookalike letter hides in p\u0430ypal\n\nP.S. A soft\u00ADhyphen is sitting in this line.',
}

const ZH: AiWatermarkCopy = {
  breadcrumb: { label: '面包屑', home: '首页', current: 'AI 水印检测' },
  hero: {
    title: 'AI 水印检测',
    intro:
      '把聊天窗口、文档或网页里复制出来的文字贴进来。这个工具会找出零宽空格、U+202F 窄空格、弯引号和其他不可见 Unicode，再让你复制干净的纯文本。免费，在浏览器里完成，文字不会上传。',
    badges: ['免费，无需注册', '文字留在这个标签页', '页面打开后即可检查'],
  },
  honesty:
    '这些是排版和格式字符，不是加密水印。清掉它们不会让一篇文字变成「检测不出来」，也不能去掉 SynthID-Text 这类藏在用词里的统计水印。',
  noscript: '检测需要 JavaScript，因为它在你的浏览器里运行。下面的字符表和问答不依赖脚本，可以直接阅读。',
  options: {
    title: '清理哪些字符',
    hint: 'emoji 序列会保留。处理法语时关掉「规范特殊空格」；处理阿拉伯语、希伯来语、波斯语或印地语时关掉「删除不可见字符」。',
    labels: {
      invisibles: '删除不可见字符',
      spaces: '规范特殊空格',
      quotes: '弯引号改成直引号',
      dashes: '破折号改成连字符',
      ellipsis: '省略号改成三个句点',
      markdown: '去掉 Markdown 标记',
      whitespace: '整理空白',
      homoglyphs: '替换形近字母',
      emoji: '删除 emoji',
    },
  },
  input: {
    title: '待检查文本',
    placeholder: '粘贴来自 ChatGPT、Claude、Gemini、Word、公众号后台或代码文件的文字…',
    aria: '待检查隐藏字符的文本',
    paste: '粘贴',
    example: '试试示例',
    exampleLoaded: '已载入示例。预览里会标出隐藏字符。',
    clear: '清空',
    reveal: '显示隐藏字符',
    editing: '返回编辑',
    pasteBlocked: '浏览器拦截了剪贴板读取。请点进输入框，按 Ctrl 或 Cmd+V 粘贴。',
    emptyReveal: '还没有可显示的内容。请先粘贴文字。',
    truncated: '预览已截断。上面的计数仍覆盖全文，只有带标记的预览被缩短。',
    revealLabel: '标出隐藏字符后的文本',
    markTitle: (name, label) => `${name}（${label}）`,
    wordTitle: '这个词把拉丁字母和形近的西里尔或希腊字母混在了一起。',
  },
  output: {
    title: '清理后的文本',
    placeholder: '粘贴之后，纯文本会出现在这里。',
    aria: '清理后的文本',
    copy: '复制纯文本',
    copied: '已复制',
    copyFailed: '复制失败。请选中文本后手动复制。',
    download: '下载 .txt',
  },
  counts: (chars, words) => `${chars} 个字符 · 按空白计 ${words} 段`,
  audit: {
    idle: '粘贴文字后即可检查。',
    clean: '没有发现隐藏字符。',
    hidden: (count) => `发现 ${count} 个隐藏字符`,
    mixed: (count) => `${count} 个混合文字词`,
    more: (count) => `还有 ${count} 类`,
    mixedChip: (count, examples) => `${count} 个混合文字词（可能是形近字母）：${examples}`,
    typographic: (count) => `${count} 个排版字符可以规范化（引号、破折号、省略号）`,
    newlines: (count) => `${count} 处非标准换行`,
    removed: (count) => `删除了 ${count} 个隐藏字符`,
    replaced: (count) => `替换了 ${count} 个字符`,
    cleanedPrefix: '已清理',
    formattingOnly: '已清理：只动了格式和空白。',
    alreadyClean: '已经是干净文本，没有需要改的地方。',
  },
  howTo: {
    title: '怎么检查文字里的隐藏字符',
    intro: '报告会随着粘贴更新。文字不会发到服务器。',
    steps: [
      {
        title: '粘贴文本',
        body: '从聊天窗口、Word、公众号后台或代码文件复制过来。示例里带了零宽空格、窄空格、弯引号、软连字符和 emoji，可以先看报告再贴自己的文字。',
      },
      {
        title: '看检查结果',
        body: '隐藏字符按种类计数，名字旁边是 Unicode 码位。打开「显示隐藏字符」，看不见或容易认错的字符会变成一个标签。引号和破折号单独列出，因为它们本来就能看见。',
      },
      {
        title: '复制纯文本',
        body: '右边是清理后的版本，可以复制，也可以下载 .txt。想保留某一类字符时，先把对应开关关掉，例如法语窄空格、你确实想留的破折号，或还要渲染的 Markdown。',
      },
    ],
  },
  article: {
    title: '为什么复制出来的文字会带上隐藏字符',
    paragraphs: [
      '2025 年 4 月，有人在 ChatGPT o3 和 o4-mini 的长回答里看到大量窄不换行空格（U+202F）。这个字符看起来就是普通空格。消息很快被叫成「ChatGPT 水印」。OpenAI 的说法是训练副作用，不是他们故意埋的标记，这种分布随后也从输出里消失了。搜索还在，是因为真正麻烦的事比这则消息更早。',
      '从聊天窗口、Word 或网页复制出来的文字，经常带着作者没打算输入的字符：弯引号、破折号、不换行空格、Markdown 星号，偶尔还有真正看不见的 Unicode，比如零宽空格、连接符、字节顺序标记和方向覆盖符。这些都不是加密水印。字符检查能把它们找出来。其中一部分还会让代码、表格、查找替换和内容系统出现看起来像「文件中邪了」的错误。',
      '2026 年 8 月 2 日起，欧盟《人工智能法案》第 50 条要求生成式系统的提供者，以机器可读的方式标注合成内容。各家产品最终用什么标记先不说，已经有人把草稿贴进检查工具，想知道剪贴板里到底有什么。字符检查回答的是剪贴板这个问题。它看不到 Google SynthID-Text 那种藏在用词里的统计水印，也不能把一段话改写到让文风检测器改口。',
      '这个边界就是工具本身。页面列出每一种特殊字符，标出看不见的那些在哪里，然后还给你纯文本。句子还是原来的句子。每一组规则都能关掉，所以法语草稿可以留下窄空格，中文可以留下全角空格，双向文本可以留下方向标记。',
    ],
  },
  table: {
    title: '这个工具会检查哪些字符',
    intro:
      '下面这张表就是清理程序实际使用的清单。表里有的字符，检查时就会找。文本框上方的开关按组打开或关闭。换行符始终会规范成普通换行。',
    caption: 'AI 水印检测会识别的 Unicode 字符，以及每一类会怎样被清理',
    columns: {
      code: '码位',
      name: '名称',
      action: '清理方式',
      why: '为什么重要',
      toggle: '由哪个开关控制',
    },
    toggleLabel: {
      invisibles: '删除不可见字符',
      spaces: '规范特殊空格',
      quotes: '弯引号改成直引号',
      dashes: '破折号改成连字符',
      ellipsis: '省略号改成三个句点',
      markdown: '去掉 Markdown 标记',
      whitespace: '整理空白',
      homoglyphs: '替换形近字母',
      emoji: '删除 emoji',
      always: '始终处理',
    },
    footnotes: [
      'U+202F 在法语里是 ; : ! ? % 前面的正规空格。如果文本是法语，请取消「规范特殊空格」。',
      '方向标记在阿拉伯语和希伯来语里是正常字符，同时也是 Trojan Source 攻击使用的字符。处理真正的双向文本时，请取消「删除不可见字符」。',
      'U+3000 是中文、日文、韩文的全角空格。U+200C 零宽非连接符在波斯语和印地语里有意义。两者都可以通过上面的开关保留。',
      'emoji 默认保护。属于 emoji 的连接符和变体选择符，包括家庭组合和肤色，不会被删除。同样的字符出现在普通文字里时会被删除。',
    ],
  },
  rules: ZH_RULES,
  actionLabel: {
    strip: '删除',
    space: '换成普通空格',
    newline: '规范为换行',
    straightDouble: '换成直双引号',
    straightSingle: '换成直撇号',
    hyphen: '换成连字符',
    dots: '换成三个句点',
  },
  sections: {
    features: '这个工具能做什么',
    scenarios: '什么时候会用到',
    faqs: '常见问题',
    related: '相关的浏览器工具',
  },
  features: [
    {
      title: '边贴边出报告',
      description: '输入时就按字符种类计数，名字旁边带 Unicode 码位。',
    },
    {
      title: '一键得到纯文本',
      description: '不可见字符删除，特殊空格换成普通空格，弯引号换成直引号。不会改写你的句子。',
    },
    {
      title: '留在这个标签页',
      description: '检查和清理都在浏览器里进行。你粘贴的文字不会上传到原牛。',
    },
    {
      title: 'emoji 保持完整',
      description: '家庭 emoji、肤色和 emoji 内部的变体选择符会留下。普通文字里单独出现的连接符仍会删除。',
    },
  ],
  scenarios: [
    {
      title: '从聊天窗口贴出来的草稿',
      description: '把模型草稿贴进公众号、邮件或文档之前，先去掉那些看不见的残留。',
    },
    {
      title: '代码和配置解析失败',
      description: '标识符里的零宽空格、配置文件开头的字节顺序标记、命令里的不换行空格。看起来没错，工具却不认。',
    },
    {
      title: '表格去重对不上',
      description: '两个看起来一样的单元格，一个里面是 U+00A0 或 U+202F，相等比较就会失败。',
    },
    {
      title: '法语、阿拉伯语和中文',
      description: '同一类字符在有些语言里是正确排版。开关可以只清理英文草稿，而不压平法语空格、全角空格或双向文本。',
    },
  ],
  faqs: [
    {
      question: 'AI 水印检测在找什么？',
      answer:
        '大家说的 AI 水印检测，找的是从聊天机器人和文字软件复制出来的隐藏字符和特殊字符：零宽空格、窄不换行空格 U+202F、不换行空格、弯引号、破折号，以及其他不可见 Unicode。这个页面在浏览器里做这件事，也可以把它们清掉。它不能发现藏在用词里的统计水印。',
    },
    {
      question: 'ChatGPT 真的用隐藏空格给文字加水印了吗？',
      answer:
        '2025 年 4 月，有人在 o3 和 o4-mini 的回答里发现大量窄不换行空格（U+202F），这个字符被广泛叫成水印。OpenAI 说那是训练副作用，不是水印，这种分布随后也消失了。现在仍然成立的是更普通的事：复制出来的文字经常带弯引号、破折号、奇怪的空格，有时还有不可见 Unicode。这个工具把这些字符显示出来。它不能证明这段话是模型写的。',
    },
    {
      question: '清理会改我的措辞吗？',
      answer:
        '不会。清理不会改写、缩写或「人性化」草稿。它删除不可见字符，把特殊空格换成普通空格，在对应开关打开时把引号和破折号拉直，也可以去掉 Markdown 标记。每条规则都能关掉，复制之前报告会列出找到了什么。',
    },
    {
      question: '我粘贴的文字会被上传吗？',
      answer:
        '不会。检查和清理都在你的浏览器标签页里进行。原牛不会收到你粘贴的文字，也不需要账号。页面仍可能加载本站常规的广告和分析脚本；这些脚本拿不到文本框里的内容。',
    },
    {
      question: '清掉之后，AI 写的文字就能通过检测器了吗？',
      answer:
        '不能。删掉隐藏字符，既骗不过按文风打分的检测器，也去不掉 SynthID-Text 这类统计水印。字符清理做不到这两件事。',
    },
    {
      question: '破折号能不能证明这段文字是生成的？',
      answer:
        '不能。破折号是正常标点，模型输出里也常见，所以有的编辑会把它当成一个提示。如果你想要连字符，可以打开破折号开关。关掉这个开关，破折号会保留。',
    },
    {
      question: '为什么看不见的字符会让代码、表格和后台出错？',
      answer:
        '名字里的零宽空格、文件开头的字节顺序标记、命令里的不换行空格，看起来和你期望的字符一样，比较时却是另一个值。编译器、搜索、去重和数据库就会以很难用眼睛发现的方式失败。把粘贴的内容清一遍，能修掉这一类问题，和文字从哪来无关。',
    },
    {
      question: '哪些字符可以保留？',
      answer:
        '关掉「规范特殊空格」，可以留下 U+202F（包括法语空格）和中文全角空格 U+3000。关掉「删除不可见字符」，可以留下阿拉伯语或希伯来语的方向标记，以及波斯语和印地语使用的零宽非连接符。emoji 默认保留。本页的表格就是检查器使用的完整清单。',
    },
  ],
  related: [
    {
      href: '/zh/sensitive-words',
      title: '敏感词检测',
      description: '在同一个浏览器标签页里检查广告文案中的高风险表述，文字不上传。',
    },
    {
      href: '/zh/subtitle-tools',
      title: '字幕工具',
      description: '本地转换 SRT 和 VTT、平移时间轴并清理字幕文件。',
    },
    {
      href: '/zh/markdown-to-image',
      title: 'Markdown 转图片',
      description: '把整理好的 Markdown 笔记转成可分享的 PNG，不用离开浏览器。',
    },
  ],
  sample:
    '\uFEFF# 发布说明\u200B\n\n**先发出更新**\u2014再告诉读者改了什么\u2026\n\n> \u201C看不见的字符，通常是在构建失败时才被发现的。\u201D\n\n* 标识符里可能夹着一个零\u200B宽空格\n* 百分号前的窄空格：10\u202F%\n* 这里有一个全角空格：中\u3000文\n* emoji 应当保留：\u{1F44D}\u{1F3FD} \u2764\uFE0F\n\n附注：这一行里藏着一个软连\u00AD字符。',
}

const COPY: Record<Locale, AiWatermarkCopy> = { en: EN, zh: ZH }

export function getAiWatermarkCopy(locale: Locale): AiWatermarkCopy {
  return COPY[locale]
}
