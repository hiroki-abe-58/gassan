import type ja from '../../ja/demos/chartScatter';

export default {
  label: '各功能的使用率與滿意度',
  description: '本季新增的自動化，使用者還不多，滿意度卻最高。通知雖然很常被使用，滿意度卻偏低。',
  adoption: '使用率',
  satisfaction: '滿意度（滿分 5 分）',
  users: '使用者人數',
  core: '基本功能',
  added: '本季新增的功能',
  features: {
    search: '搜尋',
    sharing: '共用',
    export: '匯出',
    notifications: '通知',
    permissions: '權限設定',
    automation: '自動化',
    summary: 'AI 摘要',
    integrations: '外部整合',
  },
  comments: {
    size: '傳入 sizeLabel 後，點的 size 會畫成泡泡的面積（泡泡圖）',
  },
} satisfies typeof ja;
