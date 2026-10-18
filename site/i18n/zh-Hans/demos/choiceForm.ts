import type ja from '../../ja/demos/choiceForm';

export default {
  open: '通知设置',
  title: '通知设置',
  channels: '通知方式',
  channelsHelp: '至少选择一项',
  all: '全部',
  mail: '邮件',
  push: '推送通知',
  sms: '短信',
  frequency: '频率',
  now: '立即',
  nowNote: '发生时逐条发送',
  daily: '每天一次',
  dailyNote: '早上 8 点汇总发送',
  theme: '邮件外观',
  light: '浅色',
  dark: '深色',
  auto: '跟随设备',
  rating: '这个界面的易用性',
  cancel: '取消',
  save: '保存',
  comments: {
    group: '选项组用 Fieldset。legend 是选项组的名称，help 成为选项组的说明（I-09）',
    mixed: '只选中一部分时为 indeterminate（读屏读作 mixed）',
  },
} satisfies typeof ja;
