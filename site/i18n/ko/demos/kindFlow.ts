import type ja from '../../ja/demos/kindFlow';

export default {
  open: '주문 진행하기',
  stepAddress: '배송지',
  stepPayment: '결제',
  stepConfirm: '확인',
  title: '주문 절차 — {0}',
  address: '주소',
  addressValue: '야마가타현 쓰루오카시 하구로마치',
  card: '카드 번호',
  cardHelp: '숫자만',
  confirmNote: '내용을 확인하고 확정해 주세요. 확정 후에는 변경할 수 없습니다.',
  next: '다음',
  submit: '확정하기',
  comments: {
    slots: '1fr auto 1fr의 3개 슬롯. 뒤로 버튼의 유무로 가운데가 밀리지 않는다(H-01)',
  },
} satisfies typeof ja;
