import type ja from '../ja/button';

export default {
  lead: 'primary、secondary、tertiary 三個層級，加上用於無法挽回之操作的 danger。可按、處理中、門控中、無法使用，不只靠顏色，也能從形狀分辨。',
  variants: {
    title: '種類',
    intro: '以三個不同份量的層級，讓人一眼看出按哪個能往下走。一個頁尾中每種最多放一個。',
    items: {
      primary: {
        label: '發布',
        role: '達成該畫面目的的操作。一個畫面只有一個（F-01）。',
        look: '強調色的填色，搭配與之相配的文字顏色。',
        reasons: [
          '同樣大小下，填色最引人注目。為了把目光最先停留的地方收斂成一處，只有 primary 使用填色。',
          '文字與填色的對比在 4.5:1 以上。即使用網站的主題換了顏色，也由計算加以保證。',
          '放在列的最後。DOM 順序 = 視覺順序 = Tab 順序，所以它會出現在讀完的位置（F-02）。按 ⌘ / Ctrl + Enter 也能按下（F-10）。',
        ],
      },
      secondary: {
        label: '儲存草稿',
        role: '與 primary 並列的另一個選項，例如儲存草稿、返回等。',
        look: '不填色，使用較深的外框與和內文相同的文字顏色。',
        reasons: [
          '以不填色表現與 primary 的主從關係，以外框表現可按的範圍。',
          '讓人認出這是按鈕的線索由文字承擔（與內文同色，達 4.5:1 以上）。外框只是用來呈現主從的輔助；在提高對比的設定（prefers-contrast: more）下，連文字顏色也會加深。',
        ],
      },
      tertiary: {
        label: '先不要',
        role: '退出類的操作，例如先不要、稍後、查看詳情等。',
        look: '沒有填色也沒有外框，使用與補充文字相同的文字顏色。放在列的最左側並隔開（F-03）。',
        reasons: [
          '採用最弱的外觀，位置也與 primary 拉開，避免匆忙時按錯。',
          '即使是補充文字的顏色，對表面也有 4.5:1 以上。',
          '只縮減左右留白，高度維持 44px（F-05）。即使外觀接近純文字，可按的面積也不減少。',
        ],
      },
      danger: {
        label: '刪除',
        role: '無法挽回的操作。用來取代 primary。',
        look: '維持 primary 的位置，使用紅色填色。',
        reasons: [
          '不改變位置，只改變顏色（F-06）。讓習慣按平常位置的手，不會因此按到別的操作。',
          '不把初始焦點放在這個按鈕上（K-05）。按一次 Enter 就無法挽回。',
          '不只依賴紅色，也用標籤的動詞說明會發生什麼。即使難以分辨顏色，讀了就懂。',
        ],
      },
    },
  },
  states: {
    title: '狀態',
    intro: '把 6 種狀態套用在全部 4 個種類上繪製出來。下方的比值是當場量測畫面上實際繪製的顏色。換主題就會重新量測。',
    look: '外觀',
    why: '依據',
    items: {
      rest: {
        name: '可按',
        api: '預設',
        look: '各種類的基本外觀。指標會變成手指的形狀。',
        why: '可按的按鈕即使種類不同，也擁有相同的高度（44px，粗略指標下為 48px）與圓角。統一可按之物的形狀，與不可按之物區隔。',
      },
      hover: {
        name: '指標移到上方',
        api: ':hover',
        look: 'secondary 與 tertiary 會鋪上淡淡的底色。primary 與 danger 不改變填色，而以陰影浮起。',
        why: '若讓填色按鈕的背景變亮或變暗，依主題調整到剛好 4.5:1 的顏色，與文字的比值就會跌破標準。所以用陰影而不是顏色來回應。',
      },
      focus: {
        name: '以鍵盤移入',
        api: ':focus-visible',
        look: '在距離按鈕 2px 處繪製 2px 的焦點環。',
        why: '因為隔開繪製，即使是填色按鈕，焦點環也不會與填色融在一起。焦點環對表面有 3:1 以上（K-07）。用滑鼠按下時不會出現。',
      },
      loading: {
        name: '處理中',
        api: 'onAction 回傳 Promise / loading',
        look: '讓標籤透明並疊上載入圖示。寬度不變。',
        why: '按了也不會發生任何事（防止重複送出，F-08）。標籤以 `opacity: 0` 隱藏，所以朗讀的名稱仍保留。若用 `visibility: hidden`，名稱會一起消失，成為沒有名稱的按鈕（F-07）。載入圖示不是文字，所以要求 3:1 以上。',
      },
      gated: {
        name: '門控中（條件齊備即可按）',
        api: 'gate',
        look: '灰色填色（secondary 與 tertiary 為細外框）。文字清晰可讀。',
        why: '使用 `aria-disabled` 而非 `disabled`（G-01）。可以取得焦點，按下會朗讀理由，並帶使用者前往卡住的地方（G-07 / G-08）。既然能取得焦點，就不能依賴 WCAG 的「非作用中元件不在此限」，因此不用 `opacity` 調淡，而是維持 4.5:1（G-10）。',
      },
      unavailable: {
        name: '無法使用',
        api: 'unavailable',
        look: '移除填色，改用虛線外框。',
        why: '只在沒有權限等、在此畫面上無論如何都無法按下時使用的真正 `disabled`。也無法取得焦點。為了能以形狀與門控中（有填色的灰色）區分，採用虛線。雖然不在 WCAG 的要求範圍內，文字仍以與補充文字相同的顏色維持可讀的比值。',
      },
    },
    callout:
      '狀態不只用顏色傳達。陰影、焦點環、載入圖示、有填色的灰色、虛線，形狀全都不同。難以分辨顏色的人，以及在強制色彩模式（Windows 的高對比）下，也能區分。',
  },
  measure: {
    ink: '文字',
    spinner: '載入圖示',
    ring: '焦點環',
    exempt: '（不在要求範圍內）',
    meets: (min: number): string => `（標準 ${String(min)}）`,
    fails: (min: number): string => `（未達標準 ${String(min)}）`,
  },
  gated: {
    title: '區分門控中與無法使用',
    intro: '兩者都是「現在無法按下」，差別在於有沒有變得可按的途徑。gassan 幾乎不使用 disabled。',
    tableCaption: '門控中與無法使用的差異',
    aspect: '觀點',
    gated: '門控中',
    unavailable: '無法使用',
    rows: [
      { aspect: '寫法', gated: 'gate（aria-disabled）', unavailable: 'unavailable（disabled）' },
      { aspect: '焦點', gated: '可以取得', unavailable: '無法取得' },
      { aspect: '按下時', gated: '朗讀理由，並帶使用者前往卡住的地方', unavailable: '什麼都不會發生' },
      { aspect: '外觀', gated: '灰色填色', unavailable: '虛線外框' },
      { aspect: '文字的對比', gated: '維持 4.5:1（G-10）', unavailable: '不在 WCAG 的要求範圍內，但仍維持可讀的比值' },
      { aspect: '使用情境', gated: '讀完、同意、輸入齊備後即可按下', unavailable: '沒有權限等，在此畫面上無法按下' },
    ],
    body: [
      '`disabled` 的按鈕無法取得焦點。對鍵盤與螢幕閱讀器的使用者來說，既無從得知按鈕的存在，也無從得知為什麼無法按下。若把「滿足條件就能按」的按鈕設為 `disabled`，就只有這些人無法繼續前進。',
    ],
    exampleTitle: '試著按下門控中的按鈕',
    exampleDescription: '在選好領域之前，「以此內容儲存」處於門控中。按下後會朗讀理由，並把焦點移到選項上。',
  },
  live: {
    title: '實際按按看',
    intro: '處理中的期間不論按幾次，都只會執行一次。',
    exampleTitle: '發布文章',
    exampleDescription: '依 tertiary、secondary、primary 由弱到強排列的頁尾。試著連按「發布」。',
  },
  size: {
    title: '大小與擺放方式',
    rules: [
      {
        title: '高度 44px 以上',
        body: '比 WCAG 2.5.8 最低要求的 24px 更嚴格，與 Apple 的 44pt 一致。在以手指觸碰的裝置（`pointer: coarse`）上為 48px（F-05）。',
      },
      {
        title: '由弱到強撰寫',
        body: '依 tertiary → secondary → primary 的順序撰寫，DOM 順序、視覺順序、Tab 順序就會一致（F-02）。窄螢幕上維持相同順序直向堆疊，不反轉排列（F-04）。',
      },
      {
        title: '標籤在文節處換行',
        body: '在窄螢幕上標籤即使變成 2 行，也會像「プロフィールを｜編集」這樣在文節邊界換行。請參閱[日文的換行](#/styles/line-break)。',
      },
      {
        title: '用動詞說出結果',
        body: '不寫「確定」「是」，而寫「發布」「刪除」。讓人只讀按鈕，也能知道按下後的結果。',
      },
    ],
  },
  a11yCaption: '按鈕滿足的規格',
} satisfies typeof ja;
