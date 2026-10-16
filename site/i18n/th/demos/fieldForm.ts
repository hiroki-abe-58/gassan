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
    group: 'กลุ่มตัวเลือกตั้งชื่อด้วย fieldset / legend ไม่ใช่ label',
    native: 'range หรือ date ก็ไม่ต้องสร้างใหม่ แค่ห่อของเนทีฟ',
  },
} satisfies typeof ja;
