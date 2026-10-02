/**
 * ネストしたモーダル（L-11 / L-12 / K-06 / M-06 / M-07 / F-10）。
 *
 * これまでスタックは `src/internal/stack.ts` を素の <dialog> で直接叩く単体テスト
 * （units.test.ts）しか持っていなかった。実際の `Modal.Root` を2枚マウントしたときの
 * 「覆い」「イベントの染み出し」「フォーカス復帰の連鎖」「スクロールロックの参照数」
 * 「戻るジェスチャ」は一度も通していない。ROADMAP v0.2.0 はこれを実機送りにしていたが、
 * 真偽が決まるのは描画ではなくイベントの配り方なので、jsdom で確かめられる。
 *
 * 内側は外側の本文の中にマウントする。これが入れ子の自然な書き方であり、
 * かつ「内側の dialog が外側の dialog の DOM 子孫になる」という、
 * 染み出しが起きる唯一の条件でもある。
 *
 * 層1（top layer の重なり順そのもの、::backdrop の実描画）は jsdom では検証できない。
 * その範囲は VERIFICATION.md の検品票に残す。
 */
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Modal } from '../src';
import type { CloseReason } from '../src';
import { resetWarnings } from '../src/internal/dom';
import { resetScrollLock } from '../src/internal/scroll-lock';
import { resetModalStack } from '../src/internal/stack';

interface NestOptions {
  closeOnBack?: boolean;
  lockScroll?: boolean;
  submitShortcut?: boolean;
}

interface Calls {
  outer: CloseReason[];
  inner: CloseReason[];
}

interface NestResult {
  outer: () => HTMLDialogElement;
  inner: () => HTMLDialogElement;
  openInner: () => Promise<void>;
  reasons: () => Calls;
  primaries: () => { outer: number; inner: number };
  trigger: () => HTMLButtonElement;
}

/**
 * 外側の本文に「内側を開く」ボタンと、内側の Root を置く。
 * 条件マウントにはしない（ModalRootProps.open の契約どおり、常時マウントして open で開閉する）。
 */
function renderNested(options: NestOptions = {}): NestResult {
  const outerReasons: CloseReason[] = [];
  const innerReasons: CloseReason[] = [];
  const primary = { outer: 0, inner: 0 };
  const user = userEvent.setup();

  function Harness(): ReactNode {
    const [outerOpen, setOuterOpen] = useState(true);
    const [innerOpen, setInnerOpen] = useState(false);
    return (
      <Modal.Root
        {...options}
        open={outerOpen}
        onOpenChange={(next: boolean, reason: CloseReason) => {
          if (!next) outerReasons.push(reason);
          setOuterOpen(next);
        }}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>外側</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <button type="button" data-testid="open-inner" onClick={() => setInnerOpen(true)}>
            内側を開く
          </button>
          <Modal.Root
            {...options}
            open={innerOpen}
            onOpenChange={(next: boolean, reason: CloseReason) => {
              if (!next) innerReasons.push(reason);
              setInnerOpen(next);
            }}
          >
            <Modal.Header>
              <Modal.Controls end={<Modal.Close />} />
              <Modal.Title>内側</Modal.Title>
            </Modal.Header>
            <Modal.Body>内側の本文</Modal.Body>
            <Modal.Footer>
              <Modal.Button
                variant="primary"
                onClick={() => {
                  primary.inner += 1;
                }}
              >
                内側の決定
              </Modal.Button>
            </Modal.Footer>
          </Modal.Root>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button
            variant="primary"
            onClick={() => {
              primary.outer += 1;
            }}
          >
            外側の決定
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    );
  }

  render(<Harness />);

  // 内側は外側の本文の中にある。DOM の包含関係で一意に決まる。
  const outerEl = (): HTMLDialogElement => {
    const el = document.querySelector<HTMLDialogElement>('dialog.k-dialog');
    if (!el) throw new Error('outer dialog not found');
    return el;
  };
  const innerEl = (): HTMLDialogElement => {
    const el = outerEl().querySelector<HTMLDialogElement>('dialog.k-dialog');
    if (!el) throw new Error('inner dialog not found');
    return el;
  };
  const triggerEl = (): HTMLButtonElement => {
    const el = document.querySelector<HTMLButtonElement>('[data-testid="open-inner"]');
    if (!el) throw new Error('trigger not found');
    return el;
  };

  return {
    outer: outerEl,
    inner: innerEl,
    trigger: triggerEl,
    openInner: async () => {
      await user.click(triggerEl());
    },
    reasons: () => ({ outer: outerReasons, inner: innerReasons }),
    primaries: () => ({ ...primary }),
  };
}

