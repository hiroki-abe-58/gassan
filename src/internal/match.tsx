import type { ReactNode } from 'react';

import { normalizeForMatch } from '../select';

/*
 * 探した言葉に当たる所を、元の文字の位置で示す（コマンドパレット・検索結果）。
 * 比べるのは正規化した文字列（全角半角・大文字小文字・かなの種類をそろえる）で、示すのは元の文字。
 */

/**
 * 1 文字ずつ正規化した文字列と、正規化した位置から元の文字の位置への対応。
 * 正規化で長さが変わっても（「ｶﾞ」→「が」）、当てはまった所を元の文字で示せる。
 */
export interface Folded {
  text: string;
  origin: number[];
  chars: string[];
}

export function fold(source: string): Folded {
  const chars = [...source];
  let text = '';
  const origin: number[] = [];
  chars.forEach((char, index) => {
    const piece = normalizeForMatch(char);
    text += piece;
    for (let k = 0; k < piece.length; k += 1) origin.push(index);
  });
  return { text, origin, chars };
}

/** 正規化した位置 at から needle の長さぶんを、元の文字の範囲 [始まり, 終わり) にする。 */
const toRange = (folded: Folded, at: number, needle: string): [number, number] => {
  const start = folded.origin[at] ?? 0;
  return [start, (folded.origin[at + needle.length - 1] ?? start) + 1];
};

/** 正規化した言葉が最初に当てはまる範囲。無ければ null。 */
export function firstRange(folded: Folded, needle: string): [number, number] | null {
  const at = needle ? folded.text.indexOf(needle) : -1;
  return at < 0 ? null : toRange(folded, at, needle);
}

/** 正規化した言葉のどれかが当てはまる範囲をすべて、前から順に（重なりと隣り合いは 1 つにまとめる）。 */
export function allRanges(folded: Folded, needles: readonly string[]): [number, number][] {
  const ranges: [number, number][] = [];
  for (const needle of needles) {
    if (!needle) continue;
    for (let at = folded.text.indexOf(needle); at >= 0; at = folded.text.indexOf(needle, at + needle.length)) {
      ranges.push(toRange(folded, at, needle));
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

/**
 * 範囲を mark で示した中身（Fragment）。部品ではなく素の要素で返すので、phrase() が中まで入って文節で折れる。
 */
export function highlight(folded: Folded, ranges: readonly (readonly [number, number])[], className?: string): ReactNode {
  if (ranges.length === 0) return folded.chars.join('');
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push(folded.chars.slice(cursor, start).join(''));
    parts.push(
      <mark key={start} className={className}>
        {folded.chars.slice(start, end).join('')}
      </mark>,
    );
    cursor = end;
  }
  if (cursor < folded.chars.length) parts.push(folded.chars.slice(cursor).join(''));
  return <>{parts}</>;
}
