import type ja from '../../ja/demos/titleClamp';

export default {
  open: '긴 제목의 모달',
  title:
    '2026년도 3분기 도호쿠 지역 매장별 매출 보고서(속보치·전년 동기 대비·재고 회전율·인건비율 포함)의 공유 설정 변경',
  description: '넘칠 때만 “전체 보기”가 나타난다. hover·title 속성·길게 누르기에는 의존하지 않는다.',
  submit: '변경하기',
  comments: {
    clamp: '생략은 CSS의 line-clamp만으로. DOM의 텍스트는 항상 완전하므로 이름이 잘리지 않는다',
  },
} satisfies typeof ja;
