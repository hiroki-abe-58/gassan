import type ja from '../ja/uiFeedback';

export default {
  lead: '진행률 막대, 스피너, 불러오기 전의 스켈레톤, 페이지 위의 알림 배너. 모두 “지금 무슨 일이 일어나고 있는지”를 눈과 스크린 리더 양쪽에 전한다.',
  progress: {
    title: '진행률',
    intro: 'role="progressbar"에 이름과 값을 갖게 한다. 값은 기본으로 비율을 읽어 주며, valueText로 “12 / 20 GB”처럼 쓸 수도 있다. 값을 알 수 없을 때는 선이 흐른다.',
  },
  spinner: {
    title: '스피너',
    intro: '짧은 기다림에. role="status"로 “처리 중”을 한 번만 읽어 주고, 고리는 장식으로 둔다. “동작 줄이기” 설정에서는 회전을 느리게 한다.',
  },
  skeleton: {
    title: '스켈레톤',
    intro: '불러오기 전에 모양만 보여 주어, 나타날 때의 흔들림을 줄인다. 장식이므로 읽어 주지 않는다. 불러오는 중이라는 것은 감싸는 컨테이너의 aria-busy나 스피너로 전한다. 빛이 흐르는 움직임은 “동작 줄이기” 설정과 움직임 단계 none에서는 멈춘다.',
  },
  notifications: {
    title: '알림 목록',
    intro: '상단 바의 종 모양 버튼으로 여는, 도착한 알림의 목록. 버튼 이름에 읽지 않은 개수를 포함하고(개수 배지는 장식), 읽지 않은 알림은 굵은 글씨와 점으로도 나타낸다. 도착한 시각은 “5분 전”, “어제”처럼 쓰고, 누르면 읽음으로 표시할 수 있다.',
    exampleTitle: '알림',
    exampleDescription: '종 모양 버튼을 누르면 목록이 열린다. 항목을 누르면 읽음으로 바뀌고, “모두 읽음으로 표시”로 나머지도 한꺼번에 읽음으로 바꾼다. Esc로 닫으면 포커스가 종 모양 버튼으로 돌아가고, 바깥을 눌러도 닫힌다.',
  },
  checklist: {
    title: '시작하기 체크리스트',
    intro: '가입한 뒤 쓰기 시작하기 위한 단계를 늘어놓는다. “4개 중 1개 완료” 같은 진행 상황을 두고, 끝낸 단계는 표시를 체크 표시로 바꾼다. 읽어 주는 내용에는 “완료”, “미완료”를 덧붙여, 표시와 색에만 기대지 않는다.',
    exampleTitle: '시작하기',
    exampleDescription: '단계의 버튼을 누르면 그 단계가 끝나고, 다음 단계의 버튼으로 포커스가 옮겨 간다. 오른쪽 위의 ×로 닫을 수 있다.',
  },
  banner: {
    title: '배너',
    intro: '점검 예고·결제 실패·체험 기간의 남은 날짜처럼 페이지 전체에 관련된 알림. 은은한 바탕색으로 본문과 구분하고, 테두리나 왼쪽의 굵은 선으로 감싸지 않는다. 나중에 표시할 때만 live로 읽어 준다.',
  },
  labels: {
    value: '값 있음',
    custom: '값 표기 바꾸기',
    small: '가늘게(sm)',
    indeterminate: '값을 알 수 없음',
    sizes: '크기',
    text: '문장 스켈레톤',
    card: '카드 스켈레톤',
  },
  sample: {
    upload: '업로드',
    storage: '저장 용량',
    storageText: (used: number, max: number): string => `${String(used)} / ${String(max)} GB`,
    sync: '동기화',
    preparing: '내보내기를 준비하고 있습니다',
    maintenanceTitle: '점검 안내',
    maintenance: '10월 24일(토) 2:00~4:00에는 서비스를 중단합니다.',
    paymentTitle: '결제에 실패했습니다',
    payment: '등록된 카드로 결제하지 못했습니다. 카드를 업데이트해 주세요.',
    update: '카드 업데이트',
    trial: '체험 기간이 5일 남았습니다.',
    upgrade: '요금제 선택',
    saved: '설정을 저장했습니다.',
  },
  code: "import { Progress, Spinner, Skeleton, Banner } from '@genelab/gassan';\n\n<Progress label=\"저장 용량\" value={12} max={20} valueText={(v, m) => `${v} / ${m} GB`} />\n\n<Spinner label=\"동기화하고 있습니다\" />\n\n<div aria-busy={loading}>{loading ? <Skeleton lines={3} /> : <Article />}</div>\n\n<Banner tone=\"error\" title=\"결제에 실패했습니다\" action={<Button size=\"sm\">카드 업데이트</Button>}>\n  등록된 카드로 결제하지 못했습니다.\n</Banner>",
  codeCaption: '사용법',
  a11yCaption: '진행률과 알림이 충족하는 명세',
} satisfies typeof ja;
