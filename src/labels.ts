import { createContext, createElement, useContext, type ReactNode } from 'react';

import { DEFAULT_BLOCKED_MESSAGE, DEFAULT_UNRESOLVED_GATE_MESSAGE } from './types';

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
};

const LabelsContext = createContext<GassanLabels>(japaneseLabels);

export function useLabels(): GassanLabels {
  return useContext(LabelsContext);
}

export interface GassanProviderProps {
  labels?: Partial<GassanLabels>;
  children: ReactNode;
}

/**
 * 文言を差し替える。部分指定でよい。
 * JSX を使わないのは、このファイルを .ts のまま保つため。
 */
export function GassanProvider({ labels, children }: GassanProviderProps): ReactNode {
  const merged: GassanLabels = labels ? { ...japaneseLabels, ...labels } : japaneseLabels;
  return createElement(LabelsContext.Provider, { value: merged }, children);
}
