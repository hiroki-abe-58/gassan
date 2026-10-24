import type ja from '../../ja/demos/chartFeatures';

export default {
  label: '기능별 사용 횟수(10월)',
  dashboard: '대시보드',
  api: 'API 호출',
  reports: '보고서 내보내기',
  invites: '멤버 초대',
  invoices: '청구서 다운로드',
  uses: '횟수',
  comments: {
    layout: '항목 이름이 길 때는 가로 막대로 한다. 이름이 열에 다 들어가지 않으면 …로 자르고, 전체 이름은 점을 읽어 줄 때와 툴팁에 보여 준다',
  },
} satisfies typeof ja;
