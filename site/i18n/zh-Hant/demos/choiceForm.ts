import type ja from '../../ja/demos/choiceForm';

export default {
  open: '設定通知',
  title: '設定通知',
  channels: '通知方式',
  channelsHelp: '至少選擇一項',
  all: '全部',
  mail: '電子郵件',
  push: '推播通知',
  sms: '簡訊',
  frequency: '頻率',
  now: '立即',
  nowNote: '發生時當場逐則通知',
  daily: '每天一次',
  dailyNote: '早上 8 點彙整通知',
  theme: '郵件的外觀',
  light: '淺色',
  dark: '深色',
  auto: '跟隨裝置',
  rating: '這個畫面的易用程度',
  cancel: '取消',
  save: '儲存',
  comments: {
    group: '選項群組使用 Fieldset。legend 是群組的名稱，help 則成為群組的說明（I-09）',
    mixed: '只選取部分項目時為 indeterminate（朗讀為 mixed）',
  },
} satisfies typeof ja;
