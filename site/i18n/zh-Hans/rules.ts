import type ja from '../ja/rules';

export default {
  lead: '无论 AI 还是老手，都会按同样的顺序踩同样的坑。为了在踩之前能机械地对照检查，这里准备了禁止事项、评分表和发布前检查清单。',
  prohibitions: {
    title: '禁止事项',
    intro: '按 AI 容易写出的顺序排列。哪怕踩中一条，也要重写。',
    tableCaption: '禁止事项',
  },
  rubric: {
    title: '质量评分标准',
    intro: '满分 15 分。不到 12 分，就回到重新选择类型（决策矩阵）这一步。',
    tableCaption: '质量评分标准',
    structureCaption: '评分的结构',
    formulaIntro: [
      '对每个实现，按下面的格式写一句话。如果能填上「ただし」（但是）后面的部分，那就是扣分理由。一直改到填不出来为止。',
    ],
  },
  checklist: {
    title: '发布前检查清单',
    intro: '一边对照自己的模态框一边使用。勾选只在本页面内有效，不会保存。',
    progress: (done: number, total: number): string => `${String(done)} / ${String(total)} 项`,
  },
  antipatterns: {
    title: '反模式对照表',
    intro: '常见的写法，以及应当替换成的写法。',
    tableCaption: '反模式对照表',
  },
} satisfies typeof ja;
