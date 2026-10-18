import type ja from '../../ja/demos/choiceForm';

export default {
  open: 'ตั้งค่าการแจ้งเตือน',
  title: 'ตั้งค่าการแจ้งเตือน',
  channels: 'ช่องทางการแจ้งเตือน',
  channelsHelp: 'เลือกอย่างน้อย 1 ช่องทาง',
  all: 'ทั้งหมด',
  mail: 'อีเมล',
  push: 'การแจ้งเตือนแบบพุช',
  sms: 'SMS',
  frequency: 'ความถี่',
  now: 'ทันที',
  nowNote: 'ส่งทีละฉบับทันทีที่มีเหตุการณ์',
  daily: 'วันละครั้ง',
  dailyNote: 'รวมส่งตอน 8 โมงเช้า',
  theme: 'หน้าตาของอีเมล',
  light: 'สว่าง',
  dark: 'มืด',
  auto: 'ตามอุปกรณ์',
  rating: 'ความง่ายในการใช้หน้าจอนี้',
  cancel: 'ยกเลิก',
  save: 'บันทึก',
  comments: {
    group: 'กลุ่มตัวเลือกใช้ Fieldset legend เป็นชื่อของกลุ่ม ส่วน help เป็นคำอธิบายของกลุ่ม (I-09)',
    mixed: 'เมื่อเลือกไว้แค่บางส่วน ใช้ indeterminate (อ่านออกเสียงเป็น mixed)',
  },
} satisfies typeof ja;
