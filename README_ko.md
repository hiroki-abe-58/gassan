# gassan

[English](./README.md) · [日本語](./README_ja.md) · [简体中文](./README_zh.md) · [繁體中文](./README_zh-Hant.md) · **한국어** · [ไทย](./README_th.md)

네이티브 `<dialog>`를 토대로 한, SaaS를 위한 React UI 라이브러리.

모달, 폼 요소, UI 요소, 토스트, 명령 팔레트부터 로그인·오류·요금 페이지, 설정·멤버·결제를 안에 담은 앱 셸까지, 모두 컴포넌트 하나만 두면 된다.
포커스 트랩, Esc, 배경의 inert 처리, top layer는 **여기서 한 줄도 구현하지 않았다**. 브라우저가 처리한다.
일본어·중국어·한국어 줄바꿈과 접근성은 사양으로 적어 두고 테스트로 확인한다.

- **모달** — 5가지 유형. 활성화 게이트("끝까지 읽으면", "체크하면" 누를 수 있게 되는 버튼을 `disabled` 없이 만든다). 접근 가능한 이름(accessible name)을 온전하게 지키는 제목 말줄임. 8종류의 `CloseReason`(닫기를 거부할 때는 반드시 사유를 돌려준다). 디텐트에서 멈추는 시트. 하드코딩된 60% 검정을 버린, 의도별 4단계 스크림 토큰
- **폼 요소** — 텍스트, 비밀번호, 검색, 숫자, 인증 코드, 체크박스, 라디오, 세그먼트, 평점, 스위치, 칩, 슬라이더, 셀렉트, 콤보박스, 일본 공휴일과 기간 선택을 갖춘 달력, 시간 선택, 태그, 비밀번호 강도, 파일. 안쪽은 네이티브 요소 그대로 두고 테두리와 표시만 다시 그리며, 색은 테마의 강조색을 따른다. 목록과 달력은 top layer에 나타나므로 모달에 잘리지 않는다. `Field`는 레이블을 입력란 안에 두고, 포커스나 입력이 있으면 왼쪽 위로 작아지며 비켜나는 형태(`labelPlacement="floating"`)로도 쓸 수 있다
- **UI 요소** — 버튼, 배지, 아바타, 진행률, 스켈레톤, 카드, 수치 요약, 빈 상태, 이름과 값의 목록, 타임라인, 알림 배너, 탭, 아코디언, 툴팁, 팝오버, 메뉴, 브레드크럼, 페이지 이동, 단계, 페이지 헤더, 데이터 표(정렬, 행 선택, 일괄 작업), 명령 팔레트(⌘K)
- **토스트** — 사라질 때까지 남은 시간을 미터로 보여 준다. 포인터가 올라가 있거나 포커스가 안에 있으면 멈추고, 스와이프로도 직접 눌러서도 닫을 수 있다
- **페이지 템플릿** — 로그인, 계정 만들기, 2단계 인증, 비밀번호 재설정, 이메일 확인, 로그아웃, IANA에 등록된 4xx / 5xx 40개 전부와 오프라인 오류, 점검, 약관과 개인정보 처리방침, 자주 묻는 질문, 요금, 문의하기, 업데이트 내역. 그리고 앱 셸과, 그 안의 설정·멤버·요금제와 결제·초기 설정·초대 수락 페이지
- **일본어·중국어·한국어 줄바꿈** — 버튼, 제목, 표의 셀, 차트 요약 어디에서든 단어 중간에서 줄을 바꾸지 않는다. 일본어는 문절 경계(「プロフィールを｜編集」이지, 「プロフィールを編｜集」이 아니다), 중국어는 단어 경계, 한국어는 공백에서만 끊는다. 태국어와 영어는 브라우저가 이미 올바르게 끊으므로 브라우저에 맡긴다
- **모션과 테마** — 4단계의 모션 중에서 고를 수 있다(동작 줄이기 설정은 반드시 따른다). 라이트와 다크, 원하는 기본 색상(primary color). 어떤 색을 고르든 글자와 채움 색이 WCAG 대비율을 충족하도록 도출된다

