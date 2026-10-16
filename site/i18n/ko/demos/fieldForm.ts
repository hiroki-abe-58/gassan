import type ja from '../../ja/demos/fieldForm';

export default {
  planFree: '무료',
  planPro: '프로(월 980엔)',
  emailError: '올바른 이메일 주소를 입력하세요(@ 포함)',
  open: '멤버 초대',
  title: '멤버 초대',
  alert: '입력 내용을 확인하세요({0}건)',
  email: '이메일 주소',
  emailHelp: '초대 메일이 발송됩니다',
  plan: '요금제',
  seats: '좌석 수',
  seatsHelp: '{0}석',
  cancel: '취소',
  submit: '초대하기',
  comments: {
    summary: '전송 실패 요약은 한 곳에. 포커스는 첫 번째 오류 항목으로(B-09)',
    field: '입력 하나는 Modal.Field. 레이블·도움말·오류의 연결을 맡는다(B-08)',
    group: '선택지 그룹은 label이 아니라 fieldset / legend로 이름을 붙인다',
    native: 'range도 date도 다시 만들지 않고 네이티브를 감싸기만 한다',
  },
} satisfies typeof ja;
