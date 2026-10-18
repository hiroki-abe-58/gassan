import type ja from '../ja/textInput';

export default {
  lead: 'Input·PasswordInput·SearchInput·Textarea·NumberField·CodeInput. 안쪽은 네이티브 input과 textarea 그대로이며, gassan은 테두리와, 네이티브에 없는 작은 약속(표시 전환·지우기·글자 수·증감·자릿수 상자)만 더한다.',
  gallery: {
    title: '견본',
    intro: '상태별로 늘어놓은 실제 컴포넌트. 모달 밖에서도 같은 컴포넌트를 쓸 수 있다. 오른쪽 위의 테마를 바꾸면 포커스 링의 색이 바뀐다.',
    items: {
      plain: '텍스트',
      adorned: '앞뒤에 단위',
      password: '비밀번호',
      search: '검색',
      textarea: '글자 수 표시',
      number: '숫자 스테퍼',
      code: '인증 코드',
      invalid: '오류',
      disabled: '사용 불가',
    },
    samples: {
      name: '김하나',
      price: '1200',
      yen: '¥',
      perMonth: '엔 / 월',
      search: '컴포넌트 찾기',
      bio: '모달 안에서 쓰는 자기소개.',
      seats: '석',
      invalidValue: 'hana@',
    },
  },
  modal: {
    title: '모달 안에서',
    intro: 'Modal.Field의 render prop이 넘기는 연결을 그대로 펼쳐서 넘긴다.',
    exampleTitle: '계정 만들기',
    exampleDescription: '비밀번호 표시, 글자 수, 좌석 수 증감, 인증 코드를 시험해 볼 수 있다. 코드를 6자리 입력하면 바로 등록할 수 있는 상태가 된다.',
  },
  adds: {
    title: 'gassan이 더하는 것',
    tableCaption: '텍스트 입력 컴포넌트별 약속',
    head: { part: '컴포넌트', adds: '더하는 것' },
    rows: [
      { part: 'Modal.Input', adds: '테두리와 앞뒤 장식(start / end). ref와 input의 속성은 그대로 input에 전달된다' },
      { part: 'Modal.PasswordInput', adds: '표시 전환. 상태는 aria-pressed로 전달하므로 문구는 하나로 충분하다' },
      { part: 'Modal.SearchInput', adds: '값이 있을 때만 나타나는 “지우기” 버튼. 지운 뒤에는 입력란으로 포커스를 되돌린다' },
      { part: 'Modal.Textarea', adds: 'maxLength를 넘겼을 때의 “n / max”. 설명으로 읽히게 하고, 입력할 때마다 끼어들게 하지는 않는다. 높이는 내용에 맞춰 늘어난다' },
      { part: 'Modal.NumberField', adds: '−와 +. 범위의 끝에서는 누를 수 없게 되고, step의 자릿수로 반올림한다. 포커스가 벗어날 때 범위 밖이면 끝 값으로 되돌린다' },
      { part: 'Modal.CodeInput', adds: '자릿수 상자. 입력란은 하나 그대로이므로 SMS 자동 입력과 붙여넣기가 동작한다. 전각 숫자도 받는다' },
    ],
  },
  apiNote: 'PasswordInput과 SearchInput은 ModalInputProps에서 type·start·end를 뺀 것, Textarea는 textarea의 속성을 그대로 받는다. 모두 ref는 안쪽 요소에 전달된다.',
  a11yCaption: '텍스트 입력이 충족하는 명세',
} satisfies typeof ja;
