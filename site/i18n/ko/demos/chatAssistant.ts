import type ja from '../../ja/demos/chatAssistant';

export default {
  label: 'AI 어시스턴트와의 대화',
  me: '나',
  bot: '어시스턴트',
  greeting: '무엇을 알아볼까요?',
  sales: '지난달 매출을 정리해 줘',
  salesDescription: '전월과 비교해서, 늘어난 이유도',
  churn: '해지가 늘어난 이유는?',
  churnDescription: '요금제와 시기로 나누어 보기',
  mail: '미결제 고객에게 보낼 안내문을 써 줘',
  mailDescription: '정중하고 짧은 문장으로',
  answer:
    '지난달 매출은 2,140만 엔으로, 전월보다 8% 늘었습니다. 늘어난 몫의 60%는 10월에 시작한 연 결제 요금제에 따른 것입니다. Pro에서 Business로 올린 워크스페이스도 14개 있어, 좌석 수가 늘고 있습니다. 한편 Free에서 Pro로 옮기는 비율은 0.4%포인트 내려갔으므로, 체험 기간 안내를 재검토할 여지가 있습니다.',
  placeholder: '질문 입력',
  note: 'AI의 답변은 틀릴 수 있습니다. 중요한 수치는 원본 데이터로 확인해 주세요.',
  comments: {
    stream: '견본에서는 정해진 답변을 조금씩 더해 흘려보내며 쓴다. 실제로는 도착한 만큼 content를 늘리고, 다 쓰면 streaming을 뗀다',
  },
} satisfies typeof ja;
