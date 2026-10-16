import type ja from '../../ja/demos/chartReport';

export default {
  jan: 'ม.ค.',
  feb: 'ก.พ.',
  mar: 'มี.ค.',
  apr: 'เม.ย.',
  may: 'พ.ค.',
  open: 'รายงานรายเดือน',
  title: 'รายงานรายเดือน (ม.ค.–พ.ค.)',
  label: 'ยอดขายรายเดือน (ล้านบาท)',
  summary: 'มีนาคมสูงสุดที่ 120 ล้านบาท ตั้งแต่เมษายนเป็นต้นไปทรงตัวอยู่ราว 100 ล้านบาท',
  tableLabel: 'ข้อมูลดิบของยอดขายรายเดือน',
  month: 'เดือน',
  sales: 'ยอดขาย (ล้านบาท)',
  comments: {
    bars: 'จะวาดกราฟด้วยอะไรก็ได้ gassan ไม่ได้วาดให้',
    chart: 'ชื่อ (label) และข้อความสรุปแนวโน้ม (summary) เป็นค่าบังคับ ตัวกราฟเป็น aria-hidden โดยค่าเริ่มต้น (B-14)',
  },
} satisfies typeof ja;
