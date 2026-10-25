import type ja from '../../ja/demos/chartWidgets';

export default {
  sales: '매출',
  thisMonth: '이번 달 매출',
  vsLastMonth: '지난달 대비',
  daily: '최근 30일 매출',
  storage: '스토리지',
  storageUsed: '스토리지 사용량',
  gb: '{0} GB / {1} GB',
  plans: '요금제별 워크스페이스',
  free: 'Free',
  pro: 'Pro',
  max: 'Max',
  enterprise: 'Enterprise',
  workspaces: '워크스페이스',
  pages: '많이 본 페이지',
  comments: {
    dailyData: '최근 30일의 매출(엔)',
    sparkline: '작은 추이는 축도 조작도 갖지 않는다. 이름에 최소·최대·최신 값을 곁들인 한 장의 그림으로 읽게 한다',
    gauge: '상한이 가까우므로 주의 색으로 한다. 값은 aria-valuetext로도 읽게 한다',
  },
} satisfies typeof ja;
