import type ja from '../../ja/demos/choiceForm';

export default {
  open: '알림 설정',
  title: '알림 설정',
  channels: '알림 방법',
  channelsHelp: '하나 이상 선택하세요',
  all: '전체',
  mail: '이메일',
  push: '푸시 알림',
  sms: 'SMS',
  frequency: '빈도',
  now: '즉시',
  nowNote: '일이 생기면 그때마다 한 통씩',
  daily: '하루 한 번',
  dailyNote: '아침 8시에 모아서',
  theme: '메일 테마',
  light: '라이트',
  dark: '다크',
  auto: '기기 설정에 맞춤',
  rating: '이 화면의 사용 편의성',
  cancel: '취소',
  save: '저장',
  comments: {
    group: '선택지 그룹은 Fieldset. legend가 그룹의 이름, help는 그룹의 설명이 된다(I-09)',
    mixed: '일부만 선택되었을 때는 indeterminate(읽어 주기는 mixed)',
  },
} satisfies typeof ja;
