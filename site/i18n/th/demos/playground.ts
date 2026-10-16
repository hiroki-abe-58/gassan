import type ja from '../../ja/demos/playground';

export default {
  kindDefault: 'ค่าเริ่มต้นของ kind ({0})',
  esc: 'ปิดด้วย Esc',
  backdrop: 'คลิกพื้นหลัง',
  closes: 'ปิด',
  refuses: 'ปฏิเสธและอ่านเหตุผลออกเสียง',
  open: 'เปิดด้วยการตั้งค่านี้',
  closedBy: 'เหตุผลที่ปิด: {0}',
  logEmpty: 'บันทึกว่าปิดด้วย Esc พื้นหลัง หรือ ×',
  description: 'ลองกด Esc คลิกพื้นหลัง และปุ่ม × เมื่อตั้งไว้ว่าไม่ปิด แผงจะสั่นและอ่านเหตุผลออกเสียง',
  done: 'เสร็จสิ้น',
  comments: {
    choice: 'select หนึ่งแถว ใช้สตริงว่างแทน “ค่าเริ่มต้นของ kind”',
  },
} satisfies typeof ja;
