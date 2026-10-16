import type ja from '../ja/rules';

export default {
  lead: '不論 AI 還是老手，都會以相同的順序踩進相同的坑。為了在踩到之前能機械式比對，這裡備好了禁止事項、評分表與發布前檢查清單。',
  prohibitions: {
    title: '禁止事項',
    intro: '依 AI 常寫出來的順序排列。只要踩到一項就重寫。',
    tableCaption: '禁止事項',
  },
  rubric: {
    title: '品質評分標準',
    intro: '滿分 15 分。未滿 12 分就回到類型的重新選擇（決策矩陣）。',
    tableCaption: '品質評分標準',
    structureCaption: '評分的結構',
    formulaIntro: [
      '針對每個實作，以下列格式寫一句話。能填上「ただし」（但是）後面的內容，那就是扣分的理由。一直修改到填不出來為止。',
    ],
  },
  checklist: {
    title: '發布前檢查清單',
    intro: '一邊對照自己的模態視窗一邊使用。勾選只存在於這個畫面中，不會儲存。',
    progress: (done: number, total: number): string => `${String(done)} / ${String(total)} 項`,
  },
  antipatterns: {
    title: '反模式對照表',
    intro: '常見的寫法，以及應改用的寫法。',
    tableCaption: '反模式對照表',
  },
} satisfies typeof ja;
