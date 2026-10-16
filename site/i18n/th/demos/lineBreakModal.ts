import type ja from '../../ja/demos/lineBreakModal';

/**
 * ภาษาไทยเบราว์เซอร์ตัดบรรทัดตามพจนานุกรมอยู่แล้ว gassan จึงไม่แตะ และโมดอลจะดูเหมือนกันทั้งสองแบบ
 * เดโมนี้จึงใช้ตัวอย่างภาษาญี่ปุ่นไว้ให้เห็นความต่าง (tests/site-i18n.test.ts ยกเว้นเดโมนี้จากการตรวจคานะที่ค้าง)
 */
export default {
  toggle: 'ตัดบรรทัดที่รอยต่อวลี',
  open: 'เปิดโมดอลแคบ',
  title: '第3四半期の店舗別売上レポートを共有する',
  description: '共有すると、閲覧権限のあるメンバー全員に通知が届きます。',
  tableLabel: '共有先',
  headTarget: '共有先',
  headRole: '権限',
  row1Target: '東北エリアの店舗責任者',
  row1Role: '閲覧とコメント',
  row2Target: '経営企画部のメンバー',
  row2Role: '閲覧のみ',
  draft: '下書きとして保存する',
  share: 'メンバーに共有して通知する',
  comments: {
    mode: "แค่สลับ lineBreak ค่าเริ่มต้นคือ 'phrase' (วลี) ปกติจึงไม่ต้องเขียนอะไร",
  },
} satisfies typeof ja;
