import type ja from '../ja/uiData';

export default {
  lead: '페이지 헤더와 데이터 표. 목록 화면은 “제목·작업·필터·표·페이지 이동”으로 이루어지며, 표는 정렬과 행 선택까지 맡는다.',
  example: {
    title: '조합한 견본',
    intro: '멤버 목록. 페이지 헤더에 주요 작업을 하나 두고, 이름으로 찾고, 표에서 정렬과 선택을 한다. 행의 “…”에서 상세 정보를 열면 옆에서 나오는 패널(placement="end")에 표시되어, 목록을 보면서 확인할 수 있다.',
    exampleTitle: '멤버',
    exampleDescription: '열 제목을 누르면 정렬되고, 그 결과를 읽어 준다. 행을 선택하면 선택한 개수와 일괄 작업이 표 위에 나타난다.',
  },
  pageHeader: {
    title: '페이지 헤더',
    intro: '경로·제목·설명·작업을 이 순서로 늘어놓는다. 테두리나 바탕색이 아니라 제목의 크기와 여백으로 나타낸다. 컨테이너가 좁아지면 작업은 제목 아래로 내려간다.',
  },
  table: {
    title: '데이터 표',
    intro: 'table 요소 그대로 그리며, caption을 이름으로 삼고 열과 행의 제목을 갖는다. 수와 금액은 끝에 맞춰 정렬해 자릿수를 맞춘다. 행이 없을 때는 문장이나 빈 상태를, 불러오는 중에는 스켈레톤을 보여 준다. 표가 컨테이너보다 넓을 때만 표를 가로로 넘기는 영역에 포커스할 수 있게 된다.',
  },
  labels: {
    full: '경로와 작업',
    narrow: '좁은 컨테이너',
    compact: '촘촘한 행(compact)',
    loading: '불러오는 중',
    empty: '행이 없을 때',
  },
  sample: {
    settings: '설정',
    billing: '청구',
    billingDescription: '요금제·결제 수단·청구서. 청구서는 PDF로 저장할 수 있습니다.',
    download: '청구서 일괄 다운로드',
    changePlan: '요금제 변경',
    invoices: '청구서',
    number: '번호',
    date: '날짜',
    amount: '금액',
    status: '상태',
    paid: '결제 완료',
    due: '미결제',
  },
  codeCaption: '사용법',
  code: "import { DataTable, PageHeader, Button } from '@genelab/gassan';\n\n<PageHeader title=\"멤버\" actions={<Button variant=\"primary\">초대하기</Button>} />\n<DataTable\n  label=\"멤버\"\n  rows={members}\n  getRowId={(m) => m.id}\n  columns={[\n    { key: 'name', header: '이름', cell: (m) => m.name, sortValue: (m) => m.name },\n    { key: 'seats', header: '좌석', cell: (m) => m.seats, sortValue: (m) => m.seats, align: 'end' },\n  ]}\n  selectable\n  bulkActions={(ids) => <Button onClick={() => remove(ids)}>제거</Button>}\n/>",
  a11yCaption: '페이지 헤더와 데이터 표의 동작',
} satisfies typeof ja;
