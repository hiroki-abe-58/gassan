import type ja from '../ja/home';

export default {
  eyebrow: 'React 모달 셸',
  heroTitle: ['레이어 1은', '브라우저에 맡긴다.'],
  lead: 'gassan은 네이티브 `<dialog>`를 토대로 한 React 모달 셸이다. 포커스 트랩도 Esc도 배경의 inert 처리도 한 줄도 구현하지 않았다. 그 대신 기존 라이브러리가 거의 손대지 않은 레이어, 즉 정보 구조·활성화 게이트·닫기 이유에 모든 힘을 쏟는다.',
  start: '시작하기',
  philosophy: '설계 철학 읽기',
  stats: {
    items: '열거한 동작',
    tests: '자동 테스트',
    proven: '테스트로 증명된 동작',
    trap: '자체 포커스 트랩',
  },
  languages: {
    title: '일본어·중국어·한국어 화면을 위해',
    intro:
      '좁은 화면에서 「プロフィールを編｜集」「保存更改并关｜闭」처럼 쪼개지는 버튼은 더 이상 내놓지 않는다. 오른쪽 위의 “테마”로 색을 바꿔도 글자는 계속 읽힌다.',
    browserNote: '단어 중간에서 줄바꿈된다',
    phraseNote: '단어와 문절 경계에서 줄바꿈된다',
    details: {
      lineBreak: {
        title: '줄바꿈',
        body: '버튼·제목·표의 셀·차트 요약까지, 일본어는 문절, 중국어는 단어, 한국어는 공백 경계에서만 줄을 바꾼다. 태국어와 영어에는 손대지 않는다. 읽어 주는 이름과 복사되는 문자열은 바꾸지 않는다.',
      },
      theme: {
        title: '테마',
        body: (presets: number): string =>
          `라이트와 다크, ${String(presets)}개의 프리셋과 원하는 색. 어떤 색을 골라도 글자와 채우기가 WCAG 기준을 충족하도록 색을 도출한다.`,
      },
      button: {
        title: '버튼의 종류와 상태',
        body: 'primary·secondary·tertiary와 danger. 누를 수 있음·처리 중·게이트 적용 중·사용 불가를 색에만 의존하지 않고 모양으로 구별할 수 있다.',
      },
    },
  },
  promises: {
    title: '다른 라이브러리가 풀지 못한 4가지',
    intro: '레이어 1(top layer·포커스·Esc)은 브라우저가 이미 해결했다. gassan이 시간을 쓰는 것은 그 위의 설계 작업이다.',
    gate: {
      title: '활성화 게이트',
      body: '“끝까지 읽으면”, “체크하면” 누를 수 있는 버튼을 disabled 없이 만든다. 누르면 무엇이 부족한지 읽어 주고 그곳으로 데려간다.',
      mockTitle: '이용약관 업데이트',
      mockButton: '동의하고 계속하기',
      mockNote: '본문을 끝까지 읽어 주세요',
    },
    clamp: {
      title: '제목 생략',
      body: 'DOM의 문자열을 자르지 않고 CSS의 line-clamp만으로 생략한다. 읽어 주는 이름은 항상 완전하다. 넘칠 때만 “전체 보기”가 나타난다.',
      mockTitle: '2026년도 3분기 도호쿠 지역 매장별 매출 보고서의 공유 설정 변경',
      mockToggle: '전체 보기',
    },
    reasons: {
      title: '닫기 이유',
      body: 'Esc·배경·×·제출·스와이프·뒤로 가기·페이지 이동·외부의 close(). 8가지를 구별하고, 거부할 때도 침묵하지 않는다.',
    },
    scrim: {
      title: '스크림 토큰',
      body: '검정 60% 고정값을 버리고 의도별 4단계로 나눈다. 기본값은 32%·blur 없음. 모달의 유일한 강점인 “맥락”을 지우지 않는다.',
    },
  },
  kinds: {
    title: '5가지 유형 중에서 고른다',
    intro:
      'kind를 하나 정하면 스크림의 농도, Esc와 배경 클릭으로 닫을 수 있는지, 배치의 기본값이 정해진다. 여러 유형에 해당한다면 그것은 나눠야 할 두 개의 모달이다. 버튼을 누르면 실제 모달이 열린다.',
    items: {
      confirm: { label: '확인', use: '되돌릴 수 없는 작업의 확인' },
      form: { label: '입력', use: '맥락을 유지한 채 하는 부차적인 입력' },
      view: { label: '보기', use: '상세·미디어 확대' },
      consent: { label: '동의', use: '약관·권한에 대한 명시적 동의' },
      flow: { label: '플로', use: '여러 단계의 절차' },
    },
    scrim: '스크림',
    esc: 'Esc',
    backdrop: '배경',
    closes: '닫힘',
    stays: '닫히지 않음',
    more: '유형 선택 방법과 의사 결정 매트릭스 →',
  },
  verified: {
    title: '주장이 아니라 검사 결과로',
    intro: (items: number): string =>
      `명세서의 ${String(items)}개 항목은 하나도 빠짐없이 테스트 이름·CSS·로드맵 중 하나와 연결되어 있다. 존재하지 않는 테스트 이름을 근거로 쓰면 CI가 실패한다.`,
    count: (count: number): string => `${String(count)}개 항목`,
    bar: (parts: readonly string[]): string => parts.join(', '),
    spec: (items: number): string => `${String(items)}개 항목의 동작 명세 보기`,
    verification: '무엇을 검증했고 무엇을 검증하지 않았는가 →',
  },
  install: {
    title: '설치하기',
    caption: '설치',
    more: '최소 예제와 브라우저 요구 사항 →',
  },
} satisfies typeof ja;
