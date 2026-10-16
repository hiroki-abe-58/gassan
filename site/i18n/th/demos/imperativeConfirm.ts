import type ja from '../../ja/demos/imperativeConfirm';

export default {
  logoutTitle: 'ออกจากระบบไหม',
  logout: 'ออกจากระบบ',
  callOne: 'เรียก confirm',
  firstTitle: 'ตัวที่ 1: ปิดการแจ้งเตือนไหม',
  secondTitle: 'ตัวที่ 2: ยืนยันการยกเลิกบัญชี',
  consent: 'เข้าใจเนื้อหาแล้ว',
  secondLog: 'ตัวที่ 2 → {0}',
  callTwo: 'เรียก 2 ตัวพร้อมกัน',
  comments: {
    host: 'วาง <ModalHost /> ไว้ที่ root ของแอปหนึ่งตัว (เว็บไซต์นี้วางไว้ใน App.tsx)',
    queue: 'ต่อให้เรียกพร้อมกัน 2 ตัว ก็แสดงทีละตัวตามลำดับ (L-14)',
  },
} satisfies typeof ja;
