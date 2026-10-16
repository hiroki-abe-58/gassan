# gassan

[English](./README.md) · [日本語](./README_ja.md) · [简体中文](./README_zh.md) · [繁體中文](./README_zh-Hant.md) · **한국어** · [ไทย](./README_th.md)

네이티브 `<dialog>`를 토대로 한 React용 모달 셸.
포커스 트랩, Esc, 배경의 inert 처리, top layer는 **여기서 한 줄도 구현하지 않았다**. 브라우저가 처리한다.

그 대신 gassan은 기존 라이브러리가 거의 손대지 않은 층에 집중한다.

- **활성화 게이트** — "끝까지 읽으면", "체크하면" 누를 수 있게 되는 버튼을 `disabled` 없이 만든다
- **제목 말줄임** — DOM의 텍스트를 자르지 않고 말줄임하므로, 접근 가능한 이름(accessible name)은 언제나 온전하게 남는다
- **닫기 사유** — 8종류의 `CloseReason`을 구별하고, 닫기를 거부할 때는 반드시 사유를 돌려준다
- **스크림** — 하드코딩된 60% 검정을 버리고, 의도별 4단계 토큰을 쓴다
- **일본어·중국어·한국어 줄바꿈** — 버튼, 제목, 표의 셀, 차트 요약 어디에서든 단어 중간에서 줄을 바꾸지 않는다. 일본어는 문절 경계(「プロフィールを｜編集」이지, 「プロフィールを編｜集」이 아니다), 중국어는 단어 경계, 한국어는 공백에서만 끊는다. 태국어와 영어는 브라우저가 이미 올바르게 끊으므로 브라우저에 맡긴다

