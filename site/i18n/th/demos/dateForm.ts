import type ja from '../../ja/demos/dateForm';

export default {
  open: 'จอง',
  title: 'จอง',
  date: 'วันที่',
  dateHelp: 'ตั้งแต่วันนี้เป็นต้นไป',
  time: 'เวลา',
  people: 'จำนวนคน',
  peopleUnit: 'คน',
  cancel: 'ยกเลิก',
  submit: 'จอง',
  comments: {
    today: 'วันนี้ตามเวลาของอุปกรณ์ (YYYY-MM-DD) sv-SE แสดงผลในรูปแบบนี้',
    calendar: 'ปฏิทินแสดงใน top layer ชื่อเดือนและวันในสัปดาห์มาจาก Intl ของ labels.locale (I-13)',
    native: 'เวลาใช้อินพุตแบบเนทีฟใส่ไว้ในกรอบเดียวกัน (I-15)',
  },
} satisfies typeof ja;
