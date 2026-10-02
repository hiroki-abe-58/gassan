/**
 * 環境まわりの検証。
 *
 * これまで「未検証」として追跡表に残していた 6 項目のうち、
 * jsdom で真に証明できるものをここで埋める。
 *
 *   F-10  Cmd / Ctrl + Enter での送信
 *   B-11  メディアの自動再生を既定で切る
 *   M-04  仮想キーボード（visualViewport）追従
 *   M-07  戻るジェスチャで閉じる
 *   T-06  長押しで全文を開かない（「無いこと」の証明）
 *   G-06  拡大によるリフローでも読了判定が再評価される
 *
 * 埋められない部分（実機のコンテキストメニュー、実際の 400% ズーム、
 * 実機の仮想キーボード）は docs/traceability.md に残す。
 */
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Modal } from '../src';
import { emitResize, mockScrollMetrics, renderModal } from './utils';

/* ========================================================================== */
/* F-10 送信ショートカット                                                     */
/* ========================================================================== */

describe('submit shortcut / F-10', () => {
  const plain = (onClick: () => void) => (
    <>
      <Modal.Header>
        <Modal.Title>確認</Modal.Title>
      </Modal.Header>
      <Modal.Body>本文</Modal.Body>
      <Modal.Footer>
        <Modal.Button variant="secondary" onClick={() => onClick()}>
          戻る
        </Modal.Button>
        <Modal.Button variant="primary" onClick={onClick}>
          送信
        </Modal.Button>
      </Modal.Footer>
    </>
  );

  /** dialog まで確実に届く位置から投げる。実機のキー入力と同じ経路。 */
  function press(key: string, init: { metaKey?: boolean; ctrlKey?: boolean } = {}): void {
    const target = screen.getByRole('group', { name: '本文' });
    fireEvent.keyDown(target, { key, bubbles: true, ...init });
  }

  it('Cmd + Enter で primary を起動する', () => {
    const onClick = vi.fn();
    renderModal({ submitShortcut: true, children: plain(onClick) });
    press('Enter', { metaKey: true });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Ctrl + Enter でも起動する', () => {
    const onClick = vi.fn();
    renderModal({ submitShortcut: true, children: plain(onClick) });
    press('Enter', { ctrlKey: true });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('修飾キーなしの Enter では起動しない（テキスト入力を壊さない）', () => {
    const onClick = vi.fn();
    renderModal({ submitShortcut: true, children: plain(onClick) });
    press('Enter');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('submitShortcut を明示しない限り効かない（既定は無効）', () => {
    const onClick = vi.fn();
    renderModal({ children: plain(onClick) });
    press('Enter', { metaKey: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('起動するのは primary だけで、secondary は巻き込まない', () => {
    const calls: string[] = [];
    renderModal({
      submitShortcut: true,
      children: (
        <>
          <Modal.Header>
            <Modal.Title>確認</Modal.Title>
          </Modal.Header>
          <Modal.Body>本文</Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="secondary" onClick={() => calls.push('secondary')}>
              戻る
            </Modal.Button>
            <Modal.Button variant="primary" onClick={() => calls.push('primary')}>
              送信
            </Modal.Button>
          </Modal.Footer>
        </>
      ),
    });
    press('Enter', { metaKey: true });
    expect(calls).toEqual(['primary']);
  });

  it('ゲート中の primary はショートカットでも起動しない', () => {
    const onClick = vi.fn();
    renderModal({
      submitShortcut: true,
      children: (
        <>
          <Modal.Header>
            <Modal.Title>利用規約</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Consent gate="terms">規約に同意します</Modal.Consent>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="primary" gate onClick={onClick}>
              同意して続ける
            </Modal.Button>
          </Modal.Footer>
        </>
      ),
    });
    expect(screen.getByRole('button', { name: '同意して続ける' })).toHaveAttribute('data-gated');
    press('Enter', { metaKey: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('処理中の primary はショートカットの連打でも二重に走らない', async () => {
    let resolve!: () => void;
    const onAction = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    renderModal({
      submitShortcut: true,
      children: (
        <>
          <Modal.Header>
            <Modal.Title>送信</Modal.Title>
          </Modal.Header>
          <Modal.Body>本文</Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="primary" onAction={onAction}>
              送信
            </Modal.Button>
          </Modal.Footer>
        </>
      ),
    });

    press('Enter', { metaKey: true });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '送信' })).toHaveAttribute('data-loading');
    });
    press('Enter', { metaKey: true });
    press('Enter', { metaKey: true });
    expect(onAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
    });
  });
});

/* ========================================================================== */
/* B-11 メディアの既定                                                         */
/* ========================================================================== */

describe('media defaults / B-11', () => {
  function mount(node: ReactNode): void {
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>メディア</Modal.Title>
          </Modal.Header>
          <Modal.Body>{node}</Modal.Body>
        </>
      ),
    });
  }

  it('動画は autoplay を持たず、controls を持つ', () => {
    mount(<Modal.Media kind="video" src="/a.mp4" />);
    const video = document.querySelector('video');
    if (!video) throw new Error('video missing');
    expect(video.hasAttribute('autoplay')).toBe(false);
    expect(video.autoplay).toBe(false);
    expect(video.hasAttribute('controls')).toBe(true);
    expect(video.getAttribute('preload')).toBe('metadata');
  });

  it('音声も autoplay を持たず、controls を持つ', () => {
    mount(<Modal.Media kind="audio" src="/a.mp3" />);
    const audio = document.querySelector('audio');
    if (!audio) throw new Error('audio missing');
    expect(audio.hasAttribute('autoplay')).toBe(false);
    expect(audio.autoplay).toBe(false);
    expect(audio.hasAttribute('controls')).toBe(true);
    expect(audio.getAttribute('preload')).toBe('metadata');
  });

  it('ループも既定では付けない（開いた瞬間に音が出続けない）', () => {
    mount(<Modal.Media kind="video" src="/a.mp4" />);
    const video = document.querySelector('video');
    if (!video) throw new Error('video missing');
    expect(video.loop).toBe(false);
    expect(video.hasAttribute('muted')).toBe(false);
  });

  it('画像は遅延読み込みと非同期デコードを既定にする', () => {
    mount(<Modal.Media src="/a.png" alt="図" />);
    const img = document.querySelector('img');
    if (!img) throw new Error('img missing');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
  });

  it('ギャラリーに載せても自動再生は付かない（スライド送りで音が出ない）', () => {
    mount(
      <Modal.Gallery
        label="作例"
        items={[
          { id: 'a', content: <Modal.Media kind="video" src="/a.mp4" /> },
          { id: 'b', content: <Modal.Media kind="video" src="/b.mp4" /> },
        ]}
      />,
    );
    const videos = document.querySelectorAll('video');
    expect(videos.length).toBe(2);
    for (const video of videos) {
      expect(video.hasAttribute('autoplay')).toBe(false);
      expect(video.hasAttribute('controls')).toBe(true);
    }
  });
});

/* ========================================================================== */
/* M-04 仮想キーボード                                                         */
/* ========================================================================== */

interface FakeViewport {
  height: number;
  offsetTop: number;
  addEventListener: (type: string, fn: () => void) => void;
  removeEventListener: (type: string, fn: () => void) => void;
}

function installViewport(height: number): {
  viewport: FakeViewport;
  emit: () => void;
  listeners: () => number;
} {
  const fns = new Set<() => void>();
  const viewport: FakeViewport = {
    height,
    offsetTop: 0,
    addEventListener: (_type, fn) => {
      fns.add(fn);
    },
    removeEventListener: (_type, fn) => {
      fns.delete(fn);
    },
  };
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    writable: true,
    value: viewport,
  });
  return {
    viewport,
    emit: () => {
      for (const fn of fns) fn();
    },
    // resize と scroll の 2 本を張るので、1 つの購読で 2 と数える。
    listeners: () => fns.size,
  };
}

describe('virtual keyboard / M-04', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'visualViewport');
  });

  it('visualViewport が縮むと --k-keyboard-inset に差分が出る', () => {
    const { viewport, emit } = installViewport(window.innerHeight);
    const { dialog } = renderModal();
    expect(dialog().style.getPropertyValue('--k-keyboard-inset')).toBe('0px');

    viewport.height = window.innerHeight - 320;
    act(() => {
      emit();
    });
    expect(dialog().style.getPropertyValue('--k-keyboard-inset')).toBe('320px');
  });

  it('ページがスクロールして offsetTop が動いても余白を取り違えない', () => {
    const { viewport, emit } = installViewport(window.innerHeight - 300);
    const { dialog } = renderModal();
    expect(dialog().style.getPropertyValue('--k-keyboard-inset')).toBe('300px');

    viewport.offsetTop = 100;
    act(() => {
      emit();
    });
    expect(dialog().style.getPropertyValue('--k-keyboard-inset')).toBe('200px');
  });

  it('負の余白にはならない（アドレスバーの伸縮で下駄を履かせない）', () => {
    const { viewport, emit } = installViewport(window.innerHeight + 200);
    const { dialog } = renderModal();
    viewport.height = window.innerHeight + 400;
    act(() => {
      emit();
    });
    expect(dialog().style.getPropertyValue('--k-keyboard-inset')).toBe('0px');
  });

  it('閉じると購読も CSS 変数も残さない', async () => {
    const { listeners } = installViewport(window.innerHeight - 100);
    const { dialog, setOpen } = renderModal();
    expect(listeners()).toBeGreaterThan(0);

    act(() => {
      setOpen(false);
    });
    await waitFor(() => {
      expect(listeners()).toBe(0);
    });
    expect(dialog().style.getPropertyValue('--k-keyboard-inset')).toBe('');
  });

  it('visualViewport が無い環境でも落ちない', () => {
    Reflect.deleteProperty(window, 'visualViewport');
    expect(() => renderModal()).not.toThrow();
  });
});

