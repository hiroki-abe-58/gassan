import type ja from '../../ja/demos/kindConsent';

export default {
  open: '약관 확인하기',
  agreed: '동의함',
  title: '이용약관 업데이트',
  articleNumber: '제{0}조',
  article1: '본 서비스는 사용자가 작성한 데이터를 사용자의 허락 없이 제3자에게 제공하지 않는다.',
  article2: '사용자는 언제든지 계정을 삭제할 수 있다. 삭제한 데이터는 30일 후에 복원할 수 없게 된다.',
  article3: '요금 개정은 적용 30일 전까지 통지한다. 통지는 등록된 이메일 주소로 보낸다.',
  article4: '장애로 발생한 손해는 최근 1개월의 이용 요금을 상한으로 보상한다.',
  article5: '본 약관의 개정은 개정 후의 약관을 본 서비스에 게시한 시점에 효력을 가진다.',
  article6: '본 약관에서 정하지 않은 사항은 관련 법령과 일반적인 관행에 따른다.',
  consent: '변경된 약관에 동의합니다',
  decline: '동의하지 않음',
  accept: '동의하고 계속하기',
  comments: {
    noDismiss: 'consent는 Esc로도 배경으로도 닫히지 않는다. 닫으려 하면 흔들리며 이유를 읽어 준다',
    readGate: '완독은 “끝이 보였다 OR 끝에 포커스가 닿았다 OR 스크롤 불필요”(G-03)',
    gate: 'disabled로 하지 않는다. 누르면 “무엇이 부족한지” 읽어 주고, 그곳으로 데려간다(G-07 / G-08)',
  },
} satisfies typeof ja;
