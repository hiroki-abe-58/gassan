import type ja from '../ja/japaneseInput';

export default {
  lead: '일본의 폼에서 사람들이 이탈하는 이유를 입력 컴포넌트 쪽에서 없앤다. 전각과 반각·하이픈 유무·히라가나와 가타카나는 입력한 사람에게 고치게 하지 않고 받는 쪽에서 맞춘다(“전각으로 입력해 주세요”라고 말하지 않는다). 우편번호로 주소를, 입력한 이름의 읽기로 후리가나(이름의 가나 읽기)를 채우는 것처럼 알 수 있는 것은 미리 넣고, 입력한 값과 브라우저 자동 입력이 넣은 값은 덮어쓰지 않는다.',
  principles: {
    title: '이탈시키지 않기 위한 약속',
    rows: [
      '**맞출 수 있는 차이를 오류로 만들지 않는다.** 전각과 반각·하이픈의 종류·히라가나와 가타카나·전화번호 쓰는 법은 받는 쪽에서 고친다.',
      '**알 수 있는 것은 미리 넣는다.** 단, 사용자와 브라우저 자동 입력이 넣은 값은 덮어쓰지 않는다.',
      '**포커스를 멋대로 옮기지 않는다.** 옮기는 것은 후보 버튼을 눌렀을 때처럼 사용자가 골랐을 때뿐이다.',
      '**브라우저 자동 입력이 동작하게 한다.** 입력란에 `autocomplete` 이름을 붙이고, 도도부현과 생년월일은 네이티브 select로 만든다.',
      '**고칠지 말지는 사용자가 정한다.** 이메일 주소의 오타에는 후보를 보여 줄 뿐 멋대로 고치지 않는다. 읽기는 추측이므로 후리가나는 언제든 고칠 수 있다.',
    ],
  },
  normalize: {
    title: '입력한 글자 맞추기',
    intro: '`Input`에 `normalize`를 넘기면 입력할 때마다 글자를 맞춘다. IME 조합 중에는 건드리지 않고 확정·붙여넣기·자동 입력 때 맞추며, 입력 위치도 유지한다. `onChange`는 맞춘 뒤의 값을 받는다. 어느 함수든 입력 도중의 문자열에 적용해도 깨지지 않는다.',
    exampleTitle: '6개의 입력란',
    exampleDescription: '전각 숫자·여러 종류의 하이픈·히라가나를 섞어 입력해 본다. 아래에 앱이 받는 값이 나온다.',
  },
  address: {
    title: '주소(우편번호로 자동 입력)',
    intro: '우편번호·도도부현·시구정촌·동네 이름과 번지·건물명을 브라우저 자동 입력이 동작하는 이름으로 늘어놓는다. 우편번호 7자리가 갖춰지면 `lookup`으로 주소를 찾아 빈 입력란만 채운다. 결과는 입력란 아래에 보여 주고 스크린 리더에도 알리며, 포커스는 옮기지 않는다. 라이브러리는 주소 데이터를 갖고 있지 않고, 어디에도 보내지 않는다.',
    exampleTitle: '배송지 주소',
    exampleDescription: '우편번호를 입력하면 0.4초 뒤에 주소가 들어간다(견본 데이터). “동네 이름・번지”에 번지를 덧붙인 뒤 우편번호를 고치면 동네 이름 부분만 바뀐다.',
  },
  name: {
    title: '이름과 후리가나',
    intro: '성과 이름을 나누어 묻고(자동 입력이 동작한다), 이름을 IME로 입력할 때 변환 전의 가나로 후리가나를 채운다. 사용자가 후리가나를 직접 고치면 그 뒤로는 건드리지 않는다. 후리가나를 히라가나로 물으려면 `kana="hiragana"`, 묻지 않으려면 `kana={false}`.',
    exampleTitle: '이름',
    exampleDescription: '일본어 IME를 켜고 성과 이름을 입력해 변환해 본다.',
  },
  birthDate: {
    title: '생년월일',
    intro: '연·월·일의 네이티브 select 3개(자동 입력과 스마트폰의 피커가 동작한다). 수십 년 전의 날짜까지 달력을 넘기게 하지 않는다. 연도에는 일본 연호를 곁들이고, 다 고르면 만 나이를 보여 준다. 나이 조건은 `ageOn`으로 확인한다.',
    exampleTitle: '만 20세 이상 조건',
    exampleDescription: '만 20세 미만이 되는 날짜를 고르면 오류가 된다. 2월을 고르면 29일보다 뒤의 날은 고를 수 없다.',
  },
  email: {
    title: '이메일 주소',
    intro: '전각이나 IME를 켠 채로 입력한 「。」「ー」를 고치고, 입력란을 벗어날 때 자주 쓰이는 도메인의 오타에 후보를 보여 준다. 휴대폰 통신사 메일에는 확인 메일이 스팸 설정 때문에 도착하지 않을 수 있다는 주의를 보여 준다.',
    exampleTitle: '확인 메일을 보내는 입력란',
    exampleDescription: '“taro@gmial.com”을 입력하고 입력란을 벗어나 본다.',
  },
  bank: {
    title: '입금 계좌',
    intro: '금융기관과 지점은 가나로도 코드로도 찾을 수 있는 후보 목록이다. 예금주는 히라가나나 반각 가나로 입력해도 전각 가타카나로 맞추고, 보낼 때 `toZenginKana`로 젠긴(일본 은행 이체) 형식으로 바꾼다. 유초 은행(일본 우체국 은행)은 통장의 기호·번호로 이체용 지점명과 계좌번호를 만든다.',
    exampleTitle: '매출 입금 계좌',
    exampleDescription: '금융기관에 「みつびし」나 “0005”를 입력해 본다. 유초 은행(「ゆうちょ銀行」)도 고를 수 있다.',
  },
  recipes: {
    title: '입력란별로 쓸 것',
    intro: '묶음 컴포넌트가 없는 입력란도 `Input`의 `normalize`와 판별 함수로 똑같이 다룰 수 있다.',
    tableCaption: '입력란별 컴포넌트와 맞추는 방법',
    head: { field: '입력란', use: '쓰는 것', value: '받는 값' },
    rows: [
      { field: '우편번호만(배송비 견적 등)', use: '`Input` + `normalize={formatPostalCode}`', value: '`123-4567`' },
      { field: '주소', use: '`AddressFields` (`lookup`을 넘긴다)', value: '`{ postalCode, prefecture, city, line1, line2 }`' },
      { field: '전화번호', use: '`Input type="tel"` + `normalize={normalizePhone}`', value: '`09012345678` (숫자만)' },
      { field: 'SMS를 보낼 번호', use: '위와 같음 + `isMobilePhone`으로 확인', value: '060·070·080·090으로 시작하는 11자리' },
      { field: '이메일 주소', use: '`EmailInput`', value: '`taro@gmail.com`' },
      { field: '이름과 후리가나', use: '`NameFields`', value: '`{ familyName, givenName, familyNameKana, givenNameKana }`' },
      { field: '생년월일', use: '`BirthDateInput` + `ageOn`', value: '`1990-04-01`' },
      { field: '회사명·상호', use: '`Input` + `normalize={normalizeText}`', value: '영숫자는 반각, 가나는 전각' },
      { field: '법인번호', use: '`Input` + `normalize={digitsOf}` + `isCorporateNumber`', value: '13자리 숫자(검사 숫자까지 확인한다)' },
      { field: '적격 청구서 등록번호', use: '`Input` + `normalize={normalizeInvoiceNumber}` + `isInvoiceNumber`', value: '`T`와 13자리 숫자' },
      { field: '마이넘버(개인 번호)', use: '`Input` + `normalize={digitsOf}` + `isMyNumber`', value: '12자리(수집 목적과 보관 방법은 마이넘버법을 따른다)' },
      { field: '입금 계좌', use: '`BankAccountFields` (보낼 때 `toZenginKana`)', value: '금융기관·지점·예금 종류·계좌번호·예금주' },
      { field: '전각이 필요한 시스템으로 보내는 입력란', use: '`Input` + `normalize={toFullWidth}`', value: '전각 문자' },
    ],
  },
  functions: {
    title: '맞추는 함수와 판별 함수',
    intro: '모두 순수 함수이므로 서버 쪽 검증에도 같은 것을 쓸 수 있다. 판별 함수는 쓰는 법(전각·하이픈·공백·〒)을 가리지 않고, 영문자나 가나가 섞인 값만 걸러 낸다.',
    tableCaption: '함수와 예, 결과',
    head: { name: '함수', input: '예', output: '결과' },
  },
  lookup: {
    title: '주소 검색 연결하기',
    intro: '`lookup`은 7자리 숫자를 받아 후보(도도부현·시구정촌·동네)의 배열을 돌려준다. Promise여도 된다. 일본 우편의 우편번호 데이터를 자기 서버에 두고 찾는 것이 확실하다. 외부 API를 쓴다면 이용 약관과, 우편번호를 외부로 보내도 되는지를 확인한다. 이미 바뀐 우편번호에 대한 결과는 컴포넌트가 버린다.',
    code: `import { AddressFields, type PostalAddress } from '@genelab/gassan';

// 자기 서버에 둔 일본 우편의 우편번호 데이터에서 찾는다
async function lookup(postalCode: string): Promise<PostalAddress[]> {
  const response = await fetch(\`/api/postal-codes/\${postalCode}\`);
  if (!response.ok) return [];
  return response.json(); // [{ prefecture: '東京都', city: '千代田区', town: '千代田' }]
}

export function ShippingAddress() {
  return <AddressFields label="배송지 주소" required lookup={lookup} autoCompleteSection="shipping" />;
}`,
  },
  a11yCaption: '일본 폼 입력의 동작',
} satisfies typeof ja;
