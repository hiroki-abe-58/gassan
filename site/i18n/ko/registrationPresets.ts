import type ja from '../ja/registrationPresets';

export default {
  lead: '금융·온라인 쇼핑·의료·매칭처럼 법령이 물어야 할 것을 정해 둔 업종의 정식 가입. 입구는 이메일 주소만으로 하고, 거래 전까지 물을 항목을 업종별 단계와 순서로 갖췄다. 단계마다 왜 묻는지를 근거 법령으로 적고, 미성년자의 보호자 동의·나이 하한·본인 확인 방법도 업종에 맞춰 짠다.',
  law: {
    title: '법령에 대하여',
    body: '단계와 근거는 2026년 10월 26일 시점의 조문(e-Gov 법령 검색)과 관공서 자료를 바탕으로 짠 기준이며, 법률 자문이 아니다. 등록이나 신고의 종류에 따라 물을 것이 달라지고, 개정도 잦다. 서비스를 시작하기 전에 자사에 해당하는 법령과 최신 개정을 전문가에게 확인하기 바란다. 출처는 아래 표의 링크에 있다.',
  },
  presets: {
    title: '업종 고르기',
    intro: '`preset`에 업종을 넘기면 그 업종의 단계와 입력란으로 정식 가입을 구성한다. 이 표는 `REGISTRATION_PRESETS`에서 만들므로 라이브러리의 내용과 같다.',
    tableCaption: '업종별 정식 가입 단계와 근거',
    head: { preset: '업종', steps: '정식 가입 단계', age: '나이', laws: '근거' },
    minAge: (age: number) => `만 ${String(age)}세 이상`,
    guardianUnder: (age: number) => `만 ${String(age)}세 미만은 보호자 동의`,
    noAge: '제한 없음',
  },
  sample: {
    title: '견본',
    intro: '업종을 골라 정식 가입 단계를 차례로 진행해 볼 수 있다. “다음”을 누르면 고칠 곳을 입력란 아래에 보여 주고, 단계를 넘어갈 때마다 저장한다. 우편번호는 100-0001 등을 입력하면 주소가 들어가고, 법인번호는 7000012050002를 입력하면 회사명이 들어간다(견본 데이터). 본인 확인은 견본이므로 방법을 골라 버튼을 누르면 확인한 것으로 처리된다.',
  },
  flow: {
    title: '입구에서 정식 가입까지',
    intro: '입구의 `QuickSignUpPage`는 이메일 주소만 묻고, 보내면 임시 가입이 끝난다. 확인 의무는 조문상 계약이나 거래 시점에 부과되는 것으로 쓰여 있으므로, 입구에서 본인 확인까지 요구하지 않아도 된다고 읽을 수 있다(그렇게 명시한 공식 자료는 찾지 못했다). 메일의 링크에서 `RegistrationPresetPage`를 열고, 단계마다 `onSave`로 저장해 도중에 떠나도 이어서 다시 시작할 수 있게 한다.',
    code: `import { QuickSignUpPage, RegistrationPresetPage } from '@genelab/gassan';

// 1. 입구: 이메일 주소만. 보내면 임시 가입이 끝나고, 정식 가입 링크를 메일로 보낸다
export function Entry() {
  return (
    <QuickSignUpPage
      onSubmit={({ email }) => api.preRegister(email)}
      expiresIn="24시간"
      steps={['메일의 링크 열기', '고객 정보 입력하기', '본인 확인']}
    />
  );
}

// 2. 메일의 링크에서: 업종별 정식 가입
export function Registration({ draft }: { draft: Draft }) {
  return (
    <RegistrationPresetPage
      preset="securities"
      defaultValues={draft.values}
      defaultStep={draft.stepId}
      onSave={(values, stepId) => api.saveDraft(values, stepId)}
      onSaveAndExit={() => navigate('/home')}
      lookupAddress={(postalCode) => api.postalCode(postalCode)}
      onVerifyIdentity={(method, values) => ekyc.start(method, values)}
      onSubmit={(values) => api.register(values)}
    />
  );
}`,
  },
  timing: {
    title: '언제 물을까',
    intro: '입구에서 묻는 것을 줄일수록 사람들이 덜 이탈한다. 법령이 요구하는 시점까지 묻는 것을 미루고, 물을 때는 단계 설명에 이유를 적는다.',
    tableCaption: '묻는 시점과 항목',
    head: { stage: '시점', items: '묻는 것', how: '컴포넌트' },
    rows: [
      {
        stage: '입구(임시 가입)',
        items: '이메일 주소와 약관 동의뿐. 개인정보 이용 목적은 보내기 전에 보여 준다(개인정보보호법 제21조 제2항). 광고 메일 동의는 별도의 선택 체크박스로 하고, 처음에는 체크하지 않은 상태로 둔다(특정전자메일법 제3조).',
        how: '`QuickSignUpPage`',
      },
      {
        stage: '정식 가입(거래 전)',
        items: '성명·주소·생년월일과 업종별 항목. 금융이라면 직업·거래 목적·외국 PEPs·거주지국·반사회적 세력이 아니라는 표명과 본인 확인.',
        how: '`RegistrationPresetPage`',
      },
      {
        stage: '해당 거래 직전',
        items: '상장회사 임원인지 여부(처음 상장 주식을 매매하기 전까지), 온라인 쇼핑의 배송지(첫 주문 전까지), 매입의 본인 확인(매입하기 전까지).',
        how: '단계를 나누거나, `optional`로 해서 나중에 묻는다',
      },
      {
        stage: '묻지 않는 것',
        items: '법령이 요구하지 않는 항목은 필수로 하지 않는다. 근무처나 전화번호를 묻는다면 이유를 덧붙인다. 구인에서는 본적·가족·종교 등을 묻지 않는다(후생노동성의 공정한 채용 전형 원칙).',
        how: '`optional`',
      },
    ],
  },
  fields: {
    title: '입력란 컴포넌트',
    intro: '정식 가입 단계는 법령이 요구하는 항목을 컴포넌트로 만든 것으로 구성한다. 컴포넌트만 자기 화면에 두어도 된다. 문구는 `SiteProvider`의 `registrationLabels`로 바꿀 수 있다(기본은 일본어와 영어).',
    work: {
      title: '직업과 거래 목적',
      intro: '범죄수익이전방지법의 거래 시 확인에서 묻는 항목. 자유 기술로 하지 않고 금융청의 유형을 선택지로 삼는다. 거래 목적은 몇 개든 고를 수 있고, 선택지 구성은 업태에 따라 달라진다.',
      exampleTitle: '직업과 거래 목적',
      exampleDescription: '업태를 바꾸면 거래 목적의 선택지가 바뀐다. 값은 키로 받는다.',
    },
    declarations: {
      title: '신고와 표명',
      intro: '외국 PEPs·거주지국(CRS·CARF)·미국 납세 의무(FATCA)는 질문을 묶음의 이름으로, 해당하는 사람의 범위를 설명으로 둔 양자택일이다. 해당하는 사람에게만 추가 입력란을 보여 준다. 반사회적 세력 배제 표명은 범위 설명을 열고 닫을 수 있게 한다.',
      exampleTitle: '신고와 표명',
      exampleDescription: '“일본 외의 나라에도 있음”과 “있음”을 고르면 국가와 납세자 번호 입력란, 미국 납세자 번호와 동의 입력란이 나온다.',
    },
    numbers: {
      title: '마이넘버와 법인번호',
      intro: '마이넘버는 숫자만으로 맞추고, 자동 입력과 맞춤법 검사를 끈다. 확인 화면에서는 끝 4자리만 보여 준다. 법인번호는 검사 숫자까지 올바른 13자리가 되면 회사명을 찾아 채운다(입력한 회사명은 덮어쓰지 않는다).',
      exampleTitle: '마이넘버와 법인번호',
      exampleDescription: '“１２３４-５６７８ ９０１８”처럼 입력해도 숫자만 남는다. 법인번호에 7000012050002를 입력하면 회사명이 들어간다.',
    },
    identity: {
      title: '본인 확인 방법',
      intro: '쓸 수 있는 방법은 근거 법령으로 정해지고, 개정으로 바뀐다. 방법은 조항 기호가 아니라 이름으로 갖고, 날짜를 넘기면 그날 이미 쓸 수 없는 방법은 보여 주지 않는다. 본인 확인 자체(IC 칩 읽기나 촬영)는 사용하는 쪽의 본인 확인 서비스가 수행한다.',
      exampleTitle: '본인 확인 방법',
      exampleDescription: '“은행·증권 등”에서 “2027년 4월 1일부터”를 고르면 서류와 얼굴 촬영이 사라진다(범죄수익이전방지법 개정).',
    },
    guardian: {
      title: '보호자 동의와 광고 메일 수신 동의',
      intro: '미성년자의 계약은 보호자의 동의가 없으면 취소할 수 있다. 생년월일로 미성년자임을 알게 되면 보호자의 이름·관계·이메일 주소와 동의를 묻는다. 광고 메일 수신 동의는 약관 동의와는 별도의 선택 체크박스로 한다.',
      exampleTitle: '보호자 동의와 광고 메일 수신 동의',
      exampleDescription: '보호자 입력란에는 본인의 이름이나 이메일 주소가 자동 입력으로 들어가지 않는다.',
    },
  },
  amendments: {
    title: '개정 예정',
    intro: '본인 확인과 개인정보에 관한 규정은 요 몇 년 사이에 잇따라 바뀐다. 날짜로 바뀌는 것은 컴포넌트가 날짜를 보고 전환한다.',
    tableCaption: '시행일과 gassan의 대응',
    head: { date: '시행일', change: '바뀌는 것', gassan: 'gassan' },
    rows: [
      {
        date: '2026-01-01',
        change: '암호자산 거래에 세법상 거주지국 신고가 필요하다(CARF. 조세조약등실시특례법 제10조의9). 기존 이용자는 2026년 말까지.',
        gassan: '`crypto`의 확인 사항에 거주지국을 두었다',
      },
      {
        date: '2026-04-01',
        change: '휴대전화 계약의 온라인 본인 확인은 IC 칩 읽기가 원칙이 되었고, 서류 이미지를 보내는 방식은 없어졌다.',
        gassan: '`identityMethods("telecom")`은 서류와 얼굴 촬영을 보여 주지 않는다',
      },
      {
        date: '2026-04-16',
        change: '만남 사이트의 연령 확인에 마이넘버 카드를 쓰는 방식이 추가되었다.',
        gassan: '`identityMethods("matching")`에 마이넘버 카드의 비밀번호와 전자 인증서 방식이 있다',
      },
      {
        date: '2027-04-01',
        change: '범죄수익이전방지법의 온라인 본인 확인에서 서류와 얼굴 촬영 방식이 없어진다.',
        gassan: '`identityMethods("aml")`은 이날부터 서류와 얼굴 촬영을 보여 주지 않는다(날짜로 전환된다)',
      },
      {
        date: '정령으로 정하는 날(2027년 7월까지)',
        change: '암호자산 교환업이 금융상품거래법의 암호자산 거래업이 된다.',
        gassan: '`crypto`는 투자 경험과 자산(적합성)을 묻는 단계를 갖고 있다',
      },
      {
        date: '정령으로 정하는 날(2028년 7월까지)',
        change: '개인정보보호법 개정으로, 만 16세 미만인 사람의 개인정보에 관한 동의와 통지는 법정대리인을 상대로 한다.',
        gassan: '만 16세 미만을 받아들이는 업종은 `guardianUnder`를 추가한다(다음 절)',
      },
    ],
  },
  customize: {
    title: '단계 더하고 빼기',
    intro: '`preset`에는 직접 구성한 프리셋도 넘길 수 있다. `REGISTRATION_PRESETS`의 업종을 펼쳐 넣고 단계·필수와 선택·나이 규정을 더하고 뺀다. 단계 설명 문구는 `registrationLabels`의 `presets`로 바꾼다.',
    code: `import { REGISTRATION_PRESETS, RegistrationPresetPage, type RegistrationPreset } from '@genelab/gassan';

// 온라인 쇼핑에 생년월일을 추가하고, 만 16세 미만에게는 보호자 동의를 요구한다
const shop: RegistrationPreset = {
  ...REGISTRATION_PRESETS.ec,
  guardianUnder: 16,
  steps: [{ id: 'delivery', fields: ['name', 'birthDate', 'address', 'phone', 'marketing'], optional: ['marketing'] }],
};

export function ShopRegistration() {
  return <RegistrationPresetPage preset={shop} onSubmit={(values) => api.register(values)} />;
}`,
  },
  samples: {
    savedExit: '저장했습니다. 메일의 링크에서 언제든지 이어서 입력할 수 있습니다.',
    doneNext: '홈으로 이동',
  },
  a11yCaption: '업종별 가입이 충족하는 명세',
} satisfies typeof ja;
