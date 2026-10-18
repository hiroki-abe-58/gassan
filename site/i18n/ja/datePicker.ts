export default {
  lead: 'DatePicker はカレンダーで日付を選ぶ。時刻と色は、ネイティブの入力を Modal.Input の枠に収める。月名と曜日は GassanProvider の locale から Intl で出すので、言語を変えるとカレンダーも変わる。',
  gallery: {
    title: '見本',
    intro: '選んだ日はアクセント色で塗り、今日には細い輪を付ける。',
    items: {
      datePicker: 'カレンダー',
      limited: '今日から 30 日まで',
      date: '日付（ネイティブ）',
      time: '時刻（ネイティブ）',
      color: '色（ネイティブ）',
    },
  },
  modal: {
    title: 'モーダルの中で',
    intro: 'カレンダーは popover で top layer に出る。Esc はカレンダーだけを閉じ、ボタンへフォーカスを戻す。',
    exampleTitle: '予約する',
    exampleDescription: '日付はカレンダーで、時刻はネイティブの入力で選ぶ。過去の日は選べない。',
  },
  keys: {
    title: 'キー操作',
    tableCaption: 'カレンダーのキー操作',
    head: { key: 'キー', action: '動き' },
    rows: [
      { key: '← / →', action: '前の日・次の日' },
      { key: '↑ / ↓', action: '前の週・次の週' },
      { key: 'Home / End', action: '週の始まり・終わり' },
      { key: 'PageUp / PageDown', action: '前の月・次の月（月末は寄せる）' },
      { key: 'Shift + PageUp / PageDown', action: '前の年・次の年' },
      { key: 'Enter / Space', action: '決めて閉じ、ボタンへ戻る' },
      { key: 'Esc', action: '決めずに閉じ、ボタンへ戻る（モーダルは閉じない）' },
    ],
  },
  native: {
    title: 'ネイティブの日付入力との使い分け',
    body: [
      'スマホでは、OS の日付のホイールのほうが速いことが多い。曜日を見ながら選ばせたい、選べない日を見せたい、見た目をほかの部品とそろえたい、というときは DatePicker を使う。そうでなければ `type="date"` を Modal.Input に入れる。枠と明暗（`--g-color-scheme`）は同じになる（I-15）。',
    ],
  },
  a11yCaption: '日付と時刻が満たす仕様',
};
