import type ja from '../ja/header';

export default {
  lead: '头部固定在 grid 的第 1 行。控件是“返回、当前位置、关闭”三个插槽，与标题放在不同的行。',
  slots: {
    title: '三个插槽',
    intro: 'start 放返回，center 放当前位置，end 放关闭。为了不因有无返回按钮而让中间偏移，网格采用 1fr auto 1fr。',
    exampleTitle: '下单流程（3 步）',
    exampleDescription: '按“下一步”前进后，左侧会出现返回按钮。中间的“1 / 3”位置不变。',
  },
  titleRow: {
    title: '标题不放在控件那一行',
    mockTitle: '下单流程 — 选择支付方式',
    do: '控件和标题分属不同的行。标题再长也不会撞上返回和关闭（H-05）。',
    mockCrowded: '下单流程 — 选择支付…',
    dont: '不要把标题夹在返回和关闭之间。文字一长必然冲突，误按的距离也会缩短。',
  },
  indicator: {
    title: '当前位置的播报',
    body: [
      '`Modal.Indicator` 的“2 / 3”是给眼睛看的，直接读出来会变成“2 斜杠 3”。视觉用的部分设为 `aria-hidden`，另外准备“第 2 步，共 3 步”供播报使用。步骤变化时进行通知（H-06）。',
      '只有图标的按钮带有“返回”“关闭”这样的名称（A-07）。文字可以通过 `GassanProvider` 替换。',
    ],
  },
  a11yCaption: '头部与控件满足的规范',
} satisfies typeof ja;
