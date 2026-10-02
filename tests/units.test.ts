import { describe, expect, it } from 'vitest';

import { selectBlockers, shouldDismissBySwipe } from '../src';
import {
  isPrimaryPointer,
  isTextEntry,
  readCssDurationMs,
} from '../src/internal/dom';
import { isTopModal, popModal, pushModal, resetModalStack } from '../src/internal/stack';
import type { GateEntry } from '../src';

describe('shouldDismissBySwipe', () => {
  it('上方向のドラッグでは閉じない', () => {
    expect(shouldDismissBySwipe({ deltaY: -200, elapsedMs: 100, panelHeight: 600 })).toBe(false);
  });

  it('わずかな移動では閉じない', () => {
    expect(shouldDismissBySwipe({ deltaY: 10, elapsedMs: 300, panelHeight: 600 })).toBe(false);
  });

  it('速いフリックは距離が短くても閉じる', () => {
    expect(shouldDismissBySwipe({ deltaY: 60, elapsedMs: 60, panelHeight: 600 })).toBe(true);
  });

  it('ゆっくりでも高さの25%を超えれば閉じる', () => {
    expect(shouldDismissBySwipe({ deltaY: 110, elapsedMs: 2000, panelHeight: 400 })).toBe(true);
  });

  it('高さの25%が120pxを超える場合は120pxで頭打ちになる', () => {
    // 2000px のパネルで 500px 引かないと閉じない、では指が届かない。
    expect(shouldDismissBySwipe({ deltaY: 130, elapsedMs: 2000, panelHeight: 2000 })).toBe(true);
  });

  it('高さ不明（0）でも閾値が決まる', () => {
    expect(shouldDismissBySwipe({ deltaY: 130, elapsedMs: 2000, panelHeight: 0 })).toBe(true);
    expect(shouldDismissBySwipe({ deltaY: 100, elapsedMs: 2000, panelHeight: 0 })).toBe(false);
  });

  it('経過時間0でも0除算にならない', () => {
    expect(() =>
      shouldDismissBySwipe({ deltaY: 50, elapsedMs: 0, panelHeight: 600 }),
    ).not.toThrow();
  });
});

describe('selectBlockers', () => {
  const gates = new Map<string, GateEntry>([
    ['read', { satisfied: true, reason: '読んでください', order: 0 }],
    ['terms', { satisfied: false, reason: '同意してください', order: 2 }],
    ['age', { satisfied: false, reason: '年齢を入力してください', order: 1 }],
  ]);

  it('selector が未指定なら何もブロックしない', () => {
    expect(selectBlockers(gates, undefined)).toEqual([]);
    expect(selectBlockers(gates, false)).toEqual([]);
  });

  it('true は登録済みの全ゲートを見る', () => {
    expect(selectBlockers(gates, true).map((entry) => entry.reason)).toEqual([
      '年齢を入力してください',
      '同意してください',
    ]);
  });

  it('order の小さい順に案内する', () => {
    const result = selectBlockers(gates, ['terms', 'age']);
    expect(result[0]?.reason).toBe('年齢を入力してください');
  });

  it('充足済みのゲートは除外する', () => {
    expect(selectBlockers(gates, ['read'])).toEqual([]);
  });

  it('未登録の名前は fail-closed（ブロックする）', () => {
    // マウント順の都合で一瞬未登録になる時間帯に押せてしまうと、
    // 「開いた直後だけ通る」という最悪の抜け道になる。
    const result = selectBlockers(gates, ['not-registered-yet']);
    expect(result).toHaveLength(1);
    expect(result[0]?.satisfied).toBe(false);
  });
});

describe('readCssDurationMs', () => {
  it('要素が無ければ fallback', () => {
    expect(readCssDurationMs(null, '--x', 120)).toBe(120);
  });

  it('ms と s の両方を解釈する', () => {
    const el = document.createElement('div');
    el.style.setProperty('--a', '180ms');
    el.style.setProperty('--b', '0.25s');
    document.body.append(el);
    expect(readCssDurationMs(el, '--a', 0)).toBe(180);
    expect(readCssDurationMs(el, '--b', 0)).toBe(250);
    el.remove();
  });

  it('壊れた値は fallback に落ちる', () => {
    const el = document.createElement('div');
    el.style.setProperty('--a', 'fast');
    document.body.append(el);
    expect(readCssDurationMs(el, '--a', 99)).toBe(99);
    el.remove();
  });
});

describe('isPrimaryPointer', () => {
  it('PointerEvent 非対応環境（isPrimary が undefined）でも通す', () => {
    expect(isPrimaryPointer({})).toBe(true);
  });
  it('副ポインタは弾く', () => {
    expect(isPrimaryPointer({ isPrimary: false })).toBe(false);
  });
  it('右クリックは弾く', () => {
    expect(isPrimaryPointer({ button: 2 })).toBe(false);
  });
  it('主ボタンは通す', () => {
    expect(isPrimaryPointer({ isPrimary: true, button: 0 })).toBe(true);
  });
});

describe('isTextEntry', () => {
  it('テキスト入力とテキストエリアを検出する', () => {
    const input = document.createElement('input');
    input.type = 'email';
    const textarea = document.createElement('textarea');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    expect(isTextEntry(input)).toBe(true);
    expect(isTextEntry(textarea)).toBe(true);
    expect(isTextEntry(checkbox)).toBe(false);
    expect(isTextEntry(null)).toBe(false);
  });
});

describe('modal stack', () => {
  it('最前面以外に data-k-covered を付ける', () => {
    resetModalStack();
    const a = document.createElement('dialog');
    const b = document.createElement('dialog');

    pushModal(a);
    expect(a.hasAttribute('data-k-covered')).toBe(false);
    expect(isTopModal(a)).toBe(true);

    pushModal(b);
    expect(a.hasAttribute('data-k-covered')).toBe(true);
    expect(b.hasAttribute('data-k-covered')).toBe(false);
    expect(isTopModal(b)).toBe(true);

    popModal(b);
    expect(a.hasAttribute('data-k-covered')).toBe(false);
    expect(isTopModal(a)).toBe(true);

    resetModalStack();
  });

  it('同じ要素を二重に push しても重複しない', () => {
    resetModalStack();
    const a = document.createElement('dialog');
    pushModal(a);
    pushModal(a);
    popModal(a);
    expect(isTopModal(a)).toBe(false);
    resetModalStack();
  });
});