/** ネイティブの Esc 相当。バブルしない cancel をその dialog に直接投げる。 */
function cancelOn(dialog: HTMLDialogElement): void {
  act(() => {
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
  });
}

beforeEach(() => {
  resetModalStack();
  resetScrollLock();
  resetWarnings();
});

afterEach(() => {
  resetModalStack();
  resetScrollLock();
  vi.restoreAllMocks();
  window.history.replaceState(null, '');
});

/* ========================================================================== */
/* L-11 / L-12 覆い                                                            */
/* ========================================================================== */

describe('nested modals / L-11 + L-12 覆い', () => {
  it('2枚開くと下にだけ data-k-covered が付く', async () => {
    const nest = renderNested();
    expect(nest.outer()).not.toHaveAttribute('data-k-covered');

    await nest.openInner();

    expect(nest.outer()).toHaveAttribute('data-k-covered');
    expect(nest.inner()).not.toHaveAttribute('data-k-covered');
  });

  it('上を閉じると下の覆いが外れ、下が最前面に戻る', async () => {
    const nest = renderNested();
    await nest.openInner();
    expect(nest.outer()).toHaveAttribute('data-k-covered');

    cancelOn(nest.inner());

    await waitFor(() => {
      expect(nest.outer()).not.toHaveAttribute('data-k-covered');
    });
    expect(nest.outer().open).toBe(true);
  });
});

/* ========================================================================== */
/* L-12 イベントの染み出し                                                      */
/* ========================================================================== */

describe('nested modals / L-12 イベントの染み出し', () => {
  it('Esc 一回で閉じるのは内側だけ（外側まで伝わらない）', async () => {
    const nest = renderNested();
    await nest.openInner();

    cancelOn(nest.inner());

    await waitFor(() => {
      expect(nest.inner().open).toBe(false);
    });
    expect(nest.reasons().inner).toEqual(['esc']);
    // React は非バブルの cancel でも fiber ツリーを遡る。外側が巻き添えで閉じないこと。
    expect(nest.reasons().outer).toEqual([]);
    expect(nest.outer().open).toBe(true);
  });

  it('内側が閉じても外側は programmatic として扱われない', async () => {
    const nest = renderNested();
    await nest.openInner();

    cancelOn(nest.inner());

    await waitFor(() => {
      expect(nest.inner().open).toBe(false);
    });
    expect(nest.reasons().outer).toEqual([]);
  });

  it('内側の Cmd+Enter は内側の primary だけを押す', async () => {
    const nest = renderNested({ submitShortcut: true });
    await nest.openInner();

    const body = nest.inner().querySelector<HTMLElement>('.k-body');
    expect(body).not.toBeNull();
    act(() => {
      body?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }),
      );
    });

    // keydown はネイティブでバブルし、外側の dialog にも届く。
    expect(nest.primaries()).toEqual({ outer: 0, inner: 1 });
  });

  it('外側の Cmd+Enter は外側の primary を押す（ガードが効きすぎていない）', async () => {
    const nest = renderNested({ submitShortcut: true });

    const body = nest.outer().querySelector<HTMLElement>('.k-body');
    act(() => {
      body?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }),
      );
    });

    expect(nest.primaries()).toEqual({ outer: 1, inner: 0 });
  });
});

/* ========================================================================== */
/* K-06 フォーカス復帰の連鎖                                                    */
/* ========================================================================== */

