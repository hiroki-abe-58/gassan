/**
 * ゲートの多重登録と命令的 API の出口 / G-02 / L-14 / D-13。
 *
 * 独立監査で、ゲートの登録簿に fail-open の経路が残っていることが分かった。
 *
 * ゲートは名前で引く。登録簿が Map<name, entry> だったため、
 * 同じ名前で 2 つ登録すると後勝ちになり、
 * **先に登録したほうが unmount しただけで名前ごと消えていた。**
 * 消えた名前は参照側から見れば「そんな条件は無い」なので、
 * 未充足の条件が残っているのにボタンが押せるようになる。
 *
 * このライブラリは未登録の名前をわざわざ fail-closed に倒している（context.ts）。
 * その隣で、登録済みの条件が黙って消えて fail-open するのは筋が通らない。
 *
 * 併せて、命令的 API の「出口が無い」経路を 3 つ直した。
 *   1. 子の effect から confirm() を呼ぶと、ホストが有るのに誤報が出ていた
 *      （子の effect は親より先に走る）
 *   2. <ModalHost /> を 2 つ置いても何も言わなかった
 *   3. 待たせたままホストが消えても何も言わなかった（await が永久に返らない）
 *
 * 誤報を出す警告は、やがて全部無視される。1 と 2・3 は同じ問題の裏表である。
 */

import { act, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Modal, ModalHost, confirm, resetModalQueue, selectBlockers, useModals } from '../src';
import type { GateEntry } from '../src';
import {
  duplicateGateNames,
  mergeGateInstances,
  setGateInstance,
  type GateInstances,
} from '../src/internal/gate-registry';
import { resetWarnings } from '../src/internal/dom';
import { renderModal } from './utils';

afterEach(() => {
  resetModalQueue();
  resetWarnings();
});

const entry = (satisfied: boolean, reason: string, order?: number): GateEntry => ({
  satisfied,
  reason,
  ...(order === undefined ? {} : { order }),
});

/** 読みやすさのための組み立てヘルパ。挿入順がそのまま登録順になる。 */
function build(rows: Array<[name: string, id: string, value: GateEntry]>): GateInstances {
  let acc: GateInstances = new Map();
  for (const [name, id, value] of rows) acc = setGateInstance(acc, name, id, value);
  return acc;
}

/* ========================================================================== */
/* 登録簿の純粋関数 / G-02                                                     */
/* ========================================================================== */

