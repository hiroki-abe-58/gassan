import type ja from '../ja/fileDrop';

export default {
  lead: 'FileDrop은 파일을 놓는 드롭 영역. 안쪽은 네이티브 file input을 영역 전체로 펼친 것으로, 눌러도, Enter / Space로도, 드롭으로도 고를 수 있다.',
  gallery: {
    title: '견본',
    intro: '선택한 파일은 이름과 크기의 목록에 나타나며, 하나씩 제거할 수 있다.',
    items: {
      single: '하나만',
      multiple: '여러 개(이미지만)',
      disabled: '사용 불가',
    },
  },
  modal: {
    title: '모달 안에서',
    intro: '안쪽은 네이티브 input이므로, Modal.Field의 label이 그대로 이름이 된다.',
    exampleTitle: '서류 제출',
    exampleDescription: 'PDF와 이미지만 받는다. 다른 형식을 놓으면 오류로 알린다.',
  },
  reject: {
    title: '맞지 않는 파일',
    callout:
      '드롭된 파일은 네이티브 `accept`를 거치지 않는다. gassan은 같은 규칙(확장자·`image/*` 같은 와일드카드·타입)을 적용해, 벗어난 것을 `onReject`에 넘긴다. 알리는 방식은 `Modal.Field`의 `error`에 맡긴다(I-14).',
  },
  a11yCaption: '파일 드롭 영역이 충족하는 명세',
} satisfies typeof ja;
