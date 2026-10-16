import type ja from '../../ja/demos/fieldForm';

export default {
  planFree: '免費版',
  planPro: '專業版（每月 980 日圓）',
  emailError: '請輸入包含 @ 的電子郵件地址',
  open: '邀請成員',
  title: '邀請成員',
  alert: '請確認輸入內容（{0} 項）',
  email: '電子郵件地址',
  emailHelp: '將寄送邀請信給對方',
  plan: '方案',
  seats: '席位數',
  seatsHelp: '{0} 個席位',
  cancel: '取消',
  submit: '邀請',
  comments: {
    summary: '送出失敗的摘要集中在一處。焦點移到第一個錯誤欄位（B-09）',
    field: '單一輸入使用 Modal.Field。由它負責標籤、說明文字與錯誤的關聯（B-08）',
    group: '選項群組不用 label，而用 fieldset / legend 命名',
    native: 'range 與 date 都不重新製作，只包住原生元件',
  },
} satisfies typeof ja;
