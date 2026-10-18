import type ja from '../ja/fileDrop';

export default {
  lead: 'FileDrop คือพื้นที่รับไฟล์ ข้างในคือ file input แบบเนทีฟที่ขยายเต็มพื้นที่รับไฟล์ เลือกไฟล์ได้ทั้งด้วยการคลิก Enter / Space หรือการลากมาวาง',
  gallery: {
    title: 'ตัวอย่าง',
    intro: 'ไฟล์ที่เลือกจะแสดงเป็นรายการชื่อและขนาด และเอาออกทีละไฟล์ได้',
    items: {
      single: 'ไฟล์เดียว',
      multiple: 'หลายไฟล์ (รูปภาพเท่านั้น)',
      disabled: 'ใช้ไม่ได้',
    },
  },
  modal: {
    title: 'ในโมดอล',
    intro: 'ข้างในเป็น input แบบเนทีฟ label ของ Modal.Field จึงกลายเป็นชื่อได้โดยตรง',
    exampleTitle: 'ส่งเอกสาร',
    exampleDescription: 'รับเฉพาะ PDF และรูปภาพ ถ้าลากไฟล์รูปแบบอื่นมาวาง จะแจ้งเป็นข้อผิดพลาด',
  },
  reject: {
    title: 'ไฟล์ที่ไม่ตรงเงื่อนไข',
    callout:
      'ไฟล์ที่ลากมาวางไม่ผ่าน `accept` ของเนทีฟ gassan จึงใช้กฎเดียวกัน (นามสกุลไฟล์ wildcard แบบ `image/*` และ MIME type) แล้วส่งไฟล์ที่ไม่ผ่านให้ `onReject` ส่วนการแจ้งผู้ใช้ให้ `error` ของ `Modal.Field` จัดการ (I-14)',
  },
  a11yCaption: 'สเปกที่พื้นที่รับไฟล์ทำตาม',
} satisfies typeof ja;
