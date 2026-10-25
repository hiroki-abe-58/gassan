import type ja from '../../ja/demos/registrationGuardian';

export default {
  note: '미성년자의 계약은 보호자의 동의가 없으면 취소할 수 있다(민법 제5조). 생년월일로 만 18세 미만임을 알게 되었을 때 보여 준다.',
  comments: {
    guardian: '보호자의 이름과 이메일 주소에는 본인 정보가 자동 입력으로 들어가지 않게 해 두었다',
    marketing: '광고 메일 수신 동의는 약관 동의와는 별도의 선택 체크박스. 처음에는 체크하지 않은 상태로 둔다',
  },
} satisfies typeof ja;
