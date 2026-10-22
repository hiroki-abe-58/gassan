import type ja from '../ja/color';

export default {
  lead: '所有颜色都是自定义属性，各有浅色与深色两组。先决定哪一组承载什么文字，再用测试计算它们的对比度。',
  tokens: {
    title: '颜色令牌',
    intro: '读取自 src/styles.css 的 @layer gassan.tokens。深色一栏为空的，直接使用浅色的值。',
    tableCaption: '颜色令牌',
    token: '令牌',
    light: '浅色',
    dark: '深色',
  },
  contrast: {
    title: '对比度',
    intro: '下表根据打开本页时的令牌计算。tests/tokens.test.ts 使用相同的组合与计算方法，低于标准时 CI 会失败。',
    tableCaption: { light: '浅色的对比度', dark: '深色的对比度' },
    sample: '示例',
    pair: '组合',
    use: '用途',
    ratio: '比值',
    min: '标准',
    uses: {
      fg: '正文',
      'fg-muted': '补充说明、tertiary、门控中的 secondary',
      'on-accent': 'primary',
      'on-accent-muted': '门控中的 primary（G-10）',
      'on-danger': 'danger 按钮（F-06）',
      danger: '错误文字、必填标记',
      sunday: '日历的周日与节假日（I-16）',
      saturday: '日历的周六（I-16）',
      focus: '焦点环（K-07。非文本为 3:1）',
    },
    pass: (min: number): string => `达标（${String(min)}:1 以上）`,
    fail: (min: number): string => `不足（低于 ${String(min)}:1）`,
    callout:
      '门控中的 primary（`--g-accent-muted`）曾经配白字只有 3.16:1。注释里写着“保持 4.5:1”，追踪表里也声称“值已检查”，但对比度本身从来没有人算过。是在本页尝试显示对比度时才发现的。',
  },
  gated: {
    title: '按不下去的按钮，更要看得清',
    body: [
      '`disabled` 元素不受 WCAG 对比度要求的约束。但 gassan 门控中的按钮是 `aria-disabled`，可以获得焦点，按下会返回原因，是“可用”的按钮，不能依赖这条豁免规定。所以用专用令牌保持 4.5:1，不用 `opacity` 调淡了事（G-10）。',
      '我们还规定不把背景用的令牌挪作文字颜色。在深色主题下，不存在一种颜色，既能作为承载浅色文字的背景、又能作为深色表面上的文字，同时都达到 4.5:1。',
    ],
  },
  theme: {
    title: '换成自己的颜色',
    intro: '令牌位于 @layer gassan.tokens 中，所以在该层之外书写，就能不考虑优先级直接覆盖。',
    code: ':root {\n  --g-accent: #0b5cad;\n  --g-on-accent: #ffffff;\n  --g-accent-muted: #5f7184; /* 先确认配白字达到 4.5:1 以上 */\n  --g-radius: 20px;\n}',
  },
} satisfies typeof ja;