**문서 사이트: <https://hiroki-abe-58.github.io/gassan/#/ko>**
— 설계 원칙(모달이 존재하는 이유, 4층 모델, 5가지 유형, 접근성), 스타일(스크림, 색과 대비, 테마, 크기, 줄바꿈, 모션),
모든 컴포넌트와 폼 요소의 라이브 데모와 API, 페이지 템플릿, 그리고 297개 동작의 사양을 Material Design 3 가이드라인처럼 정리했다.
사이트는 한국어, [English](https://hiroki-abe-58.github.io/gassan/#/en), [日本語](https://hiroki-abe-58.github.io/gassan/), [简体中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hans), [繁體中文](https://hiroki-abe-58.github.io/gassan/#/zh-Hant), [ไทย](https://hiroki-abe-58.github.io/gassan/#/th)로 읽을 수 있다(상단 바의 지구본 버튼으로 전환한다).
라이트 / 다크 테마와 기본 색상(primary color)을 고를 수 있고, 어떤 색을 고르든 글자와 채움 색이 WCAG 대비율을 충족하도록 도출된다.
사이트의 모든 표, 개수, API 설명은 빌드 시 사양서와 타입 정의에서 생성되며, 손으로 쓴 숫자는 하나도 없다.

전체 설계는 [`modal.skill.md`](./modal.skill.md)(297개 항목의 동작 표, 의사결정 매트릭스, 품질 루브릭)에 있다.
AI 어시스턴트와 함께 코딩할 때는 이 파일을 컨텍스트에 넣는다.

| 문서 | 내용 |
|---|---|
| [`docs/traceability.md`](./docs/traceability.md) | `modal.skill.md`의 297개 동작 각각을 그것을 충족하는 테스트와 CSS에 대응시킨 표. `npm run check:trace`가 기계적으로 검증한다 |
| [`docs/requirements-audit.md`](./docs/requirements-audit.md) | 원래 요구 사항을 분해해 한 줄씩 정리한 표: 구현됨 / 조합으로 달성 / 로드맵에 있음 |
| [`docs/control-recipes.md`](./docs/control-recipes.md) | gassan의 폼 요소를 모달 안에 넣는 최소 예제와, gassan에 없는 컴포넌트를 다른 라이브러리에서 가져와 감쌀 때의 주의점 |
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
달력의 월 이름과 요일, 파일 크기는 `labels.locale`(BCP 47. 기본값은 `ja-JP`)에 따라 `Intl`로 만든다.

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
            {(control) => <Modal.Input {...control} />}
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

## 페이지 템플릿

앱의 루트에 `SiteProvider`를 하나 두면(제품 이름, 로고, 링크, 라우터의 링크 컴포넌트), 페이지는 컴포넌트 하나로 나온다.
템플릿의 스타일은 `templates.css`에 있다. `styles.css` 다음에 불러온다.

```tsx
import { SiteProvider, SignInPage } from '@genelab/gassan';
import '@genelab/gassan/styles.css';
import '@genelab/gassan/templates.css';

export function SignIn() {
  return (
    <SiteProvider name="Atlas" links={{ home: '/', signUp: '/signup', forgotPassword: '/forgot' }}>
      <SignInPage
        onSubmit={async ({ email, password }) => {
          const ok = await signIn(email, password);
          // 실패하면 기본 문구를 보여 준다(어느 쪽이 틀렸는지 밝히지 않는다)
          if (!ok) return { error: true };
        }}
      />
    </SiteProvider>
  );
}
```

로그인한 뒤에는 `AppShell`이 왼쪽 내비게이션 바, 상단 바, 좁은 화면의 내비게이션 패널을 맡고, 그 안을 `SettingsPage`, `MembersPage`, `BillingPage`, `OnboardingPage`, `InviteAcceptPage`, `ChatPage`, `AssistantPage`, `MailboxPage`, `ApiKeysPage`, `AuditLogPage`, `NotificationSettingsPage`로 채운다.
넘기는 것은 데이터와 처리 함수뿐이다. 처리 함수가 `{ error }`를 돌려주면 그 문장을 읽어 주고, 중복 제출은 일어나지 않는다.
날짜와 시간은 `SiteProvider`의 `timeZone`으로 그린다. 지정하지 않으면 보는 사람의 시간대로 그리고, hydration이 끝날 때까지는 UTC로 그리므로, 서버와 브라우저의 글자가 어긋나지 않는다.

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
| `Modal.Field` `Modal.Fieldset` | 입력란 하나와 선택지 그룹에 이름, 도움말, 오류를 연결한다 |
| `Modal.Input` `Modal.PasswordInput` `Modal.SearchInput` `Modal.Textarea` `Modal.NumberField` `Modal.CodeInput` | 텍스트 입력 |
| `Modal.Checkbox` `Modal.CheckboxGroup` `Modal.RadioGroup` `Modal.Segmented` `Modal.Rating` `Modal.Switch` `Modal.Chips` | 선택지 |
| `Modal.Slider` `Modal.RangeSlider` | 슬라이더(손잡이와 채우기는 테마의 색) |
| `Modal.Select` `Modal.Combobox` `Modal.DatePicker` | 목록이나 달력을 top layer에 띄우는 컴포넌트 |
| `Modal.FileDrop` | 파일을 놓는 드롭 영역(드롭에도 `accept`를 적용한다) |
| `Modal.Table` `Modal.Alert` | 가로로 스크롤되는 표, 제출 결과 요약 |
| `Modal.Chart` | 가져온 그림(외부 라이브러리, 직접 만든 SVG나 canvas)을 담는 컨테이너. 이름(`label`)과 추세의 텍스트 대체(`summary`)를 연결하고, 원본 데이터를 `<details>`로 보여 준다 |
| `Modal.Handle` | 시트의 손잡이. 디텐트가 있으면 `role="slider"` 컨트롤, 없으면 장식용으로 잡는 영역 |
| `ModalHost` `useModals` | 명령형 API(`await confirm()`) |
| `Modal.Calendar` `Modal.RangeCalendar` `Modal.DateRangePicker` `Modal.TimePicker` `Modal.ColorPicker` | 일본 공휴일과 기간 선택을 갖춘 달력, 테마로 그리는 시간 선택과 색 선택 |
| `Modal.TagInput` `Modal.PasswordStrength` | 태그(붙여넣기와 IME 대응)와 새 비밀번호의 강도 |
| `Modal.NativeSelect` `Modal.EmailInput` `AddressFields` `NameFields` `BirthDateInput` `BankAccountFields` | 일본 폼 입력. 전각·반각, 하이픈, 가나를 받는 쪽에서 맞춘다(`Input`의 `normalize`와 `toHalfWidth` 등의 함수). 우편번호로 주소를, IME 변환 전의 읽기로 후리가나를 채운다. 브라우저 자동 입력이 되는 네이티브 select, 메일 도메인을 잘못 쳤을 때의 후보, 일본 연호를 곁들인 생년월일, 유초 은행의 기호·번호를 이체용으로 바꾸는 계좌 |
| `toast` `ToastHost` | 남은 시간 미터가 달린 토스트 |
| `Button` `ButtonLink` `IconButton` `CopyButton` `Badge` `Avatar` `AvatarGroup` `Kbd` `Divider` | 페이지 위(모달 밖)에서 쓰는 버튼과 표시 |
| `Card` `Stat` `EmptyState` `DescriptionList` `Timeline` `Progress` `Spinner` `Skeleton` `Banner` | 컨테이너, 숫자, 진행 상황, 알림 |
| `Tabs` `Accordion` `Tooltip` `Popover` `Menu` `ContextMenu` `Breadcrumbs` `Pagination` `Steps` | 이동을 위한 컴포넌트와, 트리거 옆이나 오른쪽 클릭한 위치에 나타나는 컴포넌트 |
| `PageHeader` `DataTable` `CommandPalette` | 페이지 헤더, 데이터 표(정렬, 행 선택, 일괄 작업), 명령 팔레트(⌘K) |
| `LineChart` `BarChart` `DonutChart` `Sparkline` `BarList` `Gauge` | 의존성 없이 SVG와 HTML로 그리는 그래프. 키보드로 점을 따라가며 값을 읽어 주고, 원본 데이터를 표로 펼칠 수 있으며, 색은 테마를 따른다 |
| `ScatterChart` `RadarChart` `Heatmap` `WaterfallChart` `ParetoChart` `FunnelChart` `FishboneDiagram` `GanttChart` | 분석용 그래프: 산점도와 버블 차트, 레이더 차트, 히트맵(방향키로 칸을 옮겨 다니는 표), 폭포 차트, 파레토 차트, 퍼널, 특성요인도(피시본), 간트 차트(주말·공휴일 음영과 오늘 선). 모두 이름과 설명을 가지며 값을 읽어 준다 |
| `Carousel` | 손가락으로도, 이전·다음·점으로도 넘길 수 있는 캐러셀. 자동 재생은 정지 버튼을 맨 앞에 두고, 포인터나 포커스가 올라가면 멈춘다 |
| `ChatThread` `ChatComposer` `TypingIndicator` `ChatSuggestions` | 사람끼리의 채팅과 AI와의 대화. 위를 읽는 동안에는 위치를 움직이지 않고, 입력기로 변환 중인 Enter로는 보내지 않으며, 생성하면서 쓰는 답변은 다 쓴 뒤에 읽어 준다 |
| `CodeBlock` `TreeView` `NotificationCenter` `Checklist` | 복사 버튼이 달린 코드 블록, 화살표 키와 문자 입력으로 움직이는 트리 뷰, 종 모양 버튼으로 여는 알림 목록, 단계를 끝내면 다음 단계로 포커스를 옮기는 시작하기 체크리스트 |
| `ScrollArea` `PageScrollbar` | 직접 그리는 스크롤바. 브라우저와 OS마다 다른 모양을 테마에 맞춰 통일한다(스크롤 자체는 브라우저 그대로). 모달 본문·목록·채팅·표 등 컴포넌트 안의 스크롤도 같은 막대로 그린다 |
| `ChatWidget` | 사이트 오른쪽 아래의 챗봇. 둥근 플로팅 버튼에서 모달이 아닌 작은 창을 열고, 오른쪽 패널로 넓힐 수 있다. 스마트폰 폭에서는 화면을 가득 채우는 시트가 된다 |
| `SiteProvider` `SignInPage` `SignUpPage` `TwoFactorPage` `ForgotPasswordPage` `ResetPasswordPage` `VerifyEmailPage` `SignOutPage` | 로그인과 계정 페이지(`templates.css`) |
| `AuthDialog` `EmailFirstPage` `MagicLinkPage` `PhoneSignInPage` `QuickSignUpPage` `RegistrationWizardPage` `PasskeyPromptPage` `AccountChooserPage` `ReauthDialog` `GuestAccountCard` | 로그인과 가입 입구의 여러 형태. 헤더에서 여는 대화상자, 이메일을 먼저 묻는 로그인, 비밀번호 없는 이메일 링크와 SMS 코드, 이메일만으로 하는 임시 가입과 저장하며 진행하는 단계별 본가입, 패스키, 계정 선택, 재인증과 로그인 만료, 비회원 구매 후 계정 만들기 |
| `RegistrationPresetPage` `REGISTRATION_PRESETS` `OccupationField` `PurposeField` `PepsField` `TaxResidencyField` `UsPersonField` `DeclarationField` `MyNumberField` `CompanyFields` `IdentityMethodField` `GuardianFields` `MarketingConsentField` | 업종별 본가입. 이메일만으로 하는 임시 가입 뒤에, 일본 법령이 거래 전까지 요구하는 단계와 항목을 15개 업종(은행·증권·암호자산·송금·카드·온라인 쇼핑·주류·법인용·매입·온라인 진료·매칭·구인·임대·티켓·휴대전화)별로 구성하고, 왜 묻는지를 근거 법령으로 보여 준다. 미성년자의 보호자 동의, 연령 하한, 본인 확인 방법(시행일에 따라 바뀜)도 업종에 맞춘다. 2026년 10월 기준의 참고이며 법률 자문이 아니다 |
| `OrderReviewPage` `CookieConsent` `ExternalTransmissionList` `CancelSubscriptionPage` | 구매와 동의. 일본 특정상거래법 제12조의6이 요구하는 주문 최종 확인 화면(표시 사항마다 제목이 있는 절로 나눈다), '모두 허용'과 '필수 항목만 허용'을 같은 무게로 두는 쿠키·외부 전송 동의 배너(종류별로 고르는 창 포함), 전기통신사업법 제27조의12가 공표를 요구하는 전송처 목록, 이유·제안(한 번만)·확인 순서로 진행하며 출구를 숨기지 않는 해지 절차. 2026년 10월 기준의 참고이며 법률 자문이 아니다 |
| `ErrorPage` `MaintenancePage` `DocumentPage` `FaqPage` `PricingPage` `ContactPage` `ChangelogPage` | 오류, 점검, 공개 페이지 |
| `AppShell` `SettingsPage` `MembersPage` `BillingPage` `OnboardingPage` `InviteAcceptPage` `ChatPage` `AssistantPage` `MailboxPage` `ApiKeysPage` `AuditLogPage` `NotificationSettingsPage` | 앱 셸과 그 안의 페이지 |
| `GassanProvider` | UI 문자열 교체(기본은 일본어, `englishLabels` 동봉)와 줄바꿈 전환(`lineBreak`) |
| `Phrase` `splitPhrases` | 직접 만든 UI의 일본어·중국어·한국어 텍스트에도 같은 줄바꿈을 적용(gassan 컴포넌트 안에서는 기본으로 켜져 있다) |

폼 요소에는 `Modal`을 붙이지 않은 중립적인 이름(`Field`, `Input`, `Select`, `Calendar` …)도 있어, 페이지 위에서도 그대로 쓸 수 있다.
폼 요소는 안쪽이 네이티브 요소이며, `Modal.Field`의 render prop을 그대로 펼쳐서 받는다.
선택지 그룹(라디오, 여러 체크박스, 평점, 손잡이가 두 개인 슬라이더)은 `label`이 아니라 `Modal.Fieldset`(`fieldset` / `legend`)으로 이름을 붙인다.
목록과 달력은 popover API로 top layer에 띄우며, 열려 있을 때의 Esc는 목록만 닫는다.
gassan에 없는 컴포넌트(여러 개를 고르는 콤보박스 등)는 다른 라이브러리의 컴포넌트를 같은 방식으로 감싼다. 예제는 [`docs/control-recipes.md`](./docs/control-recipes.md)에 있다.

```tsx
<Modal.Field label="배송 방법">
  {(control) => <Modal.Select {...control} value={shipping} onValueChange={setShipping} options={SHIPPING} />}
</Modal.Field>

<Modal.Fieldset label="가격대">
  <Modal.RangeSlider value={price} onValueChange={setPrice} min={0} max={10000} step={500} showValue />
</Modal.Fieldset>
```

```tsx
<Modal.Chart
  label="월별 매출(천 달러)"
  summary="3월에 120으로 최고치를 찍었다. 4월 이후로는 100 안팎에서 횡보한다."
  data={<Modal.Table label="원본 데이터"><table>{/* … */}</table></Modal.Table>}
>
  <MyBarChart />  {/* SVG / canvas / 어떤 라이브러리든 된다. 기본적으로 aria-hidden */}
</Modal.Chart>
```

```tsx
import { LineChart } from '@genelab/gassan';

<LineChart
  label="월별 매출"
  description="매출은 3월이 가장 많다."
  data={[
    { month: '1월', revenue: 1180, cost: 820 },
    { month: '2월', revenue: 1240, cost: 850 },
    { month: '3월', revenue: 1520, cost: 900 },
  ]}
  x="month"
  series={[
    { key: 'revenue', label: '매출' },
    { key: 'cost', label: '비용' },
  ]}
  area
  table
/>
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