/* ========================================================================== */
/* M-07 戻るジェスチャ                                                         */
/* ========================================================================== */

describe('back gesture / M-07', () => {
  afterEach(() => {
    window.history.replaceState(null, '');
  });

  const state = (): { __kasane?: string } | null =>
    window.history.state as { __kasane?: string } | null;

  it('closeOnBack で開くと履歴に印を積む', () => {
    renderModal({ closeOnBack: true });
    expect(typeof state()?.__kasane).toBe('string');
  });

  it('戻ると back-button として閉じる', async () => {
    const { onOpenChange, dialog } = renderModal({ closeOnBack: true });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false, 'back-button');
    });
    await waitFor(() => {
      expect(dialog().open).toBe(false);
    });
  });

  it('既定では履歴を触らない', () => {
    renderModal();
    expect(state()?.__kasane).toBeUndefined();
  });

  it('閉じた後の popstate はもう拾わない（二重に閉じない）', async () => {
    const { onOpenChange, dialog } = renderModal({ closeOnBack: true });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });
    await waitFor(() => {
      expect(dialog().open).toBe(false);
    });
    const count = onOpenChange.mock.calls.length;
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });
    expect(onOpenChange.mock.calls.length).toBe(count);
  });

  it('dismiss.esc=false でも戻るは独立して効く（閉じ手段を全部塞がない）', async () => {
    const { onOpenChange } = renderModal({ closeOnBack: true, dismiss: { esc: false } });
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false, 'back-button');
    });
  });
});

