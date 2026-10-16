import type ja from '../../ja/demos/quickStart';

export default {
  open: '열기',
  title: '프로필 편집',
  name: '표시 이름',
  cancel: '취소',
  save: '저장하기',
  comments: {
    alwaysMounted: '항상 마운트하고 open으로 열고 닫는다. {open && <Modal.Root />}라고 쓰면 퇴장 애니메이션을 그릴 수 없다',
  },
} satisfies typeof ja;
