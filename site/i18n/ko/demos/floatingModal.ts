import type ja from '../../ja/demos/floatingModal';

export default {
  open: '로그인 열기',
  title: 'Atlas에 로그인',
  account: '이메일 또는 전화번호',
  password: '비밀번호',
  cancel: '취소',
  submit: '로그인',
  comments: {
    modal: '모달 안에서도 마찬가지. Modal.Field에 labelPlacement="floating"을 넘긴다',
  },
} satisfies typeof ja;
