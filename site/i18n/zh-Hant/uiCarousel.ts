import type ja from '../ja/uiCarousel';

export default {
  lead: '橫向切換呈現公告與客戶案例的元件。用手指或觸控板可以直接滑動切換，也可以用「上一項」「下一項」、圓點與自動播放切換。自動播放時，停止按鈕放在最前面，指標停在上方或焦點位於其中時會暫停。',
  news: {
    title: '公告（自動播放）',
    intro: '一次大幅顯示一張。以 autoplay 每 6 秒切換一次，到最後一張後回到第一張。目前圓點上逐漸伸長的線條，表示切換到下一張之前的剩餘時間。',
    exampleTitle: '公告輪播',
    exampleDescription: '可以用左上角的按鈕停止自動播放。指標停在上方時與焦點位於其中時也會暫停，離開後從停下的地方繼續計時。',
  },
  cases: {
    title: '客戶案例（並排顯示多張）',
    intro: '傳入 minSlideWidth 後，會並排顯示容器寬度所能容納的張數。圓點的數量與可以排在最前面的位置數相同。',
    exampleTitle: '客戶案例',
    exampleDescription: '把畫面寬度縮窄後，會變成一次一張。全部都看得到時，既不顯示「上一項」「下一項」，也不顯示圓點。',
  },
  rules: {
    title: '自動播放停止的情況',
    intro: '持續移動的內容，還沒讀完就會消失。依照 WCAG 2.2.2，提供了停止的方法，也訂定了停止的時機。',
    tableCaption: '自動播放停止的情況',
    head: { when: '情況', then: '之後' },
    rows: [
      { when: '按下停止按鈕', then: '在按下開始按鈕之前不再切換' },
      { when: '指標停在上方', then: '移開後，從停下的地方繼續計時' },
      { when: '焦點位於其中', then: '焦點移出後，從停下的地方繼續計時' },
      { when: '分頁被隱藏', then: '回來後，從停下的地方繼續計時' },
      { when: '「減少動態效果」設定', then: '以停止的狀態開始（可用開始按鈕讓它播放）' },
      { when: '最後一張投影片（loop={false}）', then: '在那裡停止' },
    ],
  },
  access: {
    title: '朗讀與鍵盤',
    intro: '輪播是具備名稱與「輪播」這個角色說明的區域，投影片具備「第 1 項，共 5 項」（或 label）這樣的名稱。位置改變時會朗讀。自動切換期間不朗讀。',
    tableCaption: '輪播的鍵盤操作',
    head: { key: '按鍵', action: '動作' },
    rows: [
      { key: 'Tab', action: '依序停在停止按鈕 → 投影片中的連結與按鈕 → 上一項 → 目前的圓點 → 下一項' },
      { key: 'Enter / Space（上一項、下一項）', action: '移到相鄰的投影片。在兩端時無法按下（使用 loop 時會轉到另一端）' },
      { key: '← / →（圓點）', action: '移到相鄰的圓點，並把該投影片放到最前面' },
      { key: 'Home / End（圓點）', action: '移到第一個圓點、最後一個圓點' },
    ],
  },
  codeCaption: '用法',
  code: "import { Carousel } from '@genelab/gassan';\n\n<Carousel\n  label=\"公告\"\n  autoplay\n  items={[\n    { id: 'dashboard', label: '全新儀表板', content: <NewsSlide /> },\n    { id: 'invoices', label: '批次下載帳單', content: <NewsSlide /> },\n  ]}\n/>",
  a11yCaption: '輪播的行為',
} satisfies typeof ja;
