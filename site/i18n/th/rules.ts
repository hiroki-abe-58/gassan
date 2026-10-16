import type ja from '../ja/rules';

export default {
  lead: 'ทั้ง AI และคนที่มีประสบการณ์ ต่างตกหลุมเดียวกันในลำดับเดียวกัน จึงวางข้อห้าม ตารางให้คะแนน และเช็กลิสต์ก่อนเผยแพร่ไว้ เพื่อให้ตรวจเทียบแบบกลไกได้ก่อนตกหลุม',
  prohibitions: {
    title: 'ข้อห้าม',
    intro: 'เรียงตามสิ่งที่ AI มักเขียนผิด ถ้าพลาดแม้แต่ข้อเดียว ให้เขียนใหม่',
    tableCaption: 'ข้อห้าม',
  },
  rubric: {
    title: 'Quality rubric',
    intro: 'เต็ม 15 คะแนน ถ้าต่ำกว่า 12 ให้กลับไปเลือกประเภทใหม่ (decision matrix)',
    tableCaption: 'Quality rubric',
    structureCaption: 'โครงสร้างการให้คะแนน',
    formulaIntro: [
      'สำหรับการ implement แต่ละตัว ให้เขียนหนึ่งประโยคตามรูปแบบต่อไปนี้ ถ้าเติมส่วนหลัง “ただし” (แต่) ได้ สิ่งนั้นคือเหตุผลที่ถูกหักคะแนน แก้ไปเรื่อย ๆ จนเติมไม่ได้',
    ],
  },
  checklist: {
    title: 'เช็กลิสต์ก่อนเผยแพร่',
    intro: 'ใช้ไล่ตรวจกับโมดอลของตัวเอง การติ๊กมีผลแค่ในหน้านี้ และไม่ได้บันทึกไว้',
    progress: (done: number, total: number): string => `${String(done)} / ${String(total)} รายการ`,
  },
  antipatterns: {
    title: 'ตารางแปลง anti-pattern',
    intro: 'วิธีเขียนที่เห็นบ่อย และสิ่งที่ควรใช้แทน',
    tableCaption: 'ตารางแปลง anti-pattern',
  },
} satisfies typeof ja;
