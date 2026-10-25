import type ja from '../../ja/demos/chatBot';

export default {
  show: '오른쪽 아래에 챗봇 띄우기',
  hide: '챗봇 치우기',
  title: 'Atlas 어시스턴트',
  description: 'AI가 답변합니다. 담당자에게 연결해 드릴 수도 있습니다',
  greeting: '안녕하세요. 요금이나 요금제에 관해 무엇이든 물어보세요',
  hello: '무엇을 도와드릴까요?',
  plans: 'Pro와 Max의 차이는?',
  plansDescription: '사용량과 저장 용량으로 비교',
  invoice: '청구서 결제로 하고 싶어요',
  invoiceDescription: '연 결제와 Enterprise에 관해',
  human: '담당자와 이야기하고 싶어요',
  humanDescription: '평일 10:00~18:00',
  placeholder: '메시지 입력',
  me: '나',
  bot: '어시스턴트',
  answer:
    'Max는 Pro의 모든 기능에 더해 사용량 한도가 Pro의 5배, 저장 용량이 1 TB인 요금제입니다. 거의 매일 많이 쓰는 팀에 알맞습니다. 월 요금은 사용자 1명당 ¥5,000이며, 연 결제로 하면 2개월분을 아낄 수 있습니다. 언제든지 Pro와 Max 사이를 오갈 수 있고, 차액은 일할 계산으로 정산합니다.',
  comments: {
    stream: '답변을 조금씩 흘려보내며 보여 준다(실제로는 서버에서 도착한 만큼 더해 간다)',
    place: '플로팅 버튼은 화면 오른쪽 아래에 고정된다. 누르면 오른쪽 아래에 작은 창이 열리고, 헤더의 버튼으로 오른쪽 패널로 넓힐 수 있다',
  },
} satisfies typeof ja;
