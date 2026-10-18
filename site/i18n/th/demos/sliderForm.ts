import type ja from '../../ja/demos/sliderForm';

export default {
  open: 'เงื่อนไขการค้นหา',
  title: 'เงื่อนไขการค้นหา',
  price: 'ช่วงราคา',
  yen: '¥{0}',
  distance: 'ระยะทางจากสถานี',
  km: 'ไม่เกิน {0} กม.',
  cancel: 'ยกเลิก',
  apply: 'ค้นหาด้วยเงื่อนไขนี้',
  comments: {
    range: 'สองหัวเลื่อนคือ range สองอันซ้อนกัน ชื่อคือ “ค่าต่ำสุด” และ “ค่าสูงสุด” ส่วนชื่อของกลุ่มคือ legend (I-10)',
    format: 'formatValue ใช้ทั้งกับค่าที่แสดงด้านข้าง และ aria-valuetext',
  },
} satisfies typeof ja;
