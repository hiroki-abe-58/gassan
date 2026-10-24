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
