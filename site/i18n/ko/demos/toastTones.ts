import type ja from '../../ja/demos/toastTones';

export default {
  success: '성공',
  saved: '저장했습니다',
  savedDetail: '변경 사항은 팀원 모두에게 보입니다.',
  info: '정보',
  update: '새 버전이 있습니다',
  warning: '주의',
  storage: '저장 공간이 얼마 남지 않았습니다',
  storageDetail: '2% 남았습니다. 오래된 파일을 정리해 주세요.',
  error: '실패',
  failed: '보내지 못했습니다',
  failedDetail: '연결이 끊겼습니다. 다시 시도해 주세요.',
  neutral: '아이콘 없음',
  copied: '링크를 복사했습니다',
  comments: {
    tones: '톤에 따라 아이콘과 색이 바뀐다. 색은 아이콘과 미터에만 입힌다(N-02)',
  },
} satisfies typeof ja;
