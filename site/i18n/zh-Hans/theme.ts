import type ja from '../ja/theme';

export default {
  lead: '可以自由切换显示（浅色、深色）、背景的着色和主色。无论选择哪种颜色，都会推导出不低于 WCAG 标准的文字与填充色。',
  checksTable: {
    sample: '示例',
    pair: '组合',
    ratio: '比值',
    min: '标准',
    pass: (min: number): string => `达标（${String(min)}:1 以上）`,
    fail: (min: number): string => `不足（低于 ${String(min)}:1）`,
  },
  controls: {
    title: '切换',
    intro: '这里的设置与页面顶部的“主题”相同，对整个站点和模态框演示都生效。',
  },
  now: {
    title: '当前主题',
    intro: '从所选颜色推导出的 4 种强调色与 4 种背景色，以及使用它们的组合的对比度。此表按当前设置计算。站点的文字在它可能所在的表面中，按比值最小的表面来测量。',
    tones: {
      accent: '强调色（填充、链接、焦点）',
      onAccent: '强调色上的文字',
      soft: '浅色表面',
      onSoft: '浅色表面上的文字',
      bg: '页面背景',
      surface: '卡片的表面',
      surface1: '下沉一级的表面',
      modal: '模态框的表面',
    },
    tableCaption: '当前主题的对比度',
  },
  presets: {
    title: '全部预设',
    intro: '种子色，以及浅色、深色下实际使用的颜色。右侧数字是该主题中余量最小的组合的比值。背景的着色按当前设置计算。',
    tableLabel: '预设的验证',
    tableCaption: '各预设的颜色与最严格组合的比值',
    preset: '预设',
    seed: '种子色',
    light: '浅色',
    dark: '深色',
    current: '当前选择',
    pass: '全部达标',
    fail: '有不足',
    withTightest: (verdict: string, ratio: string, min: number): string =>
      `${verdict}，最小 ${ratio}:1（标准 ${String(min)}:1）`,
    body: [
      '同样的组合在测试中也做了穷举检查（`tests/theme.test.ts`）。除预设外，还对色相 24 个方向 × 明度 5 级 × 彩度 4 级的所有任意颜色，确认背景的 3 个档位在浅色与深色下的全部条目都满足标准、色相不发生偏移、相邻预设能够区分。',
    ],
  },
  how: {
    title: '颜色的确定方法',
    rules: [
      {
        title: '保持色相，只调整明度',
        body: '把所选颜色转换到 OKLCH（接近人眼感知的色彩空间），在保持色相和彩度的前提下调整明度。如果直接在 RGB 中调暗，色相会跑偏，黄色看起来会变成绿色或棕色。',
      },
      {
        title: '对所有表面取得 4.5:1',
        body: '强调色也用于链接和选中项的文字，所以要一直调整，直到对页面背景、表面、下沉的表面、浅色表面全部达到 4.5:1。浅色主题往暗处调，深色主题往亮处调，并停在最接近种子色的明度。',
      },
      {
        title: '文字在浅色下为白色，在深色下为深色',
        body: '对表面达到 4.5:1 的颜色，在浅色主题下对白色文字、在深色主题下对比任何表面都深的文字，必然也达到 4.5:1 以上。填充按钮的文字由计算来保证。',
      },
      {
        title: '浅色表面上的文字以 7:1 为目标',
        body: '像选中的导航项、补充说明框这样承载长文字的地方，目标是 AAA 而不是 AA。',
      },
      {
        title: '在背景中混入主色的色相',
        body: '“淡”在不改变表面与线条明度的前提下，淡淡地混入色相。“浓”进一步增加彩度，在浅色下调暗、在深色下调亮，让页面成为有颜色的表面。卡片和模态框的表面颜色较轻，浮在背景之上。文字会调整明度，直到在着色后的表面上也达到 4.5:1。表面越暗，强调色能达标的明度范围就越窄，因此在“浓”下相邻预设的颜色会稍微接近。',
      },
    ],
    callout: (yellowHue: number, limeHue: number): string =>
      `黄色、黄绿这类明亮的色相，为了在白色表面上取得 4.5:1，在浅色主题下会暗到芥末色或橄榄色。这是把可读性放在选色自由之前的结果。在深色主题下可以保持原有的鲜艳度。「黄色」与「黄绿」之间还有「柠檬黄」，为了在浅色下调暗后仍能与相邻的预设区分，把「黄绿」拉开到色相 ${String(limeHue)}°。请用色相 ${String(yellowHue)}° 的「黄色」对照预设表看一看。`,
  },
  own: {
    title: '在自己的应用中更换颜色',
    intro: 'gassan 模态框的颜色只需覆盖自定义属性即可更改。在 @layer 之外书写，就不必考虑优先级。',
    code: (accent: string, onAccent: string, tinted: string): string =>
      `:root {\n  --g-accent: ${accent};     /* primary 的填充、开关、选中的标签 */\n  --g-on-accent: ${onAccent};  /* 其上的文字 */\n  --g-focus: ${accent};      /* 焦点环 */${tinted}\n}`,
    tintedComment: '背景的着色（表面、边框、文字）',
    body: [
      '上面的值是从当前所选主题推导出来的。自己决定颜色时，请用本页表格中的相同组合（accent 与 on-accent、accent 和 focus 对表面）确认比值。',
    ],
  },
} satisfies typeof ja;
