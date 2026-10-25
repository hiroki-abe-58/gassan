import type ja from '../../ja/demos/chartGantt';

export default {
  label: '새 청구 화면 일정',
  description: '화면 설계는 이번 주 금요일 리뷰까지. API 구현이 시작되었고, 릴리스는 5주 뒤 월요일.',
  design: '설계',
  build: '구현',
  qa: '테스트와 릴리스',
  requirements: '요구 사항 정의',
  screens: '화면 설계',
  review: '설계 리뷰',
  api: 'API 개발',
  frontend: '화면 개발',
  testing: '인수 테스트',
  release: '릴리스',
  comments: {
    relative: '견본의 날짜는 이번 주 월요일부터 센다(언제 열어도 오늘을 나타내는 선이 일정 안에 들어오도록)',
  },
} satisfies typeof ja;
