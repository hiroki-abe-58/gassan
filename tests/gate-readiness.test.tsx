/**
 * 登録が出揃う前のゲート / G-12。
 *
 * 独立監査で、`gate={true}` に fail-open の窓が残っていることが分かった。
 *
 * ゲートは子の effect で登録される。サーバーでは effect が走らず、
 * クライアントでも最初のレンダーの時点ではまだ走っていない。
 * その窓で登録簿は空になるが、`gate={true}` の実装は
 * 「空＝参照すべき条件が無い＝通してよい」と読んでいた。
 *
 * 名前を並べた形（`gate={['terms']}`）は、未登録の名前を 1 件ずつ
 * 未充足として合成するので最初から fail-closed だった。
 * 同じ窓で `gate={true}` だけが通る、という非対称が残っていた。
 *
 * 併せて 2 つ直した。
 *   1. SSR スモークのアサーションが空振りしていた。html 全体から
 *      aria-disabled="true" を探していたため、Modal.Gallery の「前へ」
 *      （1 枚目なので正しく無効）に一致し、ゲートが壊れていても緑だった。
 *   2. 未登録ゲートの理由が日本語のベタ書きで、englishLabels を入れても
 *      そこだけ日本語が出ていた。
 */

import { act, render, screen } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_UNRESOLVED_GATE_MESSAGE,
  KasaneProvider,
  Modal,
  englishLabels,
  selectBlockers,
} from '../src';
import type { GateEntry } from '../src';

const entry = (satisfied: boolean, reason: string, order?: number): GateEntry => ({
  satisfied,
  reason,
  ...(order === undefined ? {} : { order }),
});

const registry = (rows: Array<[string, GateEntry]>): ReadonlyMap<string, GateEntry> =>
  new Map(rows);

/* ========================================================================== */
/* 純粋関数の契約 / G-12                                                       */
/* ========================================================================== */

describe('selectBlockers / 登録が出揃う前 / G-12', () => {
  it('2 引数で呼ぶと従来どおり（ready の既定は true）', () => {
    // 公開関数なので、第3引数を足したことで既存の呼び出しが変わってはいけない。
    expect(selectBlockers(registry([]), true)).toEqual([]);
    expect(selectBlockers(registry([['a', entry(true, 'ok')]]), true)).toEqual([]);
  });

  it('ready=false なら gate={true} は登録ゼロでも 1 件返す', () => {
    const blockers = selectBlockers(registry([]), true, { ready: false });
    expect(blockers).toHaveLength(1);
    expect(blockers[0]?.satisfied).toBe(false);
    expect(blockers[0]?.reason).toBe(DEFAULT_UNRESOLVED_GATE_MESSAGE);
  });

  it('ready=false なら、登録済みが全部充足でも gate={true} は通さない', () => {
    // まだ登録されていないゲートが残っているかもしれない。
    // 「今ある分は全部 OK」は「条件を満たした」とは違う。
    const blockers = selectBlockers(registry([['a', entry(true, 'ok')]]), true, {
      ready: false,
    });
    expect(blockers).toHaveLength(1);
    expect(blockers[0]?.reason).toBe(DEFAULT_UNRESOLVED_GATE_MESSAGE);
  });

  it('ready=false でも、実際の未充足があればその理由を優先する', () => {
    // 合成した汎用文より、登録済みの具体的な理由のほうが案内として役に立つ。
    const blockers = selectBlockers(
      registry([
        ['a', entry(false, '本文を最後までお読みください。')],
        ['b', entry(true, 'ok')],
      ]),
      true,
      { ready: false },
    );
    expect(blockers.map((b) => b.reason)).toEqual(['本文を最後までお読みください。']);
  });

  it('ready=true なら gate={true} は登録ゼロで通る', () => {
    expect(selectBlockers(registry([]), true, { ready: true })).toEqual([]);
  });

  it('gate={[]} は ready=false でも通る（条件ゼロと確定している）', () => {
    // 名前を並べた形は参照すべき条件の集合が確定している。
    // 空配列は「待つべき登録が無い」であって「まだ分からない」ではない。
    expect(selectBlockers(registry([]), [], { ready: false })).toEqual([]);
  });

  it('gate={["未登録"]} は ready に関わらず fail-closed', () => {
    for (const ready of [true, false]) {
      const blockers = selectBlockers(registry([]), ['nope'], { ready });
      expect(blockers).toHaveLength(1);
      expect(blockers[0]?.reason).toBe(DEFAULT_UNRESOLVED_GATE_MESSAGE);
    }
  });

  it('gate が false / undefined なら ready=false でも 0 件', () => {
    expect(selectBlockers(registry([]), false, { ready: false })).toEqual([]);
    expect(selectBlockers(registry([]), undefined, { ready: false })).toEqual([]);
  });

  it('unresolvedReason を渡すと未登録名にも ready 待ちにも反映される', () => {
    const options = { ready: false, unresolvedReason: 'まだ確認できません' };
    expect(selectBlockers(registry([]), ['nope'], options)[0]?.reason).toBe('まだ確認できません');
    expect(selectBlockers(registry([]), true, options)[0]?.reason).toBe('まだ確認できません');
  });

  it('order は ready=false のときも維持される', () => {
    const blockers = selectBlockers(
      registry([
        ['late', entry(false, 'あと', 2)],
        ['early', entry(false, 'さき', 1)],
      ]),
      true,
      { ready: false },
    );
    expect(blockers.map((b) => b.reason)).toEqual(['さき', 'あと']);
  });
});

