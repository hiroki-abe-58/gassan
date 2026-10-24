import type ja from '../../ja/demos/chartWidgets';

export default {
  sales: '销售额',
  thisMonth: '本月销售额',
  vsLastMonth: '较上月',
  daily: '最近 30 天的销售额',
  storage: '存储空间',
  storageUsed: '存储空间用量',
  gb: '{0} GB / {1} GB',
  plans: '各套餐的工作区',
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
  workspaces: '工作区',
  pages: '浏览最多的页面',
  comments: {
    dailyData: '最近 30 天的销售额（日元）',
    sparkline: '小型走势图既没有坐标轴，也不能操作。作为一张图来读，在名称后附上最小值、最大值和最新值',
    gauge: '接近上限，所以用警告色。数值也通过 aria-valuetext 读出',
  },
} satisfies typeof ja;
