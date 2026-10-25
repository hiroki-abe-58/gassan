import type ja from '../../ja/demos/chartWaterfall';

export default {
  label: 'การเปลี่ยนแปลงของ MRR ในเดือนตุลาคม',
  description: 'ลูกค้าใหม่และการขยายการใช้งานทำให้เพิ่มขึ้น 950,000 เยน ส่วนการลดการใช้งานและการยกเลิกทำให้ลดลง 380,000 เยน MRR สิ้นเดือนอยู่ที่ 5.39 ล้านเยน',
  start: 'MRR ต้นเดือน',
  newBusiness: 'ลูกค้าใหม่',
  expansion: 'ขยายการใช้งาน',
  contraction: 'ลดการใช้งาน',
  churn: 'การยกเลิก',
  end: 'MRR สิ้นเดือน',
  comments: {
    total: "ถ้าใช้ kind: 'total' และไม่ใส่ค่า แท่งนั้นจะเป็นยอดรวมจนถึงจุดนั้น",
  },
} satisfies typeof ja;
