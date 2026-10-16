import type ja from '../ja/gate';

export default {
  lead: '不用 disabled，做出「讀到最後」「勾選之後」「選滿 3 個」才能按的按鈕。按下時，會朗讀還缺什麼，並帶使用者前往該處。',
  consent: {
    title: '讀完與同意',
    intro: 'Modal.Body 的 readGate 與 Modal.Consent 各自註冊一個具名的門控。加上 gate 的按鈕，在全部滿足之前都無法按下。',
    exampleTitle: '服務條款更新',
    exampleDescription: '在閱讀之前試著按「同意並繼續」。理由會被朗讀，內文會往下捲動一個畫面。',
  },
  custom: {
    title: '任意條件',
    intro: '只要把 satisfied 與 reason 傳給 Modal.Gate，任何條件都能成為門控。傳入 focus 的話，被按下時會帶使用者前往該處。',
    exampleTitle: '選擇 3 個以上',
  },
  selector: {
    title: '按鈕要看哪些門控',
    tableLabel: 'gate 的寫法',
    tableCaption: 'gate 的寫法，以及註冊前的狀態',
    head: { code: '寫法', before: '註冊前', meaning: '意義' },
    rows: [
      { code: 'gate / gate={true}', before: '關閉', meaning: '查看所有已註冊的門控。在註冊齊備之前是「還不知道」' },
      { code: "gate={['terms']}", before: '關閉', meaning: '以名稱指定。未註冊的名稱視為未滿足' },
      { code: 'gate={[]}', before: '開啟', meaning: '已確定沒有任何條件，沒有等待的理由' },
    ],
    body: [
      '門控在子元件的 effect 中註冊。伺服器端不會執行 effect，用戶端在第一次渲染時也還沒執行。在這段空窗期，註冊表是空的，但這代表的是「還不知道」，而不是「沒有條件」。因此加上 `gate` 的按鈕，在伺服器端的標記中也會以 `aria-disabled="true"` 輸出，掛載後才換成實際的條件。伺服器端與首次渲染一致，所以 hydration 也不會出現差異（G-12）。',
    ],
  },
  rules: {
    title: '不能作為門控的條件',
    callout:
      '不要做「等 N 秒後才能按」（WCAG 2.2.1）。不要只以「捲動位置到達末端」來判定（虛擬游標的使用者會永遠無法前進）。可以製造無法按下狀態的，只有表單的有效性、明確的同意，以及法律上必要的閱讀。',
    codeCaption: '被按下時會發生的事',
    code: '// 1. 以 role="status" 的即時區域朗讀理由（G-07）\n// 2. 帶使用者前往卡住的地方（G-08）\n//    未讀完的話，把內文往下捲動一個畫面。不要一口氣捲到底（門控就失去意義）\n//    未勾選的話，把焦點移到核取方塊\n// 3. 不呼叫 onClick',
  },
  a11yCaption: '啟用門控的規格',
} satisfies typeof ja;
