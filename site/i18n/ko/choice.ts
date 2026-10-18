import type ja from '../ja/choice';

export default {
  lead: 'Checkbox·RadioGroup·Segmented·Rating과, 이전부터 있던 Switch·Chips. 모두 안쪽은 네이티브 input이나 button이며, 그룹의 이름은 Modal.Fieldset의 legend가 갖는다.',
  gallery: {
    title: '견본',
    intro: '체크 표시와 선택된 구획은 테마의 강조색으로 채운다. 오른쪽 위의 테마를 바꾸면 함께 바뀐다.',
    items: {
      checkbox: '체크박스',
      mixed: '일부만 선택',
      radio: '라디오',
      segmented: '세그먼트',
      rating: '평점',
      switch: '스위치',
      chips: '칩',
    },
    samples: {
      terms: '이용약관에 동의합니다',
      termsNote: '동의하면 다음으로 진행할 수 있습니다',
      all: '모든 알림',
      allNote: '3개 중 1개 선택됨',
      planLabel: '요금제',
      planFree: '무료',
      planFreeNote: '3명까지',
      planTeam: '팀',
      planTeamNote: '20명까지, 월 1,200엔',
      viewLabel: '보기',
      viewList: '목록',
      viewGrid: '타일',
      viewMap: '지도',
      ratingLabel: '만족도',
      switchLabel: '이메일로 알림 받기',
      chipsLabel: '관심 분야',
      chipDesign: '디자인',
      chipA11y: '접근성',
      chipPerf: '성능',
    },
  },
  modal: {
    title: '모달 안에서',
    intro: '선택지 그룹은 Modal.Fieldset으로 감싼다. legend가 그룹의 이름이 되고, 도움말과 오류는 그룹의 설명이 된다.',
    exampleTitle: '알림 설정',
    exampleDescription: '“전체”는 일부만 선택하면 중간 상태 표시가 된다. 라디오와 세그먼트는 화살표 키로 선택할 수 있다.',
  },
  fieldset: {
    title: '그룹에는 Fieldset',
    callout:
      '입력란 하나는 `Modal.Field`의 `<label>`로, 선택지 그룹은 `Modal.Fieldset`의 `<legend>`로 이름을 붙인다. `<label>`로 그룹을 감싸면 안쪽 선택지의 레이블과 이름이 섞인다. 선택지의 보충 설명은 `<label>` 밖에 두고 `aria-describedby`로 연결한다. 안에 두면 보충 설명까지 이름으로 읽힌다(I-09).',
  },
  a11yCaption: '선택지가 충족하는 명세',
} satisfies typeof ja;
