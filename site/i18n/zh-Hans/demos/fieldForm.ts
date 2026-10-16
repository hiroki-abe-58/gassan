import type ja from '../../ja/demos/fieldForm';

export default {
  planFree: '免费版',
  planPro: '专业版（每月 980 日元）',
  emailError: '请输入包含 @ 的邮箱地址',
  open: '邀请成员',
  title: '邀请成员',
  alert: '请检查输入内容（{0} 项）',
  email: '邮箱地址',
  emailHelp: '将收到邀请邮件',
  plan: '套餐',
  seats: '席位数',
  seatsHelp: '{0} 个席位',
  cancel: '取消',
  submit: '邀请',
  comments: {
    summary: '提交失败的汇总集中在一处。焦点移到第一个出错的项目（B-09）',
    field: '一个输入对应一个 Modal.Field。由它负责标签、帮助文字、错误信息的关联（B-08）',
    group: '选项组不用 label，而用 fieldset / legend 命名',
    native: 'range 和 date 都不重新造，只把原生控件包起来',
  },
} satisfies typeof ja;
