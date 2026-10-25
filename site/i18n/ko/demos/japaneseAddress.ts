import type ja from '../../ja/demos/japaneseAddress';

export default {
  label: '배송지 주소',
  tryLead: '시험해 볼 수 있는 우편번호(견본 데이터)',
  tryCodes: ['100-0001(東京)', '530-0001(大阪)', '810-0001(福岡)', '000-0000(후보가 여러 개)', '000-0001(찾지 못함)'],
  comments: {
    lookup: '우편번호(7자리 숫자)로 주소 후보를 돌려준다. 견본은 가지고 있는 표에서 찾는다(실제로는 자기 서버나 외부 API를 호출한다)',
    fields: '빈 입력란과, 앞서 자동으로 넣은 그대로인 입력란만 채운다(입력한 값과 브라우저 자동 입력이 넣은 값은 덮어쓰지 않는다)',
  },
} satisfies typeof ja;
