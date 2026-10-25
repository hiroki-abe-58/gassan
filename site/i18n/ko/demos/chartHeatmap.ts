import type ja from '../../ja/demos/chartHeatmap';

export default {
  locale: 'ko-KR',
  label: '요일·시간대별 이용',
  description: '평일 오전 10시대와 오후 2시대에 많고, 주말은 평일의 30~40% 수준. 점검은 일요일 밤에 잡는다.',
  sessions: '세션',
  comments: {
    intl: '요일과 시각은 Intl로, 보는 사람의 언어 표기에 맞춘다(“월”, “오전 10시”와 “Mon”, “10 AM”)',
    monday: '행은 월요일(2026-10-05)부터 일요일까지, 열은 오전 6시부터 오후 11시까지',
  },
} satisfies typeof ja;
