import type ja from '../ja/select';

export default {
  lead: 'Select는 목록까지 gassan이 그리는 드롭다운, Combobox는 입력해서 좁혀 가는 드롭다운. 목록은 popover로 top layer에 나타나므로, 모달의 transform에도 본문의 스크롤에도 잘리지 않는다.',
  gallery: {
    title: '견본',
    intro: '화살표는 테두리 여백의 안쪽에 둔다. 네이티브 select는 padding을 붙여도 화살표를 오른쪽 끝에 붙여서 그린다.',
    items: {
      select: '셀렉트',
      placeholder: '미선택',
      combobox: '콤보박스',
      invalid: '오류',
      disabled: '사용 불가',
    },
    samples: {
      sizeLabel: '크기',
      sizeS: '소(360px)',
      sizeM: '중(520px)',
      sizeL: '대(720px)',
      cityLabel: '도시',
      citySapporo: '삿포로',
      cityTokyo: '도쿄',
      cityNagoya: '나고야',
      cityOsaka: '오사카',
      cityFukuoka: '후쿠오카',
    },
  },
  modal: {
    title: '모달 안에서',
    intro: '목록이 열려 있을 때의 Esc는 목록만 닫고, 모달은 닫지 않는다.',
    exampleTitle: '배송지 선택',
    exampleDescription: '국가는 입력해서 좁혀 갈 수 있다. 대소문자나 전각·반각의 차이는 무시하고 찾는다.',
  },
  keys: {
    title: '키 조작',
    tableCaption: 'Select와 Combobox의 키 조작',
    head: { key: '키', select: 'Select', combobox: 'Combobox' },
    rows: [
      { key: '↓ / ↑', select: '연다. 열려 있으면 이전·다음으로', combobox: '연다. 열려 있으면 이전·다음으로' },
      { key: 'Home / End', select: '첫 번째·마지막 선택지로', combobox: '입력란의 맨 앞·맨 끝으로(네이티브 그대로)' },
      { key: '문자 키', select: '그 문자로 시작하는 선택지로 이동한다', combobox: '좁혀 가며 첫 번째 후보를 가리킨다' },
      { key: 'Enter', select: '확정하고 닫는다', combobox: '가리키는 후보로 확정한다(조합 중에는 확정하지 않는다)' },
      { key: 'Space', select: '확정하고 닫는다(문자 입력으로 찾는 도중에는 문자로 다룬다)', combobox: '공백을 입력한다' },
      { key: 'Tab', select: '가리키는 선택지로 확정하고 다음으로 이동한다', combobox: '정확히 일치하면 확정하고, 없으면 원래대로 되돌린 뒤 다음으로 이동한다' },
      { key: 'Esc', select: '목록만 닫는다', combobox: '목록만 닫는다' },
    ],
  },
  a11yCaption: '셀렉트와 콤보박스가 충족하는 명세',
} satisfies typeof ja;
