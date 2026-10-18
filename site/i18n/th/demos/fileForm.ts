import type ja from '../../ja/demos/fileForm';

export default {
  open: 'ส่งเอกสาร',
  title: 'ส่งเอกสาร',
  documents: 'เอกสารยืนยันตัวตน',
  documentsHelp: 'PDF หรือรูปภาพ เลือกหลายไฟล์พร้อมกันได้',
  rejected: 'รูปแบบที่ไม่รับ: {0}',
  cancel: 'ยกเลิก',
  submit: 'ส่ง',
  comments: {
    reject: 'การลากมาวางไม่ผ่าน accept gassan จึงใช้กฎเดียวกันตรวจ ไฟล์ที่ไม่ผ่านส่งไปที่ onReject (I-14)',
  },
} satisfies typeof ja;
