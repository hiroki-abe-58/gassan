/**
 * 退出アニメの fallback（L-07）と、閉じた後の後始末の順序。
 *
 * overlay transition は MDN 上 Limited availability（not Baseline）。
 * 未対応ブラウザでも退出が見えるよう、Root は
 *   1. data-exiting を付ける（dialog は open のまま）
 *   2. --k-dur-out（reduced-motion なら最短）待つ
 *   3. close() し、その後で onExited / reset / focus 復帰 / scroll unlock
 * の順で動く。ここではその順序を fake timers で固定する。
 *
 * jsdom は CSS を読まない（vitest の css: false）ので、--k-dur-out は
 * readCssDurationMs の fallback 値 120ms、待ちは 120 + 20(grace) = 140ms になる。
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Modal, ModalHost, confirm, resetModalQueue } from '../src';
import { resetWarnings } from '../src/internal/dom';
import { resetScrollLock } from '../src/internal/scroll-lock';
import { resetModalStack } from '../src/internal/stack';
import { renderModal } from './utils';

const EXIT_MS = 140;

function mockReducedMotion(): void {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
}

/** polyfill の close() は queueMicrotask で close イベントを流す。それを流し切る。 */
async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

const html = (): HTMLElement => document.documentElement;

describe('exit fallback / L-07', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    resetScrollLock();
    resetModalStack();
  });

  it('close 要求の直後は open のまま data-exiting が付き、期限後に close して onExited', () => {
    const onExited = vi.fn();
    const { dialog, onOpenChange } = renderModal({ onExited });

    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'close-button');

    // ここで即 close() すると overlay 非対応ブラウザでは一瞬で消える。
    expect(dialog().open).toBe(true);
    expect(dialog()).toHaveAttribute('data-exiting');
    expect(onExited).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(dialog().open).toBe(true);
    expect(dialog()).toHaveAttribute('data-exiting');
    expect(onExited).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(EXIT_MS - 100);
    });
    expect(dialog().open).toBe(false);
    expect(dialog()).not.toHaveAttribute('data-exiting');
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('退出中に開き直すと close せず、open のまま元に戻る', () => {
    const onExited = vi.fn();
    const { dialog, setOpen } = renderModal({
      onExited,
      kind: 'view',
      children: (
        <>
          <Modal.Header>
            <Modal.Title>同意</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Consent gate="terms">同意します</Modal.Consent>
          </Modal.Body>
        </>
      ),
    });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();
    const closeSpy = vi.spyOn(dialog(), 'close');

    act(() => setOpen(false));
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(dialog()).toHaveAttribute('data-exiting');

    act(() => setOpen(true));
    expect(dialog().open).toBe(true);
    expect(dialog()).not.toHaveAttribute('data-exiting');

    // 期限を大きく過ぎても閉じない。タイマーが取り消されている。
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(dialog().open).toBe(true);
    expect(onExited).not.toHaveBeenCalled();
    // 一度も close() していない（閉じてから開き直したのではない）。
    expect(closeSpy).not.toHaveBeenCalled();
    // 閉じ切っていないので、中身はリセットされない。
    expect(screen.getByRole('checkbox')).toBeChecked();

    // その後の通常の close は最後まで走る。
    act(() => setOpen(false));
    act(() => {
      vi.advanceTimersByTime(EXIT_MS);
    });
    expect(dialog().open).toBe(false);
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('prefers-reduced-motion では待たずに閉じる（最短）', () => {
    mockReducedMotion();
    const onExited = vi.fn();
    const { dialog, setOpen } = renderModal({ onExited });

    act(() => setOpen(false));
    // 同じコードパスを通すため属性は付くが、待ちは 0ms。
    expect(dialog()).toHaveAttribute('data-exiting');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(dialog().open).toBe(false);
    expect(dialog()).not.toHaveAttribute('data-exiting');
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('スクロールロック解除とフォーカス復帰は、実際に close した後に行う', () => {
    const { dialog, panel, setOpen, trigger } = renderModal({ initialOpen: false, lockScroll: true });
    trigger().focus();
    fireEvent.click(trigger());
    expect(dialog().open).toBe(true);
    expect(html()).toHaveAttribute('data-k-locked');
    expect(document.activeElement).toBe(panel());

    act(() => setOpen(false));
    // 退出中はまだモーダル。背景は動かず、フォーカスもトリガーへ飛ばない。
    expect(html()).toHaveAttribute('data-k-locked');
    expect(document.activeElement).not.toBe(trigger());

    act(() => {
      vi.advanceTimersByTime(EXIT_MS);
    });
    expect(dialog().open).toBe(false);
    expect(html()).not.toHaveAttribute('data-k-locked');
    expect(document.activeElement).toBe(trigger());
  });

  it('退出中の Esc / 背景クリックは何もしない（二重に閉じない）', () => {
    const { dialog, scrim, setOpen, onOpenChange } = renderModal({ kind: 'view' });
    act(() => setOpen(false));
    onOpenChange.mockClear();

    act(() => {
      dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    fireEvent.pointerDown(scrim());
    fireEvent.pointerUp(scrim());
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(dialog()).toHaveAttribute('data-exiting');
  });
});

describe('native close / F-11', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    resetScrollLock();
    resetModalStack();
  });

  it('showModal() の前に returnValue を空にする（前回の submit を持ち越さない）', async () => {
    const { dialog, onOpenChange, setOpen } = renderModal();

    act(() => {
      dialog().close('save');
    });
    await flushMicrotasks();
    expect(onOpenChange).toHaveBeenLastCalledWith(false, 'submit');
    expect(dialog().open).toBe(false);

    act(() => setOpen(true));
    expect(dialog().open).toBe(true);
    expect(dialog().returnValue).toBe('');

    // returnValue が 'save' のまま残っていると、ここが submit と誤分類される。
    act(() => {
      dialog().close();
    });
    await flushMicrotasks();
    expect(onOpenChange).toHaveBeenLastCalledWith(false, 'programmatic');
  });

  it('ネイティブ側が先に閉じても後始末（onExited / scroll unlock / reset）を行う', async () => {
    const onExited = vi.fn();
    const { dialog } = renderModal({
      onExited,
      lockScroll: true,
      kind: 'view',
      children: (
        <>
          <Modal.Header>
            <Modal.Title>同意</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Consent gate="terms">同意します</Modal.Consent>
          </Modal.Body>
        </>
      ),
    });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(html()).toHaveAttribute('data-k-locked');

    // <form method="dialog"> の送信や外部の el.close() に相当する。
    act(() => {
      dialog().close();
    });
    await flushMicrotasks();

    expect(onExited).toHaveBeenCalledTimes(1);
    expect(html()).not.toHaveAttribute('data-k-locked');
    const raw = document.querySelector<HTMLInputElement>('.k-consent input');
    expect(raw).not.toBeChecked();
  });
});

describe('accessible name warning / A-01', () => {
  beforeEach(() => {
    resetWarnings();
  });
  afterEach(() => {
    resetModalQueue();
  });

  it('名前が無いときだけ警告する', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    function Named(): ReactNode {
      return (
        <Modal.Root open onOpenChange={() => {}}>
          <Modal.Header>
            <Modal.Title>名前あり</Modal.Title>
          </Modal.Header>
        </Modal.Root>
      );
    }
    const { unmount } = render(<Named />);
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(warn).not.toHaveBeenCalled();
    unmount();

    render(
      <Modal.Root open onOpenChange={() => {}}>
        <Modal.Body>名前なし</Modal.Body>
      </Modal.Root>,
    );
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('(A-01)'));
    vi.useRealTimers();
  });

  it('命令的 confirm の2枚目に切り替わるときに誤検知しない', async () => {
    // 外部ストア起点の再マウントでは、名前なし判定のタイマーが
    // Title 登録の再レンダーより先に走ることがあった（v0.1.0 で実際に出ていた）。
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ModalHost />);
    let first!: Promise<boolean>;
    act(() => {
      first = confirm({ title: 'ひとつ目' });
      void confirm({ title: 'ふたつ目' });
    });
    await user.click(screen.getByRole('button', { name: 'OK' }));
    await expect(first).resolves.toBe(true);
    expect(await screen.findByText('ふたつ目')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('(A-01)'));
  });
});
