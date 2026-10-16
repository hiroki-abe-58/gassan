import type ja from '../ja/field';

export default {
  lead: 'Modal.Field는 레이블·도움말·오류의 연결만 맡고, 안쪽의 입력 요소는 만들지 않는다. Chips·Switch·Table·Alert는 모달 안에서 자주 필요한데 연결을 틀리기 쉬운 컴포넌트만 갖춘다.',
  field: {
    title: '연결을 한 곳에',
    intro: 'render prop으로 id와 aria-*를 넘긴다. 안쪽은 네이티브 input이어도, 다른 라이브러리의 컴포넌트여도 된다.',
    exampleTitle: '멤버 초대',
    exampleDescription: '빈 채로 “초대하기”를 누르면 요약이 한 곳에 나타나고, 포커스가 첫 번째 오류로 이동한다.',
  },
  delegate: {
    title: '컨트롤은 직접 만들지 않는다',
    tableCaption: '입력 요소를 맡길 곳',
    head: { control: '요소', use: '어떻게 하나' },
    rows: [
      { control: 'range / date / time / file / select', use: '네이티브 input을 그대로 Modal.Field로 감싼다' },
      { control: '라디오·복수 체크', use: 'fieldset과 legend로 이름을 붙인다(label이 아니라)' },
      { control: '검색 가능한 셀렉트·콤보박스·손잡이가 2개인 슬라이더', use: 'Base UI 등의 전용 라이브러리에 맡긴다' },
    ],
    body: [
      '각각의 최소 예제는 [docs/control-recipes.md](./docs/control-recipes.md)에 있다. 모달 안의 팝업은 패널의 `transform` 때문에 `position: fixed`가 깨지므로, popover API나 dialog 안으로의 포털을 쓴다(C-12).',
    ],
  },
  errors: {
    title: '오류를 보여 주는 법',
    callout:
      '개별 오류에 `role="alert"`는 붙이지 않는다. 입력할 때마다 읽기가 끼어들면 오히려 입력할 수 없게 된다. 제출 시의 요약만 `Modal.Alert`에 두고, 포커스는 첫 번째 오류 항목으로 옮긴다(B-09).',
  },
  apiControl: 'render prop의 인수',
  a11yCaption: '폼 요소가 충족하는 명세',
} satisfies typeof ja;