/* ========================================================================== */
/* サーバーレンダー / G-12                                                     */
/* ========================================================================== */

const tree = (children: ReactNode): ReactNode => (
  <Modal.Root open onOpenChange={() => {}}>
    <Modal.Header>
      <Modal.Title>確認</Modal.Title>
    </Modal.Header>
    {children}
  </Modal.Root>
);

const gatedTree = (
  <>
    <Modal.Body>
      <Modal.Consent gate="terms">同意します</Modal.Consent>
    </Modal.Body>
    <Modal.Footer>
      <Modal.Button variant="tertiary" data-probe="ungated">
        やめる
      </Modal.Button>
      <Modal.Button variant="primary" gate data-probe="gated">
        続ける
      </Modal.Button>
    </Modal.Footer>
  </>
);

const buttonMarkup = (markup: string, probe: string): string => {
  const found = markup.match(new RegExp(`<button[^>]*data-probe="${probe}"[^>]*>`));
  if (!found) throw new Error(`data-probe="${probe}" のボタンが見つからない`);
  return found[0];
};

describe('サーバーレンダー時のゲート / G-12', () => {
  it('gate={true} のボタンはサーバーで aria-disabled になる', () => {
    const markup = renderToStaticMarkup(tree(gatedTree));
    const gated = buttonMarkup(markup, 'gated');
    expect(gated).toContain('aria-disabled="true"');
    expect(gated).toContain('data-gated=""');
  });

  it('ゲートを参照しないボタンは巻き込まれない', () => {
    // 「全部塞ぐ」で辻褄を合わせていないことを、反対側から押さえる。
    const markup = renderToStaticMarkup(tree(gatedTree));
    const ungated = buttonMarkup(markup, 'ungated');
    expect(ungated).not.toContain('aria-disabled');
    expect(ungated).not.toContain('data-gated');
  });

  it('ゲートが 1 つも無くても gate={true} はサーバーでは閉じる', () => {
    // サーバーの時点では「ゲートが無い」のか「まだ登録されていない」のか区別できない。
    const markup = renderToStaticMarkup(
      tree(
        <Modal.Footer>
          <Modal.Button variant="primary" gate data-probe="gated">
            続ける
          </Modal.Button>
        </Modal.Footer>,
      ),
    );
    expect(buttonMarkup(markup, 'gated')).toContain('aria-disabled="true"');
  });

  it('理由テキストもサーバー側のマークアップに出ている', () => {
    // aria-describedby の参照先が空だと「押せないが理由は読めない」になる。G-07。
    const markup = renderToStaticMarkup(tree(gatedTree));
    expect(markup).toContain(DEFAULT_UNRESOLVED_GATE_MESSAGE);
  });

  it('理由テキストは KasaneLabels を通る', () => {
    const markup = renderToStaticMarkup(
      <KasaneProvider labels={englishLabels}>{tree(gatedTree)}</KasaneProvider>,
    );
    expect(markup).toContain('This action still has conditions that are not met.');
    expect(markup).not.toContain(DEFAULT_UNRESOLVED_GATE_MESSAGE);
  });
});

