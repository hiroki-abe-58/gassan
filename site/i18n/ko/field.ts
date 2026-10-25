import type ja from '../ja/field';

export default {
  lead: 'Modal.Field는 입력란 하나에, Modal.Fieldset은 선택지 그룹에 이름·도움말·오류를 연결한다. 안쪽은 gassan의 입력 컴포넌트여도, 네이티브 input이어도, 다른 라이브러리의 컴포넌트여도 된다.',
  field: {
    title: '연결을 한 곳에',
    intro: 'render prop으로 id와 aria-*를 넘긴다. gassan의 입력 컴포넌트는 이것을 그대로 펼쳐서 받는다.',
    exampleTitle: '멤버 초대',
    exampleDescription: '빈 채로 “초대하기”를 누르면 요약이 한 곳에 나타나고, 포커스가 첫 번째 오류로 이동한다.',
  },
  floating: {
    title: '플로팅 레이블',
    intro:
      'labelPlacement="floating"으로 레이블을 입력란의 테두리 안에 둔다. 포커스나 값이 있으면 레이블은 왼쪽 위로 줄어들며 비켜나고, 글자는 아래 줄에 들어간다. 레이블이 뜰지 가운데에 머물지는 입력란의 포커스와 값을 보고 CSS가 정하므로, 제어·비제어·초기값·폼 리셋·자동 완성·IME 조합 중 어느 경우에도 보이는 값과 어긋나지 않는다.',
    signInTitle: '로그인 입력란',
    signInDescription:
      '클릭이나 Tab으로 포커스가 가면 레이블이 왼쪽 위로 줄어들고, 커서가 그 아래에 나타난다. 빈 채로 포커스를 벗어나면 가운데로 돌아가고, 입력한 뒤에 벗어나면 뜬 채로 남는다. 아무것도 입력하지 않고 “계속”을 누르면 오류를 표시하고 입력란으로 돌아간다.',
    statesTitle: '초기값·오류·사용할 수 없는 입력란',
    statesDescription:
      '초기값이 있는 입력란은 첫 렌더링부터 뜬 모양으로 나타난다. 이메일 주소를 고치면 오류가 사라진다. “처음 값으로 되돌리기”는 폼의 reset이므로, 지운 입력란도 레이블과 함께 원래대로 돌아간다.',
    modalTitle: '모달 안',
    modalDescription: 'Modal.Field에도 같은 지정으로 넘길 수 있다.',
    notes: [
      '레이블은 진짜 `<label>` 그대로이며, 입력란의 이름은 언제나 레이블의 문구가 된다. 떠 있든 가운데에 있든 이름·설명(help와 error)·필수(`aria-required`)의 연결은 레이블을 위에 둘 때와 같고, 움직이는 도중에 읽어 주기가 끼어드는 일도 없다.',
      '겹칠 수 있는 것은 앞에 장식이 없는 `Input`과 `PasswordInput`이다(뒤쪽의 단위나 표시 전환은 괜찮다). 앞에 기호가 있는 `Input`이나 `Select` 등에 넘기면, 레이블을 위에 둔 모양으로 나온다. 플레이스홀더를 넘기면 레이블이 비켜나 있는 동안(포커스가 있고 비어 있을 때)만 보인다.',
      '움직이는 것은 레이블의 위치와 크기뿐이며, 시간은 `--g-dur-fast`이다(움직임 단계를 따르고, “동작 줄이기” 설정에서는 멈춘다). 글자가 지나쳤다가 되돌아오면 읽기 어려우므로, expressive 단계에서도 스프링을 쓰지 않는다.',
    ],
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
