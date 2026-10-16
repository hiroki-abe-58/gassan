import type ja from '../ja/motion';

export default {
  lead: 'ทั้งขาเข้าและขาออกวาดด้วย CSS อย่างเดียว ไม่ใช้ไลบรารีแอนิเมชันของ JS สิ่งที่ JS รับผิดชอบมีแค่ “รอ close() จนกว่าจะเห็นขาออก”',
  durations: {
    title: 'ระยะเวลา',
    intro: 'ขาออกเร็วกว่าขาเข้า คนรอ “เปิด” ได้ แต่รอ “ปิด” ไม่ได้',
    in: 'ขาเข้า',
    out: 'ขาออก',
    replayClose: 'ปิด (120ms)',
    replayOpen: 'เปิด (180ms)',
  },
  easing: {
    title: 'Easing',
    in: 'ขาเข้า (ชะลอแล้วหยุด)',
    out: 'ขาออก (เร่งแล้วจากไป)',
  },
  exit: {
    title: 'แอนิเมชันขาออกและ overlay',
    body: [
      'หัวใจของการวาดขาออกด้วย CSS มี 2 อย่างคือ `transition-behavior: allow-discrete` และ `overlay` แต่ `overlay` ยังไม่เป็น Baseline ในเบราว์เซอร์ที่ไม่รองรับ ทันทีที่ `close()` element จะหลุดออกจาก top layer และหายไป',
      'gassan จึงไม่เรียก `close()` เมื่อได้รับคำขอปิด แต่ใส่ `data-exiting` แล้วเปลี่ยนไปสู่สถานะขาออกขณะที่ dialog ยังเปิดอยู่ รอเท่ากับ `--g-dur-out` แล้วค่อย `close()` เวลารออ่านจากโทเคนของ CSS จึงไม่ต้องเก็บตัวเลขเดียวกันซ้ำใน JS (L-07)',
    ],
  },
  reduced: {
    title: 'การตั้งค่าลดการเคลื่อนไหว',
    callout:
      'ภายใต้ `prefers-reduced-motion: reduce` เฟดจะเหลือ 1ms ไม่ใช่ 0 เพราะถ้าเป็น 0 transition แบบ discrete (`display` และ `overlay`) จะพัง (S-05) เวลารอขาออกก็เป็น 0 ด้วย แต่ยังผ่านโค้ดเส้นทางเดิม',
    tableCaption: 'สเปกของโมชัน',
  },
} satisfies typeof ja;
