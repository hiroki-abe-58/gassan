import type ja from '../../ja/demos/fileForm';

export default {
  open: '서류 제출',
  title: '서류 제출',
  documents: '신분 확인 서류',
  documentsHelp: 'PDF 또는 이미지. 여러 개를 한꺼번에 선택할 수 있습니다',
  rejected: '받을 수 없는 형식: {0}',
  cancel: '취소',
  submit: '제출하기',
  comments: {
    reject: '드롭은 accept를 거치지 않으므로 gassan이 같은 규칙을 적용한다. 벗어난 것은 onReject로(I-14)',
  },
} satisfies typeof ja;
