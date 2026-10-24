import type ja from '../../ja/demos/dateForm';

export default {
  open: 'จอง',
  title: 'จอง',
  date: 'วันที่',
  dateHelp: 'ตั้งแต่วันนี้เป็นต้นไป',
  time: 'เวลา',
  timeHelp: '11:00–21:00 ทีละ 15 นาที',
  people: 'จำนวนคน',
  peopleUnit: 'คน',
  cancel: 'ยกเลิก',
  submit: 'จอง',
  comments: {
    today: 'วันนี้ตามเวลาของอุปกรณ์ (YYYY-MM-DD) sv-SE แสดงผลในรูปแบบนี้',
    calendar: 'ปฏิทินแสดงใน top layer ชื่อเดือนและวันในสัปดาห์มาจาก Intl ของ labels.locale (I-13)',
    time: 'เลือกเวลาจากคอลัมน์ชั่วโมงและนาที เวลาที่ไม่ลงตัวกับ step และเวลานอกเวลาทำการเลือกไม่ได้ (I-20)',
  },
} satisfies typeof ja;
