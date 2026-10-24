import type ja from '../ja/uiFeedback';

export default {
  lead: '进度条、加载指示器、加载前的骨架屏、页面上的通知横幅。它们都会把“现在正在发生什么”同时传达给眼睛和读屏。',
  progress: {
    title: '进度',
    intro: '给 role="progressbar" 加上名称和值。值默认播报为百分比，也可以用 valueText 写成“12 / 20 GB”这样的形式。值未知时，线条会循环流动。',
  },
  spinner: {
    title: '加载指示器',
    intro: '用于短暂的等待。通过 role="status" 只播报一次“处理中”，圆环本身只是装饰。在“减弱动态效果”设置下，旋转会变慢。',
  },
  skeleton: {
    title: '骨架屏',
    intro: '在加载前只显示轮廓，减少内容出现时的跳动。它只是装饰，所以不会被播报。正在加载这件事，用所在容器的 aria-busy 或加载指示器来传达。光泽流动的动画在“减弱动态效果”设置下和动效级别为 none 时会停止。',
  },
  notifications: {
    title: '通知列表',
    intro: '从顶部栏的铃铛打开的列表，列出收到的通知。按钮的名称包含未读数量（数字徽标只是装饰），未读的项目还会用粗体和圆点标示。收到的时间写成“5分钟前”“昨天”，点击后可以标为已读。',
    exampleTitle: '通知',
    exampleDescription: '点击铃铛即可打开列表。点击项目后会标为已读，点击“全部标为已读”会把其余的也一起标为已读。按 Esc 关闭后，焦点会回到铃铛；点击外部也会关闭。',
  },
  checklist: {
    title: '入门清单',
    intro: '注册之后，列出开始使用所需的步骤。放置“已完成 1 / 4”这样的进度，完成的步骤会把标记换成对勾。播报时会附上“已完成”“未完成”，不只靠标记和颜色。',
    exampleTitle: '快速上手',
    exampleDescription: '点击步骤的按钮，该步骤即完成，焦点会移到下一个步骤的按钮。可以用右上角的 × 关闭。',
  },
  banner: {
    title: '通知横幅',
    intro: '维护预告、付款失败、试用期剩余天数等与整个页面相关的通知。用低调的底色与正文区分开，不用边框或左侧粗线把它框起来。只有在之后才显示时，才用 live 播报。',
  },
  labels: {
    value: '有值',
    custom: '改变值的写法',
    small: '细（sm）',
    indeterminate: '值未知',
    sizes: '大小',
    text: '文本骨架',
    card: '卡片骨架',
  },
  sample: {
    upload: '上传',
    storage: '存储空间',
    storageText: (used: number, max: number): string => `${String(used)} / ${String(max)} GB`,
    sync: '同步',
    preparing: '正在准备导出',
    maintenanceTitle: '维护通知',
    maintenance: '10月24日（周六）2:00〜4:00 服务将暂停。',
    paymentTitle: '付款失败',
    payment: '无法用已登记的卡完成扣款。请更新卡片信息。',
    update: '更新卡片',
    trial: '试用期还剩 5 天。',
    upgrade: '选择套餐',
    saved: '设置已保存。',
  },
  code: "import { Progress, Spinner, Skeleton, Banner } from '@genelab/gassan';\n\n<Progress label=\"存储空间\" value={12} max={20} valueText={(v, m) => `${v} / ${m} GB`} />\n\n<Spinner label=\"正在同步\" />\n\n<div aria-busy={loading}>{loading ? <Skeleton lines={3} /> : <Article />}</div>\n\n<Banner tone=\"error\" title=\"付款失败\" action={<Button size=\"sm\">更新卡片</Button>}>\n  无法用已登记的卡完成扣款。\n</Banner>",
  codeCaption: '用法',
  a11yCaption: '进度与通知满足的规范',
} satisfies typeof ja;
