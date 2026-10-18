import type ja from '../ja/select';

export default {
  lead: 'Select คือ dropdown ที่ gassan วาดเองไปจนถึงรายการตัวเลือก ส่วน Combobox คือ dropdown ที่พิมพ์เพื่อกรองได้ รายการแสดงขึ้นใน top layer ด้วย popover จึงไม่ถูกตัดทั้งโดย transform ของโมดอล และโดยการสกรอลล์ของเนื้อหา',
  gallery: {
    title: 'ตัวอย่าง',
    intro: 'ลูกศรวางไว้ด้านในระยะ padding ของกรอบ ส่วน select แบบเนทีฟ ต่อให้ใส่ padding ก็ยังวาดลูกศรติดขอบขวาสุด',
    items: {
      select: 'Select',
      placeholder: 'ยังไม่ได้เลือก',
      combobox: 'Combobox',
      invalid: 'ข้อผิดพลาด',
      disabled: 'ใช้ไม่ได้',
    },
    samples: {
      sizeLabel: 'ขนาด',
      sizeS: 'เล็ก (360px)',
      sizeM: 'กลาง (520px)',
      sizeL: 'ใหญ่ (720px)',
      cityLabel: 'เมือง',
      citySapporo: 'ซัปโปโร',
      cityTokyo: 'โตเกียว',
      cityNagoya: 'นาโกย่า',
      cityOsaka: 'โอซาก้า',
      cityFukuoka: 'ฟุกุโอกะ',
    },
  },
  modal: {
    title: 'ในโมดอล',
    intro: 'เมื่อรายการเปิดอยู่ Esc จะปิดแค่รายการ ไม่ปิดโมดอล',
    exampleTitle: 'เลือกที่อยู่จัดส่ง',
    exampleDescription: 'พิมพ์เพื่อกรองประเทศได้ โดยไม่สนตัวพิมพ์เล็กใหญ่ และไม่สนว่าเป็นอักษรเต็มความกว้างหรือครึ่งความกว้าง',
  },
  keys: {
    title: 'การใช้คีย์บอร์ด',
    tableCaption: 'การใช้คีย์บอร์ดของ Select และ Combobox',
    head: { key: 'คีย์', select: 'Select', combobox: 'Combobox' },
    rows: [
      { key: '↓ / ↑', select: 'เปิดรายการ ถ้าเปิดอยู่แล้วจะเลื่อนไปตัวก่อนหน้า/ถัดไป', combobox: 'เปิดรายการ ถ้าเปิดอยู่แล้วจะเลื่อนไปตัวก่อนหน้า/ถัดไป' },
      { key: 'Home / End', select: 'ไปที่ตัวเลือกแรก/ตัวสุดท้าย', combobox: 'ไปที่ต้น/ท้ายของช่องกรอก (ตามพฤติกรรมเนทีฟ)' },
      { key: 'ตัวอักษร', select: 'กระโดดไปที่ตัวเลือกที่ขึ้นต้นด้วยตัวอักษรนั้น', combobox: 'กรองรายการ แล้วชี้ไปที่ตัวเลือกแรก' },
      { key: 'Enter', select: 'เลือกแล้วปิด', combobox: 'เลือกตัวเลือกที่ชี้อยู่ (ไม่เลือกระหว่างที่ IME กำลังแปลงอักษร)' },
      { key: 'Space', select: 'เลือกแล้วปิด (ถ้าอยู่ระหว่างพิมพ์ค้นหาต่อเนื่อง จะถือเป็นตัวอักษร)', combobox: 'พิมพ์ช่องว่าง' },
      { key: 'Tab', select: 'เลือกตัวเลือกที่ชี้อยู่ แล้วไปยังช่องถัดไป', combobox: 'ถ้าตรงกันพอดีจะเลือก ถ้าไม่ตรงจะคืนค่าเดิม แล้วไปยังช่องถัดไป' },
      { key: 'Esc', select: 'ปิดแค่รายการ', combobox: 'ปิดแค่รายการ' },
    ],
  },
  a11yCaption: 'สเปกที่ Select และ Combobox ทำตาม',
} satisfies typeof ja;
