import type ja from '../ja/media';

export default {
  lead: '이미지·동영상·오디오와, 그것을 옆으로 넘기는 갤러리. 비율을 먼저 확보해 흔들림을 없애고, 자동 재생은 하지 않는다. 갤러리의 실체는 scroll-snap이며, 버튼과 키는 위치를 지시할 뿐이다.',
  gallery: {
    title: '갤러리',
    intro: '이전·다음 버튼, 화살표 키, Home / End, 손가락 스크롤 중 무엇으로 움직여도 같은 위치를 가리킨다. 위치는 읽어 준다.',
    exampleTitle: '능선 습작',
    exampleDescription: '열면 ← →로 넘긴다. 제목의 “n / 5”는 onIndexChange로 갱신한다.',
  },
  media: {
    title: '미디어의 기본값',
    body: [
      '`ratio="16 / 9"`를 넘기면 불러오기 전부터 자리를 확보한다. 불러온 뒤 높이가 바뀌면 모달이 튀어 오르기 때문이다(B-10). 비율은 캡션을 포함하는 `figure`가 아니라 안쪽의 `img` / `video`에 적용한다(§10-7).',
      '동영상과 오디오는 `autoplay` 없음, `controls` 있음, `preload="metadata"`. 모달이 열린 순간 소리가 나는 경험은 “지금 이것에 집중해 달라”는 의도를 배신한다(B-11).',
    ],
    callout: '이미지에 `alt`를 넘기는 것을 잊으면 개발 중에 경고한다. 장식이라면 `alt=""`를 명시한다.',
  },
  notify: {
    title: '위치 알림',
    body: [
      '`onIndexChange`는 사용자에게 보이는 위치가 바뀌었을 때만 호출된다. 마운트만으로는 호출되지 않는다. `items`가 줄어 위치가 잘려 나갔을 때는 “바뀐” 것이므로 호출된다(D-14). `items[].id`가 중복되면 어느 값인지 명시해서 경고한다(D-13).',
    ],
  },
  a11yCaption: '미디어와 갤러리가 충족하는 명세',
} satisfies typeof ja;
