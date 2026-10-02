/**
 * シートのディテント（M-03）とつまみ（H-09）。
 *
 * 幾何はすべて純粋関数側に出してあるので、jsdom でも判定そのものは完全に検証できる。
 * 残るのは「実機で指を滑らせたときの体感」だけで、それは VERIFICATION.md §3 B-15。
 */
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Modal, resolveDetents, snapToDetent, detentIndexOf, DETENT_FRACTION } from '../src';
import type { DetentToken } from '../src';
import { renderModal } from './utils';

/* ========================================================================== */
/* 1. 正規化                                                                   */
/* ========================================================================== */

describe('resolveDetents / M-03', () => {
  it('指定が無ければ full ひとつに落ちる', () => {
    expect(resolveDetents()).toEqual(['full']);
    expect(resolveDetents(null)).toEqual(['full']);
    expect(resolveDetents([])).toEqual(['full']);
  });

  it('低い順に並べ替える', () => {
    expect(resolveDetents(['full', 'peek', 'half'])).toEqual(['peek', 'half', 'full']);
  });

  it('重複を畳む', () => {
    expect(resolveDetents(['half', 'half', 'peek'])).toEqual(['peek', 'half']);
  });

  it('未知の名前は捨て、残りで動く', () => {
    expect(resolveDetents(['half', 'bogus'])).toEqual(['half']);
  });

  it('全部が未知なら full に落ちる（シートを開かなくなるより良い）', () => {
    expect(resolveDetents(['nope', ''])).toEqual(['full']);
  });

  it('既定の段は最上段。指定があればそこ', () => {
    const list: DetentToken[] = ['peek', 'half', 'full'];
    expect(detentIndexOf(list)).toBe(2);
    expect(detentIndexOf(list, 'peek')).toBe(0);
    expect(detentIndexOf(list, 'bogus')).toBe(2);
    expect(detentIndexOf([], 'peek')).toBe(0);
  });

  it('full は CSS の --k-sheet-max-block (92dvh) と揃っている', () => {
    expect(DETENT_FRACTION.full).toBeCloseTo(0.92, 5);
    expect(DETENT_FRACTION.peek).toBeLessThan(DETENT_FRACTION.half);
    expect(DETENT_FRACTION.half).toBeLessThan(DETENT_FRACTION.full);
  });
});

/* ========================================================================== */
/* 2. スナップ判定                                                             */
/* ========================================================================== */

describe('snapToDetent / M-03', () => {
  const list: DetentToken[] = ['peek', 'half', 'full'];
  const base = { detents: list, viewportHeight: 1000, dismissible: true };
  const slow = (deltaY: number, currentIndex: number, over = 2000) =>
    snapToDetent({ ...base, currentIndex, deltaY, elapsedMs: over });
  const flick = (deltaY: number, currentIndex: number) =>
    snapToDetent({ ...base, currentIndex, deltaY, elapsedMs: 50 });

  it('動かさなければ今の段に留まる', () => {
    expect(slow(0, 1)).toEqual({ type: 'snap', index: 1 });
  });

  it('速い下フリックは閉じずに 1 段だけ下げる', () => {
    expect(flick(120, 2)).toEqual({ type: 'snap', index: 1 });
    expect(flick(120, 1)).toEqual({ type: 'snap', index: 0 });
  });

  it('最下段からの下フリックで閉じる', () => {
    expect(flick(120, 0)).toEqual({ type: 'dismiss' });
  });

  it('閉じられない設定なら最下段からの下フリックでも留まる', () => {
    expect(snapToDetent({ ...base, dismissible: false, currentIndex: 0, deltaY: 120, elapsedMs: 50 })).toEqual(
      { type: 'snap', index: 0 },
    );
  });

  it('速い上フリックは 1 段上げ、最上段では超えない', () => {
    expect(flick(-120, 0)).toEqual({ type: 'snap', index: 1 });
    expect(flick(-120, 2)).toEqual({ type: 'snap', index: 2 });
  });

  it('震え（速いが短い）は段を動かさない', () => {
    expect(snapToDetent({ ...base, currentIndex: 1, deltaY: 10, elapsedMs: 5 })).toEqual({
      type: 'snap',
      index: 1,
    });
  });

  it('ゆっくり引いたら指を離した高さに最も近い段へ吸い付く', () => {
    // full(920) から 320 下げると 600 → half(600) ちょうど
    expect(slow(320, 2)).toEqual({ type: 'snap', index: 1 });
    // half(600) から 280 上げると 880 → full(920) が最も近い
    expect(slow(-280, 1)).toEqual({ type: 'snap', index: 2 });
  });

  it('最下段の半分より下まで引き切ったら閉じる', () => {
    // peek(300) の半分 = 150。full(920) から 800 下げると 120
    expect(slow(800, 2)).toEqual({ type: 'dismiss' });
  });

  it('閉じられない設定なら引き切っても最下段で止まる', () => {
    expect(
      snapToDetent({ ...base, dismissible: false, currentIndex: 2, deltaY: 800, elapsedMs: 2000 }),
    ).toEqual({ type: 'snap', index: 0 });
  });

  it('ビューポート高さが取れなくても NaN を返さない', () => {
    const r = snapToDetent({ ...base, viewportHeight: 0, currentIndex: 1, deltaY: 300, elapsedMs: 2000 });
    expect(r).toEqual({ type: 'snap', index: 1 });
  });

  it('現在位置が範囲外でも丸めて扱う', () => {
    expect(slow(0, 99)).toEqual({ type: 'snap', index: 2 });
    expect(slow(0, -5)).toEqual({ type: 'snap', index: 0 });
    expect(slow(0, Number.NaN)).toEqual({ type: 'snap', index: 0 });
  });

  it('段が空でも落ちない', () => {
    expect(snapToDetent({ ...base, detents: [], currentIndex: 0, deltaY: 0, elapsedMs: 10 })).toEqual({
      type: 'dismiss',
    });
    expect(
      snapToDetent({ ...base, detents: [], dismissible: false, currentIndex: 0, deltaY: 0, elapsedMs: 10 }),
    ).toEqual({ type: 'snap', index: 0 });
  });

  it('段がひとつだけなら、上下どちらのフリックでもそこに留まる', () => {
    const one = { ...base, detents: ['half'] as DetentToken[], dismissible: false };
    expect(snapToDetent({ ...one, currentIndex: 0, deltaY: -200, elapsedMs: 50 })).toEqual({
      type: 'snap',
      index: 0,
    });
    expect(snapToDetent({ ...one, currentIndex: 0, deltaY: 200, elapsedMs: 50 })).toEqual({
      type: 'snap',
      index: 0,
    });
  });
});

