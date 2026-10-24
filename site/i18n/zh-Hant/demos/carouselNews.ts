import type ja from '../../ja/demos/carouselNews';

export default {
  label: '公告',
  dashboardTitle: '全新儀表板',
  dashboardBody: '營收、註冊數、使用率，一頁看完。可以用按鍵逐一瀏覽圖表的資料點，並朗讀數值。',
  dashboardAction: '前往查看',
  invoicesTitle: '批次下載帳單',
  invoicesBody: '把選取月份的帳單打包成一個 ZIP。交給財務只要一次。',
  invoicesAction: '查看使用方式',
  invitesTitle: '批次邀請成員',
  invitesBody: '只要貼上電子郵件地址。角色也能當場決定。',
  invitesAction: '邀請',
  comments: {
    autoplay: '每 6 秒切換一次。停止按鈕放在最前面，指標停在上方或焦點位於其中時也會暫停',
  },
} satisfies typeof ja;
