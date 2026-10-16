import type ja from '../../ja/demos/kindConfirm';

export default {
  open: '초안 삭제',
  closedReason: '닫힌 이유: {0}',
  title: '초안을 삭제할까요?',
  description: '삭제하면 되돌릴 수 없습니다. 공동 편집자의 화면에서도 사라집니다.',
  cancel: '취소',
  confirm: '삭제하기',
  comments: {
    danger: '위치는 primary 그대로, 색만 danger로 한다(F-06)',
  },
} satisfies typeof ja;
