import type ja from '../../ja/demos/rangeReport';

export default {
  open: '보고서 내보내기',
  title: '보고서 내보내기',
  period: '기간',
  periodHelp: '시작일과 종료일을 선택하세요',
  format: '형식',
  cancel: '취소',
  submit: '내보내기',
  comments: {
    presets: '자주 쓰는 기간은 commonDateRanges로 만든다. 이름은 labels.rangePreset에서 가져온다(I-17)',
  },
} satisfies typeof ja;
