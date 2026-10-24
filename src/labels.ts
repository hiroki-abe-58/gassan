import { createContext, createElement, useContext, type ReactNode } from 'react';

import { japaneseHolidayResolver, type HolidayResolver } from './holidays';
import type { DateRangePresetKey } from './internal/dates';
import { LineBreakContext, type LineBreakMode } from './phrase';
import { DEFAULT_BLOCKED_MESSAGE, DEFAULT_UNRESOLVED_GATE_MESSAGE, type MotionPreset } from './types';

/**
 * 画面に出る文字列と読み上げ専用文字列の集合。
 *
 * ライブラリ内に日本語をベタ書きすると、英語プロダクトで使えないだけでなく、
 * 「読み上げ用の文言だけ差し替えたい」という現場の要求にも応えられない。
 * 既定は日本語。English は `englishLabels` を Provider に渡す。
 */
export interface GassanLabels {
  close: string;
  back: string;
  previous: string;
  next: string;
  /** スクロール領域のアクセシブルネーム。B-03。 */
  body: string;
  expandTitle: string;
  collapseTitle: string;
  /** 本文末尾のセンチネルに置く読み上げテキスト。G-05。 */
  endOfContent: string;
  /** dismiss を拒否したときの既定文言。L-10。 */
  blocked: string;
  /** 読了ゲートの既定理由。 */
  unreadReason: string;
  /** 同意ゲートの既定理由。 */
  unconsentedReason: string;
  /**
   * 条件が確定できないときの理由。G-12。
   * 未登録のゲート名を参照したときと、登録が出揃う前（SSR・初回レンダー）に出る。
   */
  unresolvedReason: string;
  loading: string;
  cancel: string;
  ok: string;
  required: string;
  optional: string;
  /** 「5ステップ中2ステップ目」。H-06。 */
  step: (current: number, total: number) => string;
  /** 「5件中2件目」。B-12。 */
  galleryPosition: (current: number, total: number) => string;
  /** Modal.Chart の元データを開く disclosure の既定文言。B-14。 */
  chartData: string;
  /** シートのつまみのアクセシブルネーム。H-09。 */
  sheetHandle: string;
  /** ディテントの呼び名。読み上げと aria-valuetext に使う。M-03。 */
  detent: (token: 'peek' | 'half' | 'full') => string;
  /** ディテントが変わったときの通知。M-03。 */
  detentChanged: (name: string) => string;
  /**
   * 日付と大きさの書式に使うロケール（BCP 47）。カレンダーの月名・曜日もここから引く。I-13 / I-14。
   * 'th' ならタイの仏暦で出る。
   */
  locale: string;
  /** セレクト・コンボボックス・日付の、まだ選んでいないときの表示。I-11。 */
  choose: string;
  /** コンボボックスで候補が 1 つも当たらないとき。I-12。 */
  noResults: string;
  /** 検索欄の入力を消すボタン。I-05。 */
  clear: string;
  /** パスワードを見せるトグル（aria-pressed で状態を持つので、文言は 1 つ）。I-04。 */
  showPassword: string;
  /** 数値ステッパーのボタン。I-07。 */
  increment: string;
  decrement: string;
  /** 2 つ摘みのスライダーの摘み。I-10。 */
  rangeStart: string;
  rangeEnd: string;
  /** 評価の各選択肢の名前。「5 段階中 3」。I-09。 */
  rating: (value: number, max: number) => string;
  /** カレンダーの月送り。I-13。 */
  previousMonth: string;
  nextMonth: string;
  /** ファイルの受け皿。I-14。 */
  dropFiles: string;
  chooseFiles: string;
  removeFile: (name: string) => string;
  /**
   * 日付の脇に出す祝日の名前（日付 → 名前、祝日でなければ null）。null なら祝日を出さない。I-16。
   * 日本語の既定は日本の祝日（japaneseHolidayResolver）、英語の既定は null。
   */
  holidays: HolidayResolver | null;
  /** カレンダーの「今日」。I-18。 */
  today: string;
  /** 月の一覧での年送りと、年の一覧での 12 年送り。I-18。 */
  previousYear: string;
  nextYear: string;
  previousYears: string;
  nextYears: string;
  /** 見出しのボタン。押すと月の一覧・年の一覧へ移る。引数はいまの見出し（「2026年10月」）。I-18。 */
  chooseMonth: (current: string) => string;
  chooseYear: (current: string) => string;
  /** 期間の両端。日の読み上げ名に添える。I-17。 */
  startDate: string;
  endDate: string;
  /** いまどちらの端を選ぶ番か。role="status" で伝える。I-17。 */
  pickStart: string;
  pickEnd: string;
  /** 期間をまだ選んでいないときの表示。I-17。 */
  chooseRange: string;
  /** 印（marks）の付いた日の読み上げ。I-19。 */
  marked: string;
  /** よく使う期間の名前。I-17。 */
  rangePreset: (key: DateRangePresetKey) => string;
  /** 時刻の選択の列の名前（listbox の名前）。I-20。 */
  hour: string;
  minute: string;
  dayPeriod: string;
  /** 時刻の選択の「現在時刻」。I-20。 */
  now: string;
  /** 時刻の選択の窓の名前。I-20。 */
  chooseTime: string;
  /** トーストの領域の名前（region のランドマーク）。N-05。 */
  notifications: string;
  /** トーストの × ボタン。N-04。 */
  closeNotification: string;
  /** CopyButton の名前と、写したあと・写せなかったときの知らせ。U-03。 */
  copy: string;
  copied: string;
  copyFailed: string;
  /** コードの塊の名前（見出しが無いとき・あるとき）と、写すボタンの名前。U-30。 */
  code: string;
  codeOf: (title: string) => string;
  copyCode: string;
  /** 通知の一覧を開くボタンの名前（未読があるとき）・すべて既読にするボタン・空のとき・未読の印の読み上げ。U-32。 */
  notificationsUnread: (count: number) => string;
  markAllRead: string;
  noNotifications: string;
  unreadMark: string;
  /** はじめのチェックリストの進み具合と、手順の状態の読み上げ。U-33。 */
  checklistProgress: (done: number, total: number) => string;
  checklistDone: string;
  checklistTodo: string;
  /** AvatarGroup の「+3」の読み上げ名。U-05。 */
  moreCount: (count: number) => string;
  /** パンくずリストとページ送りの nav の名前。U-22 / U-23。 */
  breadcrumbs: string;
  pagination: string;
  /** ページ送りの前後のボタンと、番号の読み上げ名（「3ページ目」）。U-23。 */
  previousPage: string;
  nextPage: string;
  pageNumber: (page: number) => string;
  /** 手順の表示で、目に見えない状態（完了・進行中・未着手）を読み上げに添える。U-24。 */
  stepStatus: (state: 'complete' | 'current' | 'upcoming') => string;
  /** タグの入力の × ボタンと、足した・取り除いたときの知らせ。I-21。 */
  removeTag: (tag: string) => string;
  tagAdded: (tag: string) => string;
  tagRemoved: (tag: string) => string;
  /** パスワードの強さ（0〜4）と、既定の条件の文。条件を満たしたか・まだかの読み上げ。I-22。 */
  passwordStrength: (score: 0 | 1 | 2 | 3 | 4) => string;
  passwordLength: (min: number) => string;
  passwordNumber: string;
  passwordSymbol: string;
  passwordCase: string;
  ruleMet: string;
  ruleUnmet: string;
  /** 表の行の選択（見出しのチェックボックス・選ぶ列の見出し・選んだ数の読み上げ・選択を外すボタン）。U-26。 */
  selectAll: string;
  selectRows: string;
  selectedCount: (count: number) => string;
  clearSelection: string;
  /** 並べ替えたことの読み上げ。column は列の見出しの文字。U-26。 */
  sortedBy: (column: string, direction: 'ascending' | 'descending') => string;
  /** 行の操作の列の見出し（読み上げだけ）。U-26。 */
  rowActions: string;
  /** 表に行が無いときの既定の文。U-26。 */
  emptyTable: string;
  /** コマンドパレットの名前と、検索欄の既定の案内。U-27。 */
  commandPalette: string;
  commandPlaceholder: string;
  /** 当てはまった候補の数の読み上げ（0 なら当てはまるものが無いこと）。U-27。 */
  commandResults: (count: number) => string;
  /** 下端のキーの案内（↑↓ と Enter の意味）。Esc は close を使う。U-27。 */
  commandMove: string;
  commandSelect: string;
  /** グラフの役割の説明（aria-roledescription）と、凡例の名前。Q-01 / Q-11。 */
  chart: string;
  legend: string;
  /** 元データの表の見出し（項目の列・値・割合）。Q-01。 */
  chartCategory: string;
  chartValue: string;
  chartShare: string;
  /** 元データの表の器の名前（グラフの名前と同じにすると、入れ子の group が同じ名前になる）。Q-01。 */
  chartTable: (name: string) => string;
  /** ドーナツの真ん中の既定（合計）。Q-05。 */
  total: string;
  /** 値の欠けた点と、データの無いグラフ。Q-02。 */
  noValue: string;
  noData: string;
  /** 点の読み上げ（「3月: 売上 120万、費用 80万」）。entries は系列の名前と書式を当てた値の組。Q-02。 */
  chartPoint: (x: string, entries: readonly (readonly [string, string])[]) => string;
  /** 小さな推移の読み上げ（最小・最大・最新）。Q-06。 */
  sparkline: (summary: { min: string; max: string; last: string }) => string;
  /** カルーセルとスライドの役割の説明（aria-roledescription）。U-28。 */
  carousel: string;
  slide: string;
  /** スライドを選ぶ点の名前と、点の並びの名前。U-28。 */
  slideNumber: (n: number) => string;
  slidePicker: string;
  /** 自動再生を始める・止めるボタンの名前。U-29。 */
  startRotation: string;
  stopRotation: string;
  /** 入力欄の名前・送信・生成を止めるボタンの名前。E-05 / E-06。 */
  message: string;
  send: string;
  stop: string;
  /** 自分のメッセージの状態（送信中・失敗・既読）と、失敗したときのボタン。E-03。 */
  sending: string;
  sendFailed: string;
  retry: string;
  read: string;
  /** 編集したメッセージの印。E-02。 */
  edited: string;
  /** 日付の区切り（今日は today を使う）。E-01。 */
  yesterday: string;
  /** 下に新しいメッセージがあるときのボタン。E-04。 */
  newMessages: (count: number) => string;
  /** 新着の区切りの線。E-01。 */
  unread: string;
  /** 前のメッセージを読み込むボタン。E-04。 */
  loadOlder: string;
  /** 入力中の人（1 人・2 人・3 人以上で言い方を変える）。E-07。 */
  typing: (names: readonly string[]) => string;
  /** 入力欄の下のキーの案内（'enter' は Enter で送信、'mod+enter' は Ctrl / ⌘ + Enter で送信）。E-05。 */
  sendHint: (mode: 'enter' | 'mod+enter') => string;
  /** 質問の例の並びの名前。E-08。 */
  suggestions: string;
}

