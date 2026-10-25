import type ja from '../../ja/demos/floatingSignIn';

export default {
  account: 'อีเมลหรือหมายเลขโทรศัพท์',
  accountError: 'กรุณากรอกอีเมลหรือหมายเลขโทรศัพท์',
  password: 'รหัสผ่าน',
  submit: 'ดำเนินการต่อ',
  comments: {
    floating: 'ใช้ labelPlacement="floating" วาง label ไว้ในช่องกรอก เมื่อมีโฟกัสหรือมีค่า label จะหดเล็กลงแล้วหลบไปที่มุมซ้ายบน (I-24)',
    password: 'PasswordInput ก็เหมือนกัน ไม่ยืด label ไปทับปุ่มสลับการแสดงผล',
  },
} satisfies typeof ja;
