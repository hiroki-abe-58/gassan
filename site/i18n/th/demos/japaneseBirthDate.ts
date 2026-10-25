import type ja from '../../ja/demos/japaneseBirthDate';

export default {
  label: 'วันเกิด',
  help: 'จำหน่ายเครื่องดื่มแอลกอฮอล์เฉพาะผู้ที่มีอายุ 20 ปีขึ้นไป',
  underage: 'ผู้ที่อายุต่ำกว่า 20 ปีไม่สามารถสมัครได้',
  comments: {
    age: 'ตรวจเงื่อนไขด้วยอายุเต็มปี (เพิ่มขึ้น 1 ในวันเกิด)',
  },
} satisfies typeof ja;
