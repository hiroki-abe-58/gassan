import type ja from '../ja/datePicker';

export default {
  lead: 'DatePicker 與 DateRangePicker 是彈出式的月曆，Calendar 與 RangeCalendar 則是放在頁面上的月曆。這些月曆都以顏色與名稱標示日本的國定假日與週末，並可從標題跳到其他月份與年份。月份名稱與星期由 GassanProvider 的 locale 透過 Intl 產生，所以切換語言後，月曆也會跟著改變。',
  gallery: {
    title: '範例',
    intro: '選取的日期以強調色填色，今天則加上細圓框。週日與國定假日為紅色，週六為藍色。',
    items: {
      datePicker: '月曆',
      rangePicker: '日期範圍',
      limited: '從今天起 30 天內',
      date: '日期（原生）',
      time: '時間（原生）',
      color: '顏色（原生）',
    },
  },
  inline: {
    title: '頁面上的月曆',
    intro: '像預約的空檔或營業日這樣，想讓人邊看日期邊選擇時，就放置 Calendar。size="lg" 會撐滿容器，並在日期下方寫出國定假日的名稱。',
    exampleTitle: '預約到店',
    exampleDescription: '週三公休，無法選擇。有圓點的日期名額所剩不多。',
  },
  range: {
    title: '日期範圍',
    intro: '依開始日期 → 結束日期分兩次決定。反過來按也會自動對調。選定結束日期之前，會以暫時的色帶顯示到目前所指日期為止的範圍。',
    exampleTitle: '匯出報表',
    exampleDescription: '可從左側清單一次選好「最近 7 天」等範圍。在寬螢幕上會並排顯示兩個月。',
    body: [
      '目前輪到選哪一端，會顯示在月曆下方，並以 `role="status"` 朗讀。範圍兩端的日期，會在無障礙名稱中加上「開始日期」「結束日期」。',
      '常用的範圍（今天、昨天、最近 7 天、最近 30 天、本月、上個月）可用 `commonDateRanges(useLabels())` 建立。名稱取自 `labels.rangePreset`，所以切換語言時會一起改變。',
    ],
  },
  holidays: {
    title: '國定假日與週末',
    intro: '日本的國定假日，是把各年度當時有效的《關於國民節日的法律》套用到該年計算而得。不內建對照表，所以只要法律不變，未來的年份也查得到。',
    tableCaption: (year: number): string => `${String(year)} 年的國定假日與休假日`,
    head: { date: '日期', name: '名稱' },
    body: [
      '涵蓋補假（2007 年起為「之後第一個不是假日的日子」）、夾在兩個國定假日之間的國民休假日、快樂星期一制度、東京 2020 奧運的特例，以及令和元年天皇即位的假日。春分之日與秋分之日以近似公式計算（正式日期於前一年的 2 月公布）。',
      '名稱來自 `labels.holidays`。日文字串預設顯示日本的國定假日，英文字串預設不顯示。每個元件都能以 `holidays` 替換，傳入 `null` 則不顯示。要加上自家公司的休假日，就傳入疊加在 `japaneseHolidayResolver()` 之上的函式。',
      '不只靠顏色傳達。國定假日的名稱會寫進日期的無障礙名稱；在畫面上，小月曆會在下方一行顯示目前所指日期的國定假日，大月曆則顯示在日期下方。週日與國定假日的紅色（`--g-sunday`）和週六的藍色（`--g-saturday`）對表面都有 4.5:1 以上。若是不以顏色區分星期的地區，只要在這兩個 token 填入 `--g-fg` 即可。',
    ],
    codeCaption: '變更國定假日的顯示方式',
    code: "import { japaneseHolidayResolver, japaneseHoliday } from '@genelab/gassan';\n\n// 加上自家公司的休假日\nconst closed: Record<string, string> = { '2026-12-29': '年末公休', '2026-12-30': '年末公休' };\nconst holidays = (date: string) => closed[date] ?? japaneseHolidayResolver()(date);\n\n<Modal.DatePicker holidays={holidays} />\n\n// 不顯示國定假日\n<Modal.DatePicker holidays={null} />\n\n// 只查詢某一天\njapaneseHoliday('2026-09-22'); // { date: '2026-09-22', key: 'citizens', name: \"国民の休日\" }（名稱預設為日文）",
  },
  modal: {
    title: '在模態視窗中',
    intro: '月曆以 popover 顯示在 top layer。Esc 只關閉月曆，並把焦點移回按鈕。',
    exampleTitle: '預約',
    exampleDescription: '日期用月曆選擇，時間用原生的輸入選擇。無法選擇過去的日期。',
  },
  keys: {
    title: '鍵盤操作',
    tableCaption: '月曆的鍵盤操作',
    head: { key: '按鍵', action: '動作' },
    rows: [
      { key: '← / →', action: '前一天、後一天' },
      { key: '↑ / ↓', action: '前一週、下一週' },
      { key: 'Home / End', action: '一週的開始、結束' },
      { key: 'PageUp / PageDown', action: '上個月、下個月（超過月底時移到該月最後一天）' },
      { key: 'Shift + PageUp / PageDown', action: '前一年、下一年' },
      { key: 'Enter / Space', action: '確定並關閉，回到按鈕（選擇範圍時，第 1 次決定開始日期，第 2 次決定結束日期）' },
      { key: 'Esc', action: '不確定直接關閉，回到按鈕（不會關閉模態視窗）。在月份與年份清單中則回到上一層' },
    ],
    note: '按下標題（「2026年10月」）會顯示月份清單，再按一次會顯示年份清單。清單中也能用方向鍵移動，按 Enter 進入下一層。按下「今天」會回到今天。',
  },
  native: {
    title: '與原生日期輸入的分工',
    body: [
      '在手機上，作業系統的日期滾輪往往更快。想讓人邊看星期與國定假日邊選、想呈現無法選擇的日期、想讓人選擇日期範圍、想讓外觀與其他元件一致時，使用 DatePicker。否則就把 `type="date"` 放進 Modal.Input。外框與明暗（`--g-color-scheme`）都會相同（I-15）。',
    ],
  },
  apiCaption: {
    datePicker: 'Modal.DatePicker',
    rangePicker: 'Modal.DateRangePicker',
    calendar: 'Modal.Calendar',
    rangeCalendar: 'Modal.RangeCalendar',
  },
  a11yCaption: '日期與時間滿足的規格',
} satisfies typeof ja;
