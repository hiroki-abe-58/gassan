import type ja from '../../ja/demos/floatingSignIn';

export default {
  account: '邮箱或手机号',
  accountError: '请输入邮箱地址或手机号',
  password: '密码',
  submit: '继续',
  comments: {
    floating: '用 labelPlacement="floating" 把标签放进输入框里。有焦点或有值时，标签缩小并退到左上角（I-24）',
    password: 'PasswordInput 也一样。标签不会延伸到切换显示的按钮上',
  },
} satisfies typeof ja;
