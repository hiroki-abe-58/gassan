import type ja from '../../ja/demos/commandMenu';

export default {
  open: 'เปิดแผงคำสั่ง',
  placeholder: 'ค้นหาหน้าหรือการกระทำ',
  pages: 'หน้า',
  actions: 'การกระทำ',
  home: 'หน้าแรก',
  homeDescription: 'แดชบอร์ดและกิจกรรมล่าสุด',
  members: 'สมาชิก',
  billing: 'แพ็กเกจและการเรียกเก็บเงิน',
  settings: 'การตั้งค่า',
  settingsDescription: 'โปรไฟล์ รหัสผ่าน การยืนยันตัวตนแบบ 2 ขั้นตอน',
  invite: 'เชิญสมาชิก',
  project: 'สร้างโปรเจกต์',
  export: 'ส่งออกข้อมูล',
  exportDescription: 'ใช้ได้ในแพ็กเกจ Pro',
  ran: 'เลือก “{0}” แล้ว',
  comments: {
    hotkey: 'การค้นหาของเว็บไซต์นี้ใช้ ⌘K อยู่แล้ว ตัวอย่างจึงเปิดด้วยปุ่ม (hotkey={false}) ในแอปจริง ถ้าไม่ใส่ hotkey จะเปิดได้ด้วย ⌘K / Ctrl+K',
  },
} satisfies typeof ja;
