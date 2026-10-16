import type ja from '../ja/layers';

export default {
  lead: '模態視窗的實作可以分成 4 層。把層混在一起必定崩壞。gassan 的設計全部出自這種分法。',
  model: {
    title: '各層與各自的正解',
  },
  effort: {
    title: '九成的心力要花在哪裡',
    callout:
      '許多模態視窗的實作令人不滿，原因在於把九成心力花在第 1 層與第 2 層，第 4 層只用了一成。第 1 層早已被解決。',
    body: [
      '只要呼叫 `showModal()`，提升到 top layer、背景 inert 化、困住焦點、Esc、焦點復原都由瀏覽器完成。gassan **一行都沒有重新實作**。因為一旦重新實作，這個函式庫存在的理由就消失了。',
      '騰出來的手去做第 4 層：名稱的關聯、捲動區域的名稱、門控與理由的朗讀、關閉原因的分類、頁尾的順序。這些是函式庫不會替你解決、真正的設計工作。',
    ],
  },
  premise: {
    title: '前提已經改變',
    intro: 'AI 的訓練資料裡含有大量 2022 年以前的模態視窗實作。在以下 3 點上，那些前提已經過時。',
    tableCaption: '過去的前提與現在的前提',
  },
  core: {
    title: '實作的核心',
    intro: '讓退場動畫得以成立的最小構成。以 CSS 為主，JS 只負責「等待之後再 close()」。',
    cssCaption: 'modal.skill.md §7（CSS）',
    tsxCaption: 'modal.skill.md §7（開關的同步）',
  },
} satisfies typeof ja;
