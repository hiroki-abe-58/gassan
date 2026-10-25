import type ja from '../../ja/demos/chartGantt';

export default {
  label: '新帳單畫面的時程',
  description: '畫面設計持續到本週五的審查。API 的開發已經開始，發布則在 5 週後的週一。',
  design: '設計',
  build: '開發',
  qa: '測試與發布',
  requirements: '確定需求',
  screens: '設計畫面',
  review: '設計審查',
  api: '開發 API',
  frontend: '開發畫面',
  testing: '驗收測試',
  release: '發布',
  comments: {
    relative: '範例的日期從本週一起算（無論何時開啟，今天的線都會落在時程之中）',
  },
} satisfies typeof ja;
