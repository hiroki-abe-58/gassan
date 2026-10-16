import type ja from '../ja/layers';

export default {
  lead: '모달 구현은 4개의 레이어로 나눌 수 있다. 레이어를 섞으면 반드시 무너진다. gassan의 설계는 모두 이 구분에서 나온다.',
  model: {
    title: '레이어와 각각의 정답',
  },
  effort: {
    title: '노력의 90%를 어디에 쓸 것인가',
    callout:
      '많은 모달 구현이 만족스럽지 않은 원인은 레이어 1과 레이어 2에 노력의 90%를 쓰고, 레이어 4에는 10%밖에 쓰지 않는 데 있다. 레이어 1은 이미 해결되었다.',
    body: [
      '`showModal()`을 호출하면 top layer로의 승격·배경의 inert 처리·포커스 가두기·Esc·포커스 복귀를 브라우저가 해 준다. gassan은 이것을 **한 줄도 다시 구현하지 않았다**. 다시 구현하는 순간 이 라이브러리의 존재 이유가 사라지기 때문이다.',
      '남은 손으로 레이어 4를 한다. 이름 연결, 스크롤 영역의 이름, 게이트와 이유 읽어 주기, 닫기 이유의 분류, 푸터의 순서. 라이브러리가 대신 풀어 주지 않는, 진짜 설계 작업이다.',
    ],
  },
  premise: {
    title: '전제가 바뀌었다',
    intro: 'AI의 학습 데이터에는 2022년 이전의 모달 구현이 대량으로 포함되어 있다. 다음 3가지 점에서 그 전제는 이미 낡았다.',
    tableCaption: '예전의 전제와 현재의 전제',
  },
  core: {
    title: '구현의 핵심',
    intro: '퇴장 애니메이션이 성립하는 최소 구성. CSS가 중심이 되고, JS는 “기다렸다가 close()한다”만 맡는다.',
    cssCaption: 'modal.skill.md §7(CSS)',
    tsxCaption: 'modal.skill.md §7(열기·닫기 동기화)',
  },
} satisfies typeof ja;