export const japaneseLabels: GassanLabels = {
  close: '閉じる',
  back: '戻る',
  previous: '前へ',
  next: '次へ',
  body: '本文',
  expandTitle: 'タイトルの全文を表示',
  collapseTitle: 'タイトルを折りたたむ',
  endOfContent: '本文の終わりです。',
  blocked: DEFAULT_BLOCKED_MESSAGE,
  unreadReason: '本文を最後までお読みください。',
  unconsentedReason: '内容に同意すると次へ進めます。',
  unresolvedReason: DEFAULT_UNRESOLVED_GATE_MESSAGE,
  loading: '処理中',
  cancel: 'キャンセル',
  ok: 'OK',
  required: '必須',
  optional: '任意',
  step: (current, total) => `${total}ステップ中${current}ステップ目`,
  galleryPosition: (current, total) => `${total}件中${current}件目`,
  chartData: '元データを表示',
  sheetHandle: 'シートの高さを変える',
  detent: (token) => ({ peek: '最小', half: '中', full: '最大' })[token],
  detentChanged: (name) => `シートの高さ: ${name}`,
  locale: 'ja-JP',
  choose: '選んでください',
  noResults: '一致する候補がありません',
  clear: '入力を消す',
  showPassword: 'パスワードを表示',
  increment: '増やす',
  decrement: '減らす',
  rangeStart: '下限',
  rangeEnd: '上限',
  rating: (value, max) => `${max}段階中${value}`,
  previousMonth: '前の月',
  nextMonth: '次の月',
  dropFiles: 'ここにファイルをドロップ',
  chooseFiles: 'ファイルを選ぶ',
  removeFile: (name) => `${name} を取り除く`,
  holidays: japaneseHolidayResolver(),
  today: '今日',
  previousYear: '前の年',
  nextYear: '次の年',
  previousYears: '前の12年',
  nextYears: '次の12年',
  chooseMonth: (current) => `${current}。月を選ぶ`,
  chooseYear: (current) => `${current}。年を選ぶ`,
  startDate: '開始日',
  endDate: '終了日',
  pickStart: '開始日を選んでください',
  pickEnd: '終了日を選んでください',
  chooseRange: '期間を選ぶ',
  marked: '予定あり',
  rangePreset: (key) =>
    ({ today: '今日', yesterday: '昨日', last7: '過去7日間', last30: '過去30日間', thisMonth: '今月', lastMonth: '先月' })[key],
  hour: '時',
  minute: '分',
  dayPeriod: '午前・午後',
  now: '現在時刻',
  chooseTime: '時刻を選ぶ',
  notifications: '通知',
  closeNotification: '通知を閉じる',
  copy: 'コピー',
  copied: 'コピーしました',
  copyFailed: 'コピーできませんでした',
  code: 'コード',
  codeOf: (title) => `${title} のコード`,
  copyCode: 'コードをコピー',
  notificationsUnread: (count) => `通知 未読 ${count}件`,
  markAllRead: 'すべて既読にする',
  noNotifications: '新しい通知はありません',
  unreadMark: '未読',
  checklistProgress: (done, total) => `${done} / ${total} 完了`,
  checklistDone: '完了',
  checklistTodo: '未完了',
  moreCount: (count) => `ほか${String(count)}人`,
  breadcrumbs: 'パンくずリスト',
  pagination: 'ページ送り',
  previousPage: '前のページ',
  nextPage: '次のページ',
  pageNumber: (page) => `${String(page)}ページ目`,
  stepStatus: (state) => ({ complete: '完了', current: '進行中', upcoming: '未着手' })[state],
  removeTag: (tag) => `${tag} を取り除く`,
  tagAdded: (tag) => `${tag} を追加しました`,
  tagRemoved: (tag) => `${tag} を取り除きました`,
  passwordStrength: (score) => (['弱すぎる', '弱い', '普通', '強い', 'とても強い'] as const)[score],
  passwordLength: (min) => `${String(min)} 文字以上`,
  passwordNumber: '数字を含む',
  passwordSymbol: '記号を含む',
  passwordCase: '大文字と小文字を含む',
  ruleMet: '満たしています',
  ruleUnmet: 'まだ満たしていません',
  selectAll: 'すべて選択',
  selectRows: '選択',
  selectedCount: (count) => (count === 0 ? '選択を解除しました' : `${String(count)} 件を選択中`),
  clearSelection: '選択を解除',
  sortedBy: (column, direction) => `${column}で${direction === 'ascending' ? '昇順' : '降順'}に並べ替えました`,
  rowActions: '操作',
  emptyTable: '表示するものがありません',
  commandPalette: 'コマンドパレット',
  commandPlaceholder: 'コマンドを探す',
  commandResults: (count) => (count === 0 ? '一致する候補がありません' : `${String(count)} 件の候補`),
  commandMove: '移動',
  commandSelect: '選ぶ',
  chart: 'グラフ',
  legend: '凡例',
  chartCategory: '項目',
  chartValue: '値',
  chartShare: '割合',
  chartTable: (name) => `${name}の元データ`,
  total: '合計',
  noValue: 'なし',
  noData: 'データがありません',
  chartPoint: (x, entries) => `${x}: ${entries.map(([name, value]) => `${name} ${value}`).join('、')}`,
  sparkline: ({ min, max, last }) => `最小 ${min}、最大 ${max}、最新 ${last}`,
  carousel: 'カルーセル',
  slide: 'スライド',
  slideNumber: (n) => `${n}枚目のスライド`,
  slidePicker: 'スライドを選ぶ',
  startRotation: 'スライドの自動再生を始める',
  stopRotation: 'スライドの自動再生を止める',
  message: 'メッセージ',
  send: '送信',
  stop: '止める',
  sending: '送信中',
  sendFailed: '送信できませんでした',
  retry: '再送',
  read: '既読',
  edited: '編集済み',
  yesterday: '昨日',
  newMessages: (count) => `新しいメッセージ ${count}件`,
  unread: 'ここから新着',
  loadOlder: '前のメッセージを読み込む',
  typing: (names) =>
    names.length === 1 ? `${names[0] ?? ''}さんが入力中` : names.length === 2 ? `${names[0] ?? ''}さんと${names[1] ?? ''}さんが入力中` : `${names.length}人が入力中`,
  sendHint: (mode) => (mode === 'enter' ? 'Enter で送信、Shift+Enter で改行' : 'Ctrl+Enter（Mac は ⌘+Enter）で送信、Enter で改行'),
  suggestions: '質問の例',
};

