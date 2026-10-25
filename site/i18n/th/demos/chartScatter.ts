import type ja from '../../ja/demos/chartScatter';

export default {
  label: 'อัตราการใช้งานและความพึงพอใจแยกตามฟีเจอร์',
  description: 'ระบบอัตโนมัติที่เพิ่มในไตรมาสนี้ยังมีคนใช้ไม่มาก แต่ได้ความพึงพอใจสูงที่สุด ส่วนการแจ้งเตือนมีคนใช้มาก แต่ความพึงพอใจกลับต่ำ',
  adoption: 'อัตราการใช้งาน',
  satisfaction: 'ความพึงพอใจ (เต็ม 5 คะแนน)',
  users: 'จำนวนผู้ใช้',
  core: 'ฟีเจอร์พื้นฐาน',
  added: 'ฟีเจอร์ที่เพิ่มในไตรมาสนี้',
  features: {
    search: 'การค้นหา',
    sharing: 'การแชร์',
    export: 'การส่งออก',
    notifications: 'การแจ้งเตือน',
    permissions: 'การตั้งค่าสิทธิ์',
    automation: 'ระบบอัตโนมัติ',
    summary: 'การสรุปด้วย AI',
    integrations: 'การเชื่อมต่อภายนอก',
  },
  comments: {
    size: 'ถ้าส่ง sizeLabel ให้ จะแสดง size ของแต่ละจุดเป็นพื้นที่ของฟอง (แผนภูมิฟอง)',
  },
} satisfies typeof ja;