/* ========================================================================== */
/* マウント後 / G-12                                                           */
/* ========================================================================== */

describe('マウント後のゲート / G-12', () => {
  it('ゲートが 1 つも無ければ、マウント後は押せるようになる', () => {
    // サーバーでの fail-closed が、そのまま居座ってはいけない。
    render(
      tree(
        <Modal.Footer>
          <Modal.Button variant="primary" gate>
            続ける
          </Modal.Button>
        </Modal.Footer>,
      ),
    );
    const button = screen.getByRole('button', { name: '続ける' });
    expect(button).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('未充足のゲートがあれば、マウント後は登録された理由に差し替わる', () => {
    render(tree(gatedTree));
    const button = screen.getByRole('button', { name: '続ける' });
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // 理由は aria-describedby の参照先にある。ボタンの名前には混ぜない。
    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const reason = document.getElementById(describedBy as string);
    expect(reason).toHaveTextContent('内容に同意すると次へ進めます。');
    expect(button).toHaveAccessibleName('続ける');

    // 汎用の「まだ分からない」は、具体的な理由が出た時点で消えていること。
    expect(document.body.textContent).not.toContain(DEFAULT_UNRESOLVED_GATE_MESSAGE);
  });

  it('ゲートを満たせば押せる（fail-closed が解除される）', async () => {
    const onAction = { called: false };
    render(
      tree(
        <>
          <Modal.Body>
            <Modal.Consent gate="terms">同意します</Modal.Consent>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button
              variant="primary"
              gate
              onAction={() => {
                onAction.called = true;
              }}
            >
              続ける
            </Modal.Button>
          </Modal.Footer>
        </>,
      ),
    );
    const button = screen.getByRole('button', { name: '続ける' });
    expect(button).toHaveAttribute('aria-disabled', 'true');

    await act(async () => {
      screen.getByRole('checkbox', { name: '同意します' }).click();
    });

    expect(button).not.toHaveAttribute('aria-disabled', 'true');
    await act(async () => {
      button.click();
    });
    expect(onAction.called).toBe(true);
  });

  it('resetOnClose で中身を作り直しても fail-open しない', async () => {
    // 世代が変わると子は作り直され、登録簿は一度空になる。
    // 「出揃った」を世代と結び付けていないと、その 1 レンダーだけ押せてしまう。
    function Harness(): ReactNode {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" data-testid="toggle" onClick={() => setOpen((v) => !v)}>
            切替
          </button>
          <Modal.Root open={open} onOpenChange={setOpen} resetOnClose>
            <Modal.Header>
              <Modal.Title>確認</Modal.Title>
            </Modal.Header>
            {gatedTree}
          </Modal.Root>
        </>
      );
    }
    render(<Harness />);
    const button = (): HTMLElement => screen.getByRole('button', { name: '続ける' });

    await act(async () => {
      screen.getByRole('checkbox', { name: '同意します' }).click();
    });
    expect(button()).not.toHaveAttribute('aria-disabled', 'true');

    // 閉じて開き直す。中身は作り直されるので、同意もゲートも消えている。
    await act(async () => {
      screen.getByTestId('toggle').click();
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });
    await act(async () => {
      screen.getByTestId('toggle').click();
    });

    expect(button()).toHaveAttribute('aria-disabled', 'true');
  });
});
