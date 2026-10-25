# gassan

[English](./README.md) · [日本語](./README_ja.md) · [简体中文](./README_zh.md) · [繁體中文](./README_zh-Hant.md) · [한국어](./README_ko.md) · **ไทย**

ไลบรารี React UI สำหรับ SaaS ที่สร้างบน `<dialog>` แบบเนทีฟ

ตั้งแต่โมดอล, ส่วนประกอบฟอร์ม, ส่วนประกอบ UI, โทสต์ และแผงคำสั่ง ไปจนถึงหน้าเข้าสู่ระบบ, หน้าข้อผิดพลาด, หน้าราคา และโครงแอปที่มีการตั้งค่า สมาชิก และการเรียกเก็บเงินอยู่ข้างใน ทุกอย่างแสดงได้ด้วยการวางคอมโพเนนต์เพียงตัวเดียว
focus trap, Esc, การทำให้พื้นหลังเป็น inert และ top layer **ไม่ได้เขียนเองที่นี่เลย แม้แต่บรรทัดเดียว** เบราว์เซอร์ทำให้ทั้งหมด
การตัดบรรทัดภาษาญี่ปุ่น จีน เกาหลี รวมถึงการเข้าถึง (accessibility) เขียนไว้เป็นสเปกและตรวจด้วยเทสต์

- **โมดอล** — 5 ประเภท, activation gate (ปุ่มที่กดได้ “เมื่ออ่านจนจบ” หรือ “เมื่อติ๊กช่องแล้ว” โดยไม่ใช้ `disabled`), การย่อชื่อเรื่องที่รักษาชื่อที่เข้าถึงได้ (accessible name) ให้ครบ, `CloseReason` 8 แบบ (เมื่อปฏิเสธการปิดจะคืนเหตุผลกลับมาเสมอ), sheet ที่หยุดตาม detent และโทเคน scrim 4 ระดับที่แบ่งตามเจตนา แทนสีดำ 60% แบบตายตัว
- **ส่วนประกอบฟอร์ม** — ข้อความ, รหัสผ่าน, ค้นหา, ตัวเลข, รหัสยืนยัน, checkbox, radio, segmented, การให้คะแนน, สวิตช์, ชิป, แถบเลื่อน, select, combobox, ปฏิทินที่มีวันหยุดนักขัตฤกษ์ของญี่ปุ่นและเลือกเป็นช่วงได้, ตัวเลือกเวลา, แท็ก, ความแข็งแรงของรหัสผ่าน และไฟล์ ข้างในยังเป็น element แบบเนทีฟ วาดใหม่แค่กรอบและเครื่องหมาย และใช้สี accent ของธีม รายการตัวเลือกและปฏิทินแสดงใน top layer จึงไม่ถูกโมดอลตัดขอบ และ `Field` ยังวางป้ายกำกับไว้ในช่องกรอก แล้วให้ย่อลงไปที่มุมซ้ายบนเมื่อโฟกัสหรือมีข้อความได้ด้วย (`labelPlacement="floating"`)
- **ส่วนประกอบ UI** — ปุ่ม, แบดจ์, อวาตาร์, ความคืบหน้า, skeleton, การ์ด, สรุปตัวเลข, สถานะว่าง, รายการชื่อและค่า, ไทม์ไลน์, แบนเนอร์, แท็บ, accordion, tooltip, popover, เมนู, เส้นทางนำทาง, การแบ่งหน้า, ขั้นตอน, ส่วนหัวของหน้า, ตารางข้อมูล (เรียงลำดับ, เลือกแถว, ทำกับหลายแถวพร้อมกัน) และแผงคำสั่ง (⌘K)
- **โทสต์** — แสดงเวลาที่เหลือก่อนข้อความหายไปด้วยแถบเวลา หยุดเมื่อตัวชี้อยู่บนโทสต์หรือโฟกัสอยู่ข้างใน และปิดได้ทั้งด้วยการปัดหรือกดปิดเอง
- **เทมเพลตหน้าเว็บ** — เข้าสู่ระบบ, สร้างบัญชี, การยืนยันตัวตนแบบ 2 ขั้นตอน, รีเซ็ตรหัสผ่าน, ยืนยันอีเมล, ออกจากระบบ, ข้อผิดพลาด 4xx / 5xx ทั้ง 40 รหัสที่ลงทะเบียนกับ IANA และออฟไลน์, การปิดปรับปรุง, ข้อกำหนดและนโยบายความเป็นส่วนตัว, คำถามที่พบบ่อย, ราคา, ติดต่อเรา และบันทึกการเปลี่ยนแปลง รวมถึงโครงแอปกับหน้าที่อยู่ข้างใน ได้แก่ การตั้งค่า, สมาชิก, แพ็กเกจและการเรียกเก็บเงิน, การตั้งค่าเริ่มต้น และการตอบรับคำเชิญ
- **การตัดบรรทัดภาษาญี่ปุ่น จีน และเกาหลี** — ไม่ว่าจะเป็นปุ่ม ชื่อเรื่อง เซลล์ตาราง หรือข้อความสรุปของกราฟ ข้อความจะไม่ขาดกลางคำ ภาษาญี่ปุ่นตัดที่รอยต่อวลี (「プロフィールを｜編集」 ไม่ใช่ 「プロフィールを編｜集」) ภาษาจีนตัดที่รอยต่อคำ ภาษาเกาหลีตัดเฉพาะที่ช่องว่าง ส่วนภาษาไทยและภาษาอังกฤษปล่อยให้เบราว์เซอร์จัดการ เพราะเบราว์เซอร์ตัดได้ถูกต้องอยู่แล้ว
- **โมชันและธีม** — เลือกการเคลื่อนไหวได้ 4 ระดับ (ทำตามการตั้งค่าลดการเคลื่อนไหวเสมอ) มีโหมดสว่างและมืด และเลือกสีหลัก (primary color) ได้ตามต้องการ ไม่ว่าจะเลือกสีไหน สีตัวอักษรและสีพื้นจะถูกคำนวณให้ผ่านอัตราส่วนคอนทราสต์ของ WCAG

