import type ja from '../ja/spec';

export default {
  title: (page: string, count: number): string => `${page} (${String(count)} รายการ)`,
  lead: 'รายการพฤติกรรมที่โมดอลในอุดมคติควรมี แบ่งเป็น 12 หมวด บรรทัดละหนึ่งข้อ แต่ละบรรทัดผูกไว้กับเทสต์และ CSS ที่ทำให้ข้อนั้นเป็นจริง',
  source: (version: string, updated: string): string =>
    `ต้นฉบับคือ [modal.skill.md](modal.skill.md) §4 (v${version}, ${updated}) สถานะและหลักฐานอยู่ใน [docs/traceability.md](docs/traceability.md) ทั้งสองไฟล์ถูกตรวจแบบกลไกด้วย \`npm run check:trace\` ถ้าอ้างชื่อเทสต์ที่ไม่มีอยู่จริงเป็นหลักฐาน CI จะล้ม หน้านี้สร้างจากสองไฟล์นั้นตอน build`,
  filters: {
    label: 'กรองสเปก',
    keyword: 'คีย์เวิร์ด',
    keywordPlaceholder: 'เช่น โฟกัส, G-03, line-clamp',
    category: 'หมวด',
    status: 'สถานะ',
    all: 'ทั้งหมด',
    priority: 'ระดับความจำเป็น',
    priorityOption: (letter: string, label: string): string => `${letter} (${label})`,
    count: (shown: number, total: number): string => `แสดง ${String(shown)} / ${String(total)} รายการ`,
  },
  categoryItems: (name: string): string => `รายการในหมวด ${name}`,
  statusAndEvidence: 'สถานะและหลักฐาน',
  evidence: {
    count: (n: number): string => `หลักฐาน ${String(n)} รายการ`,
    kinds: {
      T: 'เทสต์',
      C: 'CSS',
      S: 'ไฟล์',
      D: 'เอกสาร',
      B: 'ตรวจบนเครื่องจริง',
      R: 'โรดแมป',
      N: 'ผู้รับมอบหมาย',
    },
  },
  empty: 'ไม่มีรายการที่ตรงเงื่อนไข ลองผ่อนเงื่อนไขการกรองดู',
  legend: {
    title: 'วิธีอ่านสถานะ',
    intro: 'เรียงจากการรับประกันที่แข็งแรงที่สุด หัวใจของตารางนี้คือไม่ปน “Implement แล้ว” (実装) กับ “เขียนไว้” (記述) เข้าด้วยกัน',
    tableCaption: 'คำศัพท์ของสถานะ',
  },
} satisfies typeof ja;
