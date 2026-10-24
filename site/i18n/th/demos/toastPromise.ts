import type ja from '../../ja/demos/toastPromise';

export default {
  succeed: 'บันทึก (สำเร็จ)',
  fail: 'บันทึก (ล้มเหลว)',
  loading: 'กำลังบันทึก…',
  success: 'บันทึกแล้ว',
  error: 'บันทึกไม่สำเร็จ: {0}',
  reason: 'เซิร์ฟเวอร์ไม่ตอบสนอง',
  comments: {
    promise: 'ระหว่างประมวลผลจะแสดงกำลังโหลด เมื่อเสร็จจะแทนที่ในตำแหน่งเดิม (N-07)',
  },
} satisfies typeof ja;