describe('ゲート登録簿', () => {
  it('空の登録簿は空に畳まれる', () => {
    expect([...mergeGateInstances(new Map())]).toEqual([]);
  });

  it('登録者が1人なら、その entry がそのまま出る', () => {
    const a = entry(false, 'A未達');
    const merged = mergeGateInstances(build([['g', 'i1', a]]));
    expect(merged.get('g')).toBe(a);
  });

  it('同じ名前はひとつでも未充足なら未充足に畳まれる', () => {
    const merged = mergeGateInstances(
      build([
        ['g', 'i1', entry(true, 'A済')],
        ['g', 'i2', entry(false, 'B未達')],
      ]),
    );
    expect(merged.get('g')?.satisfied).toBe(false);
    expect(merged.get('g')?.reason).toBe('B未達');
  });

  it('同じ名前が全部充足したときだけ充足に畳まれる', () => {
    const merged = mergeGateInstances(
      build([
        ['g', 'i1', entry(true, 'A済')],
        ['g', 'i2', entry(true, 'B済')],
      ]),
    );
    expect(merged.get('g')?.satisfied).toBe(true);
  });

  it('案内するのは未充足のうち order が最小のもの', () => {
    const merged = mergeGateInstances(
      build([
        ['g', 'i1', entry(false, 'あと', 5)],
        ['g', 'i2', entry(false, 'さき', 1)],
      ]),
    );
    expect(merged.get('g')?.reason).toBe('さき');
  });

  it('order が同点なら先に登録されたほうを案内する', () => {
    const merged = mergeGateInstances(
      build([
        ['g', 'i1', entry(false, 'さき', 2)],
        ['g', 'i2', entry(false, 'あと', 2)],
      ]),
    );
    expect(merged.get('g')?.reason).toBe('さき');
  });

  it('畳んだ結果は合成物ではなく、登録された entry そのものである', () => {
    const b = entry(false, 'B未達', 1);
    const merged = mergeGateInstances(
      build([
        ['g', 'i1', entry(false, 'A未達', 9)],
        ['g', 'i2', b],
      ]),
    );
    // reason と focus がちぐはぐな組を作らないための性質。
    expect(merged.get('g')).toBe(b);
  });

  it('1人が解除されても、残りの登録者の条件は残る', () => {
    const after = setGateInstance(
      build([
        ['g', 'i1', entry(false, 'A未達')],
        ['g', 'i2', entry(false, 'B未達')],
      ]),
      'g',
      'i1',
      null,
    );
    expect(mergeGateInstances(after).get('g')?.reason).toBe('B未達');
  });

  it('最後の1人が解除されたら名前ごと消える', () => {
    const after = setGateInstance(build([['g', 'i1', entry(false, 'A')]]), 'g', 'i1', null);
    expect(after.has('g')).toBe(false);
  });

  it('同じ内容で呼び直されたら同じ参照を返す（再レンダーを増やさない）', () => {
    const before = build([['g', 'i1', entry(false, 'A', 1)]]);
    expect(setGateInstance(before, 'g', 'i1', entry(false, 'A', 1))).toBe(before);
  });

  it('居ない登録者を解除しても同じ参照を返す', () => {
    const before = build([['g', 'i1', entry(false, 'A')]]);
    expect(setGateInstance(before, 'g', 'nobody', null)).toBe(before);
    expect(setGateInstance(before, 'other', 'i1', null)).toBe(before);
  });

  it('2人以上が同じ名前を使っていることを検出できる', () => {
    const instances = build([
      ['dup', 'i1', entry(false, 'A')],
      ['dup', 'i2', entry(false, 'B')],
      ['solo', 'i3', entry(false, 'C')],
    ]);
    expect(duplicateGateNames(instances)).toEqual(['dup']);
  });
});

/* ========================================================================== */
/* 参照側の重複 / G-02                                                         */
/* ========================================================================== */

describe('ゲートの参照', () => {
  it('同じ名前を2回書いても理由は1件しか数えない', () => {
    const gates = new Map([['a', entry(false, '未達')]]);
    expect(selectBlockers(gates, ['a', 'a'])).toHaveLength(1);
  });

  it('未登録の名前を2回書いても1件に畳まれる', () => {
    expect(selectBlockers(new Map(), ['missing', 'missing'])).toHaveLength(1);
  });

  it('重複を除いても並び順は order のまま', () => {
    const gates = new Map([
      ['a', entry(false, 'あと', 5)],
      ['b', entry(false, 'さき', 1)],
    ]);
    expect(selectBlockers(gates, ['a', 'b', 'a']).map((e) => e.reason)).toEqual(['さき', 'あと']);
  });
});

/* ========================================================================== */
/* 実際のモーダルで fail-open しないこと / G-02                                 */
/* ========================================================================== */

