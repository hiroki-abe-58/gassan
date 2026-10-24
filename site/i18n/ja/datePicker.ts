export default {
  lead: 'DatePicker と DateRangePicker はポップアップのカレンダーで、Calendar と RangeCalendar はページの上に置くカレンダー。どれも日本の祝日と土日を色と名前で示し、見出しから月と年を飛べる。月名と曜日は GassanProvider の locale から Intl で出すので、言語を変えるとカレンダーも変わる。',
  gallery: {
    title: '見本',
    intro: '選んだ日はアクセント色で塗り、今日には細い輪を付ける。日曜と祝日は赤、土曜は青。',
    items: {
      datePicker: 'カレンダー',
      rangePicker: '期間',
      limited: '今日から 30 日まで',
      date: '日付（ネイティブ）',
      time: '時刻（ネイティブ）',
      color: '色（ネイティブ）',
    },
  },
  inline: {
    title: 'ページの上のカレンダー',
    intro: '予約の空きや営業日のように、日付を見せながら選ばせたいときは Calendar を置く。size="lg" は器いっぱいに広がり、日の下に祝日の名前を書く。',
    exampleTitle: '来店の予約',
    exampleDescription: '水曜は定休日で選べない。点の付いた日は残りわずか。',
  },
  range: {
    title: '期間',
    intro: '開始日 → 終了日の 2 回で決める。逆順に押しても入れ替える。終了日を選ぶ前は、指している日までを仮の帯で見せる。',
    exampleTitle: 'レポートを書き出す',
    exampleDescription: '左の一覧から「過去 7 日間」などを 1 回で選べる。広い画面では 2 か月を並べる。',
    body: [
      'いまどちらの端を選ぶ番かは、カレンダーの下に出し、`role="status"` で読み上げる。期間の両端の日には、読み上げ名に「開始日」「終了日」を添える。',
      'よく使う期間（今日・昨日・過去 7 日間・過去 30 日間・今月・先月）は `commonDateRanges(useLabels())` で作れる。名前は `labels.rangePreset` から引くので、言語を変えれば一緒に変わる。',
    ],
  },
  holidays: {
    title: '祝日と土日',
    intro: '日本の祝日は「国民の祝日に関する法律」の改正を年ごとに当てはめて計算する。表を持たないので、法が変わらない限り先の年も引ける。',
    tableCaption: (year: number): string => `${String(year)} 年の祝日と休日`,
    head: { date: '日付', name: '名前' },
    body: [
      '振替休日（2007 年からは「後ろの最初の休日でない日」）、祝日に挟まれた国民の休日、ハッピーマンデー、東京 2020 大会の特例、令和の即位の休日まで含む。春分の日と秋分の日は近似式で求める（正式な日は前年の 2 月に公表される）。',
      '名前は `labels.holidays` から出す。日本語の文言の既定は日本の祝日、英語の文言の既定は出さない。部品ごとに `holidays` で差し替えられ、`null` で消せる。自社の休業日を足すなら、`japaneseHolidayResolver()` に重ねた関数を渡す。',
      '色だけでは伝えない。祝日の名前は日の読み上げ名に入り、目には、小さなカレンダーでは下の 1 行に指している日の祝日が、大きなカレンダーでは日の下に出る。日曜・祝日の赤（`--g-sunday`）と土曜の青（`--g-saturday`）は面と 4.5:1 以上を取る。曜日を色で分けない地域向けには、2 つのトークンに `--g-fg` を入れればよい。',
    ],
    codeCaption: '祝日の出し方を変える',
    code: "import { japaneseHolidayResolver, japaneseHoliday } from '@genelab/gassan';\n\n// 自社の休業日を足す\nconst closed: Record<string, string> = { '2026-12-29': '年末休業', '2026-12-30': '年末休業' };\nconst holidays = (date: string) => closed[date] ?? japaneseHolidayResolver()(date);\n\n<Modal.DatePicker holidays={holidays} />\n\n// 祝日を出さない\n<Modal.DatePicker holidays={null} />\n\n// 1 日だけ調べる\njapaneseHoliday('2026-09-22'); // { date: '2026-09-22', key: 'citizens', name: '国民の休日' }",
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
      { key: 'Enter / Space', action: '決めて閉じ、ボタンへ戻る（期間は 1 回目で開始日、2 回目で終了日）' },
      { key: 'Esc', action: '決めずに閉じ、ボタンへ戻る（モーダルは閉じない）。月と年の一覧では 1 段戻る' },
    ],
    note: '見出し（「2026年10月」）を押すと月の一覧、もう一度押すと年の一覧になる。一覧の中も矢印で動き、Enter で 1 段降りる。「今日」を押すと今日へ戻る。',
  },
  native: {
    title: 'ネイティブの日付入力との使い分け',
    body: [
      'スマホでは、OS の日付のホイールのほうが速いことが多い。曜日や祝日を見ながら選ばせたい、選べない日を見せたい、期間を選ばせたい、見た目をほかの部品とそろえたい、というときは DatePicker を使う。そうでなければ `type="date"` を Modal.Input に入れる。枠と明暗（`--g-color-scheme`）は同じになる（I-15）。',
    ],
  },
  apiCaption: {
    datePicker: 'Modal.DatePicker',
    rangePicker: 'Modal.DateRangePicker',
    calendar: 'Modal.Calendar',
    rangeCalendar: 'Modal.RangeCalendar',
  },
  a11yCaption: '日付と時刻が満たす仕様',
};
