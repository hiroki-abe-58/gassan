import type ja from '../../ja/demos/textForm';

export default {
  open: '계정 만들기',
  title: '계정 만들기',
  name: '표시 이름',
  password: '비밀번호',
  passwordHelp: '8자 이상',
  bio: '자기소개',
  bioPlaceholder: '하는 일이나 관심 있는 것',
  seats: '좌석 수',
  seatsHelp: '나중에 늘릴 수 있습니다',
  seatsUnit: '석',
  code: '인증 코드',
  codeHelp: '이메일로 받은 6자리 숫자',
  cancel: '취소',
  submit: '등록하기',
  comments: {
    password: '표시 전환은 aria-pressed 토글. 문구는 하나로 충분하다(I-04)',
    counter: 'maxLength를 넘기면 “n / 140”을 표시하고, 설명으로 연결한다(I-06)',
    code: '입력란은 하나. 상자는 보이기만 하므로 SMS 자동 입력과 붙여넣기가 동작한다(I-08)',
  },
} satisfies typeof ja;
