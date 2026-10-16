import type ja from '../ja/lineBreak';

export default {
  lead: '「プロフィールを編｜集」這種斷法，不會再出現。gassan 不會在詞語中間替日文、中文、韓文的字串換行：日文只在文節邊界、中文只在詞語邊界、韓文只在空白處換行。按鈕、標題、表格儲存格、圖表摘要都一樣。',
  compare: {
    title: '以相同寬度比較',
    intro:
      '左邊是交給瀏覽器的結果，右邊是 gassan。兩者用的是同一個函式庫，只有左邊把 lineBreak 切換為 `browser`。請改變範例的語言與寬度，看看會在哪裡換行。',
    language: '範例語言',
    width: (em: string): string => `容器寬度：${em}em`,
    labels: {
      buttons: '按鈕',
      title: '標題',
      table: '表格',
      chart: '圖表摘要',
      tableLabel: '變更紀錄的範例',
    },
    notes: {
      ja: { browser: '逐字換行', phrase: '在文節邊界換行' },
      'zh-Hans': { browser: '在詞語中間斷行', phrase: '在詞語邊界換行' },
      'zh-Hant': { browser: '在詞語中間斷行', phrase: '在詞語邊界換行' },
      ko: { browser: '在詞語（音節序列）中間斷行', phrase: '只在空白處換行' },
      th: { browser: '用字典找出詞語邊界後換行', phrase: '不插手（與瀏覽器相同）' },
      en: { browser: '在空白處換行', phrase: '不插手（與瀏覽器相同）' },
    },
  },
  languages: {
    title: '各語言的處理方式',
    intro:
      '詞語之間不放空白的語言，交給瀏覽器時很容易在詞語中間斷開。但若對所有語言套用相同處理，有些語言反而會壞掉。我們在 Chrome 中把文字放進狹窄的框裡測量換行位置，再為每種語言決定處理方式。',
    caption: '各語言交給瀏覽器時的換行，與 gassan 的處理方式',
    head: { language: '語言', browser: '交給瀏覽器', gassan: 'gassan', why: '理由' },
    rows: [
      {
        language: '日文',
        browser: '逐字換行。「プロフィールを編｜集」「プロフィール｜を編集」',
        gassan: '只在文節邊界換行',
        why: '詞語之間沒有空白，助詞出現在行首時很難閱讀。',
      },
      {
        language: '中文（簡體、繁體）',
        browser: '在詞語中間斷行。「编辑个人资｜料」「保存更改并关｜闭」',
        gassan: '只在詞語邊界換行',
        why: '排版上習慣逐字換行，但在簡短的 UI 字串中，詞語的最後一個字會掉到下一行。',
      },
      {
        language: '韓文',
        browser: '在詞語中間斷行。「프로필 편｜집」「삭제｜하면」',
        gassan: '只在空白處換行',
        why: '詞語本來就以空白分隔，所以不加標記，只替容器加上 `keep-all`。',
      },
      {
        language: '泰文、寮文、高棉文、緬甸文',
        browser: '用字典找出詞語邊界後換行（不會在詞語中間斷開）',
        gassan: '不插手',
        why: '套用 `keep-all` 會連瀏覽器找到的詞語邊界都一併消除，反而在詞語中間斷開（實測）。',
      },
      {
        language: '英文等以空白分隔詞語的語言',
        browser: '在空白處換行',
        gassan: '不插手',
        why: '瀏覽器的換行本來就正確。',
      },
    ],
    note: '不論哪種語言，朗讀的名稱與複製出來的字串都不會改變。判斷依據是字元的種類，所以即使忘了加 `lang` 屬性，行為也相同。',
  },
  modal: {
    title: '在真正的模態視窗中',
    intro: '寬 360px 的模態視窗。取消勾選後就回到交給瀏覽器的換行。',
    exampleTitle: '窄模態視窗的換行',
    exampleDescription: '比較頁尾按鈕、標題與表格儲存格。朗讀出來的名稱在兩種模式下都相同。',
  },
  try: {
    title: '輸入文字試試',
    intro: '可以當場確認會在哪裡斷開。',
    input: '要測試的字串',
    resultLabel: '切分結果',
    split: (count: number): string => `切成了 ${String(count)} 段。只會在這些邊界換行。`,
    single: '只有一個文節（詞語）的字串，不會放置標記。',
    korean: '韓文字母只在空白處換行。gassan 只替容器加上 keep-all，不加標記。',
    untouched: '英文、泰文等語言則不插手。瀏覽器會透過空白或字典找出詞語邊界。',
  },
  how: {
    title: '運作原理',
    steps: [
      {
        title: '判斷字元的種類',
        body: '含有假名就視為日文，含有韓文字母就視為韓文，兩者都沒有但含有漢字就視為中文。其他語言（英文、泰文等）則不插手。',
      },
      {
        title: '切分成詞語',
        body: '使用瀏覽器與 Node 內建的 `Intl.Segmenter`，取出詞語邊界作為候選。不增加相依套件。',
      },
      {
        title: '只保留可以換行的位置',
        body: '日文依字元類別的規則合併成文節（平假名之後開始出現漢字、片假名或英數字時，標點符號或右括號之後等。送假名、「お」「ご」、數字與單位之間則不換行）。中文使用字典的詞語邊界，單字詞則併入前後的詞語。韓文的空白直接作為邊界。',
      },
      {
        title: '在邊界放上標記',
        body: '在邊界插入 `<wbr aria-hidden="true">`。一個字元都不增加，所以複製或搜尋都維持原樣。',
      },
      {
        title: '只在那裡換行',
        body: '替容器加上 `word-break: keep-all`，字元之間不換行。只有當一個文節比容器還長時，才用 `overflow-wrap: break-word` 逐字換行。',
      },
    ],
    cssComments: {
      keepAll: '字元之間不換行',
      breakWord: '只在一個文節比容器還長時逐字換行',
      strict: '即使如此，也不讓小寫假名與長音符號出現在行首',
    },
  },
  name: {
    title: '不污染朗讀內容',
    intro: '即使改變換行位置，螢幕閱讀器朗讀的名稱與複製出來的字串也不會改變。',
    body: [
      '單純的 `<wbr>` 在 Chrome 的無障礙樹中會被當成空白混進名稱。`<button>プロフィールを<wbr>編集</button>` 會被讀成「プロフィールを 編集」，而畫面上的文字（`innerText`）明明沒有空白。我們在實際瀏覽器中量測了 3 種做法後才做出選擇。',
    ],
    tableLabel: '做法的比較',
    caption: '換行標記的加法與其結果',
    head: { method: '做法', name: '朗讀的名稱', breaks: '能否在文節換行', long: '過長的文節' },
    rows: [
      { method: '`<wbr aria-hidden="true">` ＋ keep-all（採用）', name: '維持原樣', breaks: '能', long: '不會溢出' },
      { method: '每個文節的 span 加 white-space: nowrap', name: '維持原樣', breaks: '能', long: '會溢出' },
      { method: '每個文節的 span 加 word-break: keep-all', name: '維持原樣', breaks: '不能（逐字換行）', long: '—' },
      { method: '單純的 `<wbr>`', name: '混入空白', breaks: '能', long: '不會溢出' },
    ],
    callout: '不使用零寬空格。它看不見卻仍以字元的形式存在，會悄悄破壞複製出來的字串、搜尋，以及與輸入值的比對。',
  },
  use: {
    title: '用法',
    intro: '在 gassan 的元件中，什麼都不用寫，換行就會整理好。gassan 之外的 UI，可以用 Phrase 套用相同的換行。',
    codeComments: {
      outside: '也能套用到 gassan 之外的按鈕或標題',
      revert: "改回交給瀏覽器（預設為 'phrase'）",
    },
    body: [
      '伺服器端與用戶端會在相同位置放置標記，所以 hydration 不會出現差異。CSS 的 `word-break: auto-phrase` 是在瀏覽器端解決同一問題的機制，但支援的瀏覽器與語言有限，換行位置也因瀏覽器而異。gassan 在任何瀏覽器上都在相同位置換行。',
    ],
  },
  spec: {
    title: '換行的項目',
    caption: '換行的規格',
  },
} satisfies typeof ja;
