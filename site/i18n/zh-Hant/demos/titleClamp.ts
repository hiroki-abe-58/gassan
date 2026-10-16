import type ja from '../../ja/demos/titleClamp';

export default {
  open: '長標題的模態視窗',
  title:
    '變更 2026 年度第 3 季東北區各門市營收報告（含速報值、與去年同期比較、存貨週轉率、人事費用率）的分享設定',
  description: '只有在溢出時才會出現「顯示全文」。不依賴 hover、title 屬性或長按。',
  submit: '變更',
  comments: {
    clamp: '省略只靠 CSS 的 line-clamp。DOM 中的文字永遠完整，所以名稱不會缺漏',
  },
} satisfies typeof ja;
