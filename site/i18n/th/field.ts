import type ja from '../ja/field';

export default {
  lead: 'Modal.Field รับแค่การผูก label, help และ error ไม่ได้สร้างช่องกรอกข้างใน ส่วน Chips, Switch, Table และ Alert มีไว้เฉพาะส่วนประกอบที่ใช้บ่อยในโมดอลแต่ผูกผิดได้ง่าย',
  field: {
    title: 'ผูกไว้ที่เดียว',
    intro: 'ส่ง id และ aria-* ผ่าน render prop ข้างในจะเป็น input เนทีฟ หรือคอมโพเนนต์จากไลบรารีอื่นก็ได้',
    exampleTitle: 'เชิญสมาชิก',
    exampleDescription: 'ถ้ากด “เชิญ” ตอนที่ยังว่างอยู่ สรุปข้อผิดพลาดจะแสดงในที่เดียว และโฟกัสย้ายไปที่ข้อผิดพลาดแรก',
  },
  delegate: {
    title: 'อย่าสร้าง control เอง',
    tableCaption: 'ที่พึ่งของส่วนประกอบสำหรับกรอกข้อมูล',
    head: { control: 'ส่วนประกอบ', use: 'ทำอย่างไร' },
    rows: [
      { control: 'range / date / time / file / select', use: 'ห่อ input เนทีฟด้วย Modal.Field ตรง ๆ' },
      { control: 'radio, checkbox หลายตัว', use: 'ตั้งชื่อด้วย fieldset และ legend (ไม่ใช่ label)' },
      { control: 'select ที่ค้นหาได้, combobox, slider สองหัว', use: 'ยกให้ไลบรารีเฉพาะทางอย่าง Base UI' },
    ],
    body: [
      'ตัวอย่างขั้นต่ำของแต่ละแบบอยู่ใน [docs/control-recipes.md](./docs/control-recipes.md) popup ที่อยู่ในโมดอล `position: fixed` จะพังเพราะ `transform` ของแผง จึงใช้ popover API หรือ portal เข้าไปใน dialog (C-12)',
    ],
  },
  errors: {
    title: 'วิธีแสดงข้อผิดพลาด',
    callout:
      'ไม่ใส่ `role="alert"` ให้ข้อผิดพลาดแต่ละรายการ ถ้าการอ่านออกเสียงแทรกเข้ามาทุกครั้งที่พิมพ์ จะยิ่งกรอกไม่ได้ วางแค่สรุปตอนส่งไว้ใน `Modal.Alert` แล้วย้ายโฟกัสไปที่ช่องที่ผิดช่องแรก (B-09)',
  },
  apiControl: 'อาร์กิวเมนต์ของ render prop',
  a11yCaption: 'สเปกที่ส่วนประกอบฟอร์มทำตาม',
} satisfies typeof ja;
