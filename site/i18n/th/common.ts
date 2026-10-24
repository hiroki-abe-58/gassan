import type ja from '../ja/common';

export default {
  siteTitle: 'gassan — ไลบรารี React UI สำหรับ SaaS',
  skipToMain: 'ข้ามไปยังเนื้อหาหลัก',
  openMenu: 'เปิดเมนู',
  menu: 'เมนู',
  menuBody: 'หน้าในเว็บไซต์',
  siteNav: 'ภายในเว็บไซต์',
  home: 'หน้าแรก',
  search: 'ค้นหา',
  searchPalette: 'ค้นหาในเว็บไซต์',
  searchPlaceholder: 'พิมพ์ชื่อหน้า',
  spec: 'สเปก',
  pager: 'หน้าก่อนหน้าและถัดไป',
  prev: 'ก่อนหน้า',
  next: 'ถัดไป',
  footerCompliance: (version: string, updated: string): string => `เป็นไปตาม [สเปก v${version} (${updated})](#/spec)`,
  footerGenerated: 'ตาราง จำนวน และ API ทั้งหมดสร้างจากสเปกและ type definition ตอน build ไม่มีตัวเลขที่เขียนด้วยมือ',
  originalNote:
    'คำอธิบายในเว็บไซต์นี้แปลมาจากภาษาญี่ปุ่น ส่วนข้อความที่ยกมาจากสเปก (`modal.skill.md`) — ชื่อและสาระสำคัญของรายการพฤติกรรม บันทึกการ implement คำอธิบาย API และบันทึกการตรวจสอบ — ยังคงเป็นภาษาญี่ปุ่นตามต้นฉบับ',

  lang: {
    button: 'ภาษา',
    title: 'ภาษาที่แสดง',
  },

  theme: {
    button: 'ธีม',
    close: 'ปิด',
    scheme: 'การแสดงผล',
    schemes: { light: 'สว่าง', dark: 'มืด', system: 'ตาม OS' },
    background: 'พื้นหลัง',
    tints: { neutral: 'ไม่มีสี', soft: 'อ่อน', strong: 'เข้ม' },
    motion: 'การเคลื่อนไหว',
    motions: { none: 'ไม่มี', subtle: 'เบา', standard: 'มาตรฐาน', expressive: 'เต็มที่' },
    primary: 'สี primary',
    presets: {
      default: 'ค่าเริ่มต้น',
      magenta: 'สีม่วงแดง',
      red: 'สีแดง',
      salmon: 'สีชมพูแซลมอน',
      vermilion: 'สีส้มอมแดง',
      amber: 'สีส้มอมเหลือง',
      yellow: 'สีเหลือง',
      'lime-yellow': 'สีเหลืองมะนาว',
      lime: 'สีเหลืองอมเขียว',
      green: 'สีเขียว',
      teal: 'สีเขียวหัวเป็ด',
      blue: 'สีน้ำเงิน',
      indigo: 'สีคราม',
      custom: 'สีที่เลือกเอง',
    },
    pickCustom: 'เลือกสีเอง',
    summaryPass: (count: number, worst: string): string =>
      `ตัวอักษรและสีพื้นทั้ง ${String(count)} รายการผ่านเกณฑ์ของ WCAG (แม้คู่ที่เข้มงวดที่สุดก็ได้ ${worst} เท่าของเกณฑ์)`,
    summaryFail: 'มีคู่สีที่ไม่ผ่านเกณฑ์',
    more: 'ดูว่าสีที่เลือกถูกปรับอย่างไร →',
    checks: {
      linkBg: 'ลิงก์และตัวอักษรที่ถูกเลือก (พื้นหลังของหน้า)',
      linkSurface: 'ลิงก์และตัวอักษรที่ถูกเลือก (พื้นผิว)',
      linkSurface1: 'ลิงก์และตัวอักษรที่ถูกเลือก (พื้นผิวที่ยุบลงหนึ่งระดับ)',
      linkSurface2: 'ลิงก์และตัวอักษรที่ถูกเลือก (พื้นผิวที่ยุบลงสองระดับ)',
      linkSoft: 'ลิงก์ (บนพื้นผิวสีอ่อน)',
      onAccent: 'ตัวอักษรบนปุ่มแบบทึบ',
      onSoft: 'ตัวอักษรบนพื้นผิวสีอ่อน (ตั้งเป้าที่ AAA)',
      ink: 'เนื้อหา (บนพื้นผิวที่คอนทราสต์ต่ำที่สุด)',
      ink2: 'ข้อความเสริม (บนพื้นผิวที่คอนทราสต์ต่ำที่สุด)',
      ink3: 'ข้อความจาง (บนพื้นผิวที่คอนทราสต์ต่ำที่สุด)',
      do: 'ตัวอักษรสี “Do” (บนพื้นผิวที่คอนทราสต์ต่ำที่สุด)',
      dont: 'ตัวอักษรสี “Don’t” (บนพื้นผิวที่คอนทราสต์ต่ำที่สุด)',
      caution: 'ตัวอักษรสี “Caution” (บนพื้นผิวที่คอนทราสต์ต่ำที่สุด)',
      gassanPrimary: 'ตัวอักษรของ primary ในโมดอล',
      gassanGated: 'ตัวอักษรของ primary ที่ติด gate ในโมดอล',
      gassanBody: 'เนื้อหาของโมดอล',
      gassanMuted: 'ข้อความเสริมและ tertiary ของโมดอล',
      gassanDanger: 'ข้อความแจ้งข้อผิดพลาดของโมดอล',
      gassanSuccess: 'ไอคอนสำเร็จของโทสต์',
      gassanWarning: 'ไอคอนคำเตือนของโทสต์',
      gassanInfo: 'ไอคอนแจ้งข้อมูลของโทสต์',
      gassanSunday: 'วันอาทิตย์และวันหยุดในปฏิทิน',
      gassanSaturday: 'วันเสาร์ในปฏิทิน',
      focusRing: 'focus ring (ไม่ใช่ข้อความ)',
      fill: 'สีพื้นของสวิตช์และชิปที่ถูกเลือก (ไม่ใช่ข้อความ)',
    },
  },

  example: {
    show: 'ดูโค้ด',
    hide: 'ซ่อนโค้ด',
  },

  frame: {
    variant: 'ตัวอย่าง',
    width: 'ความกว้างของตัวอย่าง',
    wide: 'เดสก์ท็อป',
    phone: 'มือถือ',
    open: 'เปิดเต็มจอ',
  },

  keyPoint: { caution: 'ข้อควรระวัง' },

  component: {
    eyebrow: 'คอมโพเนนต์',
    tabs: 'เนื้อหาในหน้านี้',
    overview: 'ภาพรวม',
    api: 'API',
    a11y: 'การเข้าถึง',
  },

  specChips: 'สเปกที่หน้านี้ครอบคลุม',

  guideline: { do: 'Do', dont: "Don't", caution: 'Caution' },

  mock: { heading: 'ยอดขายเดือนนี้' },

  specTable: {
    id: 'ID',
    behavior: 'พฤติกรรม',
    priority: 'ระดับ',
    summary: 'สาระสำคัญของการ implement',
    status: 'สถานะ',
  },
  priority: { M: 'จำเป็น', S: 'แนะนำ', O: 'ไม่บังคับ' },
  status: {
    実装: 'Implement แล้ว',
    実機: 'เครื่องจริง',
    記述: 'เขียนไว้',
    未検証: 'ยังไม่ตรวจสอบ',
    委譲: 'มอบหมาย',
    合成: 'ประกอบเอง',
    ロードマップ: 'โรดแมป',
  },

  api: {
    name: 'ชื่อ',
    type: 'ชนิด',
    default: 'ค่าเริ่มต้น',
    description: 'คำอธิบาย',
    required: 'จำเป็น',
    none: 'ไม่มี',
    propsOf: (name: string): string => `prop ของ ${name}`,
    passthrough:
      '`data-*` ส่งต่อไปยัง host element ตามเดิม (D-11) ส่วน prop อื่นที่มีขีดกลาง เช่น `aria-*` จะเตือนแล้วตัดทิ้ง',
    inherits: (name: string): string => `สืบทอดจาก \`${name}\``,
  },

  table: 'ตาราง',

  contrastSample: 'Aa ก',

  breakCompare: {
    browser: 'ปล่อยให้เบราว์เซอร์ตัด',
    browserNote: 'ตัดทีละตัวอักษร',
    phraseNote: 'ตัดที่รอยต่อวลี',
  },

  layers: {
    layer: (n: number): string => `เลเยอร์ ${String(n)}`,
    tokens: 'โทเคน CSS',
  },

  notFound: {
    title: 'ไม่พบหน้านี้',
    lead: 'ลิงก์อาจเก่าแล้ว หรือที่อยู่ไม่ถูกต้อง',
    back: 'กลับหน้าแรก',
  },
} satisfies typeof ja;
