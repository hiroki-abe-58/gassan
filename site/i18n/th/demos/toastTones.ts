import type ja from '../../ja/demos/toastTones';

export default {
  success: 'สำเร็จ',
  saved: 'บันทึกแล้ว',
  savedDetail: 'ทุกคนในทีมจะเห็นการเปลี่ยนแปลงนี้',
  info: 'แจ้งข้อมูล',
  update: 'มีเวอร์ชันใหม่',
  warning: 'คำเตือน',
  storage: 'พื้นที่เก็บข้อมูลใกล้เต็มแล้ว',
  storageDetail: 'เหลืออีก 2% โปรดจัดการไฟล์เก่า',
  error: 'ล้มเหลว',
  failed: 'ส่งไม่สำเร็จ',
  failedDetail: 'การเชื่อมต่อขาดหาย โปรดลองอีกครั้ง',
  neutral: 'ไม่มีไอคอน',
  copied: 'คัดลอกลิงก์แล้ว',
  comments: {
    tones: 'ไอคอนและสีเปลี่ยนตามโทน สีจะอยู่เฉพาะที่ไอคอนและแถบเวลา (N-02)',
  },
} satisfies typeof ja;
