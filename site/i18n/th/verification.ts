import type ja from '../ja/verification';

export default {
  lead: '“เทสต์เป็นสีเขียว” กับ “มีการรับประกัน” เป็นคนละเรื่องกัน จึงเขียนแยกไว้ว่าตรวจอะไรที่ชั้นไหน และอะไรที่ยังตรวจไม่ได้',
  stats: {
    tests: (files: number): string => `เทสต์ (${String(files)} ไฟล์)`,
    items: 'รายการพฤติกรรม',
    proven: 'รายการที่พิสูจน์ด้วยเทสต์แล้ว',
    device: 'รายการที่ตรวจได้บนเครื่องจริงเท่านั้น',
  },
  pipeline: {
    intro: 'ทำงานจากบนลงล่าง ถ้าล้มแม้แต่ขั้นเดียวก็หยุด ยิ่งขั้นล่าง ยิ่งจับอุบัติเหตุที่ขั้นบนหาไม่เจอโดยหลักการได้',
    steps: [
      { command: 'tsc --noEmit', catches: 'type ไม่ตรงกัน' },
      { command: 'eslint .', catches: 'การเขียนผิดที่รู้ได้แบบ static' },
      { command: 'vitest run', catches: 'accessible name, OR ของ gate, การจำแนกเหตุผลการปิด, อัตราส่วนคอนทราสต์ของสี' },
      { command: 'check:trace', catches: 'รายการสเปกกับหลักฐานขาดหรือเกิน การอ้างชื่อเทสต์ที่ไม่มีอยู่ จำนวนที่เขียนในเอกสารไม่ตรง' },
      { command: 'check:docs', catches: 'ตัวอย่างโค้ดใน README และ docs คอมไพล์ด้วย public API ไม่ผ่าน' },
      { command: 'tsup', catches: 'การสร้าง ESM / CJS / type ล้มเหลว' },
      { command: 'check:dist', catches: '"use client" หายไป public API ขาด ขนาดเกินงบ' },
      {
        command: 'check:ssr',
        catches: 'การอ้างถึง window ระหว่าง render (ล้มใน Next.js App Router) และ gate ที่ fail-open ตอน SSR',
      },
      {
        command: 'check:pack',
        catches: 'อุบัติเหตุในรูปแบบที่ขึ้นไปบน npm (LICENSE หาย, เงื่อนไข types สลับกัน, ลิงก์ในเอกสารที่แนบมาเสีย)',
      },
    ],
  },
  status: {
    title: 'สถานะของรายการ',
    intro: (count: number): string => `แต่ละรายการจาก ${String(count)} รายการ ได้รับการรับประกันในระดับไหน`,
    count: (n: number): string => `${String(n)} รายการ`,
    weakMust: (n: number): string =>
      `มี ${String(n)} รายการที่เป็นข้อบังคับ (M) แต่สถานะเป็น “เขียนไว้” ค่าถูกตรวจแบบกลไกแล้ว แต่ผลการวาดตรวจได้บนเบราว์เซอร์จริงเท่านั้น นี่คือจุดอ่อนปัจจุบันของไลบรารีนี้ และแสดงไว้โดยไม่ปิดบัง`,
  },
  device: {
    title: 'สิ่งที่ตรวจด้วย jsdom ไม่ได้',
    intro:
      'รายการที่ต้องวาดจริงจึงจะรู้ว่าจริงหรือเท็จ เช่น top layer แอนิเมชันขาออก ความเข้มของ scrim ถ้าเปิด examples/css-check.html บนเครื่องจริง รายการเดียวกันจะเป็น checkbox ให้ติ๊ก',
    tableCaption: 'ใบตรวจบนเครื่องจริง',
    columns: { id: 'ID', item: 'รายการ', how: 'วิธีตรวจ', diagnosis: 'ถ้าไม่ผ่าน' },
    pending: (n: number): string =>
      `${String(n)} รายการนี้ยังไม่ได้ตรวจบนเครื่องจริง (ROADMAP v0.2.0) การตรวจอัตโนมัติบนเบราว์เซอร์จริง (Playwright + axe) จะเพิ่มใน v0.4.0 รายละเอียดอยู่ที่ [VERIFICATION.md](VERIFICATION.md) และ [ROADMAP.md](ROADMAP.md)`,
  },
} satisfies typeof ja;
