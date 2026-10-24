import type ja from '../ja/uiData';

export default {
  lead: '頁面標題列與資料表格。清單畫面由「標題、操作、篩選、表格、分頁」組成，表格本身就具備排序與選取列的功能。',
  example: {
    title: '組合範例',
    intro: '成員清單。在標題列放一個主要操作，依姓名搜尋，在表格中排序與選取。從每一列的「…」開啟詳細資料，會顯示在從側邊滑出的面板（placement="end"）中，可以一邊看清單一邊確認。',
    exampleTitle: '成員',
    exampleDescription: '點擊欄標題即可排序，並會朗讀排序結果。選取列之後，表格上方會出現已選取的數量與批次操作。',
  },
  pageHeader: {
    title: '頁面標題列',
    intro: '依路徑、標題、說明、操作的順序排列。不靠外框或底色，而以標題的大小與留白呈現。容器變窄時，操作會移到標題下方。',
  },
  table: {
    title: '資料表格',
    intro: '直接以 table 元素繪製，以 caption 作為名稱，具備欄標題與列標題。數字與金額靠尾端對齊，並讓位數對齊。沒有資料列時顯示一句說明或空狀態，載入中則顯示骨架屏。只有在表格比容器寬時，橫向捲動表格的區域才能取得焦點。',
  },
  labels: {
    full: '路徑與操作',
    narrow: '狹窄的容器',
    compact: '緊湊的列（compact）',
    loading: '載入中',
    empty: '沒有資料列時',
  },
  sample: {
    settings: '設定',
    billing: '帳單',
    billingDescription: '方案、付款方式與帳單。帳單可以儲存為 PDF。',
    download: '批次下載帳單',
    changePlan: '變更方案',
    invoices: '帳單',
    number: '編號',
    date: '日期',
    amount: '金額',
    status: '狀態',
    paid: '已付款',
    due: '未付款',
  },
  codeCaption: '用法',
  code: "import { DataTable, PageHeader, Button } from '@genelab/gassan';\n\n<PageHeader title=\"成員\" actions={<Button variant=\"primary\">邀請</Button>} />\n<DataTable\n  label=\"成員\"\n  rows={members}\n  getRowId={(m) => m.id}\n  columns={[\n    { key: 'name', header: '姓名', cell: (m) => m.name, sortValue: (m) => m.name },\n    { key: 'seats', header: '席位', cell: (m) => m.seats, sortValue: (m) => m.seats, align: 'end' },\n  ]}\n  selectable\n  bulkActions={(ids) => <Button onClick={() => remove(ids)}>移除</Button>}\n/>",
  a11yCaption: '頁面標題列與資料表格的行為',
} satisfies typeof ja;