export const englishLabels: GassanLabels = {
  close: 'Close',
  back: 'Back',
  previous: 'Previous',
  next: 'Next',
  body: 'Content',
  expandTitle: 'Show the full title',
  collapseTitle: 'Collapse the title',
  endOfContent: 'End of content.',
  blocked: 'This dialog cannot be closed yet. Complete the required steps first.',
  unreadReason: 'Please read to the end of the content.',
  unconsentedReason: 'Agree to the terms to continue.',
  unresolvedReason: 'This action still has conditions that are not met.',
  loading: 'Working',
  cancel: 'Cancel',
  ok: 'OK',
  required: 'Required',
  optional: 'Optional',
  step: (current, total) => `Step ${current} of ${total}`,
  galleryPosition: (current, total) => `Item ${current} of ${total}`,
  chartData: 'Show data',
  sheetHandle: 'Resize the sheet',
  detent: (token) => ({ peek: 'small', half: 'medium', full: 'large' })[token],
  detentChanged: (name) => `Sheet height: ${name}`,
  locale: 'en-US',
  choose: 'Choose…',
  noResults: 'No matches',
  clear: 'Clear',
  showPassword: 'Show password',
  increment: 'Increase',
  decrement: 'Decrease',
  rangeStart: 'Minimum',
  rangeEnd: 'Maximum',
  rating: (value, max) => `${value} of ${max}`,
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  dropFiles: 'Drop files here',
  chooseFiles: 'Choose files',
  removeFile: (name) => `Remove ${name}`,
  holidays: null,
  today: 'Today',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  previousYears: 'Previous 12 years',
  nextYears: 'Next 12 years',
  chooseMonth: (current) => `${current}, choose a month`,
  chooseYear: (current) => `${current}, choose a year`,
  startDate: 'Start date',
  endDate: 'End date',
  pickStart: 'Choose a start date',
  pickEnd: 'Choose an end date',
  chooseRange: 'Choose dates…',
  marked: 'Has events',
  rangePreset: (key) =>
    ({
      today: 'Today',
      yesterday: 'Yesterday',
      last7: 'Last 7 days',
      last30: 'Last 30 days',
      thisMonth: 'This month',
      lastMonth: 'Last month',
    })[key],
  hour: 'Hour',
  minute: 'Minute',
  dayPeriod: 'AM/PM',
  now: 'Now',
  chooseTime: 'Choose a time',
  notifications: 'Notifications',
  closeNotification: 'Dismiss notification',
  copy: 'Copy',
  copied: 'Copied',
  copyFailed: 'Could not copy',
  code: 'Code',
  codeOf: (title) => `Code for ${title}`,
  copyCode: 'Copy code',
  notificationsUnread: (count) => `Notifications, ${count} unread`,
  markAllRead: 'Mark all as read',
  noNotifications: 'No new notifications',
  unreadMark: 'Unread',
  checklistProgress: (done, total) => `${done} of ${total} done`,
  checklistDone: 'Done',
  checklistTodo: 'Not done',
  moreCount: (count) => `${String(count)} more`,
  breadcrumbs: 'Breadcrumb',
  pagination: 'Pagination',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  pageNumber: (page) => `Page ${String(page)}`,
  stepStatus: (state) => ({ complete: 'Completed', current: 'Current', upcoming: 'Not started' })[state],
  removeTag: (tag) => `Remove ${tag}`,
  tagAdded: (tag) => `Added ${tag}`,
  tagRemoved: (tag) => `Removed ${tag}`,
  passwordStrength: (score) => (['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'] as const)[score],
  passwordLength: (min) => `At least ${String(min)} characters`,
  passwordNumber: 'Contains a number',
  passwordSymbol: 'Contains a symbol',
  passwordCase: 'Contains upper and lower case letters',
  ruleMet: 'met',
  ruleUnmet: 'not met yet',
  selectAll: 'Select all',
  selectRows: 'Select',
  selectedCount: (count) => (count === 0 ? 'Selection cleared' : `${String(count)} selected`),
  clearSelection: 'Clear selection',
  sortedBy: (column, direction) => `Sorted by ${column}, ${direction}`,
  rowActions: 'Actions',
  emptyTable: 'Nothing to show',
  commandPalette: 'Command palette',
  commandPlaceholder: 'Search commands',
  commandResults: (count) => (count === 0 ? 'No matches' : count === 1 ? '1 result' : `${String(count)} results`),
  commandMove: 'Move',
  commandSelect: 'Select',
  chart: 'chart',
  legend: 'Legend',
  chartCategory: 'Item',
  chartValue: 'Value',
  chartShare: 'Share',
  chartTable: (name) => `Data for ${name}`,
  total: 'Total',
  noValue: 'none',
  noData: 'No data',
  chartPoint: (x, entries) => `${x}: ${entries.map(([name, value]) => `${name} ${value}`).join(', ')}`,
  sparkline: ({ min, max, last }) => `min ${min}, max ${max}, latest ${last}`,
  carousel: 'carousel',
  slide: 'slide',
  slideNumber: (n) => `Slide ${n}`,
  slidePicker: 'Choose a slide',
  startRotation: 'Start automatic slide show',
  stopRotation: 'Stop automatic slide show',
  message: 'Message',
  send: 'Send',
  stop: 'Stop',
  sending: 'Sending',
  sendFailed: 'Not sent',
  retry: 'Retry',
  read: 'Read',
  edited: 'edited',
  yesterday: 'Yesterday',
  newMessages: (count) => `${count} new ${count === 1 ? 'message' : 'messages'}`,
  unread: 'New messages',
  loadOlder: 'Load earlier messages',
  typing: (names) =>
    names.length === 1 ? `${names[0] ?? ''} is typing` : names.length === 2 ? `${names[0] ?? ''} and ${names[1] ?? ''} are typing` : `${names.length} people are typing`,
  sendHint: (mode) => (mode === 'enter' ? 'Enter to send, Shift+Enter for a new line' : 'Ctrl+Enter (⌘+Enter on Mac) to send, Enter for a new line'),
  suggestions: 'Suggestions',
};