describe('nested modals / K-06 フォーカス復帰の連鎖', () => {
  it('上を閉じるとフォーカスが下のモーダル内のトリガーへ戻る', async () => {
    const nest = renderNested();
    const trigger = nest.trigger();

    await nest.openInner();
    expect(nest.inner().contains(document.activeElement)).toBe(true);

    cancelOn(nest.inner());

    await waitFor(() => {
      expect(nest.inner().open).toBe(false);
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });
});

/* ========================================================================== */
/* M-06 スクロールロックの参照数                                                */
/* ========================================================================== */

describe('nested modals / M-06 スクロールロック', () => {
  it('上を閉じても下が開いている間はロックが外れない', async () => {
    const nest = renderNested({ lockScroll: true });
    expect(document.documentElement).toHaveAttribute('data-k-locked');

    await nest.openInner();
    expect(document.documentElement).toHaveAttribute('data-k-locked');

    cancelOn(nest.inner());

    await waitFor(() => {
      expect(nest.inner().open).toBe(false);
    });
    // 外側はまだ開いている。ここで外れたら背面がスクロールしてしまう。
    expect(document.documentElement).toHaveAttribute('data-k-locked');
  });
});

/* ========================================================================== */
/* M-07 戻るジェスチャ                                                         */
/* ========================================================================== */

describe('nested modals / M-07 戻るジェスチャ', () => {
  const back = (): void => {
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });
  };

  it('戻る1回で閉じるのは最前面だけ（下まで巻き込まない）', async () => {
    const nest = renderNested({ closeOnBack: true });
    await nest.openInner();

    back();

    await waitFor(() => {
      expect(nest.inner().open).toBe(false);
    });
    expect(nest.reasons().inner).toEqual(['back-button']);
    expect(nest.outer().open).toBe(true);
    expect(nest.reasons().outer).toEqual([]);
  });

  it('上を閉じたあと、もう1回戻ると下が閉じる', async () => {
    const nest = renderNested({ closeOnBack: true });
    await nest.openInner();

    back();
    await waitFor(() => {
      expect(nest.inner().open).toBe(false);
    });

    back();
    await waitFor(() => {
      expect(nest.reasons().outer).toEqual(['back-button']);
    });
  });

  it('行き先が自分の印なら戻るジェスチャとして扱わない', async () => {
    const nest = renderNested({ closeOnBack: true });
    // 外側が開いた時点の印。上が × で閉じると、後始末の back() でここへ戻ってくる。
    const own = window.history.state as { __kasane?: string } | null;
    expect(typeof own?.__kasane).toBe('string');

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: own }));
    });

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(nest.outer().open).toBe(true);
    expect(nest.reasons().outer).toEqual([]);
  });

  it('閉じて開き直しても、次の戻るを飲み込まない', async () => {
    const nest = renderNested({ closeOnBack: true });
    await nest.openInner();

    // 戻る以外で閉じる。後始末の history.back() は最初の entry だと popstate を生まない。
    // ここで「次の popstate を無視する」印を持ち越すと、次の本物の戻るが効かなくなる。
    cancelOn(nest.inner());
    await waitFor(() => {
      expect(nest.inner().open).toBe(false);
    });

    await nest.openInner();
    await waitFor(() => {
      expect(nest.inner().open).toBe(true);
    });

    back();
    await waitFor(() => {
      expect(nest.reasons().inner).toEqual(['esc', 'back-button']);
    });
  });

  it('上を × で閉じた後始末の back() が、下を巻き込まない', async () => {
    const nest = renderNested({ closeOnBack: true });
    await nest.openInner();

    // 内側を戻る以外の手段で閉じる。後始末で history.back() が走る。
    cancelOn(nest.inner());

    await waitFor(() => {
      expect(nest.inner().open).toBe(false);
    });
    // back() 由来の popstate が届いたあとも外側は生きていること。
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(nest.outer().open).toBe(true);
    expect(nest.reasons().outer).toEqual([]);
  });
});
