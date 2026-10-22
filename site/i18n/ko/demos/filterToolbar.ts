import type ja from '../../ja/demos/filterToolbar';

export default {
  refresh: '새로 고침',
  refreshHint: '목록 다시 불러오기(마지막 업데이트는 3분 전)',
  refreshed: '목록을 다시 불러왔습니다',
  share: '공유',
  filter: '필터',
  filterCount: '필터({0})',
  filterTitle: '표시 필터',
  unreadOnly: '읽지 않은 것만',
  assignedToMe: '내 담당만',
  sortLabel: '정렬',
  newest: '최신순',
  oldest: '오래된순',
  more: '다른 작업',
  exportCsv: 'CSV로 내보내기',
  print: '인쇄',
  viewGroup: '표시 밀도',
  compact: '촘촘하게 보기',
  comfortable: '여유 있게 보기',
  archiveAll: '모두 보관',
  chose: '“{0}”을(를) 선택했습니다',
  comments: {
    glyph: '20×20 선화 아이콘. 장식이므로 aria-hidden',
    tooltip: '보충 설명이 이름과 같으면, 설명으로 두 번 읽게 하지 않는다(“공유”)',
    menu: '단축키는 표시만 한다. 키 할당은 사용하는 쪽이 맡는다',
  },
} satisfies typeof ja;
