import type ja from '../../ja/demos/quickStart';

export default {
  open: 'เปิด',
  title: 'แก้ไขโปรไฟล์',
  name: 'ชื่อที่แสดง',
  cancel: 'ยกเลิก',
  save: 'บันทึก',
  comments: {
    alwaysMounted: 'mount ไว้ตลอดเวลา แล้วเปิดปิดด้วย open ถ้าเขียน {open && <Modal.Root />} จะวาดแอนิเมชันขาออกไม่ได้',
  },
} satisfies typeof ja;
