import type ja from '../../ja/demos/chartRevenue';

export default {
  locale: 'th-TH',
  label: 'ยอดขายและค่าใช้จ่ายรายเดือน',
  description: 'ยอดขายสูงสุดในเดือนธันวาคมที่ 2.36 ล้านเยน ค่าใช้จ่ายเพิ่มขึ้นอย่างช้า ๆ ทุกเดือน และส่วนต่างกว้างขึ้นในครึ่งหลังของปี',
  month: 'เดือน',
  revenue: 'ยอดขาย',
  cost: 'ค่าใช้จ่าย',
  comments: {
    intl: 'เดือนจัดรูปแบบด้วย Intl ให้เขียนตามภาษาของผู้ชม (“มี.ค.”, “Mar”)',
  },
} satisfies typeof ja;
