import type ja from '../../ja/demos/scrollCustom';

export default {
  looks: { thin: '細', standard: '預設', thick: '粗、直角', accent: '強調色' },
  items: ['收件匣', '草稿', '寄件備份', '已加星號', '排程傳送', '封存', '垃圾郵件', '垃圾桶', '帳單', '招募', '外部', '稍後閱讀'],
  comments: {
    looks: '外觀以自訂屬性變更（寫在容器上或其外側，裡面的捲軸就會跟著改變）',
    always: '為了看出差異，這裡始終顯示',
  },
} satisfies typeof ja;
