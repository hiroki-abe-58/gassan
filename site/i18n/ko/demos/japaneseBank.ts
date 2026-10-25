import type ja from '../../ja/demos/japaneseBank';

export default {
  label: '입금 계좌',
  hint: '「みつびし」나 “0005”로도 찾을 수 있다. 유초 은행(「ゆうちょ銀行」)을 고르면 통장의 기호·번호(예: 10180과 12345671)로 이체용 지점명과 계좌번호를 만든다. 지점은 견본이다.',
  comments: {
    fields: '금융기관과 지점의 후보는 사용하는 쪽에서 넘긴다(전국은행협회의 데이터나 API에서)',
    zengin: '예금주는 전각 가타카나로 갖고 있다가, 보낼 때 젠긴 형식(반각 가나)으로 바꾼다',
  },
} satisfies typeof ja;