**เว็บไซต์เอกสาร: <https://hiroki-abe-58.github.io/gassan/#/th>**
— แนวคิดการออกแบบ (โมดอลมีไว้ทำไม, โมเดล 4 เลเยอร์, 5 ประเภท, การเข้าถึง), สไตล์ (scrim, สีและคอนทราสต์, ธีม, ขนาด, การตัดบรรทัด, โมชัน),
เดโมที่ใช้งานได้จริงและ API ของทุกคอมโพเนนต์และส่วนประกอบฟอร์ม เทมเพลตหน้าเว็บ และสเปกของพฤติกรรม 258 รายการ จัดวางแบบเดียวกับแนวทาง (guidelines) ของ Material Design 3
เว็บไซต์มีให้อ่านเป็นภาษาไทย, [English](https://hiroki-abe-58.github.io/gassan/#/en), [日本語](https://hiroki-abe-58.github.io/gassan/), [简体中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hans), [繁體中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hant) และ [한국어](https://hiroki-abe-58.github.io/gassan/#/ko) (สลับภาษาได้ด้วยปุ่มรูปลูกโลกที่แถบด้านบน)
มีธีมสว่าง / มืด และเลือกสีหลัก (primary color) ได้ ไม่ว่าจะเลือกสีไหน สีตัวอักษรและสีพื้นจะถูกคำนวณให้ผ่านอัตราส่วนคอนทราสต์ของ WCAG
ตาราง จำนวน และคำอธิบาย API ทั้งหมดบนเว็บไซต์สร้างขึ้นตอน build จากสเปกและ type definition ไม่มีตัวเลขไหนที่เขียนด้วยมือ

การออกแบบฉบับเต็มอยู่ใน [`modal.skill.md`](./modal.skill.md) (ตารางพฤติกรรม 258 รายการ, decision matrix และเกณฑ์คุณภาพ)
เวลาเขียนโค้ดกับผู้ช่วย AI ให้ใส่ไฟล์นี้ไว้ใน context

| เอกสาร | เนื้อหา |
|---|---|
| [`docs/traceability.md`](./docs/traceability.md) | จับคู่พฤติกรรม 258 รายการใน `modal.skill.md` แต่ละข้อกับเทสต์และ CSS ที่ทำให้ข้อนั้นเป็นจริง ตรวจสอบอัตโนมัติด้วย `npm run check:trace` |
| [`docs/requirements-audit.md`](./docs/requirements-audit.md) | แตกข้อกำหนดตั้งต้นออกเป็นบรรทัดละข้อ: implement แล้ว / ทำได้ด้วยการประกอบ (composition) / อยู่ในโรดแมป |
| [`docs/control-recipes.md`](./docs/control-recipes.md) | ตัวอย่างขั้นต่ำของการใส่ส่วนประกอบอินพุตของ gassan ลงในโมดอล และข้อควรระวังเมื่อห่อคอมโพเนนต์จากไลบรารีอื่นมาใช้แทนส่วนที่ gassan ไม่มี |
| [`docs/library-landscape.md`](./docs/library-landscape.md) | `<dialog>` แบบเนทีฟ vs Base UI vs React Aria vs Radix (ณ วันที่ 2026-09-29 ใช้เฉพาะแหล่งข้อมูลปฐมภูมิ) |

สเปก (`modal.skill.md`) และไฟล์ใน `docs/` เขียนเป็นภาษาญี่ปุ่น
เว็บไซต์เอกสารแปลคำอธิบายไว้ครบทั้ง 6 ภาษา ส่วนข้อความที่ยกมาจากสเปก (ชื่อและสรุปของพฤติกรรม, บันทึกการ implement, คำอธิบาย API) จะแสดงเป็นภาษาญี่ปุ่นตามต้นฉบับ

---

## การติดตั้ง

เผยแพร่บน npm ในชื่อ [`@genelab/gassan`](https://www.npmjs.com/package/@genelab/gassan)

```bash
npm install @genelab/gassan
```

```tsx
import { Modal } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
```

peer dependency คือ React 18.2 ขึ้นไป (19 ก็ใช้ได้) bundle มี `"use client"` อยู่แล้ว จึง import จาก Next.js App Router ได้ทันที

ข้อความในตัว (เสียงประกาศของโปรแกรมอ่านหน้าจอ, ป้ายปุ่ม) มีค่าเริ่มต้นเป็นภาษาญี่ปุ่น
ถ้าต้องการภาษาอังกฤษ ให้ครอบแอปด้วย `<GassanProvider labels={englishLabels}>` ทั้งสองตัว export มาจากแพ็กเกจ
สำหรับภาษาอื่น ให้ส่งข้อความของตัวเองให้ `labels` (ส่งแค่บางส่วนก็ได้) ข้อความภาษาจีน เกาหลี และไทยของเว็บไซต์เอกสาร
(`gassan.ts` ใต้ [`site/i18n/<lang>/`](https://github.com/hiroki-abe-58/gassan/tree/main/site/i18n)) ใช้เป็นจุดตั้งต้นได้
ชื่อเดือนและวันในสัปดาห์ของปฏิทิน และขนาดไฟล์ สร้างด้วย `Intl` จาก `labels.locale` (BCP 47 ค่าเริ่มต้นคือ `ja-JP`) ถ้าเป็น locale ภาษาไทย ปีจะแสดงเป็นพุทธศักราช เพราะ `Intl` ใช้ปฏิทินพุทธสำหรับ `th`

---

## ตัวอย่างขั้นต่ำ

```tsx
function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>เปิด</button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>แก้ไขโปรไฟล์</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="ชื่อที่แสดง" required>
            {(control) => <Modal.Input {...control} />}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">ยกเลิก</Modal.Button>
          <Modal.Button variant="primary" onAction={save}>บันทึก</Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
```

**mount โมดอลไว้ตลอดเวลา** อย่าเขียน `{open && <Modal.Root .../>}`
ถ้า mount แบบมีเงื่อนไข แอนิเมชันตอนปิดจะวาดไม่ได้เลยโดยหลักการ

---

## เทมเพลตหน้าเว็บ

วาง `SiteProvider` หนึ่งตัวไว้ที่ root ของแอป (ชื่อผลิตภัณฑ์ โลโก้ ลิงก์ และคอมโพเนนต์ลิงก์ของ router) แล้วแต่ละหน้าก็แค่วางคอมโพเนนต์ตัวเดียว
สไตล์ของเทมเพลตอยู่ใน `templates.css` ให้โหลดหลัง `styles.css`

```tsx
import { SiteProvider, SignInPage } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
import '@genelab/gassan/templates.css';

export function SignIn() {
  return (
    <SiteProvider name="Atlas" links={{ home: '/', signUp: '/signup', forgotPassword: '/forgot' }}>
      <SignInPage
        onSubmit={async ({ email, password }) => {
          const ok = await signIn(email, password);
          // ถ้าไม่สำเร็จ แสดงข้อความเริ่มต้น (ไม่บอกว่าช่องไหนผิด)
          if (!ok) return { error: true };
        }}
      />
    </SiteProvider>
  );
}
```

หลังเข้าสู่ระบบ `AppShell` จะให้แถบนำทางด้านข้าง แถบด้านบน และแผงนำทางเมื่อจอแคบ แล้วเติมข้างในด้วย `SettingsPage`, `MembersPage`, `BillingPage`, `OnboardingPage`, `InviteAcceptPage`, `ChatPage`, `AssistantPage` และ `MailboxPage`
ส่งให้แค่ข้อมูลกับฟังก์ชันจัดการ เมื่อฟังก์ชันจัดการคืนค่า `{ error }` ข้อความนั้นจะถูกอ่านออกเสียง และจะไม่มีการส่งซ้ำ
วันที่และเวลาวาดตาม `timeZone` ของ `SiteProvider` ถ้าไม่ระบุ จะวาดตามเขตเวลาของผู้ชม และวาดเป็น UTC จนกว่า hydration จะเสร็จ ข้อความฝั่งเซิร์ฟเวอร์กับเบราว์เซอร์จึงไม่ขัดกัน

---

## 5 ประเภท

เมื่อเลือก `kind` ค่าเริ่มต้นของ scrim การปิด (dismiss) และการจัดวางจะถูกกำหนดตามนั้น ถ้าโมดอลหนึ่งเข้าได้หลายประเภท แปลว่าจริง ๆ แล้วมันคือโมดอล 2 ตัวที่ควรแยกออกจากกัน

| kind | การใช้งาน | Scrim | Esc | คลิกพื้นหลัง |
|---|---|---|:-:|:-:|
| `confirm` | ยืนยันการกระทำที่ย้อนกลับไม่ได้ | default | ○ | ○ |
| `form` | กรอกข้อมูล | default | ○ | **×** |
| `view` | ดู / ขยาย | default | ○ | ○ |
| `consent` | ยินยอม / รับทราบสิ่งที่บังคับ | strong | **×** | **×** |
| `flow` | หลายขั้นตอน | default | ○ | **×** |

แม้จะตั้งให้ปิดไม่ได้ ความพยายามปิดก็จะไม่ถูกเพิกเฉยแบบเงียบ ๆ แผงจะสั่น และเหตุผลจะถูกอ่านออกเสียง

---

## Activation gate

นี่คือส่วนที่ gassan ต่างจากไลบรารีอื่นมากที่สุด

```tsx
<Modal.Body readGate="read">
  {/* ข้อกำหนดการใช้งานยาว ๆ */}
  <Modal.Consent gate="terms">ฉันยอมรับข้อกำหนด</Modal.Consent>
  <Modal.GateStatus />
</Modal.Body>

<Modal.Footer>
  <Modal.Button variant="primary" gate>ยอมรับและดำเนินการต่อ</Modal.Button>
</Modal.Footer>
```

**ไม่ใช้ `disabled`** ปุ่มใช้ `aria-disabled` แทน
ปุ่มที่เป็น `disabled` รับโฟกัสไม่ได้ ผู้ใช้จึงเสียช่องทางเดียวที่จะรู้ว่าทำไมถึงกดไม่ได้
เมื่อกดปุ่ม gassan จะอ่านเหตุผลออกเสียงและย้ายโฟกัสไปยังจุดที่ผู้ใช้ติดอยู่

**“อ่านจนจบ” ตัดสินด้วย logical OR**

1. sentinel ที่ท้ายเนื้อหามองเห็นได้แล้ว (เมาส์, การสัมผัส)
2. โฟกัสไปถึงตัวทำเครื่องหมายท้ายเนื้อหา (คีย์บอร์ด, โปรแกรมอ่านหน้าจอ)
3. เนื้อหาไม่จำเป็นต้องเลื่อนตั้งแต่แรก

ถ้าตัดสินจากตำแหน่งการเลื่อนอย่างเดียว คนที่อ่านด้วย virtual cursor จะถูกกันออกไป เพราะพวกเขาไม่เคยทำให้เกิด scroll event ปุ่มจึงไม่มีวันกดได้

เงื่อนไขอื่น ๆ ลงทะเบียนได้ด้วย `Modal.Gate`

```tsx
<Modal.Gate
  name="min-3"
  satisfied={selected.length >= 3}
  reason="เลือกอย่างน้อย 3 รายการ"
  focus={() => listRef.current?.focus()}
/>
```

**gate จะปิดอยู่จนกว่าการลงทะเบียนจะครบ**

gate ลงทะเบียนใน effect ของคอมโพเนนต์ลูก effect ไม่ทำงานบนเซิร์ฟเวอร์ และบนไคลเอนต์ก็ยังไม่ได้ทำงานในการ render ครั้งแรก
ในช่วงนั้น registry จะว่าง แต่นั่นหมายถึง “ยังไม่รู้” ไม่ใช่ “ไม่มีเงื่อนไข”
ปุ่มที่มี `gate` จะ render เป็น `aria-disabled="true"` ตั้งแต่ใน markup ฝั่งเซิร์ฟเวอร์
แล้วสลับไปใช้เงื่อนไขจริงหลัง mount ถ้าไม่มี gate เลยสักตัว ปุ่มจะกดได้ตั้งแต่ตอนนั้น

| รูปแบบการเขียน | ก่อนลงทะเบียน | ความหมาย |
|---|---|---|
| `gate` / `gate={true}` | ปิด | ชุดเงื่อนไขที่ต้องตรวจยังไม่ลงตัว |
| `gate={['terms']}` | ปิด | ชื่อที่ยังไม่ได้ลงทะเบียนถือว่ายังไม่ผ่าน |
| `gate={[]}` | เปิด | รู้แน่แล้วว่าไม่มีเงื่อนไขเลย ไม่มีอะไรต้องรอ |

markup ฝั่งเซิร์ฟเวอร์กับการ render ครั้งแรกฝั่งไคลเอนต์ตรงกัน จึงไม่เกิด hydration mismatch
ข้อความเหตุผลเปลี่ยนได้ด้วย `unresolvedReason` ของ `GassanProvider`

---

## การตัดบรรทัด (ภาษาญี่ปุ่น จีน เกาหลี)

ถ้าปล่อยให้เบราว์เซอร์จัดการ ภาษาญี่ปุ่นจะขึ้นบรรทัดใหม่ระหว่างตัวอักษรคู่ใดก็ได้ ปุ่มแคบ ๆ จึงกลายเป็น 「プロフィールを編｜集」
ภาษาจีน (「编辑个人资｜料」) และภาษาเกาหลี (「프로필 편｜집」) ก็ขาดกลางคำแบบเดียวกัน
gassan ไม่ตัดบรรทัดกลางคำเลย — ทั้งในชื่อเรื่อง คำอธิบาย ปุ่ม ป้ายของฟิลด์ เซลล์ตาราง ข้อความสรุปของกราฟ และทุกที่ที่คอมโพเนนต์ของ gassan แสดงข้อความ

| ภาษา | ปล่อยให้เบราว์เซอร์ | gassan |
|---|---|---|
| ภาษาญี่ปุ่น | ตัดระหว่างตัวอักษรคู่ใดก็ได้ | ตัดเฉพาะที่รอยต่อวลี: 「プロフィールを｜編集」 |
| ภาษาจีน (ตัวย่อ, ตัวเต็ม) | ตัดกลางคำ: 「编辑个人资｜料」 | ตัดเฉพาะที่รอยต่อคำ: 「编辑个人｜资料」 |
| ภาษาเกาหลี | ตัดกลางคำ: 「프로필 편｜집」 | ตัดเฉพาะที่ช่องว่าง: 「프로필｜편집」 |
| ภาษาไทย ลาว เขมร พม่า | หารอยต่อคำด้วยพจนานุกรม (ถูกต้องอยู่แล้ว) | ไม่ไปยุ่ง |
| ภาษาอังกฤษและภาษาอื่นที่คั่นคำด้วยช่องว่าง | ตัดที่ช่องว่าง (ถูกต้องอยู่แล้ว) | ไม่ไปยุ่ง |

กฎเหล่านี้ได้มาจากการวัดทีละภาษาว่า Chrome ตัดบรรทัดตรงไหนจริง ๆ เมื่อใส่ข้อความในกล่องแคบ
การไม่ไปยุ่งกับภาษาไทยและภาษาข้างเคียงเป็นความตั้งใจ: ถ้าใส่ `word-break: keep-all` ให้ภาษาเหล่านี้ จุดตัดตามพจนานุกรมของเบราว์เซอร์เองจะถูกกดไว้ แล้วกลับขาดกลางคำแทน

```tsx
// ในคอมโพเนนต์ของ gassan เปิดใช้อยู่แล้วโดยค่าเริ่มต้น สำหรับ UI ของคุณเองให้ใช้ Phrase
const edit = (
  <button type="button">
    <Phrase>プロフィールを編集</Phrase>
  </button>
);

// ปล่อยการตัดบรรทัดให้เบราว์เซอร์ (ค่าเริ่มต้นคือ 'phrase')
const plain = <GassanProvider lineBreak="browser">{edit}</GassanProvider>;
```

- ภาษาตัดสินจากตัวอักษรในสตริง: มีคานะคือภาษาญี่ปุ่น มีฮันกึลคือภาษาเกาหลี มีอักษรฮั่น (Han) โดยไม่มีสองอย่างนั้นคือภาษาจีน ถึงจะไม่มี attribute `lang` ผลก็ไม่เปลี่ยน
- จุดตัดได้จาก `Intl.Segmenter` ร่วมกับกฎตามประเภทตัวอักษร (ไม่เพิ่ม dependency) และทำเครื่องหมายด้วย `<wbr aria-hidden="true">` ข้อความจะได้ `word-break: keep-all` และวลีที่ยาวกว่ากล่องก็ยังขึ้นบรรทัดใหม่ได้แทนที่จะล้นออกไป ภาษาเกาหลีไม่ต้องใช้เครื่องหมาย: `keep-all` อย่างเดียวก็ทำให้ตัดเฉพาะที่ช่องว่างแล้ว
- ไม่มีอะไรถูกเพิ่มลงในข้อความ accessible name ข้อความที่คัดลอก และการค้นหาจึงไม่เปลี่ยน `<wbr>` เปล่า ๆ จะเพิ่มช่องว่างลงใน accessible name บน Chrome และ `aria-hidden` ป้องกันเรื่องนี้
- เซิร์ฟเวอร์และไคลเอนต์สร้าง markup เดียวกัน

---

## คอมโพเนนต์

| ชื่อ | บทบาท |
|---|---|
| `Modal.Root` | เลเยอร์ 1–3: `<dialog>` / scrim / แผง / live region |
| `Modal.Header` `Modal.Controls` | header และช่องทั้งสามของมัน (1fr auto 1fr) |
| `Modal.Back` `Modal.Close` `Modal.Indicator` | ย้อนกลับ / ปิด / ขั้นตอนปัจจุบัน |
| `Modal.Title` `Modal.Description` | ชื่อและคำอธิบาย (ผูกกับ aria ให้อัตโนมัติ) |
| `Modal.Body` `Modal.Section` | พื้นที่เลื่อนเพียงแห่งเดียว และส่วนย่อยภายใน |
| `Modal.Footer` `Modal.Button` | ลำดับชั้นของปุ่ม, gate, กันการส่งซ้ำ |
| `Modal.Gate` `Modal.Consent` `Modal.GateStatus` | Activation gate |
| `Modal.Media` `Modal.Gallery` | รูปภาพ, วิดีโอ, เสียง, สไลเดอร์ |
| `Modal.Field` `Modal.Fieldset` | ผูกชื่อ, help และ error ให้ช่องกรอกหนึ่งช่อง และให้กลุ่มตัวเลือก |
| `Modal.Input` `Modal.PasswordInput` `Modal.SearchInput` `Modal.Textarea` `Modal.NumberField` `Modal.CodeInput` | ช่องกรอกข้อความ |
| `Modal.Checkbox` `Modal.RadioGroup` `Modal.Segmented` `Modal.Rating` `Modal.Switch` `Modal.Chips` | ตัวเลือก |
| `Modal.Slider` `Modal.RangeSlider` | แถบเลื่อน (หัวเลื่อนและแถบที่เติมสีใช้สีของธีม) |
| `Modal.Select` `Modal.Combobox` `Modal.DatePicker` | ส่วนประกอบที่แสดงรายการตัวเลือกหรือปฏิทินใน top layer |
| `Modal.FileDrop` | พื้นที่รับไฟล์ (ตรวจ `accept` กับไฟล์ที่ลากมาวางด้วย) |
| `Modal.Table` `Modal.Alert` | ตารางที่เลื่อนแนวนอนได้ และสรุปผลการส่งฟอร์ม |
| `Modal.Chart` | ภาชนะสำหรับกราฟที่นำมาใส่เอง (ไลบรารีภายนอก หรือ SVG และ canvas ที่ทำเอง) ผูกชื่อ (`label`) และข้อความทดแทนที่บอกแนวโน้ม (`summary`) และเปิดให้ดูข้อมูลดิบใน `<details>` |
| `Modal.Handle` | ที่จับของ sheet ถ้ามี detent จะเป็นตัวควบคุม `role="slider"` ถ้าไม่มี จะเป็นพื้นที่จับเพื่อการตกแต่ง |
| `ModalHost` `useModals` | Imperative API (`await confirm()`) |
| `Modal.Calendar` `Modal.RangeCalendar` `Modal.DateRangePicker` `Modal.TimePicker` `Modal.ColorPicker` | ปฏิทินที่มีวันหยุดนักขัตฤกษ์ของญี่ปุ่นและเลือกเป็นช่วงได้ รวมถึงตัวเลือกเวลาและตัวเลือกสีที่วาดตามธีม |
| `Modal.TagInput` `Modal.PasswordStrength` | แท็ก (รองรับการวางและ IME) และความแข็งแรงของรหัสผ่านใหม่ |
| `toast` `ToastHost` | โทสต์ที่มีแถบบอกเวลาที่เหลือ |
| `Button` `ButtonLink` `IconButton` `CopyButton` `Badge` `Avatar` `AvatarGroup` `Kbd` `Divider` | ปุ่มและเครื่องหมายสำหรับใช้บนหน้าเว็บ (นอกโมดอล) |
| `Card` `Stat` `EmptyState` `DescriptionList` `Timeline` `Progress` `Spinner` `Skeleton` `Banner` | ภาชนะ, ตัวเลข, ความคืบหน้า และการแจ้งเตือน |
| `Tabs` `Accordion` `Tooltip` `Popover` `Menu` `ContextMenu` `Breadcrumbs` `Pagination` `Steps` | ส่วนประกอบสำหรับนำทาง และส่วนประกอบที่แสดงข้างองค์ประกอบต้นทางหรือตรงตำแหน่งที่คลิกขวา |
| `PageHeader` `DataTable` `CommandPalette` | ส่วนหัวของหน้า, ตารางข้อมูล (เรียงลำดับ, เลือกแถว, ทำกับหลายแถวพร้อมกัน) และแผงคำสั่ง (⌘K) |
| `LineChart` `BarChart` `DonutChart` `Sparkline` `BarList` `Gauge` | กราฟที่วาดด้วย SVG และ HTML โดยไม่ต้องพึ่งไลบรารีอื่น ไล่ดูจุดด้วยคีย์บอร์ดพร้อมอ่านค่าออกเสียง เปิดข้อมูลดิบเป็นตารางได้ และสีเป็นไปตามธีม |
| `Carousel` | ภาพหมุนเวียนที่เลื่อนด้วยนิ้วได้ และใช้ปุ่มก่อนหน้า ถัดไป กับจุดเลือกสไลด์ได้ การเล่นอัตโนมัติวางปุ่มหยุดไว้เป็นลำดับแรก และหยุดเมื่อมีตัวชี้หรือโฟกัสอยู่ |
| `ChatThread` `ChatComposer` `TypingIndicator` `ChatSuggestions` | แชตระหว่างผู้คนและการสนทนากับ AI ไม่เลื่อนตำแหน่งขณะอ่านข้อความด้านบน กด Enter ระหว่างแปลงอักษรด้วย IME จะไม่ส่ง และคำตอบที่ทยอยเขียนจะอ่านออกเสียงเมื่อเขียนเสร็จ |
| `CodeBlock` `TreeView` `NotificationCenter` `Checklist` | บล็อกโค้ดพร้อมปุ่มคัดลอก Tree view ที่เลื่อนด้วยปุ่มลูกศรและการพิมพ์ตัวอักษร รายการแจ้งเตือนที่เปิดจากกระดิ่ง และเช็กลิสต์เริ่มต้นใช้งานที่ย้ายโฟกัสไปยังขั้นตอนถัดไปเมื่อทำขั้นตอนเสร็จ |
| `ScrollArea` `PageScrollbar` | แถบสกรอลล์ที่วาดเอง ให้หน้าตาเหมือนกันทุกเบราว์เซอร์และระบบปฏิบัติการ (การสกรอลล์ยังเป็นของเบราว์เซอร์) การสกรอลล์ภายในคอมโพเนนต์ เช่น เนื้อหาโมดัล รายการ แชต และตาราง ก็ใช้แถบเดียวกัน |
| `ChatWidget` | แชตบอตที่มุมขวาล่างของเว็บไซต์ ปุ่มลอยทรงกลมเปิดหน้าต่างเล็กที่ไม่ใช่โมดัล และขยายเป็นแผงด้านขวาได้ บนจอโทรศัพท์จะเป็น sheet เต็มหน้าจอ |
| `SiteProvider` `SignInPage` `SignUpPage` `TwoFactorPage` `ForgotPasswordPage` `ResetPasswordPage` `VerifyEmailPage` `SignOutPage` | หน้าเข้าสู่ระบบและหน้าบัญชี (`templates.css`) |
| `ErrorPage` `MaintenancePage` `DocumentPage` `FaqPage` `PricingPage` `ContactPage` `ChangelogPage` | หน้าข้อผิดพลาด, การปิดปรับปรุง และหน้าสาธารณะ |
| `AppShell` `SettingsPage` `MembersPage` `BillingPage` `OnboardingPage` `InviteAcceptPage` `ChatPage` `AssistantPage` `MailboxPage` | โครงแอปและหน้าที่อยู่ข้างใน |
| `GassanProvider` | แทนที่ข้อความ UI (ค่าเริ่มต้นเป็นภาษาญี่ปุ่น มี `englishLabels` มาให้ด้วย) และสลับการตัดบรรทัด (`lineBreak`) |
| `Phrase` `splitPhrases` | การตัดบรรทัดแบบเดียวกันสำหรับข้อความภาษาญี่ปุ่น จีน และเกาหลีใน UI ของคุณเอง (ในคอมโพเนนต์ของ gassan เปิดอยู่แล้วโดยค่าเริ่มต้น) |

ส่วนประกอบฟอร์มยังมีชื่อกลาง ๆ ที่ไม่มี `Modal` นำหน้า (`Field`, `Input`, `Select`, `Calendar` …) ไว้ใช้บนหน้าเว็บด้วย
ส่วนประกอบอินพุตข้างในเป็น element แบบเนทีฟ และรับ render prop ของ `Modal.Field` ได้เลยแค่ spread เข้าไปตรง ๆ
กลุ่มตัวเลือก (radio, checkbox หลายตัว, การให้คะแนน, สไลเดอร์สองหัว) ให้ตั้งชื่อด้วย `Modal.Fieldset` (`fieldset` / `legend`) ไม่ใช่ `label`
รายการตัวเลือกและปฏิทินแสดงใน top layer ด้วย popover API และขณะที่เปิดอยู่ Esc จะปิดแค่รายการหรือปฏิทินนั้น
ส่วนประกอบที่ gassan ไม่มี (เช่น combobox ที่เลือกได้หลายค่า) ให้ห่อคอมโพเนนต์จากไลบรารีอื่นด้วยวิธีเดียวกัน ตัวอย่างอยู่ใน [`docs/control-recipes.md`](./docs/control-recipes.md)

```tsx
<Modal.Field label="วิธีจัดส่ง">
  {(control) => <Modal.Select {...control} value={shipping} onValueChange={setShipping} options={SHIPPING} />}
</Modal.Field>

<Modal.Fieldset label="ช่วงราคา">
  <Modal.RangeSlider value={price} onValueChange={setPrice} min={0} max={10000} step={500} showValue />
</Modal.Fieldset>
```

```tsx
<Modal.Chart
  label="ยอดขายรายเดือน (พันดอลลาร์สหรัฐ)"
  summary="มีนาคมสูงสุดที่ 120 ตั้งแต่เมษายนเป็นต้นไปทรงตัวอยู่ราว 100"
  data={<Modal.Table label="ข้อมูลดิบ"><table>{/* … */}</table></Modal.Table>}
>
  <MyBarChart />  {/* SVG / canvas / ไลบรารีใดก็ได้ ค่าเริ่มต้นเป็น aria-hidden */}
</Modal.Chart>
```

```tsx
import { LineChart } from '@genelab/gassan';

<LineChart
  label="ยอดขายรายเดือน"
  description="ยอดขายสูงสุดในเดือนมีนาคม"
  data={[
    { month: 'ม.ค.', revenue: 1180, cost: 820 },
    { month: 'ก.พ.', revenue: 1240, cost: 850 },
    { month: 'มี.ค.', revenue: 1520, cost: 900 },
  ]}
  x="month"
  series={[
    { key: 'revenue', label: 'ยอดขาย' },
    { key: 'cost', label: 'ต้นทุน' },
  ]}
  area
  table
/>
```

---

## การส่งผ่าน `data-*`

ทุกคอมโพเนนต์ส่ง `data-*` ต่อไปยัง host element ตรง ๆ จึงใช้เป็น selector สำหรับ E2E ได้

```tsx
<Modal.Root data-testid="confirm" open={open} onOpenChange={setOpen}>
  <Modal.Footer>
    <Modal.Button variant="primary" data-testid="confirm-ok">OK</Modal.Button>
  </Modal.Footer>
</Modal.Root>
```

มีแค่ 2 อย่างที่ไม่ถูกส่งผ่าน และทั้งสองอย่าง**ไม่ถูกทิ้งแบบเงียบ ๆ: จะมีคำเตือนตอน development เสมอ**

| สิ่งที่ส่งไป | ผลที่เกิด | ให้ใช้แทน |
|---|---|---|
| ชื่อที่ gassan ใช้ภายใน เช่น `data-kind` | ถูกเพิกเฉย (ไม่อย่างนั้น state ภายในจะเสียหาย) | ชื่ออื่น |
| prop ที่มีขีดกลางซึ่งไม่ใช่ `data-` เช่น `aria-label` | ถูกเพิกเฉย | `label` หรือ `Modal.Title` สำหรับชื่อ, `aria-describedby` สำหรับคำอธิบาย |

TypeScript ยกเว้นชื่อ attribute ของ JSX ที่มีขีดกลางจากการตรวจ excess property
**ทั้งหมดนี้จึงไม่เป็น type error** เมื่อ type จับไม่ได้ runtime จึงไม่ยอมเงียบ

---

## Sheet และ detent

`placement="sheet"` ทำให้แผงเลื่อนขึ้นมาจากด้านล่าง ถ้าส่ง `detents` แผงจะหยุดที่ความสูงเหล่านั้น

```tsx
<Modal.Root
  open={open}
  onOpenChange={setOpen}
  placement="sheet"
  swipeToDismiss
  detents={['peek', 'half', 'full']}
  defaultDetent="half"
  onDetentChange={(d) => console.log(d)}
>
  <Modal.Handle />
  <Modal.Header>
    <Modal.Title>เส้นทาง</Modal.Title>
  </Modal.Header>
  <Modal.Body>{/* … */}</Modal.Body>
</Modal.Root>
```

มีกฎ 3 ข้อ

1. **การปัดลงเร็ว ๆ ไม่ได้ปิด sheet แต่ลดลงหนึ่ง detent** เมื่อมี detent คนที่ปัดมักหมายถึง “ย่อลงอีกนิด”
   sheet จะปิดก็ต่อเมื่อปัดลงต่อจาก detent ที่ต่ำที่สุดเท่านั้น
2. **ที่จับไม่ได้มีไว้ลากอย่างเดียว** เมื่อมี detent จะกลายเป็น `role="slider"`
   และปุ่มลูกศร, Home / End และการคลิกก็เลื่อนไปมาระหว่าง detent ได้ คนที่ลากไม่ได้จึงไม่ถูกทิ้งไว้โดยไม่มีทางไป
3. **ถ้าไม่มี detent sheet จะสูงเท่าเนื้อหาเหมือนเดิม** ที่จับจะกลับไปเป็นของตกแต่ง (`aria-hidden`)
   สิ่งที่ขยับไม่ได้จะไม่ถูกประกาศว่าเป็นตัวควบคุม

ตรรกะการ snap แยกออกมาเป็น pure function `resolveDetents` / `snapToDetent` (import แยกได้)

---

## Imperative API

```tsx
const modals = useModals();
const ok = await modals.confirm({ title: 'ลบรายการนี้ไหม', tone: 'danger' });
```

วาง `<ModalHost />` หนึ่งตัวไว้ที่ root ของแอป ต่อให้เรียก confirm สองครั้งพร้อมกัน ก็จะแสดงทีละอัน

---

## ข้อกำหนดของเบราว์เซอร์

gassan ใช้ `<dialog>` `showModal()` `@starting-style` `transition-behavior: allow-discrete` `:has()` `@container`
ทั้งหมดเป็น Baseline (`<dialog>` ตั้งแต่ 2022 ที่เหลือตั้งแต่ 2023–2024)

มีเพียง property `overlay` ของ CSS ที่ใช้กับแอนิเมชันขาออกเท่านั้นที่เป็น **Limited availability บน MDN (ไม่ใช่ Baseline)**
gassan จึงมี fallback ด้วย JS: เมื่อได้รับคำขอปิด จะเพิ่ม `data-exiting` แล้ววาดสถานะขาออกขณะที่ dialog ยังเปิดอยู่
และเรียก `close()` หลัง `--g-dur-out` (ถ้าเป็น `prefers-reduced-motion` จะเรียกทันที)
`onExited` การรีเซ็ตเนื้อหา การคืนโฟกัส และการปลด scroll lock เกิดขึ้นหลัง `close()` ทั้งหมด

`requestClose()` เป็น Baseline 2025 และ `closedby` เป็น Limited availability gassan ไม่ใช้ทั้งสองอย่าง
แต่หยุด `cancel` แล้วส่งทุกอย่างผ่าน `requestClose(reason)` ของตัวเอง (รายละเอียดอยู่ใน [`docs/library-landscape.md`](./docs/library-landscape.md))

ในสภาพแวดล้อมที่เก่ากว่า จะลดระดับเหลือแค่ “โมดอลที่ไม่มีแอนิเมชัน” ส่วนการเปิดปิดและการเข้าถึงยังคงอยู่

---

## การพัฒนา

```bash
npm install
npm run dev              # เดโมใน examples/react (Vite) ใช้เป็นแท่นทดสอบบนอุปกรณ์จริง
npm run site:dev         # เปิดเว็บไซต์เอกสารบนเครื่อง (http://localhost:5180)
npm run site:build       # build เว็บไซต์ลง site/dist (ตรวจดูด้วย npm run site:preview)
npm run verify           # typecheck → lint → test → trace → docs → build → ตรวจ dist / SSR / pack
npm run check:consumer   # ติดตั้ง tarball จริงแล้วตรวจจากภายนอก (ต้องใช้เครือข่าย)
```

เว็บไซต์เอกสารอยู่ใน `site/` ตอน build จะอ่านสเปก ตาราง traceability รายงานการตรวจสอบ
และ type definition ใน `src` มาประกอบเป็นตารางและ API reference (`site/plugins/gassan-data.ts`)
โค้ดที่แสดงในแต่ละเดโมคือไฟล์เดโมตัวจริง (`?raw`) ตัวอย่างกับโค้ดจึงไม่มีทางคลาดกัน
เมื่อ push ไปที่ `main` GitHub Actions จะ build เว็บไซต์และเผยแพร่ไปยัง GitHub Pages

`examples/css-check.html` เปิดในเบราว์เซอร์ได้โดยตรง
เป็นหน้าสำหรับตรวจด้วยตาในสิ่งที่ jsdom ตรวจไม่ได้ เช่น top layer แอนิเมชันขาออก ความเข้มของ scrim

อะไรตรวจแล้วและอะไรยังไม่ได้ตรวจ เขียนแยกไว้ใน [`VERIFICATION.md`](./VERIFICATION.md)
**“เทสต์เป็นสีเขียว” กับ “รับประกันได้” เป็นคนละเรื่องกัน**
18 รายการที่ตรวจได้เฉพาะในเบราว์เซอร์จริงจึงแยกไว้ในหัวข้อที่ 3 ของไฟล์นั้น

ประวัติการเปลี่ยนแปลงอยู่ใน [`CHANGELOG.md`](./CHANGELOG.md) และแผนการออกเวอร์ชันจนถึง v1.0 อยู่ใน [`ROADMAP.md`](./ROADMAP.md)

---

## ไลเซนส์

MIT ฉบับเต็มอยู่ใน [`LICENSE`](./LICENSE)
