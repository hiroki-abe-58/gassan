import type ja from '../../ja/demos/scrollCustom';

export default {
  looks: { thin: '얇게', standard: '기본', thick: '두껍게·모서리 각지게', accent: '강조색' },
  items: ['받은편지함', '임시보관함', '보낸편지함', '별표편지함', '예약 발송', '보관함', '스팸함', '휴지통', '청구서', '채용', '외부', '나중에 읽기'],
  comments: {
    looks: '모양은 커스텀 프로퍼티로 바꾼다(컨테이너나 그 바깥쪽에 쓰면 안쪽의 바가 따른다)',
    always: '차이가 보이도록 여기서는 항상 표시한다',
  },
} satisfies typeof ja;
