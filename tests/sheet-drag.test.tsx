/**
 * シートのドラッグ経路のうち、「指を離したあと」に起きることの検証。M-02 / M-03 / H-09。
 *
 * detent.test.tsx が判定式そのものを見ているのに対し、ここは
 * ブラウザが勝手に起こす二次的な出来事（合成 click、捕捉の喪失、
 * React が持っているインラインスタイルとの衝突）を見る。
 * 実機でしか起きないと思われがちだが、原因はすべて jsdom で再現できる。
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from '../src';
import type { CloseReason, DetentToken, ModalKind } from '../src';

/* -------------------------------------------------------------------------- */

interface Options {
  kind?: ModalKind;
  detents?: readonly DetentToken[];
  defaultDetent?: DetentToken;
  swipeToDismiss?: boolean;
  initialOpen?: boolean;
}

function sheet(options: Options = {}) {
  const { initialOpen = true, ...rootProps } = options;
  const onOpenChange = vi.fn();
  let setOpenExternal: ((open: boolean) => void) | null = null;
  let setDetentsExternal: ((next: readonly DetentToken[] | undefined) => void) | null = null;

  function Harness() {
    const [open, setOpen] = useState(initialOpen);
    const [detents, setDetents] = useState<readonly DetentToken[] | undefined>(rootProps.detents);
    setOpenExternal = setOpen;
    setDetentsExternal = setDetents;
    return (
      <Modal.Root
        {...rootProps}
        detents={detents}
        placement="sheet"
        open={open}
        onOpenChange={(next: boolean, reason: CloseReason) => {
          onOpenChange(next, reason);
          setOpen(next);
        }}
      >
        <Modal.Handle />
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>シート</Modal.Title>
        </Modal.Header>
        <Modal.Body>本文</Modal.Body>
      </Modal.Root>
    );
  }

  const result = render(<Harness />);
  const panel = () => result.container.querySelector('.g-panel') as HTMLElement;
  const handle = () => result.container.querySelector('.g-handle') as HTMLElement;
  const dialog = () => result.container.querySelector('dialog') as HTMLDialogElement;

  // jsdom はレイアウトを持たない。幾何はここで与える。
  Object.defineProperty(panel(), 'offsetHeight', { value: 920, configurable: true });
  window.innerHeight = 1000;

  return {
    ...result,
    onOpenChange,
    panel,
    handle,
    dialog,
    grip: () => screen.getByRole('slider'),
    setOpen: (open: boolean) => act(() => setOpenExternal?.(open)),
    setDetents: (next: readonly DetentToken[] | undefined) =>
      act(() => setDetentsExternal?.(next)),
  };
}

const down = (el: Element, clientY: number, pointerId = 1, init: PointerEventInit = {}) =>
  fireEvent.pointerDown(el, { pointerId, clientY, button: 0, isPrimary: true, ...init });
const move = (el: Element, clientY: number, pointerId = 1) =>
  fireEvent.pointerMove(el, { pointerId, clientY });
const up = (el: Element, clientY: number, pointerId = 1) =>
  fireEvent.pointerUp(el, { pointerId, clientY });

const THREE: readonly DetentToken[] = ['peek', 'half', 'full'];

/* ========================================================================== */
/* D1. ドラッグのあとに来る合成 click                                           */
/* ========================================================================== */

