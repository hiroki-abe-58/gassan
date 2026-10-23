import type ja from '../../ja/demos/commandMenu';

export default {
  open: '명령 팔레트 열기',
  placeholder: '페이지나 작업 검색',
  pages: '페이지',
  actions: '작업',
  home: '홈',
  homeDescription: '대시보드와 최근 활동',
  members: '멤버',
  billing: '요금제와 결제',
  settings: '설정',
  settingsDescription: '프로필·비밀번호·2단계 인증',
  invite: '멤버 초대',
  project: '프로젝트 만들기',
  export: '데이터 내보내기',
  exportDescription: 'Pro 요금제에서 사용할 수 있습니다',
  ran: '“{0}”을(를) 선택했습니다',
  comments: {
    hotkey: '이 사이트의 검색이 ⌘K를 쓰므로, 견본은 버튼으로 연다(hotkey={false}). 앱에서는 hotkey를 생략하면 ⌘K / Ctrl+K로 열린다',
  },
} satisfies typeof ja;
