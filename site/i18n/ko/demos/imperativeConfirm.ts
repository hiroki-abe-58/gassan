import type ja from '../../ja/demos/imperativeConfirm';

export default {
  logoutTitle: '로그아웃할까요?',
  logout: '로그아웃',
  callOne: 'confirm 호출',
  firstTitle: '첫 번째: 알림을 끌까요?',
  secondTitle: '두 번째: 탈퇴 확인',
  consent: '내용을 이해했습니다',
  secondLog: '두 번째 → {0}',
  callTwo: '2개 동시에 호출',
  comments: {
    host: '앱의 루트에 <ModalHost />를 하나 둘 것(이 사이트에서는 App.tsx에 두었다).',
    queue: '동시에 2개를 호출해도 한 장씩 차례로 나온다(L-14)',
  },
} satisfies typeof ja;
