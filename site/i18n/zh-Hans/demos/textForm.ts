import type ja from '../../ja/demos/textForm';

export default {
  open: '创建账户',
  title: '创建账户',
  name: '显示名称',
  password: '密码',
  passwordHelp: '至少 8 个字符',
  bio: '自我介绍',
  bioPlaceholder: '工作或感兴趣的事',
  seats: '席位数',
  seatsHelp: '之后可以增加',
  seatsUnit: '个席位',
  code: '验证码',
  codeHelp: '邮件中收到的 6 位数字',
  cancel: '取消',
  submit: '注册',
  comments: {
    password: '显示切换是 aria-pressed 的开关按钮。文案一条就够（I-04）',
    counter: '传入 maxLength 会显示“n / 140”，并作为说明关联起来（I-06）',
    code: '输入框只有一个。方框只是外观，所以短信自动填充和粘贴都有效（I-08）',
  },
} satisfies typeof ja;
