import type ja from '../../ja/demos/playground';

export default {
  kindDefault: 'kind 的預設（{0}）',
  esc: '按 Esc 關閉',
  backdrop: '點擊背景',
  closes: '關閉',
  refuses: '拒絕並朗讀理由',
  open: '以此設定開啟',
  closedBy: '關閉原因：{0}',
  logEmpty: '記錄是以 Esc、背景、× 中的哪一個關閉',
  description: '試試 Esc、點擊背景、× 按鈕。設定為不關閉時，面板會晃動並朗讀理由。',
  done: '完成',
  comments: {
    choice: 'select 的一列。以空字串表示「kind 的預設」。',
  },
} satisfies typeof ja;
