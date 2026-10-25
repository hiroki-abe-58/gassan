import type ja from '../../ja/demos/floatingStates';

export default {
  name: 'ชื่อที่แสดง',
  nameValue: 'ณัฐวุฒิ ศรีสุข',
  email: 'อีเมล',
  emailValue: 'aoi@',
  emailError: 'กรุณากรอกอีเมลให้ถูกรูปแบบ',
  workspace: 'URL ของเวิร์กสเปซ',
  workspaceValue: 'atlas-design',
  workspaceHelp: 'เปลี่ยนไม่ได้หลังจากสร้างแล้ว',
  reset: 'คืนค่าเริ่มต้น',
  comments: {
    reset: 'เมื่อ form.reset() ทำให้ช่องกลับเป็นค่าว่างหรือค่าเริ่มต้น label ก็ขยับตามไปด้วย (ค่าที่ควบคุมเองให้คืนค่าใน onReset)',
    initial: 'ถ้ามี defaultValue จะแสดงแบบลอยตั้งแต่การวาดครั้งแรก (วาดบนเซิร์ฟเวอร์ก็เหมือนกัน)',
    error: 'แสดงข้อผิดพลาดไว้ใต้ช่อง และทำให้ label เป็นสีแดงด้วย การผูก (aria-invalid / aria-describedby) เหมือนกับ label ด้านบน',
    disabled: 'ช่องที่ใช้ไม่ได้จะทำให้กรอบและ label จางลงพร้อมกัน',
  },
} satisfies typeof ja;
