import type ja from '../ja/slider';

export default {
  lead: 'Slider 和 RangeSlider。里面是原生的 range，手柄和填充用主题的强调色绘制。切换右上角的主题，本页滑块的颜色也会改变。',
  gallery: {
    title: '示例',
    intro: '填充只到值所在的位置。轨道向内收进手柄半径的距离，让填充的末端与手柄的中心对齐。',
    items: {
      slider: '滑块',
      value: '在旁边显示数值',
      range: '双手柄',
      disabled: '不可用',
    },
    samples: {
      volume: '音量',
      opacity: '不透明度',
      price: '价格区间',
      percent: '{0}%',
      yen: '¥{0}',
    },
  },
  modal: {
    title: '在模态框中',
    intro: '数值的表述方式（formatValue）同时用于旁边的显示和读屏播报（aria-valuetext）。',
    exampleTitle: '搜索条件',
    exampleDescription: '价格区间用两个手柄选择，距离用一个手柄选择。键盘上可以用 ←→ 和 Home / End。',
  },
  theme: {
    title: '跟随主题',
    callout:
      '原生 range 的颜色归浏览器所有，在模态框中一直是默认的蓝色。即使加上 `accent-color`，浅色时额外加上的描边和手柄的形状也因浏览器而异。gassan 重绘了手柄和轨道，并把到当前值为止的填充做成 `--g-accent` 的渐变。只要主题改变 `--g-accent`，手柄和填充就会一起改变（I-10）。',
  },
  a11yCaption: '滑块满足的规范',
} satisfies typeof ja;
