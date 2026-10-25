import type ja from '../../ja/demos/chartScatter';

export default {
  label: '기능별 이용률과 만족도',
  description: '이번 분기에 추가한 자동화는 아직 쓰는 사람이 적지만 만족도가 가장 높다. 알림은 많이 쓰이는데도 만족도가 낮다.',
  adoption: '이용률',
  satisfaction: '만족도(5점 만점)',
  users: '이용자 수',
  core: '기본 기능',
  added: '이번 분기에 추가한 기능',
  features: {
    search: '검색',
    sharing: '공유',
    export: '내보내기',
    notifications: '알림',
    permissions: '권한 설정',
    automation: '자동화',
    summary: 'AI 요약',
    integrations: '외부 연동',
  },
  comments: {
    size: 'sizeLabel을 넘기면 점의 size를 버블의 면적으로 그린다(버블 차트)',
  },
} satisfies typeof ja;
