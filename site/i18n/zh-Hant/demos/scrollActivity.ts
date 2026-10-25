import type ja from '../../ja/demos/scrollActivity';

export default {
  label: '最近操作',
  visibility: '捲軸的顯示方式',
  modes: { auto: '自動', hover: '懸停', scroll: '捲動時', always: '始終' },
  items: [
    '佐藤開立了「4 月帳單」',
    '田中加入了專案「Atlas 2.0」',
    '儲存空間用量已達 80%',
    '鈴木在「價格表調整」中留言',
    '建立了新的 API 金鑰',
    '高橋邀請了 3 位成員',
    '寄出了每週報告',
    '伊藤匯出了「流失原因」',
    '將方案從 Pro 變更為 Max',
    '渡邊啟用了兩步驟驗證',
    '變更了帳單地址',
    '山本變更了工作區名稱',
    '中村草擬了「新手引導」郵件',
    '登入失敗 3 次（東京）',
    '小林發布了「客戶案例」',
    '加藤變更了通知設定',
  ],
  comments: {
    height: '高度上限加在容器上（捲動區域隨容器的高度縮小，內容溢出多少就能捲動多少）',
  },
} satisfies typeof ja;