/* ========================================================================== */
/* T-06 長押しの禁止                                                           */
/* ========================================================================== */

describe('no long-press on title / T-06', () => {
  it('長押ししてもタイトルは展開しない（OS のコンテキストメニューと衝突させない）', () => {
    renderModal();
    const text = document.querySelector<HTMLElement>('.k-title-text');
    if (!text) throw new Error('title missing');
    mockScrollMetrics(text, { scrollHeight: 96, clientHeight: 40 });
    act(() => {
      emitResize(text);
    });
    // 溢れているのでトグルは出る。それでも長押しでは開かない。
    expect(screen.getByRole('button', { name: 'タイトルの全文を表示' })).toBeVisible();

    vi.useFakeTimers();
    try {
      fireEvent.pointerDown(text);
      fireEvent.touchStart(text);
      act(() => {
        // iOS の長押し判定（約 500ms）を大きく超える時間を進める。
        vi.advanceTimersByTime(2000);
      });
      fireEvent.touchEnd(text);
      fireEvent.pointerUp(text);
    } finally {
      vi.useRealTimers();
    }

    expect(screen.getByRole('button', { name: 'タイトルの全文を表示' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('タイトルは contextmenu を奪わない', () => {
    renderModal();
    const text = document.querySelector<HTMLElement>('.k-title-text');
    if (!text) throw new Error('title missing');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    text.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('タイトルは user-select も touch-action も奪わない（選択とスクロールを残す）', () => {
    renderModal();
    const text = document.querySelector<HTMLElement>('.k-title-text');
    if (!text) throw new Error('title missing');
    expect(text.style.getPropertyValue('user-select')).toBe('');
    expect(text.style.getPropertyValue('-webkit-user-select')).toBe('');
    expect(text.style.getPropertyValue('touch-action')).toBe('');
  });

  it('全文表示の入口は明示トグルだけ（クリックでは開かない）', () => {
    renderModal();
    const text = document.querySelector<HTMLElement>('.k-title-text');
    if (!text) throw new Error('title missing');
    mockScrollMetrics(text, { scrollHeight: 96, clientHeight: 40 });
    act(() => {
      emitResize(text);
    });
    fireEvent.click(text);
    expect(screen.getByRole('button', { name: 'タイトルの全文を表示' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    fireEvent.click(screen.getByRole('button', { name: 'タイトルの全文を表示' }));
    expect(screen.getByRole('button', { name: 'タイトルを折りたたむ' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});

/* ========================================================================== */
/* G-06 拡大耐性                                                               */
/* ========================================================================== */

describe('zoom resilience / G-06', () => {
  const gated = (
    <>
      <Modal.Header>
        <Modal.Title>利用規約</Modal.Title>
      </Modal.Header>
      <Modal.Body readGate="read">
        <p>規約の本文</p>
        <Modal.GateStatus />
      </Modal.Body>
      <Modal.Footer>
        <Modal.Button variant="primary" gate>
          同意して続ける
        </Modal.Button>
      </Modal.Footer>
    </>
  );
  const primary = () => screen.getByRole('button', { name: '同意して続ける' });
  const body = () => screen.getByRole('group', { name: '本文' });

  it('拡大でリフローしスクロール不要になれば、その場で読了が成立する', async () => {
    renderModal({ children: gated });
    const el = body();
    // 等倍：スクロールが要る。
    const metrics = { scrollHeight: 1000, clientHeight: 200 };
    mockScrollMetrics(el, metrics);
    act(() => {
      emitResize(el);
    });
    expect(primary()).toHaveAttribute('aria-disabled', 'true');

    // 400% 相当：リフローで本文が縮み、ビューポート内に収まった。
    metrics.scrollHeight = 240;
    metrics.clientHeight = 240;
    act(() => {
      emitResize(el);
    });
    await waitFor(() => {
      expect(primary()).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('拡大で逆にスクロールが必要になっても、満たした読了は取り消されない', async () => {
    renderModal({ children: gated });
    const el = body();
    const metrics = { scrollHeight: 200, clientHeight: 200 };
    mockScrollMetrics(el, metrics);
    act(() => {
      emitResize(el);
    });
    await waitFor(() => {
      expect(primary()).not.toHaveAttribute('aria-disabled', 'true');
    });

    // 拡大して行が折り返し、スクロールが必要になった。
    metrics.scrollHeight = 2400;
    metrics.clientHeight = 200;
    act(() => {
      emitResize(el);
    });
    expect(primary()).not.toHaveAttribute('aria-disabled', 'true');
  });
});
