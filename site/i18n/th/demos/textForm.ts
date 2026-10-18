import type ja from '../../ja/demos/textForm';

export default {
  open: 'สร้างบัญชี',
  title: 'สร้างบัญชี',
  name: 'ชื่อที่แสดง',
  password: 'รหัสผ่าน',
  passwordHelp: 'อย่างน้อย 8 ตัวอักษร',
  bio: 'แนะนำตัว',
  bioPlaceholder: 'งานหรือสิ่งที่สนใจ',
  seats: 'จำนวนที่นั่ง',
  seatsHelp: 'เพิ่มทีหลังได้',
  seatsUnit: 'ที่นั่ง',
  code: 'รหัสยืนยัน',
  codeHelp: 'ตัวเลข 6 หลักที่ได้รับทางอีเมล',
  cancel: 'ยกเลิก',
  submit: 'ลงทะเบียน',
  comments: {
    password: 'การสลับการแสดงผลเป็น toggle ด้วย aria-pressed ใช้ข้อความแค่อันเดียวก็พอ (I-04)',
    counter: 'ถ้าส่ง maxLength จะแสดง “n / 140” และผูกไว้เป็นคำอธิบาย (I-06)',
    code: 'ช่องกรอกมีช่องเดียว กล่องเป็นแค่หน้าตา การกรอกอัตโนมัติจาก SMS และการวางจึงใช้ได้ (I-08)',
  },
} satisfies typeof ja;
