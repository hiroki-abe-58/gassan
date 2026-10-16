import type ja from '../ja/root';

export default {
  lead: 'ภาชนะที่รับผิดชอบเลเยอร์ 1–3 ยก top layer โฟกัส และ Esc ให้ <dialog> กับ showModal() จัดการ วาง scrim แผง และ live region แล้วรวมคำขอปิดทั้งหมดพร้อมเหตุผลมาไว้ในเส้นทางเดียว',
  playground: {
    title: 'สิ่งที่ kind กำหนด',
    intro: 'เปลี่ยน kind, size, placement และ scrim แล้วเปิดดู เมื่อตั้งไว้ว่าไม่ปิด ถ้ากด Esc หรือคลิกพื้นหลัง แผงจะสั่นและอ่านออกเสียงเหตุผล',
    exampleTitle: 'Playground ของ Modal.Root',
  },
  reasons: {
    title: 'เหตุผลการปิด',
    intro: 'onOpenChange(false, reason) มาพร้อมเหตุผลเสมอ จึงเขียนเงื่อนไขอย่าง “บันทึกฉบับร่างเฉพาะตอนปิดด้วย Esc” ได้',
    tableLabel: 'รายการเหตุผลการปิด',
    tableCaption: 'CloseReason ทั้ง 8 แบบ',
    from: 'ต้นทาง',
    refuse: 'ช่องทางที่ปฏิเสธได้',
    rows: {
      esc: { from: 'ปุ่ม Esc หยุด cancel ของเนทีฟเสมอ แล้วให้มารวมที่นี่', refuse: 'dismiss.esc / onRequestClose' },
      backdrop: { from: 'การกดที่ scrim นับเฉพาะเมื่อทั้งจุดที่กดและจุดที่ปล่อยอยู่บน scrim', refuse: 'dismiss.backdrop / onRequestClose' },
      'close-button': { from: 'Modal.Close หรือปุ่มที่มี closeOnClick="close-button"', refuse: 'onRequestClose' },
      'back-button': { from: 'ปุ่มย้อนกลับของเบราว์เซอร์เมื่อใช้ closeOnBack (ตอบสนองเฉพาะตัวบนสุดตัวเดียว)', refuse: 'onRequestClose' },
      submit: { from: 'ปุ่มที่มี closeOnClick="submit" หรือ <form method="dialog">', refuse: 'onRequestClose (เมื่อมาจากปุ่ม)' },
      programmatic: { from: 'มีการเรียก dialog.close() จากภายนอก', refuse: '— (ปิดไปแล้ว ทำแค่เก็บกวาด)' },
      swipe: { from: 'การปัดลงของ sheet (swipeToDismiss)', refuse: 'dismiss.backdrop / onRequestClose' },
      'route-change': { from: 'routeKey เปลี่ยน (ถ้าเป็น Next.js ให้ส่ง usePathname())', refuse: 'onRequestClose' },
    },
  },
  guard: {
    title: 'การรั้งไว้',
    intro: 'ถ้า onRequestClose คืน false (หรือ Promise ที่ resolve เป็น false) จะไม่ปิด เมื่อปฏิเสธก็ไม่เงียบ แต่สั่นแผงและอ่านเหตุผลออกเสียง',
    exampleTitle: 'รั้งฟอร์มที่กรอกค้างไว้',
    exampleDescription: 'พิมพ์อะไรสักอย่างแล้วกด Esc หรือ × จะมี dialog ยืนยันซ้อนขึ้นมาอีกชั้น',
  },
  mount: {
    title: 'mount ไว้ตลอดและการเก็บกวาด',
    body: [
      'วาดโมดอลไว้ตลอด และเปิดปิดด้วย `open` เมื่อได้รับคำขอปิด จะใส่ `data-exiting` เพื่อวาดขาออก รอ `--g-dur-out` แล้วค่อย `close()` การรีเซ็ตเนื้อหา (`resetOnClose`) การคืนโฟกัส การปลดล็อกสกรอลล์ และ `onExited` ทำทั้งหมดหลัง `close()`',
    ],
    callout:
      'ซ้อนกันได้ (L-11) เพื่อไม่ให้ Esc หรือ Cmd/Ctrl + Enter ของตัวในทะลุไปถึงตัวนอก event จะผ่านเฉพาะเมื่อ “dialog ที่ใกล้ที่สุดคือตัวเอง” ซ้อน 2 ชั้น scrim ก็ยังเข้มเท่ากับชั้นเดียว (L-12)',
  },
  a11yBody: [
    'การกักโฟกัส การทำให้พื้นหลังเป็น inert, Esc และการคืนโฟกัส `showModal()` ทำให้ สิ่งที่ Root ถือเองคือ การผูกชื่อ live region หนึ่งตัว ตำแหน่งโฟกัสเริ่มต้น และการรวมเส้นทางการปิดให้เหลือเส้นเดียว',
  ],
  a11yCaption: 'สเปกที่ Modal.Root ทำตาม',
} satisfies typeof ja;
