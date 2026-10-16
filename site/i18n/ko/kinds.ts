import type ja from '../ja/kinds';

export default {
  lead: '만들기 전에, 지금부터 만들 것이 어느 것인지 하나를 고른다. 유형이 정해지면 스크림·배치·닫기 방식·푸터의 순서는 의사 결정 매트릭스에 따라 자동으로 정해진다.',
  kinds: {
    title: '5가지 유형',
    intro: '여러 유형에 해당한다면 그것은 나눠야 할 두 개의 모달이다.',
    tableCaption: '모달의 5가지 유형',
  },
  live: {
    title: '직접 움직여 보기',
    intro: '모두 실제 gassan이다. 닫히지 않는 설정의 유형에서 Esc나 배경을 누르면 패널이 흔들리고 이유를 읽어 준다.',
    confirm: {
      title: 'confirm — 확인',
      description: '작게, 가운데에. Esc로도 배경으로도 닫을 수 있다.',
    },
    form: {
      title: 'form — 입력',
      description: '배경 클릭으로는 닫히지 않는다. 작성 중이면 붙잡는다.',
    },
    view: {
      title: 'view — 보기',
      description: 'immersive 스크림의 라이트박스. 화살표 키로 넘길 수 있다.',
    },
    consent: {
      title: 'consent — 동의',
      description: '완독과 동의가 갖춰질 때까지 primary는 누를 수 없다. 누르면 이유가 돌아온다.',
    },
    flow: {
      title: 'flow — 플로',
      description: '뒤로·현재 위치·닫기의 3개 슬롯.',
    },
  },
  scrim: {
    title: '스크림',
    body: [
      '기본값은 검정 32%·blur 없음. 60~80%의 검정은 뒤의 맥락을 죽이고, 모달의 유일한 우위를 스스로 버린다. 의도별 4단계와 blur를 허용하는 조건은 [스크림](#/styles/scrim) 페이지에 정리했다.',
    ],
  },
  placement: {
    title: '배치',
    tableCaption: '배치의 조건',
    callout:
      '`placement="auto"`는 JS(matchMedia)로 `center` 또는 `sheet`로 결정한 뒤 DOM에 넘긴다. CSS 미디어 쿼리로 분기하면 배치별 `@starting-style`을 이중으로 갖게 되어, 반드시 한쪽이 썩는다.',
  },
  dismiss: {
    title: '닫기 방식의 허용 여부',
    intro: '○는 닫힘, ✕는 닫히지 않음, △는 조건부(저장하지 않은 내용의 확인을 거치는 등).',
    tableCaption: '유형별 닫기 방식',
    mockTitle: '이용약관 업데이트',
    mockNote: '이 대화 상자는 아직 닫을 수 없습니다',
    do: '닫히지 않는 설정이라도 Esc나 배경 클릭은 “닫고 싶다”는 명확한 의사 표시로 받아들인다. 패널을 흔들고 이유를 `role="status"`로 읽어 준다(L-10).',
    dont: '말없이 무시하지 않는다. 아무 일도 일어나지 않으면 사용자는 고장 났다고 판단한다.',
  },
  footer: {
    title: '푸터 버튼의 순서',
    intro: 'DOM 순서 = 시각 순서 = Tab 순서 = 읽기 순서. 좁은 화면에서도 뒤집지 않는다.',
    orderTitle: '글 게시하기',
    cancel: '취소',
    draft: '임시 저장',
    publish: '게시하기',
    orderDo: '좁은 폭에서는 DOM 순서 그대로 세로로 쌓는다. primary를 위에 두고 싶다면 CSS가 아니라 DOM 순서 자체를 바꾼다.',
    orderDont:
      '`column-reverse`나 `order`로 보이는 것만 바꾸지 않는다. Tab과 읽기 순서가 시각과 반대가 된다(WCAG 1.3.2 / 2.4.3).',
    dangerTitle: '프로젝트 삭제',
    dangerCancel: '취소',
    dangerDelete: '삭제하기',
    dangerDo: '파괴적인 작업은 위치는 평소의 primary 그대로, 색만 danger로 한다(F-06).',
    dangerDont: '색과 위치를 동시에 바꾸지 않는다. 근육 기억이 어긋나 오히려 오조작을 낳는다.',
  },
  gates: {
    title: '활성화 게이트 고르는 법',
    intro: '누를 수 없는 상태를 만들어도 되는 조건은 한정되어 있다. 시간으로 기다리게 하는 것과 스크롤 위치만으로 판정하는 것은 금지.',
    tableCaption: '게이트에 써도 되는 조건',
    more: '[활성화 게이트 사용법 →](#/components/gate)',
  },
} satisfies typeof ja;
