import type ja from '../../ja/demos/kindConfirm';

export default {
  open: 'ลบฉบับร่าง',
  closedReason: 'เหตุผลที่ปิด: {0}',
  title: 'ลบฉบับร่างนี้ไหม',
  description: 'ลบแล้วกู้คืนไม่ได้ และจะหายไปจากหน้าจอของผู้ร่วมแก้ไขด้วย',
  cancel: 'ยกเลิก',
  confirm: 'ลบ',
  comments: {
    danger: 'คงตำแหน่งของ primary ไว้ เปลี่ยนแค่สีเป็น danger (F-06)',
  },
} satisfies typeof ja;
