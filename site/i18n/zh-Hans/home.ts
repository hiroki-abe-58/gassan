import type ja from '../ja/home';

export default {
  eyebrow: '面向 SaaS 的 React UI 库',
  heroTitle: ['从登录到账单，', '只需放一个组件。'],
  lead: 'gassan 是以原生 `<dialog>` 为基础的 React UI 库。从模态框、表单部件、UI 部件、轻提示、命令面板，到登录、错误、价格、设置、成员、账单的页面，都包含在内。焦点陷阱、Esc、背景 inert 化都交给浏览器，省下的精力用来把读屏、键盘和日语换行写进规范，并用测试验证。',
  start: '开始使用',
  templates: '查看模板',
  stats: {
    exports: '公开的 API',
    items: '列举的行为',
    tests: '自动化测试',
    trap: '自己实现的焦点陷阱',
  },
  showcase: {
    title: '示例应用',
    intro: '“Atlas”是一个虚构的 SaaS。通过导航和按钮，可以在首页、成员、套餐与账单、设置、登录、套餐与价格之间四处浏览。界面由 gassan 的模板和部件搭建，额外加上的只有标志、示例数据，以及首页数字的排列方式。切换到“手机”，就会变成窄屏的样子。',
    frameTitle: 'Atlas',
    variants: { dashboard: '首页', members: '成员', billing: '套餐与账单', settings: '设置', signIn: '登录', pricing: '套餐与价格' },
  },
  features: {
    title: '包含的内容',
    intro: 'SaaS 界面需要的东西，以部件和页面为单位提供。每一项都用具名 import 引入，没有用到的不会被打包进应用。',
    items: {
      modal: {
        title: '模态框',
        body: '五种类型、激活门控、标题截断、关闭原因、按档位停靠的底部面板。焦点、Esc 和背景交给浏览器。',
      },
      forms: {
        title: '表单部件',
        body: '输入框、选项、下拉选择、带日本节假日和区间选择的日历、时间、标签、密码强度、文件。',
      },
      ui: {
        title: 'UI 部件',
        body: '按钮、徽标、卡片、数值摘要、标签页、菜单、面包屑、分页、步骤条、数据表格、命令面板。',
      },
      feedback: {
        title: '通知',
        body: '计时条随剩余时间缩短的轻提示、通知横幅、进度。可以暂停下来阅读，轻扫或手动都能关闭。',
      },
      templates: {
        title: '页面模板',
        body: '登录、注册、两步验证、重置密码、错误、维护、价格、常见问题、条款、联系我们、更新日志。',
      },
      app: {
        title: '应用界面',
        body: '应用外框，以及设置、成员、套餐与账单、初始设置、接受邀请的页面。只要传入数据和处理函数就能运行。',
      },
      motion: {
        title: '动效',
        body: '可以从 4 个级别的动效中选择。按下时的手感、退出、弹簧的回弹都已齐备，并且始终遵从“减弱动态效果”的设置。',
      },
      a11y: {
        title: '读屏与键盘',
        body: '名称、状态、焦点的去向，按部件逐一写进规范，并用测试验证。不只靠颜色传达。',
      },
    },
  },
  languages: {
    title: '为日语、中文、韩语界面而做',
    intro:
      '在窄屏上，不再出现断成「プロフィールを編｜集」「保存更改并关｜闭」的按钮。用右上角的“主题”换颜色，文字依然清晰可读。',
    browserNote: '在词语中间断开',
    phraseNote: '在词语、文节的边界处断开',
    details: {
      lineBreak: {
        title: '换行',
        body: '从按钮、标题、表格单元格到图表摘要，日语只在文节边界、中文只在词语边界、韩语只在空格处换行。泰语和英语不做处理。读屏读出的名称和复制得到的文字保持不变。',
      },
      theme: {
        title: '主题',
        body: (presets: number): string =>
          `浅色与深色，${String(presets)} 种预设以及自定义颜色。无论选择哪种颜色，都会推导出满足 WCAG 标准的文字与填充色。`,
      },
      button: {
        title: '按钮的种类与状态',
        body: 'primary、secondary、tertiary 以及 danger。可按、处理中、门控中、不可用，不只靠颜色，也能从形状上区分。',
      },
    },
  },
  promises: {
    title: '模态框的核心——其他库没有解决的 4 件事',
    intro: '第 1 层（top layer、焦点、Esc）浏览器已经解决了。gassan 把时间花在其上的设计工作上。',
    gate: {
      title: '激活门控',
      body: '不使用 disabled，做出“读到最后”“勾选之后”才能按下的按钮。一按，就播报还缺什么，并把用户带到那里。',
      mockTitle: '服务条款更新',
      mockButton: '同意并继续',
      mockNote: '请将正文读到最后',
    },
    clamp: {
      title: '标题截断',
      body: '不截断 DOM 中的文字，只用 CSS 的 line-clamp 省略。读屏读出的名称始终完整。只有溢出时才会出现“显示全文”。',
      mockTitle: '更改 2026 财年第三季度东北地区各门店销售报告的共享设置',
      mockToggle: '显示全文',
    },
    reasons: {
      title: '关闭原因',
      body: 'Esc、背景、×、提交、轻扫、返回、页面跳转、外部调用 close()。区分这 8 种，拒绝关闭时也不保持沉默。',
    },
    scrim: {
      title: '遮罩层令牌',
      body: '不再写死 60% 的黑色，改为按意图划分的 4 级。默认为 32%、不加 blur。不抹掉模态框唯一的长处——“上下文”。',
    },
  },
  kinds: {
    title: '从五种类型中选择',
    intro:
      '确定一个 kind，遮罩层的浓度、能否用 Esc 和点击背景关闭、位置的默认值就随之确定。如果同时符合多种，那其实是应该拆开的两个模态框。按下按钮会打开真实的模态框。',
    items: {
      confirm: { label: '确认', use: '确认不可撤销的操作' },
      form: { label: '输入', use: '保持上下文的附属输入' },
      view: { label: '浏览', use: '查看详情、放大媒体' },
      consent: { label: '同意', use: '明确同意条款、权限' },
      flow: { label: '流程', use: '多个步骤的手续' },
    },
    scrim: '遮罩层',
    esc: 'Esc',
    backdrop: '背景',
    closes: '关闭',
    stays: '不关闭',
    more: '类型的选择方法与决策矩阵 →',
  },
  verified: {
    title: '不是主张，而是检查结果',
    intro: (items: number): string =>
      `规范中的 ${String(items)} 项，每一项都关联到测试名、CSS 或路线图之一。如果把不存在的测试名写作依据，CI 就会失败。`,
    count: (count: number): string => `${String(count)} 项`,
    bar: (parts: readonly string[]): string => parts.join('、'),
    spec: (items: number): string => `查看 ${String(items)} 项行为规范`,
    verification: '验证了什么，没有验证什么 →',
  },
  install: {
    title: '安装',
    caption: '安装',
    cssCaption: '加载样式',
    css: "import '@genelab/gassan/styles.css';\n// 仅在使用页面模板时（在 styles.css 之后加载）\nimport '@genelab/gassan/templates.css';",
    more: '最小示例与浏览器要求 →',
  },
} satisfies typeof ja;
