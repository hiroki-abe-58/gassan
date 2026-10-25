import type ja from '../../ja/demos/registrationIdentity';

export default {
  regime: '업종(근거 법령)',
  aml: '은행·증권 등',
  telecom: '휴대전화',
  reuse: '매입',
  matching: '매칭',
  day: '사용일',
  before: '2027년 3월 31일까지',
  after: '2027년 4월 1일부터',
  comments: {
    regime: '쓸 수 있는 방법은 근거 법령으로 정해진다',
    day: '날짜를 넘기면 그날 이미 쓸 수 없는 방법은 보여 주지 않는다(기본은 오늘)',
  },
} satisfies typeof ja;
