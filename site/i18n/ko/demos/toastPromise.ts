import type ja from '../../ja/demos/toastPromise';

export default {
  succeed: '저장하기(성공)',
  fail: '저장하기(실패)',
  loading: '저장하는 중…',
  success: '저장했습니다',
  error: '저장하지 못했습니다: {0}',
  reason: '서버가 응답하지 않습니다',
  comments: {
    promise: '처리하는 동안 로딩 중을 표시하고, 끝나면 같은 자리에서 바꾼다(N-07)',
  },
} satisfies typeof ja;
