import type ja from '../../ja/demos/registrationWork';

export default {
  kind: '업태',
  deposit: '예금',
  securities: '증권',
  crypto: '암호자산',
  remittance: '송금',
  card: '카드',
  comments: {
    kind: '거래 목적의 선택지는 업태마다 다르다(예금은 금융청의 유형)',
    fields: '직업과 거래 목적은 자유 기술로 하지 않는다. 값은 선택지의 키로 받는다',
  },
} satisfies typeof ja;
