import type ja from '../ja/uiBadges';

export default {
  lead: 'แบดจ์ที่บอกสถานะหรือจำนวนด้วยคำสั้น ๆ อวาตาร์ที่เป็นหน้าตาของคนหรือองค์กร และการแสดงปุ่มคีย์บอร์ด ทั้งหมดไม่สื่อด้วยสีอย่างเดียว แต่มีคำหรือชื่อกำกับเสมอ',
  badges: {
    title: 'แบดจ์',
    intro: 'พื้นปูด้วยสีของโทนแบบอ่อน ๆ ตัวอักษรใช้สีของโทนที่เข้มขึ้นเล็กน้อย ให้ได้ 4.5:1 ขึ้นไปทั้งโหมดสว่างและโหมดมืด จุดเป็นแค่ของตกแต่ง ความหมายเขียนไว้ในคำ',
  },
  avatars: {
    title: 'อวาตาร์',
    intro: 'ชื่อจะเป็นชื่อที่ใช้อ่านออกเสียง ส่วนรูปเป็นของตกแต่ง ถ้าไม่มีรูปหรือโหลดรูปไม่ได้ จะแสดงอักษรตัวแรก สีพื้นกำหนดจากชื่อ คนเดียวกันจึงได้สีเดียวกันเสมอ',
  },
  group: {
    title: 'วางซ้อนเรียงกัน',
    intro: 'ส่วนที่เกินจำนวนที่แสดง (max) จะรวมเป็น “+N” และอ่านออกเสียงว่า “และอีก N คน”',
    label: 'ผู้รับผิดชอบ',
  },
  kbd: {
    title: 'การแสดงปุ่มคีย์บอร์ด',
    intro: 'ใช้บอกคีย์ลัด เป็น element kbd ที่ทำเส้นเฉพาะด้านล่างให้หนาขึ้นเล็กน้อย ให้ดูเหมือนปุ่มที่กดได้',
  },
  labels: {
    neutral: 'neutral (ค่าเริ่มต้น)',
    accent: 'accent',
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
    dot: 'มีจุด',
    initials: 'อักษรตัวแรก',
    japanese: 'ชื่อภาษาไทย',
    square: 'สี่เหลี่ยม (องค์กร)',
    sizes: 'ขนาด',
    group: 'max={3}',
    shortcut: 'คีย์ลัด',
  },
  sample: {
    draft: 'ฉบับร่าง',
    beta: 'เบต้า',
    paid: 'ชำระแล้ว',
    review: 'กำลังตรวจสอบ',
    overdue: 'เลยกำหนด',
    failed: 'ล้มเหลว',
    online: 'ทำงานอยู่',
    personEn: 'Mina Carter',
    personJa: 'สมชาย ใจดี',
    team: 'Acme Studio',
    search: 'ค้นหา',
    close: 'ปิด',
  },
  code: "import { Badge, Avatar, AvatarGroup, Kbd } from '@genelab/gassan';\n\n<Badge tone=\"success\" dot>ชำระแล้ว</Badge>\n\n<AvatarGroup label=\"ผู้รับผิดชอบ\" max={3}>\n  {members.map((m) => <Avatar key={m.id} name={m.name} src={m.photo} />)}\n</AvatarGroup>\n\n<Kbd>⌘</Kbd> <Kbd>K</Kbd>",
  codeCaption: 'วิธีใช้',
  a11yCaption: 'สเปกที่แบดจ์และอวาตาร์ทำตาม',
} satisfies typeof ja;