describe('同じ名前のゲートが2つあるとき', () => {
  function Dup({ showFirst }: { showFirst: boolean }) {
    return (
      <>
        {showFirst ? <Modal.Gate name="dup" satisfied={false} reason="A未達" /> : null}
        <Modal.Gate name="dup" satisfied={false} reason="B未達" />
      </>
    );
  }

  it('片方が消えても、残ったほうの条件でブロックし続ける', async () => {
    // 名前の重複そのものは別のテストで見る。ここでは警告を黙らせて挙動だけを見る。
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const view = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>重複</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Dup showFirst />
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="primary" gate>
              進む
            </Modal.Button>
          </Modal.Footer>
        </>
      ),
    });

    const button = screen.getByRole('button', { name: /進む/ });
    expect(button).toHaveAttribute('aria-disabled', 'true');

    view.rerender(
      <Modal.Root open onOpenChange={() => {}}>
        <Modal.Header>
          <Modal.Title>重複</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Dup showFirst={false} />
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="primary" gate>
            進む
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>,
    );
    await act(async () => {});

    // ここが fail-open していた箇所。B は未充足のままなので押せてはいけない。
    expect(screen.getByRole('button', { name: /進む/ })).toHaveAttribute('aria-disabled', 'true');
    warn.mockRestore();
  });

  it('名前の重複は開発時に警告する', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>重複</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Dup showFirst />
          </Modal.Body>
        </>
      ),
    });
    const messages = spy.mock.calls.map((call) => String(call[0])).join('\n');
    spy.mockRestore();
    expect(messages).toMatch(/registered under the name "dup"/);
  });

  it('名前が別なら警告しない', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>別名</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Gate name="a" satisfied={false} reason="A" />
            <Modal.Gate name="b" satisfied={false} reason="B" />
          </Modal.Body>
        </>
      ),
    });
    const messages = spy.mock.calls.map((call) => String(call[0])).join('\n');
    spy.mockRestore();
    expect(messages).not.toMatch(/registered under the name/);
  });
});

/* ========================================================================== */
/* 命令的 API の出口 / L-14                                                    */
/* ========================================================================== */

describe('命令的 API の出口', () => {
  it('子の effect から呼んでも、ホストが有れば誤報を出さない', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    function Child() {
      // 子の effect は親（ModalHost）の effect より先に走る。
      // ここで即座にホストの有無を見ると、正しい構成でも誤報が出ていた。
      useEffect(() => {
        void confirm({ title: '確認' });
      }, []);
      return null;
    }

    render(
      <>
        <ModalHost />
        <Child />
      </>,
    );
    await act(async () => {});

    const messages = spy.mock.calls.map((call) => String(call[0])).join('\n');
    spy.mockRestore();
    expect(messages).not.toMatch(/never settle/);
  });

  it('ホストが無いまま呼んだら警告する', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    void confirm({ title: '宛先なし' });
    await act(async () => {});
    const messages = spy.mock.calls.map((call) => String(call[0])).join('\n');
    spy.mockRestore();
    expect(messages).toMatch(/not mounted/);
  });

  it('ホストが2つ載っていたら警告する', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <ModalHost />
        <ModalHost />
      </>,
    );
    const messages = spy.mock.calls.map((call) => String(call[0])).join('\n');
    spy.mockRestore();
    expect(messages).toMatch(/instances are mounted/);
  });

  it('ホストが1つなら警告しない', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ModalHost />);
    const messages = spy.mock.calls.map((call) => String(call[0])).join('\n');
    spy.mockRestore();
    expect(messages).not.toMatch(/instances are mounted/);
  });

  it('待たせたままホストが消えたら警告する', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    function Harness() {
      const modals = useModals();
      const [mounted, setMounted] = useState(true);
      return (
        <>
          {mounted ? <ModalHost /> : null}
          <button type="button" onClick={() => void modals.confirm({ title: '待機' })}>
            要求
          </button>
          <button type="button" onClick={() => setMounted(false)}>
            外す
          </button>
        </>
      );
    }

    render(<Harness />);
    await act(async () => {
      screen.getByRole('button', { name: '要求' }).click();
    });
    await act(async () => {
      screen.getByRole('button', { name: '外す' }).click();
    });

    const messages = spy.mock.calls.map((call) => String(call[0])).join('\n');
    spy.mockRestore();
    expect(messages).toMatch(/still pending/);
  });

  it('待機が無ければホストが消えても警告しない', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const view = render(<ModalHost />);
    view.unmount();
    await act(async () => {});
    const messages = spy.mock.calls.map((call) => String(call[0])).join('\n');
    spy.mockRestore();
    expect(messages).not.toMatch(/still pending/);
  });
});