/* ========================================================================== */
/* 3. Modal.Handle                                                            */
/* ========================================================================== */

const sheet = (props: Record<string, unknown> = {}) =>
  renderModal({
    placement: 'sheet',
    children: (
      <>
        <Modal.Handle />
        <Modal.Header>
          <Modal.Title>高さの変わるシート</Modal.Title>
        </Modal.Header>
        <Modal.Body>本文</Modal.Body>
      </>
    ),
    ...props,
  });

describe('Modal.Handle / H-09', () => {
  it('center 配置では何も描かない（意味のないフォーカス先を作らない）', () => {
    const { container } = renderModal({
      placement: 'center',
      children: (
        <>
          <Modal.Handle />
          <Modal.Body>本文</Modal.Body>
        </>
      ),
    });
    expect(container.querySelector('.k-handle')).toBeNull();
  });

  it('段を指定しなければ、ただの掴みどころ（aria-hidden・フォーカス不可）', () => {
    const { container } = sheet();
    const handle = container.querySelector('.k-handle');
    expect(handle).not.toBeNull();
    expect(handle).toHaveAttribute('aria-hidden', 'true');
    expect(handle).toHaveAttribute('data-k-swipe-origin');
    expect(container.querySelector('.k-handle button')).toBeNull();
  });

  it('段があれば role="slider" の操作子になる', () => {
    sheet({ detents: ['peek', 'half', 'full'] });
    const slider = screen.getByRole('slider');
    expect(slider.tagName).toBe('BUTTON');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '2');
    expect(slider).toHaveAttribute('aria-valuenow', '2');
    expect(slider).toHaveAttribute('aria-valuetext', '最大');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('段がひとつだけなら飾りのまま（動かせないものを操作子にしない）', () => {
    const { container } = sheet({ detents: ['half'] });
    expect(screen.queryByRole('slider')).toBeNull();
    expect(container.querySelector('.k-handle')).toHaveAttribute('aria-hidden', 'true');
  });

  it('矢印ーで段を移る', () => {
    sheet({ detents: ['peek', 'half', 'full'], defaultDetent: 'half' });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '1');

    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
    expect(slider).toHaveAttribute('aria-valuetext', '最小');

    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '2');

    // 端は超えない
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(slider).toHaveAttribute('aria-valuenow', '2');
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(slider).toHaveAttribute('aria-valuenow', '0');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveAttribute('aria-valuenow', '2');
  });

  it('クリックでも巡回する（ドラッグできない人の経路を消さない）', () => {
    sheet({ detents: ['peek', 'half', 'full'], defaultDetent: 'peek' });
    const slider = screen.getByRole('slider');
    fireEvent.click(slider);
    expect(slider).toHaveAttribute('aria-valuenow', '1');
    fireEvent.click(slider);
    expect(slider).toHaveAttribute('aria-valuenow', '2');
    // 最上段の次は最下段へ戻る
    fireEvent.click(slider);
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('キーボード操作では live region に流さない（valuetext と二重に読ませない）', async () => {
    sheet({ detents: ['peek', 'full'] });
    const status = screen.getByRole('status');
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowDown' });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
    // 読み上げの反映は 60ms 遅らせてある。その後も空のままであることを見る。
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
    });
    expect(status).toHaveTextContent('');
  });

  it('onDetentChange が新しい段の名前で呼ばれる', () => {
    const onDetentChange = vi.fn();
    sheet({ detents: ['peek', 'half', 'full'], onDetentChange });
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' });
    expect(onDetentChange).toHaveBeenCalledWith('peek');
    // 同じ段へ移そうとしても鳴らさない
    onDetentChange.mockClear();
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'Home' });
    expect(onDetentChange).not.toHaveBeenCalled();
  });

  it('パネルに段の高さが入り、ダイアログに data-detent が出る', () => {
    const { container } = sheet({ detents: ['peek', 'half', 'full'], defaultDetent: 'half' });
    const dialog = container.querySelector('dialog');
    const panel = container.querySelector('.k-panel') as HTMLElement;
    expect(dialog).toHaveAttribute('data-detent', 'half');
    expect(panel.style.getPropertyValue('--k-sheet-detent')).toBe('60.00dvh');

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
    expect(dialog).toHaveAttribute('data-detent', 'full');
    expect(panel.style.getPropertyValue('--k-sheet-detent')).toBe('92.00dvh');
  });

  it('段を使わないシートには高さを注さない（従来の挙動を変えない）', () => {
    const { container } = sheet();
    const panel = container.querySelector('.k-panel') as HTMLElement;
    expect(panel.style.getPropertyValue('--k-sheet-detent')).toBe('');
    expect(container.querySelector('dialog')).not.toHaveAttribute('data-detent');
  });

  it('閉じて開き直すと既定の段に戻る', async () => {
    const { container, setOpen } = sheet({ detents: ['peek', 'half', 'full'], defaultDetent: 'peek' });
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
    expect(container.querySelector('dialog')).toHaveAttribute('data-detent', 'full');

    await act(async () => setOpen(false));
    await act(async () => setOpen(true));
    expect(container.querySelector('dialog')).toHaveAttribute('data-detent', 'peek');
  });

  it('未知の段を渡しても開く（開発時に警告だけ出す）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = sheet({ detents: ['half', 'bogus'] });
    expect(container.querySelector('dialog')).toHaveAttribute('data-detent', 'half');
    warn.mockRestore();
  });
});

