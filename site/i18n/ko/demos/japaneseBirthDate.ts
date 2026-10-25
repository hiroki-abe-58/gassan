import type ja from '../../ja/demos/japaneseBirthDate';

export default {
  label: '생년월일',
  help: '주류는 만 20세 이상만 구매할 수 있습니다',
  underage: '만 20세 미만은 신청할 수 없습니다',
  comments: {
    age: '만 나이로 조건을 확인한다(생일에 1 늘어난다)',
  },
} satisfies typeof ja;
