import type ja from '../../ja/demos/chartFeatures';

export default {
  label: 'จำนวนครั้งที่ใช้แยกตามฟีเจอร์ (ตุลาคม)',
  dashboard: 'แดชบอร์ด',
  api: 'การเรียก API',
  reports: 'การส่งออกรายงาน',
  invites: 'การเชิญสมาชิก',
  invoices: 'การดาวน์โหลดใบแจ้งหนี้',
  uses: 'จำนวนครั้ง',
  comments: {
    layout: 'เมื่อชื่อรายการยาว ให้ใช้แท่งแนวนอน ถ้าชื่อยาวเกินคอลัมน์จะตัดด้วย … และแสดงชื่อเต็มในการอ่านออกเสียงของจุดและใน tooltip',
  },
} satisfies typeof ja;
