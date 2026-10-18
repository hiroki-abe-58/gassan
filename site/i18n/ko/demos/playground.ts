import type ja from '../../ja/demos/playground';

export default {
  kindDefault: 'kind 기본값({0})',
  esc: 'Esc 키',
  backdrop: '배경 클릭',
  closes: '닫힘',
  refuses: '거부하고 이유를 읽어 줌',
  open: '이 설정으로 열기',
  closedBy: '닫힌 이유: {0}',
  logEmpty: 'Esc·배경·× 중 무엇으로 닫았는지 기록한다',
  description: 'Esc·배경 클릭·× 버튼을 시험해 본다. 닫히지 않는 설정일 때는 패널이 흔들리며 이유를 읽어 준다.',
  done: '완료',
  comments: {
    choice: 'Modal.Select 한 줄. “kind 기본값”을 빈 문자열 value로 나타낸다. <label> 안의 버튼이므로, 레이블의 글자가 그대로 이름이 된다.',
  },
} satisfies typeof ja;
