import type ja from '../../ja/demos/bookingCalendar';

export default {
  label: 'วันที่เข้าร้าน',
  selected: 'วันที่เลือก: {0}',
  empty: 'กรุณาเลือกวันที่',
  comments: {
    today: 'วันนี้ตามเวลาของอุปกรณ์ (YYYY-MM-DD) sv-SE แสดงผลในรูปแบบนี้',
    large: 'size="lg" จะขยายเต็มพื้นที่ที่วางไว้ และเขียนชื่อวันหยุดไว้ใต้วันที่ วันหยุดประจำของร้านเลือกไม่ได้ และวันที่มีจุดคือวันที่คิวเหลือน้อย (I-16 / I-19)',
  },
} satisfies typeof ja;
