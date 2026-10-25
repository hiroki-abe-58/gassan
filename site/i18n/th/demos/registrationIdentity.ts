import type ja from '../../ja/demos/registrationIdentity';

export default {
  regime: 'ประเภทธุรกิจ (กฎหมายที่อ้างอิง)',
  aml: 'ธนาคาร หลักทรัพย์ ฯลฯ',
  telecom: 'มือถือ',
  reuse: 'รับซื้อ',
  matching: 'หาคู่',
  day: 'วันที่ใช้งาน',
  before: 'ถึง 31 มีนาคม 2027',
  after: 'ตั้งแต่ 1 เมษายน 2027',
  comments: {
    regime: 'วิธีที่ใช้ได้ขึ้นอยู่กับกฎหมายที่อ้างอิง',
    day: 'เมื่อส่งวันที่ให้ จะไม่แสดงวิธีที่ใช้ไม่ได้แล้วในวันนั้น (ค่าเริ่มต้นคือวันนี้)',
  },
} satisfies typeof ja;