describe('drag then synthetic click / H-09', () => {
  it('つまみをドラッグして離しても、直後の click で段がもう一つ動かない', () => {
    const view = sheet({ detents: THREE });

    // full(92%) から 320px 下げる → 600px ≒ half に吸い付く
    down(view.handle(), 100);
    move(view.handle(), 420);
    up(view.panel(), 420);
    expect(view.dialog()).toHaveAttribute('data-detent', 'half');

    // ブラウザは pointerup のあとに click を出す。つまみは button なので onClick が走る。
    fireEvent.click(view.grip());
    expect(view.dialog()).toHaveAttribute('data-detent', 'half');
  });

  it('動かさずに叩いたときは、これまでどおり click で 1 段上がる', () => {
    const view = sheet({ detents: THREE, defaultDetent: 'peek' });

    down(view.grip(), 100);
    up(view.grip(), 100);
    fireEvent.click(view.grip());
    expect(view.dialog()).toHaveAttribute('data-detent', 'half');
  });

  it('ドラッグのあとでも、次の click は通る（抑止は 1 回だけ）', () => {
    const view = sheet({ detents: THREE, defaultDetent: 'peek' });

    down(view.handle(), 300);
    move(view.handle(), 100);
    up(view.panel(), 100);
    fireEvent.click(view.grip());
    const after = view.dialog().getAttribute('data-detent');

    down(view.grip(), 100);
    up(view.grip(), 100);
    fireEvent.click(view.grip());
    expect(view.dialog().getAttribute('data-detent')).not.toBe(after);
  });

  it('ドラッグのあと、キーボードでの操作は抑止されない', () => {
    const view = sheet({ detents: THREE, defaultDetent: 'peek' });

    down(view.handle(), 300);
    move(view.handle(), 290);
    up(view.panel(), 290); // 10px。段は変わらない
    expect(view.dialog()).toHaveAttribute('data-detent', 'peek');

    fireEvent.keyDown(view.grip(), { key: 'ArrowUp' });
    expect(view.dialog()).toHaveAttribute('data-detent', 'half');
  });
});

/* ========================================================================== */
/* D2. パネルの外で指を離す                                                     */
/* ========================================================================== */

describe('pointer capture / M-02', () => {
  it('ドラッグを始めたらポインタを捕捉する（外で離しても pointerup が届く）', () => {
    const view = sheet({ detents: THREE });
    const panel = view.panel();
    const capture = vi.spyOn(panel, 'setPointerCapture');

    down(view.handle(), 100, 7);
    expect(capture).toHaveBeenCalledWith(7);
  });

  it('捕捉を失ったらドラッグを畳む（パネルが縮んだまま残らない）', () => {
    const view = sheet({ detents: THREE });

    down(view.handle(), 100);
    move(view.handle(), 420);
    expect(view.panel()).toHaveAttribute('data-g-dragging');

    fireEvent.lostPointerCapture(view.panel(), { pointerId: 1 });
    expect(view.panel()).not.toHaveAttribute('data-g-dragging');
    // 捕捉の喪失は中断。段は動かさない。
    expect(view.dialog()).toHaveAttribute('data-detent', 'full');
  });

  it('捕捉できない環境でも例外にしない', () => {
    const view = sheet({ detents: THREE });
    vi.spyOn(view.panel(), 'setPointerCapture').mockImplementation(() => {
      throw new DOMException('no such pointer', 'NotFoundError');
    });
    expect(() => down(view.handle(), 100)).not.toThrow();
    move(view.handle(), 420);
    expect(view.panel()).toHaveAttribute('data-g-dragging');
  });

  it('ドラッグ中の 2 本目のポインタは割り込めない', () => {
    const view = sheet({ detents: THREE });

    down(view.handle(), 100, 1);
    move(view.handle(), 420, 1);
    // 別種のポインタ（マウス）は、それ自身としては primary になりうる
    down(view.handle(), 900, 2);
    up(view.panel(), 900, 2);

    // 2 本目は無視され、1 本目の操作が生き続ける
    expect(view.panel()).toHaveAttribute('data-g-dragging');
    up(view.panel(), 420, 1);
    expect(view.dialog()).toHaveAttribute('data-detent', 'half');
  });
});

/* ========================================================================== */
/* D3. ドラッグの途中で閉じる                                                   */
/* ========================================================================== */

