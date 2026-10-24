import type ja from '../ja/layout';

export default {
  lead: 'ความกว้างกำหนดด้วยโทเคน ความสูงกำหนดด้วย CSS Grid และ dvh ไม่คำนวณความสูงด้วย JS และส่วนที่สกรอลล์ได้มีแค่เนื้อหา',
  size: {
    title: 'โทเคนความกว้าง',
    intro: 'ความกว้างของแผงคือ min(100%, โทเคน) บนจอแคบจะไม่ล้นออกไป บนจอกว้างจะอยู่ในความยาวบรรทัดที่อ่านง่าย',
  },
  placement: {
    title: 'การจัดวาง',
    intro: 'placement="auto" จะถูก resolve ด้วย JS ให้เป็น center หรือ sheet ก่อนส่งเข้า DOM ส่วน start และ end คือแผงที่เลื่อนออกมาจากขอบด้านข้าง ให้เลือกตามการใช้งาน (auto จะไม่ resolve เป็นสองค่านี้)',
    mockTitle: 'เส้นทาง',
    when: {
      center: 'ค่าเริ่มต้นบนเดสก์ท็อป',
      top: 'เมื่อความสูงของเนื้อหาเปลี่ยนมาก ถ้าจัดกึ่งกลาง แผงจะกระโดดขึ้นลงตามความสูงที่เปลี่ยน',
      sheet: 'ค่าเริ่มต้นเมื่อกว้างไม่ถึง 600px วาง primary ไว้ในจุดที่มือเดียวเอื้อมถึงได้',
      start: 'ลิ้นชักการนำทาง เปิดเมนูนำทางของแอปบนจอแคบ',
      end: 'แผงสำหรับรายละเอียดหรือการกรอง ตรวจดูเนื้อหาได้โดยยังเห็นรายการอยู่',
    },
  },
  grid: {
    title: 'Grid ของแผง',
    intro: 'header, body และ footer สามแถว ถ้าแถวของ body ไม่ใช่ minmax(0, 1fr) body จะไม่หดและไม่สกรอลล์',
    code: '.g-panel {\n  inline-size: min(100%, var(--g-panel-max));\n  max-block-size: 100%;           /* ไม่ใช้ 100vh */\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n}\n.g-header { grid-row: 1; }\n.g-body   { grid-row: 2; overflow: auto; overscroll-behavior: contain; }\n.g-footer { grid-row: 3; }',
    codeCaption: 'แนวคิด (กฎจริงอยู่ใน src/styles.css)',
    mockTitle: 'ประวัติการอัปเดต',
    mockClose: 'ปิด',
    do: 'ส่วนที่สกรอลล์ได้มีแค่ body ส่วน header และ footer มองเห็นตลอด (B-01 / H-10)',
    mockCut: 'ชื่อเรื่องถูกตัดเลยขอบบนของจอ',
    dont: 'อย่าจบแค่ `max-h-[90vh]` หรือ `1fr` เดี่ยว ๆ ความสูงจะพังเพราะ address bar บนมือถือ และขอบบนจะถูกตัดเมื่อจัดกึ่งกลาง',
  },
  touch: {
    title: 'ขนาดที่แตะได้',
    body: (tap: string): string =>
      `พื้นที่แตะของปุ่มและปุ่มไอคอนคือ \`${tap}\` ขั้นต่ำของ WCAG 2.5.8 คือ 24px แต่เลือกใช้ 44px ตาม Apple HIG ระหว่าง “ย้อนกลับ” กับ “×” เว้นระยะอย่างน้อย 8px เพราะการกดสองปุ่มนี้สลับกันคืออุบัติเหตุที่แพงที่สุด (H-03 / H-04)`,
    callout: 'ห่อ safe area ด้วย `max()` เสมอ เพื่อไม่ให้ระยะขอบหายไปบนอุปกรณ์ที่ `env(safe-area-inset-bottom)` เป็น 0 (C-04 / F-12)',
  },
  spec: {
    title: 'รายการของคอนเทนเนอร์',
    tableCaption: 'สเปกของคอนเทนเนอร์',
  },
} satisfies typeof ja;
