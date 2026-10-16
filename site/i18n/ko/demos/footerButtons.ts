import type ja from '../../ja/demos/footerButtons';

export default {
  open: '게시 설정',
  title: '글 게시하기',
  description: '“게시하기”를 연타해도 처리가 끝날 때까지 두 번째는 실행되지 않는다(F-08). 지금까지의 전송 횟수: {0}',
  note: '게시 후에도 편집할 수 있습니다',
  cancel: '취소',
  saveDraft: '임시 저장',
  publish: '게시하기',
  comments: {
    order: 'DOM 순서 = 시각 순서 = Tab 순서. 약한 순서로 쓴다. 첫 tertiary만 왼쪽으로 떨어진다(F-02 / F-03)',
  },
} satisfies typeof ja;
