import type ja from '../../ja/demos/japaneseEmail';

export default {
  label: 'ที่อยู่อีเมล',
  hint: 'พิมพ์ “taro@gmial.com” แล้วออกจากช่อง จะมีคำแนะนำขึ้นมา อีเมลของผู้ให้บริการมือถือ เช่น “@docomo.ne.jp” จะมีคำเตือนเรื่องการตั้งค่าการรับอีเมล',
  comments: {
    sender: 'ผู้ส่งอีเมลยืนยัน (ใส่ไว้ในคำเตือนสำหรับอีเมลของผู้ให้บริการมือถือ)',
  },
} satisfies typeof ja;
