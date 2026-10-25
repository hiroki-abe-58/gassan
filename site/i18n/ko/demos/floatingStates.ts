import type ja from '../../ja/demos/floatingStates';

export default {
  name: '표시 이름',
  nameValue: '김민준',
  email: '이메일 주소',
  emailValue: 'aoi@',
  emailError: '이메일 주소 형식으로 입력하세요',
  workspace: '워크스페이스 URL',
  workspaceValue: 'atlas-design',
  workspaceHelp: '만든 뒤에는 바꿀 수 없습니다',
  reset: '처음 값으로 되돌리기',
  comments: {
    reset: 'form.reset()으로 빈 값이나 처음 값으로 돌아가면, 레이블도 그에 맞춰 움직인다(제어하는 값은 onReset에서 되돌린다)',
    initial: 'defaultValue가 있으면 첫 렌더링부터 뜬 모양으로 나온다(서버에서 렌더링해도 같다)',
    error: '오류는 입력란 아래에 표시하고, 레이블도 빨갛게 한다. 연결(aria-invalid / aria-describedby)은 레이블을 위에 둘 때와 같다',
    disabled: '사용할 수 없는 입력란은 테두리와 레이블을 함께 흐리게 한다',
  },
} satisfies typeof ja;
