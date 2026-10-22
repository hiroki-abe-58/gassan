import type ja from '../../ja/demos/filterToolbar';

export default {
  refresh: 'รีเฟรช',
  refreshHint: 'โหลดรายการใหม่ (อัปเดตล่าสุดเมื่อ 3 นาทีก่อน)',
  refreshed: 'โหลดรายการใหม่แล้ว',
  share: 'แชร์',
  filter: 'กรอง',
  filterCount: 'กรอง ({0})',
  filterTitle: 'กรองการแสดงผล',
  unreadOnly: 'เฉพาะที่ยังไม่ได้อ่าน',
  assignedToMe: 'เฉพาะที่ฉันรับผิดชอบ',
  sortLabel: 'ลำดับ',
  newest: 'ใหม่สุดก่อน',
  oldest: 'เก่าสุดก่อน',
  more: 'การกระทำอื่น',
  exportCsv: 'ส่งออกเป็น CSV',
  print: 'พิมพ์',
  viewGroup: 'ความหนาแน่นของการแสดงผล',
  compact: 'แสดงแบบกะทัดรัด',
  comfortable: 'แสดงแบบโปร่ง',
  archiveAll: 'เก็บถาวรทั้งหมด',
  chose: 'เลือก “{0}” แล้ว',
  comments: {
    glyph: 'ไอคอนลายเส้นขนาด 20×20 เป็นของตกแต่งจึงใส่ aria-hidden',
    tooltip: 'ถ้าคำอธิบายเหมือนกับชื่อ จะไม่ให้อ่านซ้ำเป็นคำอธิบายอีกรอบ (“แชร์”)',
    menu: 'ปุ่มลัดมีไว้แสดงเท่านั้น การผูกคีย์เป็นหน้าที่ของฝั่งที่นำไปใช้',
  },
} satisfies typeof ja;
