import type ja from '../ja/textInput';

export default {
  lead: 'Input, PasswordInput, SearchInput, Textarea, NumberField และ CodeInput ข้างในยังเป็น input และ textarea แบบเนทีฟ gassan เพิ่มแค่กรอบ กับความสามารถเล็ก ๆ ที่ของเนทีฟไม่มี (สลับการแสดงผล ล้างค่า นับตัวอักษร เพิ่ม/ลด และกล่องแยกแต่ละหลัก)',
  gallery: {
    title: 'ตัวอย่าง',
    intro: 'ส่วนประกอบของจริงที่เรียงตามสถานะ ใช้ส่วนประกอบเดียวกันนอกโมดอลได้ด้วย ถ้าเปลี่ยนธีมที่มุมขวาบน สีของวงโฟกัสจะเปลี่ยนตาม',
    items: {
      plain: 'ข้อความ',
      adorned: 'มีหน่วยด้านหน้าและด้านหลัง',
      password: 'รหัสผ่าน',
      search: 'ค้นหา',
      textarea: 'มีตัวนับตัวอักษร',
      number: 'stepper ตัวเลข',
      code: 'รหัสยืนยัน',
      invalid: 'ข้อผิดพลาด',
      disabled: 'ใช้ไม่ได้',
    },
    samples: {
      name: 'สมหญิง ใจดี',
      price: '1200',
      yen: '¥',
      perMonth: 'เยน / เดือน',
      search: 'ค้นหาส่วนประกอบ',
      bio: 'คำแนะนำตัวที่เขียนในโมดอล',
      seats: 'ที่นั่ง',
      invalidValue: 'somying@',
    },
  },
  modal: {
    title: 'ในโมดอล',
    intro: 'การผูกที่ได้จาก render prop ของ Modal.Field ส่งต่อด้วยการ spread ได้ตรง ๆ',
    exampleTitle: 'สร้างบัญชี',
    exampleDescription: 'ลองสลับการแสดงรหัสผ่าน นับตัวอักษร เพิ่ม/ลดจำนวนที่นั่ง และกรอกรหัสยืนยัน เมื่อพิมพ์รหัสครบ 6 หลัก ก็พร้อมลงทะเบียนได้ทันที',
  },
  adds: {
    title: 'สิ่งที่ gassan เพิ่มให้',
    tableCaption: 'สิ่งที่ส่วนประกอบช่องกรอกข้อความแต่ละตัวเพิ่มให้',
    head: { part: 'ส่วนประกอบ', adds: 'สิ่งที่เพิ่ม' },
    rows: [
      { part: 'Modal.Input', adds: 'กรอบและของตกแต่งด้านหน้าและด้านหลัง (start / end) ref และ attribute ของ input ส่งถึง input ตรง ๆ' },
      { part: 'Modal.PasswordInput', adds: 'ปุ่มสลับการแสดงผล บอกสถานะด้วย aria-pressed ข้อความบนปุ่มจึงมีแค่อันเดียวก็พอ' },
      { part: 'Modal.SearchInput', adds: 'ปุ่ม “ล้าง” ที่แสดงเฉพาะเมื่อมีค่า เมื่อล้างแล้วจะคืนโฟกัสไปที่ช่องกรอก' },
      { part: 'Modal.Textarea', adds: '“n / max” เมื่อส่ง maxLength ให้อ่านเป็นคำอธิบาย ไม่แทรกขึ้นมาทุกครั้งที่พิมพ์ ความสูงยืดตามเนื้อหา' },
      { part: 'Modal.NumberField', adds: '− และ + กดไม่ได้เมื่อถึงขอบของช่วง และปัดตามหลักทศนิยมของ step ถ้าค่าอยู่นอกช่วงตอนออกจากช่อง จะดึงกลับไปที่ขอบ' },
      { part: 'Modal.CodeInput', adds: 'กล่องแยกแต่ละหลัก ช่องกรอกยังเป็นช่องเดียว การกรอกอัตโนมัติจาก SMS และการวางจึงใช้ได้ รับตัวเลขแบบเต็มความกว้าง (full-width) ด้วย' },
    ],
  },
  apiNote: 'PasswordInput และ SearchInput คือ ModalInputProps ที่ตัด type, start และ end ออก ส่วน Textarea รับ attribute ของ textarea ตามเดิม ทุกตัวส่ง ref ถึง element ข้างใน',
  a11yCaption: 'สเปกที่ช่องกรอกข้อความทำตาม',
} satisfies typeof ja;
