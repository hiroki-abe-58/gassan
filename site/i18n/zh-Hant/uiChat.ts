import type ja from '../ja/uiChat';

export default {
  lead: '既能用於人與人之間的聊天，也能用於與 AI 對話的元件，包括訊息列表、輸入欄位、輸入中提示與範例問題。往上翻閱時不會移動閱讀位置，也不會把日文輸入法組字中的 Enter 誤當成傳送。',
  team: {
    title: '團隊聊天',
    intro: '自己的訊息以強調色顯示在右側，對方的訊息顯示在左側。同一個人連續傳送的訊息，不會重複顯示頭像與名字。',
    exampleTitle: '與陳怡君的對話',
    exampleDescription: '傳送後會從「傳送中」變為「已讀」，並在輸入中提示之後收到回覆。若在往上捲動時收到訊息，會以「新訊息」按鈕提示。',
  },
  assistant: {
    title: '與 AI 對話',
    intro: 'AI 的回答不放進氣泡，而是作為內文以全寬顯示。可以從範例問題開始，正在寫回答時可以停止。',
    exampleTitle: 'AI 助理',
    exampleDescription: '按下範例問題後，回答會以串流方式邊寫邊顯示。撰寫期間，傳送按鈕會變成「停止」。回答寫完之後才會朗讀。',
  },
  widget: {
    title: '網站右下角的聊天機器人',
    intro: 'ChatWidget 會在畫面右下角放置圓形的浮動按鈕，按下後在右下角開啟小視窗。小視窗不是模態的，所以可以一邊閱讀頁面一邊對話。用標題列的按鈕可以展開成右側面板（模態），在手機寬度下則會變成全螢幕的底部面板。內容直接使用上方的 ChatThread 與 ChatComposer。',
    exampleTitle: 'AI 助理聊天機器人',
    exampleDescription: '按下按鈕後，本頁右下角會出現浮動按鈕與問候語。按下浮動按鈕並選擇範例問題，回答會以串流方式邊寫邊顯示。「展開到右側」與「縮小」是標題列右側的按鈕。',
    tableCaption: '聊天機器人的開啟與關閉',
    head: { when: '情況', then: '結果' },
    rows: [
      { when: '按下浮動按鈕', then: '右下角的小視窗開啟，焦點移到輸入欄位。浮動按鈕的名稱變為「關閉聊天」' },
      { when: '有未讀訊息', then: '在浮動按鈕上顯示數字徽章，名稱變為「開啟聊天 3 則未讀」（數字徽章只是裝飾）' },
      { when: '按下 Esc 或「關閉聊天」', then: '關閉，並把焦點移回浮動按鈕（內部的清單或選單已經處理了 Esc 時，以及輸入法組字中的 Esc，不會關閉）' },
      { when: '按下「展開到右側」', then: '移到右側面板（模態）。後方的頁面變得無法操作，關閉後回到浮動按鈕' },
      { when: '手機寬度', then: '變成全螢幕的底部面板（若是小視窗，輸入欄位會與螢幕鍵盤重疊）' },
      { when: '問候語', then: '只在關閉期間顯示在浮動按鈕旁。按下即開啟，按 × 即消失（不會插入朗讀）' },
    ],
  },
  behavior: {
    title: '讓人能繼續讀下去的規則',
    intro: '聊天的內容會在閱讀途中持續增加。為了守住讀者的閱讀位置與朗讀，元件的行為如下。',
    tableCaption: '聊天元件的規則',
    head: { when: '情況', then: '如何處理' },
    rows: [
      { when: '收到新訊息', then: '若正在看最底部，就跟著捲動。若正在閱讀上方的內容，就不移動位置，並以「3 則新訊息」按鈕提示' },
      { when: '載入了較早的訊息', then: '保持原本的閱讀位置（即使在上方加入訊息，正在看的那一行也不會移動）' },
      { when: '正在用輸入法輸入日文', then: '組字中的 Enter 用於確認輸入，不會傳送' },
      { when: '在觸控裝置上輸入', then: 'Enter 用於換行（螢幕鍵盤沒有 Shift 鍵）。用傳送按鈕傳送，也不顯示按鍵提示' },
      { when: 'AI 正在寫回答', then: '設為 aria-busy，寫完之後才朗讀。傳送按鈕會變成「停止」' },
      { when: '對方正在輸入', then: '以文字傳達「陳怡君 正在輸入」，並放在訊息列表之外（不會在每次出現或消失時朗讀）' },
    ],
  },
  access: {
    title: '朗讀與鍵盤',
    intro: '訊息列表是 role="log"，會朗讀新增的訊息。每則訊息是以「名字 時間」為名稱的 article，時間使用 time 元素。',
    tableCaption: '聊天元件的鍵盤操作',
    head: { key: '按鍵', action: '動作' },
    rows: [
      { key: 'Tab', action: '依序停在訊息列表 → 輸入欄位 → 傳送按鈕。在訊息列表中可以用 ↑↓ 捲動' },
      { key: 'Enter', action: '傳送（空白內容不傳送）' },
      { key: 'Shift+Enter', action: '換行' },
      { key: 'Ctrl+Enter / ⌘+Enter', action: '在 sendOn="mod+enter" 時傳送（Enter 換行）' },
    ],
  },
  codeCaption: '用法',
  code: "import { ChatComposer, ChatThread } from '@genelab/gassan';\n\n<ChatThread\n  label=\"與陳怡君的對話\"\n  messages={messages}\n  currentUserId={me.id}\n  unreadFrom={firstUnreadId}\n  typing={typingUsers}\n/>\n<ChatComposer onSend={(text) => send(text)} placeholder=\"輸入訊息\" />",
  a11yCaption: '聊天元件的行為',
} satisfies typeof ja;
