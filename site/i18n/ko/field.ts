import type ja from '../ja/field';

export default {
  lead: 'Modal.Field는 입력란 하나에, Modal.Fieldset은 선택지 그룹에 이름·도움말·오류를 연결한다. 안쪽은 gassan의 입력 컴포넌트여도, 네이티브 input이어도, 다른 라이브러리의 컴포넌트여도 된다.',
  field: {
    title: '연결을 한 곳에',
    intro: 'render prop으로 id와 aria-*를 넘긴다. gassan의 입력 컴포넌트는 이것을 그대로 펼쳐서 받는다.',
    exampleTitle: '멤버 초대',
    exampleDescription: '빈 채로 “초대하기”를 누르면 요약이 한 곳에 나타나고, 포커스가 첫 번째 오류로 이동한다.',
  },
  parts: {
    title: 'gassan의 입력 컴포넌트',
    tableCaption: '입력 컴포넌트와 해당 페이지',
    head: { page: '페이지', parts: '컴포넌트' },
    body: [
      '어느 컴포넌트든 안쪽은 네이티브 요소이며, 테두리와 표시만 다시 그렸다. 키보드 조작·읽어 주기·폼 제출·스마트폰 전용 UI는 브라우저의 것이 그대로 동작한다. 네이티브로는 부족한 셀렉트·콤보박스·달력만 WAI-ARIA APG의 패턴대로 만들었다(I-01~I-15).',
      '여러 개를 고를 수 있는 콤보박스나 날짜 범위 선택은 아직 없다. 필요할 때는 다른 라이브러리의 컴포넌트를 똑같이 Modal.Field로 감싼다. 모달 안의 팝업은 패널의 `transform` 때문에 `position: fixed`가 깨지므로, popover API나 dialog 안으로의 포털을 쓴다(C-12). 최소 예제는 [docs/control-recipes.md](./docs/control-recipes.md)에 있다.',
    ],
  },
  errors: {
    title: '오류를 보여 주는 법',
    callout:
      '개별 오류에 `role="alert"`는 붙이지 않는다. 입력할 때마다 읽기가 끼어들면 오히려 입력할 수 없게 된다. 제출 시의 요약만 `Modal.Alert`에 두고, 포커스는 첫 번째 오류 항목으로 옮긴다(B-09).',
  },
  apiControl: 'render prop의 인수',
  apiAria: '입력 컴포넌트가 받는 연결(Field 밖에서 이름을 붙일 때)',
  a11yCaption: '폼 요소가 충족하는 명세',
} satisfies typeof ja;