const LabelsContext = createContext<GassanLabels>(japaneseLabels);

export function useLabels(): GassanLabels {
  return useContext(LabelsContext);
}

export interface GassanProviderProps {
  labels?: Partial<GassanLabels>;
  /**
   * 日本語・中国語・韓国語の折り返し方。既定は 'phrase'（文節・語の切れ目でだけ改行する）。
   * 'browser' にするとブラウザ任せ（文字単位）に戻る。省略すると外側の Provider に従う。W-01〜W-06。
   */
  lineBreak?: LineBreakMode;
  /**
   * 動きの段（V-01）。渡すと、中身を `data-g-motion` の器（`display: contents`）で包み、その枝の
   * 動きのトークンを差し替える。モーダルとポップアップは top layer に出ても DOM の上では子孫なので、同じ段で動く。
   * 省略すると器を足さず、外側（`<html data-g-motion>` か、外側の Provider）に従う。
   */
  motion?: MotionPreset;
  children: ReactNode;
}

/**
 * 文言と、折り返し方と、動きの段を差し替える。文言は部分指定でよい。
 * どれも、省略した分は外側の Provider に従う（文言は外側の文言に重ねる）。
 * 英語の Provider の内側に lineBreak だけを指定した Provider を置いても、文言は日本語に戻らない。
 * JSX を使わないのは、このファイルを .ts のまま保つため。
 */
export function GassanProvider({ labels, lineBreak, motion, children }: GassanProviderProps): ReactNode {
  const outer = useContext(LabelsContext);
  const merged: GassanLabels = labels ? { ...outer, ...labels } : outer;
  const inherited = useContext(LineBreakContext);
  const provided = createElement(
    LineBreakContext.Provider,
    { value: lineBreak ?? inherited },
    createElement(LabelsContext.Provider, { value: merged }, children),
  );
  // 段はカスタムプロパティなので、継承させるための器が要る。レイアウトには参加させない。
  return motion
    ? createElement('div', { 'data-g-motion': motion, style: { display: 'contents' } }, provided)
    : provided;
}
