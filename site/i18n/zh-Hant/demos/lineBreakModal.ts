import type ja from '../../ja/demos/lineBreakModal';

export default {
  toggle: '在詞語邊界換行',
  open: '開啟窄模態視窗',
  title: '分享第 3 季各門市營收報告',
  description: '分享後，所有具備檢視權限的成員都會收到通知。',
  tableLabel: '分享對象',
  headTarget: '分享對象',
  headRole: '權限',
  row1Target: '東北區的門市負責人',
  row1Role: '檢視與留言',
  row2Target: '經營企劃部的成員',
  row2Role: '僅限檢視',
  draft: '儲存為草稿',
  share: '分享給成員並通知',
  comments: {
    mode: "只需切換 lineBreak。預設為 'phrase'（文節、詞語），平常什麼都不用寫",
  },
} satisfies typeof ja;
