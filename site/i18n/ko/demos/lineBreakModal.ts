import type ja from '../../ja/demos/lineBreakModal';

export default {
  toggle: '어절 단위로 줄바꿈',
  open: '좁은 모달 열기',
  title: '3분기 매장별 매출 보고서 공유하기',
  description: '공유하면 열람 권한이 있는 모든 멤버에게 알림이 전송됩니다.',
  tableLabel: '공유 대상',
  headTarget: '공유 대상',
  headRole: '권한',
  row1Target: '도호쿠 지역 매장 책임자',
  row1Role: '열람 및 댓글',
  row2Target: '경영기획부 멤버',
  row2Role: '열람만',
  draft: '초안으로 저장하기',
  share: '멤버에게 공유하고 알리기',
  comments: {
    mode: "lineBreak를 바꾸기만 하면 된다. 기본값은 'phrase'(문절)이므로 평소에는 아무것도 쓰지 않아도 된다",
  },
} satisfies typeof ja;
