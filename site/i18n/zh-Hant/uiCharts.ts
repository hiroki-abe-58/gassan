import type ja from '../ja/uiCharts';

export default {
  lead: '能把營收走勢、各方案的註冊數、使用率這類數字直接畫出來的圖表。不增加相依的函式庫，以 SVG 與 HTML 繪製，可以用按鍵逐一瀏覽資料點並朗讀數值。顏色跟隨主題。',
  line: {
    title: '折線圖與面積圖',
    intro: '用於隨時間變化的數字。可以從圖例顯示或隱藏系列，將指標移到某個點上或用按鍵移到該點時，會一併顯示該月的各項數值。',
    exampleTitle: '每月營收與費用',
    exampleDescription: '以 area 填滿線條下方。加上 table 後，可以從下方的「顯示原始資料」開啟表格。',
  },
  bar: {
    title: '長條圖',
    intro: '用於比較各個項目。可以選擇將系列並排或堆疊，負值會從 0 的線往反方向延伸。',
    stackedTitle: '各方案的新註冊數',
    stackedDescription: '以 stacked 堆疊。只有離 0 最遠的那一段，末端才會做成圓角。',
    horizontalTitle: '各功能的使用次數',
    horizontalDescription: '以 layout="horizontal" 改為橫向長條。適合名稱較長的項目。',
  },
  widgets: {
    title: '放在卡片裡的小圖表',
    intro: '放在儀表板卡片裡的 4 種：小型走勢圖（Sparkline）、計量表（Gauge）、環圈圖（DonutChart）、排名長條（BarList）。',
    exampleTitle: '儀表板的卡片',
    exampleDescription: '將指標移到環圈圖的某一段或圖例上時，中間會顯示它的數值與占比。計量表以 role="meter" 讓數值被朗讀。',
  },
  choose: {
    title: '如何選擇',
    intro: '依想呈現的內容來選擇。拿不定主意時就用長條圖。長度比角度或面積更能準確判讀。',
    tableCaption: '如何選擇圖表',
    head: { chart: '元件', when: '適合的數字', avoid: '不適合的數字' },
    rows: [
      { chart: 'LineChart', when: '隨時間變化的數字（營收走勢、使用者人數）', avoid: '順序沒有意義的項目' },
      { chart: 'LineChart（area）', when: '量的走勢與其組成（stacked）', avoid: '超過 4 個系列的比較' },
      { chart: 'BarChart', when: '項目之間的比較、組成（stacked）、增減（負值）', avoid: '點很多的走勢（如 90 天）' },
      { chart: 'DonutChart', when: '占整體的比例（最多 5 個項目）', avoid: '大小相近的項目之間的比較' },
      { chart: 'Sparkline', when: '附在表格或卡片旁的走勢', avoid: '需要讓人準確讀出數值時' },
      { chart: 'BarList', when: '排名（瀏覽次數最多的頁面、流量來源）', avoid: '隨時間的變化' },
      { chart: 'Gauge', when: '有上限的單一數量（使用率、達成率）', avoid: '沒有上限的數量' },
    ],
  },
  access: {
    title: '朗讀與鍵盤',
    intro: '圖表具備名稱（label）與描述主要趨勢的一句話（description）。Tab 只會停在其中一個資料點上，以方向鍵移到相鄰的點時，會一併朗讀該項目與各系列的數值。工具提示只是在視覺上顯示相同的數值，因此不會朗讀。',
    tableCaption: '圖表的鍵盤操作',
    head: { key: '按鍵', action: '動作' },
    rows: [
      { key: 'Tab', action: '進入圖表的資料點（上次停留的點，或第一個點）。再按一次會移到下一個元素' },
      { key: '→ / ↓', action: '移到下一個點。到末端時停住' },
      { key: '← / ↑', action: '移到上一個點' },
      { key: 'Home / End', action: '移到第一個點、最後一個點' },
      { key: 'Enter / Space（圖例）', action: '隱藏或重新顯示系列。剩下的最後一個不會被隱藏' },
    ],
  },
  colors: {
    title: '顏色',
    intro: '系列從 --g-chart-1 開始依序著色。1 跟隨強調色，2〜8 是色相彼此拉開的固定顏色，對表面都有 3:1 以上。為了不只靠顏色傳達系列，圖例、工具提示與朗讀都會附上名稱。',
    listLabel: '系列的顏色',
  },
  codeCaption: '用法',
  code: "import { LineChart } from '@genelab/gassan';\n\nconst rows = [\n  { month: '1月', revenue: 1180000, cost: 820000 },\n  { month: '2月', revenue: 1240000, cost: 850000 },\n  { month: '3月', revenue: 1520000, cost: 900000 },\n];\n\n<LineChart\n  label=\"每月營收與費用\"\n  description=\"營收在 3 月最高\"\n  data={rows}\n  x=\"month\"\n  series={[\n    { key: 'revenue', label: '營收' },\n    { key: 'cost', label: '費用' },\n  ]}\n  valueFormat={{ style: 'currency', currency: 'JPY' }}\n  area\n/>",
  a11yCaption: '圖表的行為',
} satisfies typeof ja;
