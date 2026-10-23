import { siteConfig } from '@/config/site'
import type { Locale } from '@/lib/i18n'

/**
 * 法律页面内容（隐私政策 / 服务条款），中英各一份。
 *
 * 两版必须保持同一事实口径：工具本地处理、不上传文件；使用无 Cookie 的
 * 自托管 Umami 统计；通过 Google AdSense 展示广告（Google 及其合作方可能
 * 使用 Cookie）。修改其中一版时同步另一版，避免中英政策不一致。
 */

export interface LegalSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface LegalDoc {
  title: string
  lastUpdated: string
  metaDescription: string
  sections: LegalSection[]
}

const CONTACT = siteConfig.author.email
const DOMAIN = siteConfig.domain

export const privacyContent: Record<Locale, LegalDoc> = {
  zh: {
    title: '隐私政策',
    lastUpdated: '最后更新：2026 年 10 月 23 日',
    metaDescription:
      '了解 mihoyonb 如何处理你的信息：所有工具在浏览器本地运行、文件不上传；使用无 Cookie 的自托管统计；通过 Google AdSense 展示广告。',
    sections: [
      {
        heading: '我们是谁',
        paragraphs: [
          `mihoyonb（${DOMAIN}）提供免费的浏览器端创作工具。本政策说明你在使用本站时，信息会如何被处理。如有疑问，可随时通过 ${CONTACT} 联系我们。`,
        ],
      },
      {
        heading: '你处理的文件不会上传',
        paragraphs: [
          '本站所有工具（图片拼接、拼豆图纸、Markdown 转图片、二维码、字幕处理等）都使用浏览器自带的 Canvas 与 Web API 在本机完成处理。你选择的图片、视频、字幕和文本只会留在你的设备上，不会上传到我们的服务器，我们也没有接收文件的接口。',
          '正因如此，大部分工具在断网后仍可继续使用；我们也无法查看、恢复或删除你处理过的文件。',
        ],
      },
      {
        heading: '我们收集的信息',
        paragraphs: [
          '本站不要求注册账号，不收集姓名、邮箱、支付信息，也不会建立用户画像。',
        ],
        bullets: [
          '服务器日志：托管服务会为安全与防滥用保留常规访问日志（IP 地址、浏览器标识、请求地址、时间），并在短期保留后轮转删除。',
          '访问统计：本站使用自托管的 Umami 统计页面访问量、来源与设备类型。它不使用 Cookie，不做跨站追踪，也不记录你在工具里处理的内容。',
          '广告：本站通过 Google AdSense 展示广告，相关 Cookie 与数据处理见下一节。',
        ],
      },
      {
        heading: '广告与第三方 Cookie',
        paragraphs: [
          '为了维持免费服务，本站展示 Google AdSense 广告。包括 Google 在内的第三方供应商可能使用 Cookie，根据你此前对本站或其他网站的访问记录投放广告。Google 使用广告 Cookie 后，Google 及其合作方可以基于你对本站和/或互联网上其他站点的访问投放广告。',
          `你可以访问 Google 广告设置（https://adssettings.google.com）管理或关闭个性化广告，也可以在 https://www.aboutads.info/choices/ 了解并退出部分第三方供应商的广告 Cookie。退出个性化广告后你仍会看到广告，但相关性会降低。Google 如何在其合作方网站使用数据，可查看 https://policies.google.com/technologies/partner-sites 。`,
          '如果你位于欧洲经济区或英国，广告与 Cookie 的投放会遵循 Google 的同意要求；你也可以随时在浏览器中清除或阻止 Cookie。',
        ],
      },
      {
        heading: 'Cookie',
        paragraphs: [
          '本站自身的页面不使用登录 Cookie，也没有账号体系；访问统计不使用 Cookie。广告合作方可能在你访问时设置 Cookie，用于频次控制、防欺诈与广告效果衡量。阻止第三方 Cookie 不会影响工具的核心功能，只会影响广告体验。',
        ],
      },
      {
        heading: '第三方链接',
        paragraphs: [
          '本站可能包含指向第三方网站的链接（例如广告、目录站或社交平台）。这些网站由第三方运营，其隐私政策不受我们控制，建议你在提交任何信息前自行阅读。',
        ],
      },
      {
        heading: '儿童隐私',
        paragraphs: [
          '本站不面向 13 岁以下儿童（欧洲经济区为 16 岁以下）提供服务，也不会主动收集儿童的个人信息。如果你是家长或监护人，发现孩子向我们提供了个人信息，请联系我们处理。',
        ],
      },
      {
        heading: '你的权利',
        paragraphs: [
          `根据你所在地区的法律（如 GDPR、CCPA），你可能有权访问、更正、删除或限制处理你的个人信息，或反对个性化广告。由于本站不保存账号数据，我们掌握的个人信息非常有限；服务器日志与广告数据主要由托管商和 Google 处理，你可以通过 ${CONTACT} 联系我们，我们会尽力协助。`,
        ],
      },
      {
        heading: '政策更新',
        paragraphs: [
          '我们可能因功能或法规变化更新本政策。更新后会修改本页顶部的日期；重大变化会在站内提示。继续使用本站即表示你接受更新后的政策。',
        ],
      },
      {
        heading: '联系我们',
        paragraphs: [`如对本政策有任何疑问，请联系：${CONTACT}。`],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: October 23, 2026',
    metaDescription:
      'How mihoyonb handles your data: every tool runs locally in your browser and your files are never uploaded, analytics is cookie-less, and ads are served by Google AdSense.',
    sections: [
      {
        heading: 'Who we are',
        paragraphs: [
          `mihoyonb (${DOMAIN}) provides free, browser-based creative tools. This policy explains what happens to your information when you use the site. If you have questions, contact us at ${CONTACT}.`,
        ],
      },
      {
        heading: 'Your files stay on your device',
        paragraphs: [
          'Every tool on this site (image collage, bead pattern generator, Markdown to image, QR codes, subtitle tools and others) runs locally in your browser using Canvas and standard web APIs. The images, videos, subtitles and text you open stay on your device: they are not uploaded to our servers, and we have no endpoint that accepts them.',
          'That also means most tools keep working offline, and we cannot view, recover or delete files you have processed.',
        ],
      },
      {
        heading: 'Information we collect',
        paragraphs: [
          'We do not require an account and do not collect names, email addresses or payment details. We do not build user profiles.',
        ],
        bullets: [
          'Server logs: our hosting provider keeps standard access logs (IP address, user agent, requested URL, timestamp) for security and abuse prevention, retained for a short period and then rotated out.',
          'Analytics: we use a self-hosted Umami instance to measure page views, referrers and device type. It does not use cookies, does not track you across sites and does not record what you process inside a tool.',
          'Advertising: we display ads through Google AdSense. The related cookies and data processing are described below.',
        ],
      },
      {
        heading: 'Advertising and third-party cookies',
        paragraphs: [
          'To keep the tools free, this site displays Google AdSense ads. Third-party vendors, including Google, may use cookies to serve ads based on your prior visits to this or other websites. Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the Internet.',
          'You can manage or turn off personalized advertising in Google Ads Settings (https://adssettings.google.com), and learn about opting out of some third-party vendors’ cookies at https://www.aboutads.info/choices/. If you opt out of personalized advertising you will still see ads, but they will be less relevant. For details on how Google uses data on partner sites, see https://policies.google.com/technologies/partner-sites.',
          'If you are in the European Economic Area or the United Kingdom, advertising and cookies are handled according to Google’s consent requirements. You can also clear or block cookies in your browser at any time.',
        ],
      },
      {
        heading: 'Cookies',
        paragraphs: [
          'Our own pages do not use login cookies and we have no account system; our analytics does not use cookies. Advertising partners may set cookies when you visit, for frequency capping, fraud prevention and measurement. Blocking third-party cookies does not affect the core functionality of the tools; it only affects advertising.',
        ],
      },
      {
        heading: 'Third-party links',
        paragraphs: [
          'The site may link to third-party websites (for example ads, directories or social platforms). Those sites are operated by third parties and are not covered by this policy; please review their privacy policies before sharing information with them.',
        ],
      },
      {
        heading: 'Children’s privacy',
        paragraphs: [
          'The site is not directed to children under 13 (under 16 in the European Economic Area), and we do not knowingly collect personal information from children. If you are a parent or guardian and believe a child has provided us with personal information, please contact us so we can address it.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          `Depending on where you live (for example under the GDPR or CCPA), you may have the right to access, correct, delete or restrict the processing of your personal information, or to object to personalized advertising. Because we do not keep account data, we hold very little personal information; server logs and advertising data are handled mainly by our hosting provider and Google. You can contact us at ${CONTACT} and we will help where we can.`,
        ],
      },
      {
        heading: 'Changes to this policy',
        paragraphs: [
          'We may update this policy as features or regulations change. When we do, we will update the date at the top of this page, and significant changes will be announced on the site. Continuing to use the site means you accept the updated policy.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [`Questions about this policy? Email ${CONTACT}.`],
      },
    ],
  },
}

export const termsContent: Record<Locale, LegalDoc> = {
  zh: {
    title: '服务条款',
    lastUpdated: '最后更新：2026 年 10 月 23 日',
    metaDescription:
      'mihoyonb 服务条款：免费浏览器工具的使用规则、内容归属、免责声明与责任限制。',
    sections: [
      {
        heading: '服务说明',
        paragraphs: [
          `mihoyonb（${DOMAIN}）是一个免费的浏览器端工具站，提供图片处理、排版、拼豆图纸等工具。所有处理都在你的浏览器本地完成，文件不会上传到服务器。本站按“现状”免费提供，无需注册。`,
        ],
      },
      {
        heading: '使用规则',
        paragraphs: ['使用本站即表示你同意遵守以下规则：'],
        bullets: [
          '合法使用本站，不将其用于任何违法或侵权用途；',
          '不上传、处理或传播违反当地法律的内容；',
          '不通过自动化手段大规模抓取、攻击或干扰本站及其托管服务；',
          '不冒充本站或误导他人认为你与本站在合作或代理关系。',
        ],
      },
      {
        heading: '你的内容',
        paragraphs: [
          '你通过本站处理的图片、视频、字幕和文本，其权利仍归你或原权利人所有。由于处理过程完全在本地进行，我们不会收到、保存或主张这些内容的任何权利。你需要对自己处理的内容及使用结果负责。',
        ],
      },
      {
        heading: '知识产权',
        paragraphs: [
          '本站的界面设计、代码、品牌标识与文案受适用法律保护。你可以自由使用工具产出的结果，但不得复制、转售或冒充本站品牌与服务。',
        ],
      },
      {
        heading: '第三方服务与链接',
        paragraphs: [
          '本站包含 Google AdSense 广告及指向第三方网站的链接。这些内容由第三方提供或运营，我们不对其准确性、可用性或政策负责。你与第三方之间的交易与互动由你自行判断并承担风险。',
        ],
      },
      {
        heading: '免责声明',
        paragraphs: [
          '本站工具按“现状”和“可用”状态提供，不对处理结果的准确性、完整性或适用性作任何明示或默示保证。例如拼豆图纸的色号是屏幕参考色，实际颜色与用量请以实物色卡为准；导出结果也可能受浏览器、设备与打印设置影响。',
          '你使用本站及处理结果所产生的后果由你自行承担。',
        ],
      },
      {
        heading: '责任限制',
        paragraphs: [
          '在适用法律允许的最大范围内，我们不对因使用或无法使用本站而产生的任何间接、附带、特殊或后果性损失负责，包括数据丢失、利润损失或业务中断。若法律不允许排除某些责任，则本条款不排除该等责任。',
        ],
      },
      {
        heading: '服务变更与终止',
        paragraphs: [
          '本站为免费服务，我们保留随时修改、暂停或终止全部或部分功能的权利，恕不另行通知。我们也会尽力保持服务稳定，但不承诺不间断或无错误运行。',
        ],
      },
      {
        heading: '条款更新',
        paragraphs: [
          '我们可能更新本条款，更新后会修改页面顶部的日期。继续使用本站即表示你接受更新后的条款。',
        ],
      },
      {
        heading: '联系我们',
        paragraphs: [`如对本条款有疑问，请联系：${CONTACT}。`],
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: October 23, 2026',
    metaDescription:
      'mihoyonb terms of service: rules for using the free browser-based tools, content ownership, disclaimers and limitation of liability.',
    sections: [
      {
        heading: 'The service',
        paragraphs: [
          `mihoyonb (${DOMAIN}) is a free, browser-based toolbox offering image, layout and bead-pattern tools. All processing happens locally in your browser and your files are never uploaded to our servers. The service is provided free of charge, as is, and without an account.`,
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: ['By using the site you agree to the following:'],
        bullets: [
          'use the site lawfully and not for any illegal or infringing purpose;',
          'do not process or distribute content that violates applicable law;',
          'do not scrape, attack or otherwise disrupt the site or its hosting at scale through automated means;',
          'do not impersonate the site or misrepresent a partnership or agency relationship with us.',
        ],
      },
      {
        heading: 'Your content',
        paragraphs: [
          'You keep all rights to the images, videos, subtitles and text you process with the tools, or those rights remain with their owners. Because processing happens entirely on your device, we never receive, store or claim any rights in that content. You are responsible for the content you process and for how you use the results.',
        ],
      },
      {
        heading: 'Intellectual property',
        paragraphs: [
          'The site’s interface, code, branding and copy are protected by applicable law. You are free to use the output of the tools, but you may not copy, resell or impersonate the site’s brand and services.',
        ],
      },
      {
        heading: 'Third-party services and links',
        paragraphs: [
          'The site displays Google AdSense ads and links to third-party websites. Those services are provided or operated by third parties, and we are not responsible for their accuracy, availability or policies. Any transaction or interaction you have with a third party is at your own discretion and risk.',
        ],
      },
      {
        heading: 'Disclaimer',
        paragraphs: [
          'The tools are provided “as is” and “as available”, without any express or implied warranty of accuracy, completeness or fitness for a particular purpose. For example, bead pattern codes are screen reference colors — check a physical color card for the real colors and quantities, and exported results may vary with your browser, device and print settings.',
          'You use the site and its output at your own risk.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          'To the maximum extent permitted by applicable law, we are not liable for any indirect, incidental, special or consequential loss arising from your use of, or inability to use, the site, including lost data, lost profits or business interruption. Nothing in these terms excludes liability that cannot be excluded by law.',
        ],
      },
      {
        heading: 'Changes and availability',
        paragraphs: [
          'The service is free, and we reserve the right to modify, suspend or discontinue all or part of it at any time without notice. We aim to keep the service running smoothly but do not guarantee uninterrupted or error-free operation.',
        ],
      },
      {
        heading: 'Changes to these terms',
        paragraphs: [
          'We may update these terms; when we do, we will update the date at the top of this page. Continuing to use the site means you accept the updated terms.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [`Questions about these terms? Email ${CONTACT}.`],
      },
    ],
  },
}