**문서 사이트: <https://hiroki-abe-58.github.io/gassan/#/ko>**
— 설계 원칙(모달이 존재하는 이유, 4층 모델, 5가지 유형, 접근성), 스타일(스크림, 색과 대비, 테마, 크기, 줄바꿈, 모션),
모든 컴포넌트의 라이브 데모와 API, 그리고 141개 동작의 사양을 Material Design 3 가이드라인처럼 정리했다.
사이트는 한국어, [English](https://hiroki-abe-58.github.io/gassan/#/en), [日本語](https://hiroki-abe-58.github.io/gassan/), [简体中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hans), [繁體中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hant), [ไทย](https://hiroki-abe-58.github.io/gassan/#/th)로 읽을 수 있다(상단 바의 지구본 버튼으로 전환한다).
라이트 / 다크 테마와 기본 색상(primary color)을 고를 수 있고, 어떤 색을 고르든 글자와 채움 색이 WCAG 대비율을 충족하도록 도출된다.
사이트의 모든 표, 개수, API 설명은 빌드 시 사양서와 타입 정의에서 생성되며, 손으로 쓴 숫자는 하나도 없다.

전체 설계는 [`modal.skill.md`](./modal.skill.md)(141개 항목의 동작 표, 의사결정 매트릭스, 품질 루브릭)에 있다.
AI 어시스턴트와 함께 코딩할 때는 이 파일을 컨텍스트에 넣는다.

| 문서 | 내용 |
|---|---|
| [`docs/traceability.md`](./docs/traceability.md) | `modal.skill.md`의 141개 동작 각각을 그것을 충족하는 테스트와 CSS에 대응시킨 표. `npm run check:trace`가 기계적으로 검증한다 |
| [`docs/requirements-audit.md`](./docs/requirements-audit.md) | 원래 요구 사항을 분해해 한 줄씩 정리한 표: 구현됨 / 조합으로 달성 / 로드맵에 있음 |
| [`docs/control-recipes.md`](./docs/control-recipes.md) | range / checkbox / radio / toggle / select / text / file / date / time / chips를 모달 안에 넣는 최소 예제 |
| [`docs/library-landscape.md`](./docs/library-landscape.md) | 네이티브 `<dialog>` vs Base UI vs React Aria vs Radix(2026-09-29 기준, 1차 자료만 사용) |

사양서(`modal.skill.md`)와 `docs/`의 파일은 일본어로 작성되어 있다.
문서 사이트는 설명을 6개 언어 모두로 번역했고, 사양서에서 인용한 부분(동작의 이름과 요약, 구현 노트, API 설명)은 원문인 일본어 그대로 보여 준다.

---

## 설치

npm에 [`@genelab/gassan`](https://www.npmjs.com/package/@genelab/gassan)으로 공개되어 있다.

```bash
npm install @genelab/gassan
```

```tsx
import { Modal } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
```

peer dependency는 React 18.2 이상이다(19에서도 동작한다). 번들에 이미 `"use client"`가 붙어 있으므로 Next.js App Router에서 그대로 import할 수 있다.

내장 문자열(스크린 리더 안내, 버튼 레이블)의 기본값은 일본어다.
영어로 하려면 앱을 `<GassanProvider labels={englishLabels}>`로 감싼다. 둘 다 패키지에서 export된다.
그 밖의 언어는 `labels`에 직접 만든 문자열을 넘긴다(일부만 지정해도 된다). 문서 사이트의 중국어·한국어·태국어 문자열
([`site/i18n/<lang>/`](https://github.com/hiroki-abe-58/gassan/tree/main/site/i18n) 아래의 `gassan.ts`)을 출발점으로 쓸 수 있다.

---

## 최소 예제

```tsx
function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>열기</button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>프로필 편집</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="표시 이름" required>
            {(control) => <input {...control} type="text" />}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">취소</Modal.Button>
          <Modal.Button variant="primary" onAction={save}>저장</Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
```

**모달은 항상 마운트해 둔다.** `{open && <Modal.Root .../>}`처럼 쓰지 않는다.
조건부로 마운트하면 닫히는 애니메이션을 아예 그릴 수 없다.

---

## 다섯 가지 유형

`kind`를 고르면 스크림, 닫기 방식, 배치의 기본값이 정해진다. 어떤 모달이 둘 이상의 유형에 해당한다면, 그것은 사실 나눠야 할 두 개의 모달이다.

| kind | 용도 | 스크림 | Esc | 배경 클릭 |
|---|---|---|:-:|:-:|
| `confirm` | 되돌릴 수 없는 작업의 확인 | default | ○ | ○ |
| `form` | 입력 | default | ○ | **×** |
| `view` | 열람, 확대 | default | ○ | ○ |
| `consent` | 동의, 필수 확인 | strong | **×** | **×** |
| `flow` | 여러 단계 | default | ○ | **×** |

닫기를 허용하지 않을 때도 그 시도를 조용히 무시하지 않는다. 패널이 흔들리고 사유를 읽어 준다.

---

## 활성화 게이트

gassan이 다른 라이브러리와 가장 크게 다른 부분이다.

```tsx
<Modal.Body readGate="read">
  {/* 긴 이용 약관 */}
  <Modal.Consent gate="terms">약관에 동의합니다</Modal.Consent>
  <Modal.GateStatus />
</Modal.Body>

<Modal.Footer>
  <Modal.Button variant="primary" gate>동의하고 계속하기</Modal.Button>
</Modal.Footer>
```

**`disabled`는 쓰지 않는다.** 대신 버튼에 `aria-disabled`를 쓴다.
`disabled` 버튼은 포커스를 받을 수 없으므로, 왜 누를 수 없는지 사용자가 알아낼 유일한 방법을 빼앗는다.
버튼이 눌리면 gassan은 사유를 읽어 주고, 사용자가 막혀 있는 곳으로 포커스를 옮긴다.

**"끝까지 읽었다"는 논리합(OR)으로 판정한다.**

1. 콘텐츠 끝의 센티널이 화면에 보였다(마우스, 터치)
2. 콘텐츠 끝 마커에 포커스가 도달했다(키보드, 스크린 리더)
3. 콘텐츠가 처음부터 스크롤이 필요 없었다

스크롤 위치만으로 판정하면 가상 커서로 읽는 사람이 갇힌다. 이들은 scroll 이벤트를 발생시키지 않으므로 버튼을 영영 누를 수 없다.

그 밖의 조건은 `Modal.Gate`로 등록할 수 있다.

```tsx
<Modal.Gate
  name="min-3"
  satisfied={selected.length >= 3}
  reason="세 개 이상 고르세요"
  focus={() => listRef.current?.focus()}
/>
```

**게이트는 등록이 끝날 때까지 닫혀 있다.**

게이트는 자식의 effect에서 등록된다. effect는 서버에서 실행되지 않고, 클라이언트에서도 첫 렌더 동안에는 아직 실행되지 않은 상태다.
그 사이 레지스트리는 비어 있지만, 이는 "조건이 없다"가 아니라 "아직 모른다"는 뜻이다.
`gate`가 붙은 버튼은 서버 마크업에서도 `aria-disabled="true"`로 렌더링되고,
마운트 후에 실제 조건으로 바뀐다. 게이트가 하나도 없으면 그 시점에 누를 수 있게 된다.

| 문법 | 등록 전 | 의미 |
|---|---|---|
| `gate` / `gate={true}` | 닫힘 | 확인할 조건의 집합이 아직 확정되지 않았다 |
| `gate={['terms']}` | 닫힘 | 등록되지 않은 이름은 충족되지 않은 것으로 취급한다 |
| `gate={[]}` | 열림 | 조건이 0개임이 확정되어 있다. 기다릴 것이 없다 |

서버 마크업과 클라이언트의 첫 렌더가 일치하므로 hydration 불일치가 일어나지 않는다.
사유 텍스트는 `GassanProvider`의 `unresolvedReason`으로 바꿀 수 있다.

---

## 줄바꿈(일본어, 중국어, 한국어)

브라우저에 맡기면 일본어는 아무 두 글자 사이에서나 줄이 바뀌어, 좁은 버튼이 「プロフィールを編｜集」처럼 된다.
중국어(「编辑个人资｜料」)와 한국어(「프로필 편｜집」)도 같은 식으로 단어 중간에서 끊긴다.
gassan은 단어 안에서 절대 줄을 바꾸지 않는다. 제목, 설명, 버튼, 필드 레이블, 표의 셀, 차트 요약 등 컴포넌트가 텍스트를 그리는 모든 곳에서 그렇다.

| 언어 | 브라우저에 맡기면 | gassan |
|---|---|---|
| 일본어 | 아무 두 글자 사이에서나 끊긴다 | 문절 경계에서만 끊는다: 「プロフィールを｜編集」 |
| 중국어(간체, 번체) | 단어 안에서 끊긴다: 「编辑个人资｜料」 | 단어 경계에서만 끊는다: 「编辑个人｜资料」 |
| 한국어 | 단어 안에서 끊긴다: 「프로필 편｜집」 | 공백에서만 끊는다: 「프로필｜편집」 |
| 태국어, 라오어, 크메르어, 버마어 | 사전으로 단어 경계를 찾는다(이미 올바르다) | 손대지 않는다 |
| 영어 등 공백으로 단어를 나누는 언어 | 공백에서 끊긴다(이미 올바르다) | 손대지 않는다 |

규칙은 언어별로 Chrome이 좁은 상자에서 실제로 줄을 바꾸는 위치를 측정해서 정했다.
태국어와 그 주변 언어에 손대지 않는 것은 의도적이다. 여기에 `word-break: keep-all`을 적용하면 브라우저 자체의 사전 기반 줄바꿈이 억제되어, 오히려 단어 안에서 끊기게 된다.

```tsx
// gassan 컴포넌트 안에서는 기본으로 켜져 있다. 직접 만든 UI에는 Phrase를 쓴다
const edit = (
  <button type="button">
    <Phrase>プロフィールを編集</Phrase>
  </button>
);

// 줄바꿈을 브라우저에 맡긴다(기본값은 'phrase')
const plain = <GassanProvider lineBreak="browser">{edit}</GassanProvider>;
```

- 언어는 문자열에 든 글자로 정한다. 가나가 있으면 일본어, 한글이 있으면 한국어, 둘 다 없이 한자가 있으면 중국어다. `lang` 속성이 없어도 결과는 달라지지 않는다.
- 경계는 `Intl.Segmenter`와 문자 종류 규칙으로 정하고(추가 의존성 없음), `<wbr aria-hidden="true">`로 표시한다. 텍스트에는 `word-break: keep-all`을 적용하며, 상자보다 긴 문절도 넘치지 않고 줄이 바뀐다. 한국어는 표시가 필요 없다. `keep-all`만으로 공백에서만 끊긴다.
- 텍스트에 아무것도 더하지 않으므로 접근 가능한 이름, 복사한 텍스트, 검색은 그대로다. Chrome에서 그냥 `<wbr>`을 쓰면 접근 가능한 이름에 공백이 끼어드는데, `aria-hidden`이 이를 막는다.
- 서버와 클라이언트에서 같은 마크업이 만들어진다.

---

## 컴포넌트

| 이름 | 역할 |
|---|---|
| `Modal.Root` | 1~3층: `<dialog>` / 스크림 / 패널 / 라이브 리전 |
| `Modal.Header` `Modal.Controls` | 헤더와 그 안의 세 슬롯(1fr auto 1fr) |
| `Modal.Back` `Modal.Close` `Modal.Indicator` | 뒤로 / 닫기 / 현재 단계 |
| `Modal.Title` `Modal.Description` | 이름과 설명(aria에 자동 연결) |
| `Modal.Body` `Modal.Section` | 유일한 스크롤 영역과 그 하위 섹션 |
| `Modal.Footer` `Modal.Button` | 버튼 위계, 게이트, 중복 제출 방지 |
| `Modal.Gate` `Modal.Consent` `Modal.GateStatus` | 활성화 게이트 |
| `Modal.Media` `Modal.Gallery` | 이미지, 동영상, 오디오, 슬라이더 |
| `Modal.Field` `Modal.Chips` `Modal.Switch` `Modal.Table` `Modal.Alert` | 폼 부품과 표 |
| `Modal.Chart` | 차트를 담는 컨테이너. 이름(`label`)과 추세의 텍스트 대체(`summary`)를 연결하고, 원본 데이터를 `<details>`로 보여 준다. 직접 그리지는 않는다 |
| `Modal.Handle` | 시트의 손잡이. 디텐트가 있으면 `role="slider"` 컨트롤, 없으면 장식용으로 잡는 영역 |
| `ModalHost` `useModals` | 명령형 API(`await confirm()`) |
| `GassanProvider` | UI 문자열 교체(기본은 일본어, `englishLabels` 동봉)와 줄바꿈 전환(`lineBreak`) |
| `Phrase` `splitPhrases` | 직접 만든 UI의 일본어·중국어·한국어 텍스트에도 같은 줄바꿈을 적용(gassan 컴포넌트 안에서는 기본으로 켜져 있다) |

`Modal.Field`는 render prop이므로 안에 넣는 컨트롤은 네이티브 입력이든 Base UI 컴포넌트든 상관없다.
선택지 그룹(라디오, 여러 체크박스)은 `label`이 아니라 `fieldset` / `legend`로 이름을 붙인다.
**컨트롤을 직접 만들지 않는다.** 네이티브 range / date / time / file / select를 먼저 쓰고,
검색 가능한 셀렉트나 손잡이가 두 개인 슬라이더는 Base UI에 맡긴다. 예제는 [`docs/control-recipes.md`](./docs/control-recipes.md)에 있다.

```tsx
<Modal.Chart
  label="월별 매출(천 달러)"
  summary="3월에 120으로 최고치를 찍었다. 4월 이후로는 100 안팎에서 횡보한다."
  data={<Modal.Table label="원본 데이터"><table>{/* … */}</table></Modal.Table>}
>
  <MyBarChart />  {/* SVG / canvas / 어떤 라이브러리든 된다. 기본적으로 aria-hidden */}
</Modal.Chart>
```

---

## `data-*` 전달

모든 컴포넌트는 `data-*`를 호스트 요소에 그대로 전달하므로 E2E 셀렉터로 쓸 수 있다.

```tsx
<Modal.Root data-testid="confirm" open={open} onOpenChange={setOpen}>
  <Modal.Footer>
    <Modal.Button variant="primary" data-testid="confirm-ok">OK</Modal.Button>
  </Modal.Footer>
</Modal.Root>
```

전달되지 않는 것은 두 가지뿐이고, 둘 다 **조용히 버려지지 않는다. 둘 다 개발 시 경고를 낸다**.

| 넘긴 것 | 결과 | 대신 쓸 것 |
|---|---|---|
| `data-kind`처럼 gassan이 내부에서 쓰는 이름 | 무시된다(내부 상태가 망가지므로) | 다른 이름 |
| `aria-label`처럼 `data-`가 아닌 하이픈 포함 prop | 무시된다 | 이름은 `label`이나 `Modal.Title`, 설명은 `aria-describedby` |

TypeScript는 하이픈이 들어간 JSX 속성 이름을 초과 속성 검사에서 제외하므로,
**이것들은 모두 타입 오류가 되지 않는다.** 타입으로 잡을 수 없으니, 런타임이 침묵하지 않는다.

---

## 시트와 디텐트

`placement="sheet"`를 주면 패널이 아래에서 올라오는 시트가 된다. `detents`를 넘기면 그 높이들에서 멈춘다.

```tsx
<Modal.Root
  open={open}
  onOpenChange={setOpen}
  placement="sheet"
  swipeToDismiss
  detents={['peek', 'half', 'full']}
  defaultDetent="half"
  onDetentChange={(d) => console.log(d)}
>
  <Modal.Handle />
  <Modal.Header>
    <Modal.Title>경로</Modal.Title>
  </Modal.Header>
  <Modal.Body>{/* … */}</Modal.Body>
</Modal.Root>
```

규칙은 세 가지다.

1. **아래로 빠르게 튕겨도 시트는 닫히지 않는다. 디텐트 하나만큼 내려간다.** 디텐트가 있으면 사람들은 "조금 작게"라는 뜻으로 튕긴다.
   시트는 가장 낮은 디텐트에서 더 아래로 튕길 때만 닫힌다.
2. **손잡이는 드래그 전용이 아니다.** 디텐트가 있으면 `role="slider"`가 되어,
   화살표 키, Home / End, 클릭으로도 디텐트 사이를 이동한다. 드래그할 수 없는 사람도 방법을 잃지 않는다.
3. **디텐트가 없으면 시트는 이전처럼 콘텐츠 높이만큼이다.** 손잡이는 장식(`aria-hidden`)으로 돌아간다.
   움직일 수 없는 것을 컨트롤로 안내하지 않는다.

스냅 로직은 순수 함수 `resolveDetents` / `snapToDetent`로 분리되어 있다(따로 import할 수 있다).

---

## 명령형 API

```tsx
const modals = useModals();
const ok = await modals.confirm({ title: '삭제할까요?', tone: 'danger' });
```

앱의 루트에 `<ModalHost />`를 하나 둔다. confirm 두 개가 동시에 요청되어도 한 번에 하나씩 표시된다.

---

## 브라우저 요구 사항

gassan은 `<dialog>` `showModal()` `@starting-style` `transition-behavior: allow-discrete` `:has()` `@container`를 사용한다.
모두 Baseline이다(`<dialog>`는 2022년부터, 나머지는 2023~2024년부터).

퇴장 애니메이션에 쓰는 CSS `overlay` 속성만 **MDN 기준 Limited availability(Baseline 아님)** 상태다.
그래서 gassan은 JS 폴백을 갖고 있다. 닫기 요청이 오면 `data-exiting`을 붙이고, dialog가 열린 채로 퇴장 상태를 그린 뒤,
`--g-dur-out`이 지나면(`prefers-reduced-motion`에서는 즉시) `close()`를 호출한다.
`onExited`, 콘텐츠 초기화, 포커스 복원, 스크롤 잠금 해제는 모두 `close()` 이후에 일어난다.

`requestClose()`는 Baseline 2025, `closedby`는 Limited availability다. gassan은 둘 다 쓰지 않는다.
`cancel`을 막고 모든 것을 자체 `requestClose(reason)`로 모은다(자세한 내용은 [`docs/library-landscape.md`](./docs/library-landscape.md)).

오래된 환경에서는 "애니메이션 없는 모달"로 저하될 뿐이며, 열기, 닫기, 접근성은 유지된다.

---

## 개발

```bash
npm install
npm run dev              # examples/react의 데모(Vite). 실기기 확인용 작업대
npm run site:dev         # 문서 사이트를 로컬에서 연다(http://localhost:5180)
npm run site:build       # 사이트를 site/dist에 출력한다(npm run site:preview로 확인)
npm run verify           # typecheck → lint → test → trace → docs → build → dist / SSR / pack 검사
npm run check:consumer   # tarball을 실제로 설치해 외부에서 검증한다(네트워크 필요)
```

문서 사이트는 `site/`에 있다. 빌드 시 사양서, 추적 표, 검증 보고서,
`src`의 타입 정의를 읽어 표와 API 레퍼런스를 조립한다(`site/plugins/gassan-data.ts`).
각 데모에 표시되는 코드는 데모 파일 그 자체(`?raw`)이므로, 예제와 코드가 서로 어긋날 수 없다.
`main`에 push하면 GitHub Actions가 사이트를 빌드해 GitHub Pages에 공개한다.

`examples/css-check.html`은 브라우저에서 바로 열 수 있다.
jsdom으로는 확인할 수 없는 것들(top layer, 퇴장 애니메이션, 스크림 농도 등)을 눈으로 확인하기 위한 페이지다.

무엇을 검증했고 무엇을 검증하지 않았는지는 [`VERIFICATION.md`](./VERIFICATION.md)에 따로 정리해 두었다.
**"테스트가 초록색이다"와 "보장된다"는 다른 이야기**이므로,
실제 브라우저에서만 확인할 수 있는 18개 항목은 그 파일의 3절로 분리했다.

변경 이력은 [`CHANGELOG.md`](./CHANGELOG.md)에, v1.0까지의 릴리스 계획은 [`ROADMAP.md`](./ROADMAP.md)에 있다.

---

## 라이선스

MIT. 전문은 [`LICENSE`](./LICENSE)에 있다.
