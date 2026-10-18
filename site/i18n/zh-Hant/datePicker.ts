import type ja from '../ja/datePicker';

export default {
  lead: 'DatePicker 以月曆選擇日期。時間與顏色則把原生的輸入放進 Modal.Input 的外框。月份名稱與星期由 GassanProvider 的 locale 透過 Intl 產生，所以切換語言後，月曆也會跟著改變。',
  gallery: {
    title: '範例',
    intro: '選取的日期以強調色填色，今天則加上細圓框。',
    items: {
      datePicker: '月曆',
      limited: '從今天起 30 天內',
      date: '日期（原生）',
      time: '時間（原生）',
      color: '顏色（原生）',
    },
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
      { key: 'Enter / Space', action: '確定並關閉，回到按鈕' },
      { key: 'Esc', action: '不確定直接關閉，回到按鈕（不會關閉模態視窗）' },
    ],
  },
  native: {
    title: '與原生日期輸入的分工',
    body: [
      '在手機上，作業系統的日期滾輪往往更快。想讓人邊看星期邊選、想呈現無法選擇的日期、想讓外觀與其他元件一致時，使用 DatePicker。否則就把 `type="date"` 放進 Modal.Input。外框與明暗（`--g-color-scheme`）都會相同（I-15）。',
    ],
  },
  a11yCaption: '日期與時間滿足的規格',
} satisfies typeof ja;
