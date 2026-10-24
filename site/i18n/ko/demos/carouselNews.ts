import type ja from '../../ja/demos/carouselNews';

export default {
  label: '공지사항',
  dashboardTitle: '새로운 대시보드',
  dashboardBody: '매출·가입·사용률을 한 화면에. 그래프의 점은 키로 따라가며 값을 읽어 줄 수 있다.',
  dashboardAction: '살펴보기',
  invoicesTitle: '청구서 일괄 다운로드',
  invoicesBody: '고른 달의 청구서를 ZIP 하나로. 회계팀에 넘기는 일이 한 번으로 끝난다.',
  invoicesAction: '사용법 보기',
  invitesTitle: '멤버 일괄 초대',
  invitesBody: '이메일 주소를 붙여 넣기만 하면 된다. 역할도 그 자리에서 정할 수 있다.',
  invitesAction: '초대하기',
  comments: {
    autoplay: '6초마다 넘긴다. 정지 버튼은 맨 앞에 놓이고, 포인터가 올라가 있거나 포커스가 안에 있는 동안에도 멈춘다',
  },
} satisfies typeof ja;
