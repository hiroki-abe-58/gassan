import type ja from '../../ja/demos/chartPareto';

export default {
  label: '문의 유형',
  description: '로그인·청구·사용법 3가지가 80%를 넘는다. 먼저 이 3가지의 도움말부터 고친다.',
  count: '건수',
  login: '로그인 불가',
  billing: '청구와 결제',
  howTo: '사용법',
  bug: '오류',
  cancel: '해지',
  other: '기타',
  comments: {
    other: 'other는 크기순으로 정렬하지 않고 맨 뒤에 둔다',
  },
} satisfies typeof ja;
