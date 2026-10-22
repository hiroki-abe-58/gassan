/**
 * トースト（N-01〜N-08）。
 *
 * 時間は store が持ち、ホストのタイマー 1 本で待つ（fake timers で時刻を進める）。
 * jsdom は CSS を読まないので、退出の transition は 0 で、閉じたらその場で外れる。
 * top layer・メーターの動き・出入りの動きはヘッドレス Chrome で確かめる（VERIFICATION.md）。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Modal, ToastHost, resetToasts, toast } from '../src';

const region = (): HTMLElement => screen.getByRole('region', { name: '通知' });
const items = (): HTMLElement[] => within(region()).queryAllByRole('listitem');
const meterOf = (item: HTMLElement): HTMLElement | null => item.querySelector<HTMLElement>('.g-toast-meter-fill');

afterEach(() => {
  act(() => resetToasts());
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('トースト / N-01〜N-08', () => {
  it('toast() で出し、ToastHost が「通知」の領域に描く。id を返し、同じ id は置き換えて時間をやり直す', () => {
    vi.useFakeTimers();
    render(<ToastHost />);
    let id = '';
    act(() => {
      id = toast('保存しました');
    });
    expect(region()).toHaveAttribute('aria-live', 'polite');
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent('保存しました');

    act(() => vi.advanceTimersByTime(4000));
    act(() => {
      toast('もう一度保存しました', { id });
    });
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent('もう一度保存しました');
    act(() => vi.advanceTimersByTime(4000));
    expect(items()).toHaveLength(1); // 置き換えた時点から 5 秒
    act(() => vi.advanceTimersByTime(1000));
    expect(items()).toHaveLength(0);
  });

  it('時間が来たら閉じる。メーターは全体の長さを持ち、Infinity なら閉じずメーターも出さない', () => {
    vi.useFakeTimers();
    render(<ToastHost />);
    act(() => {
      toast.success('送信しました');
      toast('同期を待っています', { duration: Number.POSITIVE_INFINITY });
    });
    const [timed, sticky] = items();
    expect(meterOf(timed as HTMLElement)?.style.getPropertyValue('--g-toast-duration')).toBe('5000ms');
    expect(meterOf(sticky as HTMLElement)).toBeNull();
    act(() => vi.advanceTimersByTime(4999));
    expect(items()).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(items()).toHaveLength(1);
    expect(items()[0]).toHaveTextContent('同期を待っています');
    act(() => vi.advanceTimersByTime(600_000));
    expect(items()).toHaveLength(1);
  });

  it('既定の長さは 5 秒、注意と失敗は 8 秒、ボタンが付けば 10 秒以上。duration を渡せばそれに従う', () => {
    render(<ToastHost max={10} />);
    act(() => {
      toast.info('お知らせ');
      toast.warning('容量が残りわずかです');
      toast.error('送信できませんでした');
      toast('削除しました', { action: { label: '元に戻す', onClick: () => undefined } });
      toast('削除しました', { duration: 3000, action: { label: '元に戻す', onClick: () => undefined } });
    });
    expect(items().map((item) => meterOf(item)?.style.getPropertyValue('--g-toast-duration'))).toEqual([
      '5000ms',
      '8000ms',
      '8000ms',
      '10000ms',
      '3000ms',
    ]);
    expect(items().map((item) => item.querySelector('.g-toast')?.getAttribute('data-tone'))).toEqual([
      'info',
      'warning',
      'error',
      'neutral',
      'neutral',
    ]);
  });

  it('ポインタが乗っている間とフォーカスが中にある間は、時間もメーターも止まる', () => {
    vi.useFakeTimers();
    render(<ToastHost />);
    act(() => {
      toast('保存しました');
    });
    const list = region().querySelector('ol') as HTMLElement;
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.pointerEnter(list);
    expect(region()).toHaveAttribute('data-paused');
    act(() => vi.advanceTimersByTime(60_000));
    expect(items()).toHaveLength(1);
    fireEvent.pointerLeave(list);
    expect(region()).not.toHaveAttribute('data-paused');
    act(() => vi.advanceTimersByTime(1999));
    expect(items()).toHaveLength(1); // 止める前に 3 秒経っていたので、残りは 2 秒
    act(() => {
      within(region()).getByRole('button', { name: '通知を閉じる' }).focus();
    });
    expect(region()).toHaveAttribute('data-paused');
    act(() => vi.advanceTimersByTime(60_000));
    expect(items()).toHaveLength(1);
    act(() => {
      (document.activeElement as HTMLElement).blur();
    });
    act(() => vi.advanceTimersByTime(1));
    expect(items()).toHaveLength(0);
  });

  it('タブが隠れている間は止まる（戻ってきた人が読めるように）', () => {
    vi.useFakeTimers();
    let state: DocumentVisibilityState = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => state);
    render(<ToastHost />);
    act(() => {
      toast('書き出しが終わりました');
    });
    state = 'hidden';
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    act(() => vi.advanceTimersByTime(60_000));
    expect(items()).toHaveLength(1);
    state = 'visible';
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    act(() => vi.advanceTimersByTime(5000));
    expect(items()).toHaveLength(0);
  });

  it('× と Esc で閉じ（Esc はモーダルに届かせない）、ボタンは押すと onClick を呼んで閉じる。閉じ終えたら onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const undo = vi.fn();
    render(<ToastHost max={5} />);
    let first = '';
    act(() => {
      first = toast('A', { onDismiss });
      toast('B', { action: { label: '元に戻す', onClick: undo } });
      toast('C');
    });
    await user.click(within(items()[0] as HTMLElement).getByRole('button', { name: '通知を閉じる' }));
    expect(onDismiss).toHaveBeenCalledWith(first);
    expect(items()).toHaveLength(2);

    await user.click(within(region()).getByRole('button', { name: '元に戻す' }));
    expect(undo).toHaveBeenCalledTimes(1);
    expect(items()).toHaveLength(1);

    const notPrevented = fireEvent.keyDown(items()[0]?.querySelector('.g-toast') as HTMLElement, { key: 'Escape' });
    expect(notPrevented).toBe(false);
    expect(items()).toHaveLength(0);
  });

  it('横に払うと閉じる。少しの動きと縦の動きでは閉じない', () => {
    render(<ToastHost />);
    act(() => {
      toast('払って閉じる');
    });
    const card = (): HTMLElement => items()[0]?.querySelector('.g-toast') as HTMLElement;
    fireEvent.pointerDown(card(), { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(card(), { pointerId: 1, clientX: 5, clientY: 0 });
    fireEvent.pointerUp(card(), { pointerId: 1, clientX: 5, clientY: 0 });
    expect(items()).toHaveLength(1);

    fireEvent.pointerDown(card(), { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(card(), { pointerId: 1, clientX: 4, clientY: 40 });
    fireEvent.pointerUp(card(), { pointerId: 1, clientX: 4, clientY: 40 });
    expect(items()).toHaveLength(1);

    fireEvent.pointerDown(card(), { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(card(), { pointerId: 1, clientX: 40, clientY: 0 });
    expect(card()).toHaveAttribute('data-dragging');
    expect(region()).toHaveAttribute('data-paused'); // 指で動かしている間は止める
    fireEvent.pointerMove(card(), { pointerId: 1, clientX: 160, clientY: 0 });
    fireEvent.pointerUp(card(), { pointerId: 1, clientX: 160, clientY: 0 });
    expect(items()).toHaveLength(0);
  });

  it('閉じたトーストにフォーカスがあれば、隣のトーストへ、最後なら通知へ入る前の場所へ戻す', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">前の場所</button>
        <ToastHost />
      </>,
    );
    act(() => {
      toast('A');
      toast('B');
    });
    const outside = screen.getByRole('button', { name: '前の場所' });
    act(() => outside.focus());
    act(() => {
      within(items()[0] as HTMLElement).getByRole('button', { name: '通知を閉じる' }).focus();
    });
    await user.keyboard('{Enter}');
    expect(items()).toHaveLength(1);
    expect(within(items()[0] as HTMLElement).getByRole('button', { name: '通知を閉じる' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(items()).toHaveLength(0);
    expect(outside).toHaveFocus();
  });

  it('印はトーンごとに付け、飾りとして読ませない。読み込み中は回る印', () => {
    render(<ToastHost max={5} />);
    act(() => {
      toast('印なし');
      toast.success('成功');
      toast.error('失敗');
      void toast.promise(new Promise(() => undefined), { loading: '保存しています', success: '', error: '' });
    });
    const [plain, success, failure, loading] = items() as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
    expect(plain.querySelector('svg.g-toast-icon')).toBeNull();
    expect(success.querySelector('svg.g-toast-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(failure.querySelector('svg.g-toast-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(loading.querySelector('.g-toast-spinner')).toHaveAttribute('aria-hidden', 'true');
    expect(loading.querySelector('.g-toast')).toHaveAttribute('data-tone', 'loading');
  });

  it('toast.promise は読み込み中を出して時間では閉じず、終わったら成功か失敗に置き換える', async () => {
    render(<ToastHost max={5} />);
    let resolve: (value: string) => void = () => undefined;
    let reject: (error: unknown) => void = () => undefined;
    const saving = new Promise<string>((done) => {
      resolve = done;
    });
    const failing = new Promise<string>((_, fail) => {
      reject = fail;
    });
    let returned: Promise<string> | null = null;
    act(() => {
      returned = toast.promise(saving, {
        loading: '保存しています',
        success: (name) => `${name} を保存しました`,
        error: '保存できませんでした',
      });
      void toast.promise(failing, { loading: '送っています', success: '送りました', error: (e) => `送れませんでした: ${String(e)}` }).catch(
        () => undefined,
      );
    });
    expect(returned).toBe(saving);
    expect(meterOf(items()[0] as HTMLElement)).toBeNull();
    await act(async () => {
      resolve('メモ');
      reject('通信が切れた');
      await Promise.allSettled([saving, failing]);
    });
    expect(items()[0]).toHaveTextContent('メモ を保存しました');
    expect(items()[0]?.querySelector('.g-toast')).toHaveAttribute('data-tone', 'success');
    expect(meterOf(items()[0] as HTMLElement)?.style.getPropertyValue('--g-toast-duration')).toBe('5000ms');
    expect(items()[1]).toHaveTextContent('送れませんでした: 通信が切れた');
    expect(items()[1]?.querySelector('.g-toast')).toHaveAttribute('data-tone', 'error');
  });

  it('見せる数を超えたら古いものから閉じる。上に出すときは新しいものを上（DOM の先頭）に置く', () => {
    const { rerender } = render(<ToastHost max={2} />);
    act(() => {
      toast('1');
      toast('2');
      toast('3');
    });
    expect(items().map((item) => item.textContent)).toEqual(['2', '3']);
    rerender(<ToastHost max={2} position="top-center" />);
    expect(region()).toHaveAttribute('data-position', 'top-center');
    expect(items().map((item) => item.textContent)).toEqual(['3', '2']);
  });

  it('モーダルが開いている間は最前面の dialog の中へ移り、残り時間とメーターを引き継ぐ。閉じたら戻る', () => {
    vi.useFakeTimers();
    function App({ open }: { open: boolean }): ReactNode {
      return (
        <>
          <Modal.Root open={open} onOpenChange={() => undefined} label="設定">
            <Modal.Body>本文</Modal.Body>
          </Modal.Root>
          <ToastHost />
        </>
      );
    }
    const { rerender } = render(<App open={false} />);
    act(() => {
      toast('コピーしました');
    });
    expect(region().parentElement).toBe(document.body);
    act(() => vi.advanceTimersByTime(3000));
    rerender(<App open />);
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.contains(region())).toBe(true);
    expect(meterOf(items()[0] as HTMLElement)?.style.getPropertyValue('--g-toast-elapsed')).toBe('-3000ms');
    act(() => vi.advanceTimersByTime(1999));
    expect(items()).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(items()).toHaveLength(0);
    rerender(<App open={false} />);
    act(() => vi.runOnlyPendingTimers());
    expect(region().parentElement).toBe(document.body);
  });

  it('ホストが無いまま出したら警告し、2 つ置いたら警告する。data-* は領域へ渡す', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    act(() => {
      toast('ホストが無い');
    });
    await Promise.resolve();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('<ToastHost /> is not mounted'));
    render(
      <>
        <ToastHost data-testid="toasts" />
        <ToastHost />
      </>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('More than one <ToastHost />'));
    expect(screen.getAllByRole('region', { name: '通知' })[0]).toHaveAttribute('data-testid', 'toasts');
  });
});
