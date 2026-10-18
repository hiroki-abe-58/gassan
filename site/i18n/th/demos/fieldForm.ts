import type ja from '../../ja/demos/fieldForm';

export default {
  planFree: 'ฟรี',
  planPro: 'Pro (980 บาท/เดือน)',
  emailError: 'กรุณากรอกอีเมลที่มี @',
  open: 'เชิญสมาชิก',
  title: 'เชิญสมาชิก',
  alert: 'กรุณาตรวจสอบข้อมูลที่กรอก ({0} รายการ)',
  email: 'อีเมล',
  emailHelp: 'อีเมลคำเชิญจะส่งไปที่อยู่นี้',
  plan: 'แพ็กเกจ',
  seats: 'จำนวนที่นั่ง',
  seatsHelp: '{0} ที่นั่ง',
  cancel: 'ยกเลิก',
  submit: 'เชิญ',
  comments: {
    summary: 'สรุปข้อผิดพลาดตอนส่งไว้ที่เดียว และย้ายโฟกัสไปที่ช่องที่ผิดช่องแรก (B-09)',
    field: 'ช่องกรอกหนึ่งช่องคือ Modal.Field ซึ่งรับการผูก label, help และ error ไว้ (B-08)',
    group: 'กลุ่มตัวเลือกคือ Modal.Fieldset ตั้งชื่อด้วย legend ไม่ใช่ label (I-09)',
    native: 'ข้างในเป็น range แบบเนทีฟ หัวเลื่อนและแถบที่เติมสีวาดด้วยสีของธีม (I-10)',
  },
} satisfies typeof ja;
