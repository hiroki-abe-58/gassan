import type ja from '../../ja/demos/footerButtons';

export default {
  open: 'ตั้งค่าการเผยแพร่',
  title: 'เผยแพร่บทความ',
  description: 'ต่อให้กด “เผยแพร่” รัว ๆ ครั้งที่ 2 ก็จะไม่ทำงานจนกว่าการประมวลผลจะเสร็จ (F-08) จำนวนครั้งที่ส่งไปแล้ว: {0}',
  note: 'แก้ไขได้แม้เผยแพร่แล้ว',
  cancel: 'ยกเลิก',
  saveDraft: 'บันทึกฉบับร่าง',
  publish: 'เผยแพร่',
  comments: {
    order: 'ลำดับ DOM = ลำดับที่เห็น = ลำดับ Tab เขียนเรียงจากอ่อนไปเข้ม tertiary ตัวแรกเท่านั้นที่แยกไปทางซ้าย (F-02 / F-03)',
  },
} satisfies typeof ja;
