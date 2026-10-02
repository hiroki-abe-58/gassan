/**
 * ゲート登録簿。G-02 の多重登録まわり。
 *
 * ゲートは名前で引く。しかし「名前はひとつ、登録者は複数」が起きる。
 * 同じ画面に同じ `name` の Gate を 2 つ置いたとき、
 * 素朴に Map<name, entry> で持つと後勝ちになり、
 * **先に登録したほうが unmount しただけで、後勝ち分まで消える**。
 * 消えた名前は参照側から見れば「ゲートが無い」なので、
 * 未充足のままボタンが押せるようになる。fail-open である。
 *
 * このライブラリはゲートで fail-open を出してはいけない。
 * そこで name → instanceId → entry の二段で持ち、
 * 参照側に渡す直前に「名前ごと 1 件」へ畳む。畳み方は連言（AND）。
 *
 * React を起動せずに検証できるよう、DOM も state も持たない純粋関数として置く。
 */

import type { GateEntry } from '../types';

/** 名前 → 登録者 → 中身。どちらの Map も挿入順を保つ。 */
export type GateInstances = ReadonlyMap<string, ReadonlyMap<string, GateEntry>>;

/** 畳んだあと。参照側（selectBlockers）はこの形だけを見る。 */
export type MergedGates = ReadonlyMap<string, GateEntry>;

function sameEntry(a: GateEntry, b: GateEntry): boolean {
  return (
    a.satisfied === b.satisfied &&
    a.reason === b.reason &&
    a.focus === b.focus &&
    a.order === b.order
  );
}

/**
 * 1 件ぶんの登録・更新・解除。
 *
 * 変化が無いときは受け取った参照をそのまま返す。
 * 呼び出し側（setState）が再レンダーを省けるようにするため、
 * 「同じ内容で呼び直されただけ」を必ずここで吸収する。
 *
 * @param entry null を渡すと解除。
 */
export function setGateInstance(
  previous: GateInstances,
  name: string,
  instanceId: string,
  entry: GateEntry | null,
): GateInstances {
  const bucket = previous.get(name);

  if (entry === null) {
    if (!bucket || !bucket.has(instanceId)) return previous;
    const next = new Map(previous);
    if (bucket.size === 1) {
      // 最後の 1 件が抜けたら、名前ごと消す。
      // 空の bucket を残すと「登録されているが中身が無い名前」になる。
      next.delete(name);
    } else {
      const inner = new Map(bucket);
      inner.delete(instanceId);
      next.set(name, inner);
    }
    return next;
  }

  const current = bucket?.get(instanceId);
  if (current && sameEntry(current, entry)) return previous;

  const next = new Map(previous);
  const inner = new Map(bucket ?? []);
  inner.set(instanceId, entry);
  next.set(name, inner);
  return next;
}

/**
 * 名前ごとに 1 件へ畳む。
 *
 * 規則は 2 つだけ。
 *   1. ひとつでも未充足なら、その名前は未充足（連言・fail-closed）
 *   2. 案内するのは未充足のうち order が最小のもの。同点なら先に登録されたもの
 *
 * 畳んだ結果は必ず「実際に登録された entry そのもの」であり、
 * 複数の entry を混ぜた合成物は作らない。
 * reason と focus がちぐはぐな組（A の文言で B へ飛ばす）を生まないため。
 */
export function mergeGateInstances(instances: GateInstances): MergedGates {
  const merged = new Map<string, GateEntry>();

  for (const [name, bucket] of instances) {
    let chosen: GateEntry | undefined;
    let chosenOrder = Number.POSITIVE_INFINITY;
    let fallback: GateEntry | undefined;

    for (const entry of bucket.values()) {
      if (!fallback) fallback = entry;
      if (entry.satisfied) continue;
      const order = entry.order ?? 0;
      // 厳密な < で比較する。同点のときは先に見たほう（挿入順で先）を残す。
      if (!chosen || order < chosenOrder) {
        chosen = entry;
        chosenOrder = order;
      }
    }

    const result = chosen ?? fallback;
    if (result) merged.set(name, result);
  }

  return merged;
}

/** 2 件以上の登録者を持つ名前。開発時の警告に使う。 */
export function duplicateGateNames(instances: GateInstances): string[] {
  const names: string[] = [];
  for (const [name, bucket] of instances) {
    if (bucket.size > 1) names.push(name);
  }
  return names;
}