describe('close while dragging / M-03', () => {
  it('掴んだまま閉じても、次に開いたとき縮んだままにならない', () => {
    const view = sheet({ detents: THREE });

    down(view.handle(), 100);
    move(view.handle(), 600);
    expect(view.panel()).toHaveAttribute('data-g-dragging');

    view.setOpen(false);
    expect(view.panel()).not.toHaveAttribute('data-g-dragging');

    view.setOpen(true);
    expect(view.panel()).not.toHaveAttribute('data-g-dragging');
    expect(view.panel().style.getPropertyValue('--g-sheet-detent')).toBe('92.00dvh');
  });

  it('閉じたまま始まっても、開いたときの高さは既定の段である', () => {
    // 閉じている間に高さを戻す処理が、React が書いた値と違うものを書くと
    // 開いたときに別の段の高さで現れる。state が既に既定値だと再レンダーも起きず戻らない。
    const view = sheet({ detents: THREE, initialOpen: false });
    expect(view.panel().style.getPropertyValue('--g-sheet-detent')).toBe('92.00dvh');

    view.setOpen(true);
    expect(view.panel().style.getPropertyValue('--g-sheet-detent')).toBe('92.00dvh');
  });

  it('閉じたあとに遅れて届く pointerup では閉じない', () => {
    // kind="view" にして実際に閉じられる状態にする。
    // backdrop 不可のままだと、そもそも閉じないので主張が空になる。
    const view = sheet({
      kind: 'view',
      detents: THREE,
      defaultDetent: 'peek',
      swipeToDismiss: true,
    });

    down(view.handle(), 100);
    move(view.handle(), 400);
    view.setOpen(false);
    view.onOpenChange.mockClear();

    up(view.panel(), 400);
    expect(view.onOpenChange).not.toHaveBeenCalled();
  });
});

/* ========================================================================== */
/* D4. detents が差し替わる                                                     */
/* ========================================================================== */

describe('detents prop changes / M-03', () => {
  it('段が減っても aria-valuenow が valuemax を超えない', () => {
    const view = sheet({ detents: THREE, defaultDetent: 'peek' });

    fireEvent.keyDown(view.grip(), { key: 'End' }); // index 2
    expect(view.grip()).toHaveAttribute('aria-valuenow', '2');

    view.setDetents(['peek', 'half']); // valuemax は 1 に減る

    const grip = view.grip();
    const now = Number(grip.getAttribute('aria-valuenow'));
    const max = Number(grip.getAttribute('aria-valuemax'));
    expect(now).toBeLessThanOrEqual(max);
    expect(view.dialog()).toHaveAttribute('data-detent', 'half');
  });

  it('段が減ったあとも、矢印キーで下へ動ける', () => {
    const view = sheet({ detents: THREE, defaultDetent: 'peek' });

    fireEvent.keyDown(view.grip(), { key: 'End' });
    view.setDetents(['peek', 'half']);
    fireEvent.keyDown(view.grip(), { key: 'ArrowDown' });

    expect(view.dialog()).toHaveAttribute('data-detent', 'peek');
    expect(view.grip()).toHaveAttribute('aria-valuenow', '0');
  });
});

/* ========================================================================== */
/* D5. React が持っているインラインスタイルとの衝突                              */
/* ========================================================================== */

describe('inline style ownership / C-08', () => {
  it('同じ段に戻ったときも高さの指定が残る（React は再レンダーしない）', () => {
    const view = sheet({ detents: THREE });
    expect(view.panel().style.getPropertyValue('--g-sheet-detent')).toBe('92.00dvh');

    // わずかに動かして離す。吸い付く先は元と同じ段。
    down(view.handle(), 100);
    move(view.handle(), 105);
    up(view.panel(), 105);

    expect(view.dialog()).toHaveAttribute('data-detent', 'full');
    // ここが消えると block-size が auto に落ち、シートが内容なりの高さへ縮む。
    expect(view.panel().style.getPropertyValue('--g-sheet-detent')).toBe('92.00dvh');
  });

  it('中断したときも高さの指定が残る', () => {
    const view = sheet({ detents: THREE });

    down(view.handle(), 100);
    move(view.handle(), 420);
    fireEvent.pointerCancel(view.panel(), { pointerId: 1, clientY: 420 });

    expect(view.panel().style.getPropertyValue('--g-sheet-detent')).toBe('92.00dvh');
  });

  it('段を使わないシートでは高さを指定しない（内容なりに伸びる）', () => {
    // 既定の kind="form" は backdrop 不可。スワイプはスクリム押下と同じ許可に従う。
    const view = sheet({ kind: 'view', swipeToDismiss: true });
    expect(view.panel().style.getPropertyValue('--g-sheet-detent')).toBe('');

    down(view.panel(), 100);
    move(view.panel(), 200);
    expect(view.panel().style.getPropertyValue('--g-swipe-y')).toBe('100px');
    up(view.panel(), 200);
    expect(view.panel().style.getPropertyValue('--g-swipe-y')).toBe('');
    expect(view.panel().style.getPropertyValue('--g-sheet-detent')).toBe('');
  });
});
