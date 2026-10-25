import type ja from '../ja/commerce';

export default {
  lead: '주문 최종 확인, Cookie와 외부 전송 동의, 수신처 목록, 해지 절차. 일본 법령이 화면에 요구하는 것(특정상거래법의 최종 확인 화면과 전기통신사업법의 외부 전송 규율)을 그대로 절과 문구로 만들었다.',
  law: {
    title: '법령에 대하여',
    body: '표시 사항은 2026년 10월 시점의 조문(e-Gov 법령 검색)을 바탕으로 짠 기준이며, 법률 자문이 아니다. 파는 상품·서비스·보내는 정보에 따라 필요한 표시가 달라지므로, 시작하기 전에 전문가에게 확인하기 바란다.',
  },
  orderReview: {
    title: '주문 최종 확인',
    intro: '특정상거래법 제12조의6은 인터넷 주문의 마지막 화면에 수량·대금·지급 시기와 방법·인도 시기·청약 기간·청약 철회와 계약 해제를 표시하도록 요구하고, 주문이 된다는 사실이나 표시 사항을 오인하게 하는 표시를 금지한다. `OrderReviewPage`는 이것들을 제목이 있는 절에 늘어놓고, 아직 확정되지 않았음을 알리며, “주문하기”로 확정한다.',
    tableCaption: '최종 확인 화면의 표시 사항과 props',
    head: { item: '표시 사항', prop: 'props' },
    rows: [
      { item: '수량(제12조의6 제1항 제1호)', prop: '`items`의 `quantity`와 `unit`' },
      { item: '판매 가격과 배송비(제11조 제1호)', prop: '`items`의 `price`·`shippingFee`·`fees`·`discounts` (합계는 컴포넌트가 계산한다)' },
      { item: '대금 지급 시기와 방법(제11조 제2호)', prop: '`payment`의 `method`와 `timing`' },
      { item: '인도 시기(제11조 제3호)', prop: '`delivery`의 `method`와 `timing`' },
      { item: '청약 기간(제11조 제4호)', prop: '`offerPeriod` (기한이 있는 판매일 때)' },
      { item: '청약 철회와 계약 해제(제11조 제5호)', prop: '`cancellationPolicy` (링크만 두지 말고 조건을 적는다)' },
      { item: '정기 구매 조건', prop: '`subscription` (회당 금액·주기·최소 구매 횟수·해지 방법)' },
    ],
  },
  cookieConsent: {
    title: 'Cookie와 외부 전송 동의',
    intro: '전기통신사업법 제27조의12(외부 전송 규율)는 이용자의 정보를 외부로 보내기 전에 보내는 정보와 수신처 등을 통지하거나, 쉽게 알 수 있는 상태에 두도록 요구한다(동의를 얻은 것이나 멈출 수 있게 한 것은 예외). `CookieConsent`는 아직 고르지 않은 사람에게 배너를 띄우고, “모두 허용”과 “필수 항목만 허용”을 같은 무게로 늘어놓으며, 종류별로 고를 수 있는 창을 연다. 저장은 사용하는 쪽이 `onChange`에서 한다.',
  },
  externalTransmission: {
    title: '외부 전송 공표',
    intro: '`ExternalTransmissionList`는 수신처마다 보내는 정보·목적·종류와, 수신처의 개인정보 처리방침 및 전송을 멈추는 페이지로 가는 링크를 늘어놓는다. 배너의 “수신처 목록” 링크가 가리키는 곳(개인정보 처리방침 안의 절 등)에 둔다.',
  },
  cancel: {
    title: '해지 절차',
    intro: '이유(선택) → 제안(선택·한 번만) → 확인, 이렇게 3단계까지. 어느 화면에서든 “계속 사용”으로 빠져나갈 수 있고, 제안 화면에서는 “해지 계속하기”를 제안과 같거나 그 이상의 무게로 둔다. 확인 화면에서 쓸 수 있는 마지막 날·데이터 처리·내보내기를 보여 준 뒤에 해지한다.',
  },
  setup: {
    title: '동의 배너 두기',
    intro: '배너는 페이지의 마지막에 두고, 허용한 내용을 Cookie나 localStorage에 저장한다. 서버에서 렌더링하는 페이지에서는 저장한 선택을 렌더링한 뒤(`useEffect`)에 읽고, 다 읽기 전까지는 배너를 렌더링하지 않는다(먼저 `null`을 넘기면 이미 고른 사람에게도 배너가 잠깐 나타난다). 페이지 아래쪽의 “Cookie 설정”에서 `settingsOpen`으로 창을 다시 열 수 있다.',
    code: `import { useEffect, useState } from 'react';
import { CookieConsent, type CookieConsentValue } from '@genelab/gassan';

const KEY = 'cookie-consent';

type Props = { settingsOpen: boolean; onSettingsOpenChange: (open: boolean) => void };

export function Consent({ settingsOpen, onSettingsOpenChange }: Props) {
  const [value, setValue] = useState<CookieConsentValue | null | undefined>(undefined);
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    setValue(saved ? (JSON.parse(saved) as CookieConsentValue) : null);
  }, []);
  if (value === undefined) return null;
  return (
    <CookieConsent
      value={value}
      onChange={(next) => {
        localStorage.setItem(KEY, JSON.stringify(next));
        setValue(next);
        // 허용한 종류의 태그만 불러온다
      }}
      settingsOpen={settingsOpen}
      onSettingsOpenChange={onSettingsOpenChange}
      policyHref="/privacy#external"
    />
  );
}`,
  },
  samples: {
    coffee: '커피 원두 200g',
    coffeeOption: '미디엄 로스팅·홀빈',
    bag: '봉지',
    dripper: '드리퍼',
    coupon: '첫 주문 쿠폰',
    address: ['사토 하나', '〒100-0001 도쿄도 지요다구 지요다 1-1', '090-1234-5678'],
    deliveryMethod: '택배',
    deliveryTiming: '주문 후 2~4일 이내 도착(날짜와 시간을 지정할 수 있습니다)',
    paymentMethod: '신용카드(Visa 끝자리 4242)',
    paymentTiming: '주문을 확정할 때',
    offerPeriod: '2026년 11월 30일 23:59까지(이 구성의 판매 기간)',
    cancellationPolicy: '상품 도착 후 8일 이내라면 개봉하지 않은 상품에 한해 반품할 수 있습니다. 반품 배송비는 고객 부담입니다. 불량품은 당사 부담으로 교환해 드립니다.',
    interval: '매월',
    priceNote: '2회차부터는 회당 ¥2,160(10% 할인)',
    howToCancel: '다음 배송 7일 전까지 마이페이지의 “정기 구매”에서 해지할 수 있습니다. 전화로도 접수합니다.',
    consent: '이용약관과 정기 구매 조건에 동의합니다',
    edit: '이전 화면으로 돌아갑니다(견본)',
    shopTitle: '주말 커피 정기배송',
    shopText: '갓 볶은 원두를 매월 보내 드립니다. 이 견본에서는 화면 아래에 Cookie 배너가 나타납니다.',
    openSettings: 'Cookie 설정',
    consentSaved: 'Cookie 설정을 저장했습니다(견본)',
    policyTitle: '외부로 보내는 정보와 수신처',
    policyText: '이 사이트는 다음 사업자에게 이용자의 정보를 보낼 수 있습니다. 멈추고 싶다면 각 사업자의 페이지에서 멈출 수 있습니다.',
    recipientsTitle: '수신처와 보내는 정보',
    transmissions: [
      {
        recipient: 'Google LLC',
        service: 'Google Analytics',
        information: '열람한 페이지의 URL, 참조 페이지, 기기와 브라우저의 종류, Cookie 식별자',
        purpose: '페이지 열람 수와 이용 방식을 집계해 사이트 개선에 사용합니다.',
        category: 'analytics',
        policyHref: 'https://policies.google.com/privacy',
        optOutHref: 'https://tools.google.com/dlpage/gaoptout',
      },
      {
        recipient: 'Meta Platforms, Inc.',
        service: 'Meta Pixel',
        information: '열람한 페이지의 URL, 구매 여부, 기기 정보, Cookie 식별자',
        purpose: '광고 효과를 측정하고 관심사에 맞는 광고를 보여 줍니다.',
        category: 'marketing',
        policyHref: 'https://www.facebook.com/privacy/policy/',
      },
      {
        recipient: 'Atlas Inc.',
        service: '로그인 상태 유지',
        information: '로그인 상태를 나타내는 식별자',
        purpose: '로그인한 상태를 유지하는 데 사용합니다.',
        category: 'necessary',
      },
    ],
    plan: 'Pro',
    reasons: { price: '요금이 비쌈', unused: '자주 쓰지 않음', missing: '필요한 기능이 없음', switching: '다른 서비스로 옮김', other: '기타' },
    pauseTitle: '한 달만 일시 정지',
    pauseDescription: '일시 정지하는 동안에는 요금이 들지 않고, 데이터는 그대로 남습니다.',
    pauseAction: '1개월 일시 정지하기',
    downgradeTitle: '무료 요금제로 바꾸기',
    downgradeDescription: '멤버는 3명까지, 저장 용량은 1 GB까지입니다. 데이터는 그대로 쓸 수 있습니다.',
    downgradeAction: 'Free로 바꾸기',
    dataNotice: '해지하고 30일 뒤에 워크스페이스의 데이터를 삭제합니다. 그때까지는 내보낼 수 있습니다.',
  },
  a11yCaption: '구매와 동의 템플릿의 동작',
} satisfies typeof ja;
