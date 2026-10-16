import type ja from '../ja/notes';

export default {
  lead: (count: number): string =>
    `หลุมพราง ${String(count)} ข้อที่มองไม่เห็นตอนออกแบบ และเพิ่งโผล่มาเมื่อลองรันจริง เป็นประเภทที่ถูกต้องบนกระดาษแต่พังเมื่อเขียนเป็นโค้ด จึงตรึงไว้ที่นี่`,
} satisfies typeof ja;
