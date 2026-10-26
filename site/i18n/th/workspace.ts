import type ja from '../ja/workspace';

export default {
  lead: 'คีย์ API บันทึกการตรวจสอบ และการตั้งค่าการแจ้งเตือน เป็น 3 หน้าจอสำหรับผู้ดูแลระบบที่มักถูกสร้างใหม่ซ้ำแล้วซ้ำเล่า จึงเตรียมไว้เป็นเนื้อหาสำหรับวางในโครงแอป (P-12)',
  apiKeys: {
    title: 'คีย์ API',
    intro: 'ตัวคีย์จะแสดงเพียงครั้งเดียวในหน้าต่างเดิมทันทีหลังจากสร้าง โฟกัสจะย้ายไปที่ช่องแบบอ่านอย่างเดียวและเลือกข้อความทั้งหมดไว้ พร้อมผูกปุ่ม “คัดลอก” และข้อความ “แสดงเฉพาะตอนนี้เท่านั้น” เข้ากับช่องนั้น ระหว่างที่แสดงคีย์ กด Esc หรือกดข้างนอกก็จะไม่ปิด และจะอ่านออกเสียงเหตุผลที่ไม่ปิด ส่วนประกอบจะไม่เก็บคีย์ไว้ (แสดง `secret` ที่ `onCreate` คืนค่ามา แล้วทิ้งไปเมื่อปิด) ตารางจะได้รับแค่บางส่วนของคีย์ไว้ใช้แยกแยะ (`hint`) ตัวเลือกวันหมดอายุจะเรียงช่วงที่สั้นกว่าไว้ก่อน และใช้ตัวแรกเป็นค่าเริ่มต้น',
    code: `import { ApiKeysPage, type ApiKey } from '@genelab/gassan';

const SCOPES = [
  { value: 'read', label: 'อ่าน', description: 'อ่านโปรเจกต์และสมาชิก' },
  { value: 'write', label: 'เขียน', description: 'สร้าง แก้ไข และลบโปรเจกต์' },
];

export function ApiKeys({ keys, reload }: { keys: ApiKey[]; reload: () => void }) {
  return (
    <ApiKeysPage
      keys={keys}
      scopes={SCOPES}
      onCreate={async (values) => {
        const response = await fetch('/api/keys', { method: 'POST', body: JSON.stringify(values) });
        if (!response.ok) return { error: true };
        // เซิร์ฟเวอร์เก็บไว้แค่แฮชของคีย์ และส่งตัวคีย์กลับมาเพียงครั้งนี้ครั้งเดียว
        const { secret } = (await response.json()) as { secret: string };
        reload();
        return { secret };
      }}
      onRevoke={async (id) => {
        const response = await fetch(\`/api/keys/\${id}\`, { method: 'DELETE' });
        if (!response.ok) return { error: true };
        reload();
      }}
    />
  );
}`,
  },
  auditLog: {
    title: 'บันทึกการตรวจสอบ',
    intro: 'การกรองและการแบ่งหน้าทำที่เซิร์ฟเวอร์ ส่วนประกอบไม่เก็บเงื่อนไขไว้เอง แต่รับผ่าน `query` และส่งต่อผ่าน `onQueryChange` ทุกครั้งที่เปลี่ยน คำค้นหาจะมีผลเมื่อส่ง (Enter หรือ “ค้นหา”) ส่วนประเภทการดำเนินการและช่วงวันที่จะมีผลเมื่อเลือก และเมื่อเปลี่ยนเงื่อนไขจะกลับไปที่หน้า 1 วันที่และเวลาแสดงถึงหลักวินาที โดยมีชื่อเขตเวลากำกับไว้ที่หัวคอลัมน์ ระหว่างโหลดให้ส่ง `loading` (ตารางจะแสดงเป็น skeleton และเมื่อโหลดเสร็จจะอ่านออกเสียงจำนวนรายการ)',
    code: `import { useState } from 'react';
import { AuditLogPage, type AuditLogQuery } from '@genelab/gassan';

import { useAuditLog } from './api'; // รับเงื่อนไข แล้วอ่านข้อมูล 1 หน้าจากเซิร์ฟเวอร์

const ACTIONS = [
  { value: 'member.invite', label: 'เชิญสมาชิก' },
  { value: 'api_key.create', label: 'สร้างคีย์ API' },
  { value: 'auth.sign_in', label: 'เข้าสู่ระบบ' },
];

export function AuditLog() {
  const [query, setQuery] = useState<AuditLogQuery>({ text: '', action: null, range: null, page: 1 });
  const { data, isLoading } = useAuditLog(query);
  return (
    <AuditLogPage
      query={query}
      onQueryChange={setQuery}
      events={data?.events ?? []}
      total={data?.total ?? 0}
      pageCount={data?.pageCount ?? 1}
      loading={isLoading}
      actions={ACTIONS}
      onExport={async (current) => {
        const response = await fetch('/api/audit-log/exports', { method: 'POST', body: JSON.stringify(current) });
        return response.ok ? undefined : { error: true };
      }}
    />
  );
}`,
  },
  notifications: {
    title: 'การตั้งค่าการแจ้งเตือน',
    intro: 'ตารางที่มีประเภทการแจ้งเตือนเป็นแถว และวิธีรับเป็นคอลัมน์ โดย checkbox แต่ละอันมีชื่อที่รวมหัวแถวกับหัวคอลัมน์เข้าด้วยกัน (“ความคิดเห็นและการกล่าวถึง อีเมล”) วิธีที่ส่งไม่ได้จะแสดง “—” ส่วนการแจ้งเตือนที่ปิดไม่ได้ (ความปลอดภัย การเรียกเก็บเงิน) จะไม่มีให้เลือก แต่เขียนไว้ว่า “ส่งเสมอ” สวิตช์ “หยุดการแจ้งเตือนทั้งหมดชั่วคราว” วางไว้ก่อนตาราง และระหว่างที่หยุดไว้ ตารางจะเลือกไม่ได้และมีเหตุผลเขียนกำกับไว้ ถ้าเวลาสิ้นสุดของช่วงเวลาห้ามรบกวนมาก่อนเวลาเริ่มต้น จะเติม “ของวันถัดไป” ต่อท้าย',
  },
  samples: {
    keys: { production: 'เซิร์ฟเวอร์ใช้งานจริง', ci: 'การทดสอบ CI', analytics: 'ส่งออกข้อมูลวิเคราะห์', legacy: 'การเชื่อมต่อระบบเก่า' },
    scopes: {
      read: { label: 'อ่าน', description: 'อ่านโปรเจกต์และสมาชิก' },
      write: { label: 'เขียน', description: 'สร้าง แก้ไข และลบโปรเจกต์' },
      billing: { label: 'การเรียกเก็บเงิน', description: 'อ่านใบแจ้งหนี้และปริมาณการใช้งาน' },
    },
    actions: {
      signIn: 'เข้าสู่ระบบ',
      signInFailed: 'เข้าสู่ระบบไม่สำเร็จ',
      invite: 'เชิญสมาชิก',
      role: 'เปลี่ยนบทบาทของสมาชิก',
      remove: 'นำสมาชิกออก',
      keyCreate: 'สร้างคีย์ API',
      keyRevoke: 'เพิกถอนคีย์ API',
      plan: 'เปลี่ยนแพ็กเกจ',
      settings: 'เปลี่ยนการตั้งค่าเวิร์กสเปซ',
      export: 'ส่งออกข้อมูล',
    },
    roleChange: '{0} (ผู้ดู → ผู้แก้ไข)',
    planChange: 'Free → Pro',
    settingsTarget: 'ชื่อเวิร์กสเปซ',
    exportTarget: 'รายชื่อสมาชิก (CSV)',
    system: 'ระบบ',
    apiKey: 'คีย์ API',
    locations: { tokyo: 'โตเกียว ประเทศญี่ปุ่น', osaka: 'โอซากา ประเทศญี่ปุ่น', fukuoka: 'ฟุกุโอกะ ประเทศญี่ปุ่น', singapore: 'สิงคโปร์' },
    topics: {
      comments: { label: 'ความคิดเห็นและการกล่าวถึง', description: 'ความคิดเห็นที่ส่งถึงคุณ และการ @กล่าวถึงคุณ' },
      invites: { label: 'คำเชิญและการเข้าร่วม', description: 'คำเชิญเข้าเวิร์กสเปซ และการเข้าร่วมของสมาชิก' },
      projects: { label: 'การอัปเดตโปรเจกต์', description: 'การเปลี่ยนแปลงในโปรเจกต์ที่คุณรับผิดชอบ' },
      weekly: { label: 'สรุปประจำสัปดาห์', description: 'ส่งสรุปความเคลื่อนไหวของสัปดาห์ที่แล้วให้ทุกเช้าวันจันทร์' },
      product: { label: 'ฟีเจอร์ใหม่', description: 'ฟีเจอร์ใหม่และเคล็ดลับการใช้งาน' },
      security: { label: 'ความปลอดภัย', description: 'การเข้าสู่ระบบจากอุปกรณ์ใหม่ และการเปลี่ยนรหัสผ่าน' },
      billing: { label: 'การเรียกเก็บเงิน', description: 'ใบแจ้งหนี้และการชำระเงินที่ไม่สำเร็จ' },
    },
  },
  a11yCaption: 'การทำงานของเทมเพลตคีย์ API บันทึกการตรวจสอบ และการตั้งค่าการแจ้งเตือน',
} satisfies typeof ja;