/* ========================================================================== */
/* 4. ドラッグ経路（M-02 / M-03 の結合）                                        */
/* ========================================================================== */

describe('sheet drag / M-02 + M-03', () => {
  const panelOf = (container: HTMLElement) => container.querySelector('.k-panel') as HTMLElement;
  const handleOf = (container: HTMLElement) => container.querySelector('.k-handle') as HTMLElement;
  const drag = (el: Element, from: number, to: number, id = 1) => {
    fireEvent.pointerDown(el, { pointerId: id, clientY: from, button: 0, isPrimary: true });
    fireEvent.pointerMove(el, { pointerId: id, clientY: to });
  };

  it('つまみを掴むとパネルの高さが指に追従する', () => {
    const { container } = sheet({ detents: ['peek', 'half', 'full'] });
    const panel = panelOf(container);
    Object.defineProperty(panel, 'offsetHeight', { value: 920, configurable: true });
    window.innerHeight = 1000;

    drag(handleOf(container), 100, 300);
    expect(panel).toHaveAttribute('data-k-dragging');
    // 920 - 200 = 720
    expect(panel.style.getPropertyValue('--k-sheet-detent')).toBe('720px');
  });

  it('指を離すと近い段に吸い付き、インラインの px は消える', () => {
    const { container } = sheet({ detents: ['peek', 'half', 'full'] });
    const panel = panelOf(container);
    Object.defineProperty(panel, 'offsetHeight', { value: 920, configurable: true });
    window.innerHeight = 1000;

    drag(handleOf(container), 100, 420); // 920 - 320 = 600 = half
    fireEvent.pointerUp(panel, { pointerId: 1, clientY: 420 });

    expect(panel).not.toHaveAttribute('data-k-dragging');
    expect(container.querySelector('dialog')).toHaveAttribute('data-detent', 'half');
    expect(panel.style.getPropertyValue('--k-sheet-detent')).toBe('60.00dvh');
  });

  it('ドラッグで段が変わったときは読み上げる（キーボードと違い valuetext が鳴らない）', async () => {
    const { container } = sheet({ detents: ['peek', 'half', 'full'] });
    const panel = panelOf(container);
    Object.defineProperty(panel, 'offsetHeight', { value: 920, configurable: true });
    window.innerHeight = 1000;

    drag(handleOf(container), 100, 420);
    fireEvent.pointerUp(panel, { pointerId: 1, clientY: 420 });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('シートの高さ: 中'));
  });

  it('pointercancel なら段を変えずに戻す', () => {
    const { container } = sheet({ detents: ['peek', 'half', 'full'] });
    const panel = panelOf(container);
    Object.defineProperty(panel, 'offsetHeight', { value: 920, configurable: true });
    window.innerHeight = 1000;

    drag(handleOf(container), 100, 420);
    fireEvent.pointerCancel(panel, { pointerId: 1, clientY: 420 });
    expect(panel).not.toHaveAttribute('data-k-dragging');
    expect(container.querySelector('dialog')).toHaveAttribute('data-detent', 'full');
  });

  it('本文がスクロール途中でも、つまみからのドラッグは始まる', () => {
    const { container } = sheet({ detents: ['peek', 'half', 'full'] });
    const panel = panelOf(container);
    const body = container.querySelector('.k-body') as HTMLElement;
    Object.defineProperty(panel, 'offsetHeight', { value: 920, configurable: true });
    Object.defineProperty(body, 'scrollTop', { value: 200, configurable: true });
    window.innerHeight = 1000;

    drag(handleOf(container), 100, 300);
    expect(panel).toHaveAttribute('data-k-dragging');
  });

  it('本文がスクロール途中なら、本文からのドラッグは始まらない', () => {
    const { container } = sheet({ detents: ['peek', 'half', 'full'] });
    const panel = panelOf(container);
    const body = container.querySelector('.k-body') as HTMLElement;
    Object.defineProperty(panel, 'offsetHeight', { value: 920, configurable: true });
    Object.defineProperty(body, 'scrollTop', { value: 200, configurable: true });

    drag(body, 100, 300);
    expect(panel).not.toHaveAttribute('data-k-dragging');
  });

  it('段が無く swipeToDismiss も無ければドラッグしない', () => {
    const { container } = sheet();
    const panel = panelOf(container);
    drag(handleOf(container), 100, 300);
    expect(panel).not.toHaveAttribute('data-k-dragging');
  });

  it('閉じられない設定でも、段があれば高さは変えられる', () => {
    const { container } = sheet({
      detents: ['peek', 'half', 'full'],
      dismiss: { backdrop: false, esc: false },
    });
    const panel = panelOf(container);
    Object.defineProperty(panel, 'offsetHeight', { value: 920, configurable: true });
    window.innerHeight = 1000;

    drag(handleOf(container), 100, 420);
    fireEvent.pointerUp(panel, { pointerId: 1, clientY: 420 });
    expect(container.querySelector('dialog')).toHaveAttribute('data-detent', 'half');
  });

  it('backdrop を許していなければ swipeToDismiss は効かない（スクリム押下と同じ扱い）', () => {
    const { container, onOpenChange } = sheet({
      detents: ['peek', 'half', 'full'],
      defaultDetent: 'peek',
      swipeToDismiss: true,
      dismiss: { backdrop: false },
    });
    const panel = panelOf(container);
    Object.defineProperty(panel, 'offsetHeight', { value: 300, configurable: true });
    window.innerHeight = 1000;
    fireEvent.pointerDown(handleOf(container), {
      pointerId: 1,
      clientY: 100,
      button: 0,
      isPrimary: true,
    });
    fireEvent.pointerUp(panel, { pointerId: 1, clientY: 300 });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(container.querySelector('dialog')).toHaveAttribute('data-detent', 'peek');
  });

  it('最下段から投げ落とすと swipe として閉じる', () => {
    const { container, onOpenChange } = sheet({
      detents: ['peek', 'half', 'full'],
      defaultDetent: 'peek',
      swipeToDismiss: true,
      // スワイプ閉じは「スクリムを押して閉じる」の指版。backdrop を許していないと成立しない。
      dismiss: { backdrop: true },
    });
    const panel = panelOf(container);
    Object.defineProperty(panel, 'offsetHeight', { value: 300, configurable: true });
    window.innerHeight = 1000;

    fireEvent.pointerDown(handleOf(container), {
      pointerId: 1,
      clientY: 100,
      button: 0,
      isPrimary: true,
    });
    fireEvent.pointerUp(panel, { pointerId: 1, clientY: 300 });
    expect(onOpenChange).toHaveBeenCalledWith(false, 'swipe');
  });
});
