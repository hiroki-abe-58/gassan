import type ja from '../../ja/demos/contextFiles';

export default {
  label: '파일',
  quote: '견적서.pdf',
  contract: '계약서.docx',
  minutes: '회의록.md',
  open: '열기',
  rename: '이름 바꾸기',
  duplicate: '복제',
  delete: '삭제',
  menuLabel: '{0}의 작업',
  moreLabel: '{0}의 다른 작업',
  chosen: '선택한 작업: {0}({1})',
  comments: {
    visible: '오른쪽 클릭은 키와 터치로는 찾기 어려우므로, 같은 작업을 “…” 메뉴에도 둔다',
  },
} satisfies typeof ja;
