import type ja from '../ja/common';

export default {
  siteTitle: 'gassan — 面向原生 dialog 的模态框外壳',
  skipToMain: '跳到正文',
  openMenu: '打开菜单',
  menu: '菜单',
  menuBody: '站内页面',
  siteNav: '站内导航',
  home: '首页',
  spec: '规范',
  pager: '上一页与下一页',
  prev: '上一页',
  next: '下一页',
  footerCompliance: (version: string, updated: string): string => `遵循 [规范 v${version}（${updated}）](#/spec)`,
  footerGenerated: '表格、数量和 API 全部在构建时从规范和类型定义生成，没有任何手写的数字。',
  originalNote:
    '本站的说明译自日语。引自规范（`modal.skill.md`）的文字——行为条目的名称与要点、实现说明、API 说明、验证记录——保留日语原文。',

  lang: {
    button: '语言',
    title: '显示语言',
  },

  theme: {
    button: '主题',
    close: '关闭',
    scheme: '显示',
    schemes: { light: '浅色', dark: '深色', system: '跟随系统' },
    background: '背景',
    tints: { neutral: '无彩色', soft: '淡', strong: '浓' },
    motion: '动效',
    motions: { none: '无', subtle: '克制', standard: '标准', expressive: '丰富' },
    primary: '主色',
    presets: {
      default: '默认',
      magenta: '洋红',
      red: '红色',
      salmon: '鲑鱼粉',
      vermilion: '橙红',
      amber: '琥珀色',
      yellow: '黄色',
      'lime-yellow': '柠檬黄',
      lime: '黄绿',
      green: '绿色',
      teal: '蓝绿',
      blue: '蓝色',
      indigo: '靛蓝',
      custom: '自定义颜色',
    },
    pickCustom: '选择自定义颜色',
    summaryPass: (count: number, worst: string): string =>
      `文字与填充色的 ${String(count)} 项全部满足 WCAG 标准（最严格的一组也达到标准的 ${worst} 倍）`,
    summaryFail: '有未达标的组合',
    more: '所选颜色是如何调整的 →',
    checks: {
      linkBg: '链接、选中项的文字（页面背景）',
      linkSurface: '链接、选中项的文字（表面）',
      linkSurface1: '链接、选中项的文字（下沉一级的表面）',
      linkSurface2: '链接、选中项的文字（下沉两级的表面）',
      linkSoft: '链接（浅色表面上）',
      onAccent: '填充按钮的文字',
      onSoft: '浅色表面的文字（目标 AAA）',
      ink: '正文（比值最小的表面）',
      ink2: '补充文字（比值最小的表面）',
      ink3: '次要文字（比值最小的表面）',
      do: '“Do”颜色的文字（比值最小的表面）',
      dont: '“Don’t”颜色的文字（比值最小的表面）',
      caution: '“Caution”颜色的文字（比值最小的表面）',
      gassanPrimary: '模态框 primary 按钮的文字',
      gassanGated: '模态框中门控状态的 primary 按钮的文字',
      gassanBody: '模态框的正文',
      gassanMuted: '模态框的补充说明、tertiary',
      gassanDanger: '模态框的错误提示',
      focusRing: '焦点环（非文本）',
      fill: '开关、选中标签的填充（非文本）',
    },
  },

  code: {
    copy: '复制',
    copied: '已复制',
    copiedStatus: '代码已复制',
    label: '代码',
    labelOf: (caption: string): string => `${caption} 的代码`,
  },

  example: {
    show: '查看代码',
    hide: '收起代码',
  },

  keyPoint: { caution: '注意' },

  component: {
    eyebrow: '组件',
    tabs: '本页内容',
    overview: '概览',
    api: 'API',
    a11y: '无障碍',
  },

  specChips: '本页涉及的规范',

  guideline: { do: 'Do', dont: "Don't", caution: 'Caution' },

  mock: { heading: '本月销售额' },

  specTable: {
    id: 'ID',
    behavior: '行为',
    priority: '级别',
    summary: '实现要点',
    status: '状态',
  },
  priority: { M: '必须', S: '推荐', O: '可选' },
  status: {
    実装: '已实现',
    実機: '真机',
    記述: '已记述',
    未検証: '未验证',
    委譲: '委托',
    合成: '组合',
    ロードマップ: '路线图',
  },

  api: {
    name: '名称',
    type: '类型',
    default: '默认值',
    description: '说明',
    required: '必填',
    none: '无',
    propsOf: (name: string): string => `${name} 的属性`,
    passthrough:
      '`data-*` 原样传给宿主元素（D-11）。`aria-*` 等其他带连字符的 prop 会给出警告并丢弃。',
    inherits: (name: string): string => `继承 \`${name}\`。`,
  },

  table: '表格',

  contrastSample: 'Aa 字',

  breakCompare: {
    browser: '交给浏览器',
    browserNote: '按字符换行',
    phraseNote: '在文节边界处换行',
  },

  layers: {
    layer: (n: number): string => `第 ${String(n)} 层`,
    tokens: 'CSS 令牌',
  },

  notFound: {
    title: '找不到页面',
    lead: '链接已过时，或者地址有误。',
    back: '返回首页',
  },
} satisfies typeof ja;
