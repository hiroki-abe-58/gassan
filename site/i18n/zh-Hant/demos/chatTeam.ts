import type ja from '../../ja/demos/chatTeam';

export default {
  label: '與陳怡君的對話',
  me: '許家瑋',
  aoi: '陳怡君',
  m1: '帳單範本的新版本已經分享了，從這個月起就能使用。',
  m2: '謝謝。我從明天的結算開始切換。',
  m3: '還有一件事。從 11 月的帳單開始，付款期限改為月底。',
  m4: '給客戶的通知，我稍後傳送。',
  reply: '了解。等通知到了，我這邊也會確認一下。',
  placeholder: '輸入訊息',
  comments: {
    reply: '範例中，傳出的訊息稍等片刻後標為已讀，並在輸入中提示之後加入回覆。在應用程式中，依伺服器的通知更新',
  },
} satisfies typeof ja;
