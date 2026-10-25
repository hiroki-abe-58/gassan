import type ja from '../../ja/demos/floatingSignIn';

export default {
  account: '이메일 또는 전화번호',
  accountError: '이메일 주소나 전화번호를 입력하세요',
  password: '비밀번호',
  submit: '계속',
  comments: {
    floating: 'labelPlacement="floating"으로 레이블을 입력란 안에 둔다. 포커스나 값이 있으면 왼쪽 위로 줄어들며 비켜난다(I-24)',
    password: 'PasswordInput도 마찬가지. 표시 전환 위로는 레이블을 늘이지 않는다',
  },
} satisfies typeof ja;
