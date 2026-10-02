/**
 * 構造コンテナの空入力 / D-12。
 *
 * 文書のコード例を型チェックに掛けたところ（scripts/check-docs.mjs）、
 * README のシート例が `<Modal.Body>{/* … *\/}</Modal.Body>` で落ちた。
 * `ModalBodyProps.children` が必須だったためである。
 *
 * ところが `children: ReactNode` を必須にしても中身があることは保証できない。
 * `{null}` `{undefined}` `{false}` `{[]}` はいずれも ReactNode なので型を通り、
 * 弾けるのは「実行時には undefined と同じ」コメントだけの書き方に限られる。
 * 保証にならない制約だったので、構造コンテナ（Root / Header / Body / Section / Footer）
 * では children を任意にした。
 *
 * ここでは次の2つを固定する。
 *   1. 型の規約   — 構造コンテナは空でも通り、名前を持つ部品は空だと通らない
 *   2. 実行時の挙動 — 空でも領域・名前・ゲートが壊れない
 *
 * 特に 2 の読了ゲートが重要で、空の本文がスクロール不要と判定されなければ、
 * 利用者は永久にボタンを押せなくなる（G-03 の「そもそもスクロールが要らない高さだった」）。
 */

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from '../src';
import { emitResize, mockScrollMetrics, renderModal } from './utils';

/* ========================================================================== */
/* 型の規約 / D-12                                                            */
/* ========================================================================== */

/*
 * tsc は tests/ も見るので、ここに書いた型の主張はそのまま検査される。
 * @ts-expect-error が「実はエラーにならない」場合も tsc が落ちるため、
 * 必須／任意のどちらに転んでも気づける。
 */
describe('children の必須・任意の規約 / D-12', () => {
  it('構造コンテナは children を省略できる', () => {
    const structural = (
      <>
        <Modal.Header />
        <Modal.Body />
        <Modal.Section />
        <Modal.Footer />
      </>
    );
    expect(structural).toBeTruthy();
  });

  it('名前を持つ部品は children を省略できない', () => {
    const labelled = (
      <>
        {/* @ts-expect-error Modal.Title は空だとアクセシブルネームが消える */}
        <Modal.Title />
        {/* @ts-expect-error Modal.Button は空だと名前のないボタンになる */}
        <Modal.Button variant="primary" />
        {/* @ts-expect-error Modal.Consent は空だとチェックの意味が読めない */}
        <Modal.Consent gate="x" />
        {/* @ts-expect-error Modal.Description は空なら要素ごと置かないほうがよい */}
        <Modal.Description />
      </>
    );
    expect(labelled).toBeTruthy();
  });
});

/* ========================================================================== */
/* 実行時の挙動                                                               */
/* ========================================================================== */

describe('空の構造コンテナ / D-12', () => {
  it('children なしの Body でもスクロール領域と名前が残る', () => {
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>空の本文</Modal.Title>
          </Modal.Header>
          <Modal.Body />
        </>
      ),
    });
    const body = screen.getByRole('group', { name: '本文' });
    expect(body).toBeInTheDocument();
    // キーボードで到達できないスクロール領域を作らない。B-02。
    expect(body).toHaveAttribute('tabindex', '0');
  });

  it('children なしの Section は、見出しが無ければただの div になる', () => {
    const { dialog } = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>節</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Section />
          </Modal.Body>
        </>
      ),
    });
    const section = dialog().querySelector('.g-section');
    expect(section).not.toBeNull();
    // 名前のない region を支援技術に増やさない。
    expect(section?.tagName).toBe('DIV');
  });

  it('children なしでも title があれば section と見出しを出す', () => {
    const { dialog } = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>節</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Section title="まだ何もありません" />
          </Modal.Body>
        </>
      ),
    });
    const section = dialog().querySelector('.g-section');
    expect(section?.tagName).toBe('SECTION');
    expect(screen.getByRole('heading', { name: 'まだ何もありません', level: 3 })).toBeVisible();
  });

  it('children なしの Header / Footer も落ちずに枠だけ残る', () => {
    const { dialog } = renderModal({
      children: (
        <>
          <Modal.Header />
          <Modal.Body>本文</Modal.Body>
          <Modal.Footer />
        </>
      ),
    });
    expect(dialog().querySelector('.g-header')).not.toBeNull();
    expect(dialog().querySelector('.g-footer')).not.toBeNull();
  });

  /*
   * ここが本題。空の本文は「スクロールが要らない高さ」なので、
   * 読了ゲートは開いた時点で満たされていなければならない。
   * 満たされないと、読む中身が無いのにボタンが永久に押せなくなる。
   */
  it('空の本文でも読了ゲートが満たされ、ボタンが押せる', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>確認</Modal.Title>
          </Modal.Header>
          <Modal.Body readGate="read" />
          <Modal.Footer>
            <Modal.Button variant="primary" gate onAction={onAction}>
              続ける
            </Modal.Button>
          </Modal.Footer>
        </>
      ),
    });

    // jsdom はレイアウトを持たないので、測定できる状態を作る。
    const body = screen.getByRole('group', { name: '本文' });
    mockScrollMetrics(body, { scrollHeight: 120, clientHeight: 120 });
    act(() => {
      emitResize(body);
    });

    const button = screen.getByRole('button', { name: '続ける' });
    await waitFor(() => {
      expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });

    await user.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('空の本文でも、測れないあいだは閉じたまま（fail-closed）', () => {
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>確認</Modal.Title>
          </Modal.Header>
          <Modal.Body readGate="read" />
          <Modal.Footer>
            <Modal.Button variant="primary" gate>
              続ける
            </Modal.Button>
          </Modal.Footer>
        </>
      ),
    });
    // clientHeight が 0 のあいだ（= 閉じている／未レイアウト）は
    // 「読み終えた」と判定しない。開く前に通してしまうほうが危険なため。
    expect(screen.getByRole('button', { name: '続ける' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});
