import type ja from '../ja/verification';

export default {
  lead: '“测试是绿的”与“有保证”是两回事。在哪一层验证了什么、什么还没能验证，分开来写。',
  stats: {
    tests: (files: number): string => `测试（${String(files)} 个文件）`,
    items: '行为条目',
    proven: '已由测试证明的条目',
    device: '只能在真机上确认的条目',
  },
  pipeline: {
    intro: '自上而下依次运行，任何一步失败就停止。越往下的步骤，越能捕捉到上面的步骤从原理上发现不了的事故。',
    steps: [
      { command: 'tsc --noEmit', catches: '类型不一致' },
      { command: 'eslint .', catches: '可以静态发现的笔误' },
      { command: 'vitest run', catches: '可访问名称、门控的逻辑或、关闭原因的分类、颜色对比度' },
      { command: 'check:trace', catches: '规范条目与依据的缺失或多余、引用了不存在的测试名、文档中所写数量的偏差' },
      { command: 'check:docs', catches: 'README 和 docs 中的代码示例无法用公开 API 编译' },
      { command: 'tsup', catches: 'ESM / CJS / 类型生成失败' },
      { command: 'check:dist', catches: '"use client" 丢失、公开 API 缺失、超出体积预算' },
      {
        command: 'check:ssr',
        catches: '渲染期间引用 window（在 Next.js App Router 中会出错）、SSR 时门控的 fail-open',
      },
      {
        command: 'check:pack',
        catches: '发布到 npm 的形态出现事故（缺少 LICENSE、types 条件弄错、随附文档的链接失效）',
      },
    ],
  },
  status: {
    title: '条目的状态',
    intro: (count: number): string => `${String(count)} 个条目各自以何种强度得到保证。`,
    count: (n: number): string => `${String(n)} 项`,
    weakMust: (n: number): string =>
      `有 ${String(n)} 个条目是必须（M）却处于“已记述”状态。值已经过机器校验，但渲染结果只能在真实浏览器中确认。这是本库目前的弱点，我们不加隐瞒地列出来。`,
  },
  device: {
    title: 'jsdom 无法验证的内容',
    intro:
      '像 top layer、退出动画、遮罩层浓度这样，不渲染就无法判定真假的条目。在真机上打开 examples/css-check.html，同样的条目会以复选框的形式列出。',
    tableCaption: '真机检查表',
    columns: { id: 'ID', item: '条目', how: '确认方法', diagnosis: '如果失败' },
    pending: (n: number): string =>
      `这 ${String(n)} 个条目尚未在真机上逐一确认（ROADMAP v0.2.0）。真实浏览器中的自动检查（Playwright + axe）将在 v0.4.0 中加入。详见 [VERIFICATION.md](VERIFICATION.md) 和 [ROADMAP.md](ROADMAP.md)。`,
  },
} satisfies typeof ja;
