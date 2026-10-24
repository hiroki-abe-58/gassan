import type ja from '../../ja/demos/chartWidgets';

export default {
  sales: '營收',
  thisMonth: '本月營收',
  vsLastMonth: '較上月',
  daily: '最近 30 天的營收',
  storage: '儲存空間',
  storageUsed: '儲存空間用量',
  gb: '{0} GB / {1} GB',
  plans: '各方案的工作區',
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
  workspaces: '工作區',
  pages: '瀏覽次數最多的頁面',
  comments: {
    dailyData: '最近 30 天的營收（日圓）',
    sparkline: '小型走勢圖既沒有座標軸，也無法操作。作為一張圖來朗讀，在名稱後附上最小值、最大值與最新值',
    gauge: '接近上限，所以使用警告色。數值也透過 aria-valuetext 朗讀',
  },
} satisfies typeof ja;
