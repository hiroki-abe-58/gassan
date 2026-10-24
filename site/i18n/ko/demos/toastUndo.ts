import type ja from '../../ja/demos/toastUndo';

export default {
  draftA: '분기 회고',
  draftB: '채용 페이지 문안',
  draftC: '릴리스 노트 v2.4',
  remove: '삭제',
  removeLabel: '{0} 삭제',
  removed: '“{0}” 초안을 삭제했습니다',
  undo: '실행 취소',
  empty: '초안이 없습니다',
  reset: '초안 되돌리기',
  comments: {
    undo: '되돌릴 수 있는 작업은 확인으로 멈추지 않고 바로 실행하며, 토스트에 “실행 취소”를 붙인다. 버튼이 있으면 10초',
  },
} satisfies typeof ja;
