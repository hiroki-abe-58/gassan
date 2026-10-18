import type ja from '../ja/textInput';

export default {
  lead: 'Input、PasswordInput、SearchInput、Textarea、NumberField、CodeInput。里面仍是原生的 input 和 textarea，gassan 只加上边框，以及原生所没有的几条小约定（切换显示、清除、字数、增减、逐位方框）。',
  gallery: {
    title: '示例',
    intro: '按状态排列的真实部件。在模态框之外也能使用同样的部件。切换右上角的主题，焦点环的颜色会随之改变。',
    items: {
      plain: '文本',
      adorned: '前后带单位',
      password: '密码',
      search: '搜索',
      textarea: '带字数统计',
      number: '数值步进器',
      code: '验证码',
      invalid: '错误',
      disabled: '不可用',
    },
    samples: {
      name: '李华',
      price: '1200',
      yen: '¥',
      perMonth: '日元 / 月',
      search: '查找部件',
      bio: '在模态框里写的自我介绍。',
      seats: '个席位',
      invalidValue: 'lihua@',
    },
  },
  modal: {
    title: '在模态框中',
    intro: '把 Modal.Field 的 render prop 传来的关联原样展开传入。',
    exampleTitle: '创建账户',
    exampleDescription: '可以试试密码的显示切换、字数统计、席位数的增减和验证码。输入 6 位验证码后，就直接处于可以注册的状态。',
  },
  adds: {
    title: 'gassan 加上的东西',
    tableCaption: '各文本输入部件的约定',
    head: { part: '部件', adds: '加上的东西' },
    rows: [
      { part: 'Modal.Input', adds: '边框与前后装饰（start / end）。ref 和 input 的属性原样传给 input' },
      { part: 'Modal.PasswordInput', adds: '切换显示。状态用 aria-pressed 传达，所以文案一条就够' },
      { part: 'Modal.SearchInput', adds: '只在有值时出现的“清除”按钮。清除后焦点回到输入框' },
      { part: 'Modal.Textarea', adds: '传入 maxLength 时显示“n / max”。作为说明读出，不会每次输入都打断。高度随内容增长' },
      { part: 'Modal.NumberField', adds: '− 和 +。到达范围端点时不可按，并按 step 的位数取整。失去焦点时如果超出范围，就回到端点' },
      { part: 'Modal.CodeInput', adds: '逐位方框。输入框仍然只有一个，所以短信自动填充和粘贴都有效。也接受全角数字' },
    ],
  },
  apiNote: 'PasswordInput 和 SearchInput 接受 ModalInputProps 去掉 type、start、end 后的属性，Textarea 原样接受 textarea 的属性。所有部件的 ref 都指向内部的元素。',
  a11yCaption: '文本输入满足的规范',
} satisfies typeof ja;
