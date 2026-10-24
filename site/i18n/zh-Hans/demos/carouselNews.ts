import type ja from '../../ja/demos/carouselNews';

export default {
  label: '公告',
  dashboardTitle: '全新仪表盘',
  dashboardBody: '销售额、注册数、使用率，一屏看全。可以用按键逐个浏览图表的数据点，并播报数值。',
  dashboardAction: '去看看',
  invoicesTitle: '批量下载账单',
  invoicesBody: '把所选月份的账单打包成一个 ZIP。交给财务只需一次。',
  invoicesAction: '查看使用方法',
  invitesTitle: '批量邀请成员',
  invitesBody: '只需粘贴邮箱地址。角色也能当场设定。',
  invitesAction: '邀请',
  comments: {
    autoplay: '每 6 秒切换一次。停止按钮放在最前面，指针悬停在上面或焦点位于其中时也会暂停',
  },
} satisfies typeof ja;
