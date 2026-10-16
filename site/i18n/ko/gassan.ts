/**
 * gassan이 내보내는 문자열(닫기·읽어 주기·게이트의 이유 등). 한국어는 사이트에서 번역한다.
 */
import type { GassanLabels } from '@genelab/gassan';

const labels: GassanLabels = {
  close: '닫기',
  back: '뒤로',
  previous: '이전',
  next: '다음',
  body: '본문',
  expandTitle: '제목 전체 보기',
  collapseTitle: '제목 접기',
  endOfContent: '본문의 끝입니다.',
  blocked: '이 대화 상자는 아직 닫을 수 없습니다. 내용을 확인하고 작업을 완료해 주세요.',
  unreadReason: '본문을 끝까지 읽어 주세요.',
  unconsentedReason: '내용에 동의하면 다음으로 진행할 수 있습니다.',
  unresolvedReason: '이 작업에는 아직 충족되지 않은 조건이 있습니다.',
  loading: '처리 중',
  cancel: '취소',
  ok: '확인',
  required: '필수',
  optional: '선택',
  step: (current, total) => `${total}단계 중 ${current}단계`,
  galleryPosition: (current, total) => `${total}개 중 ${current}번째`,
  chartData: '원본 데이터 보기',
  sheetHandle: '시트 높이 조절',
  detent: (token) => ({ peek: '최소', half: '중간', full: '최대' })[token],
  detentChanged: (name) => `시트 높이: ${name}`,
};

export default labels;
