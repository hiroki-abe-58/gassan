/**
 * カルーセル（U-28 / U-29）。
 *
 * 位置は scroll-snap の器で決まり、jsdom はレイアウトを持たないので、ここでは役割・名前・状態・キー操作・
 * 自動再生の時間の数え方を見る。指で送ったときの位置の読み取りは、モーダルのギャラリーと共有の useSnapTrack が持つ。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Carousel } from '../src';

const ITEMS = [
  { id: 'a', content: <p>新しいダッシュボード</p> },
  { id: 'b', content: <p>請求書の一括ダウンロード</p> },
  { id: 'c', content: <p>メンバーの招待</p> },
];

const region = (): HTMLElement => screen.getByRole('region', { name: 'お知らせ' });
const dots = (): HTMLElement[] => within(within(region()).getByRole('group', { name: 'スライドを選ぶ' })).getAllByRole('button');
const currentDot = (): number => dots().findIndex((dot) => dot.getAttribute('aria-current') === 'true');
const status = (): HTMLElement | null => region().querySelector('p.g-sr-only');

function reduceMotion(reduce: boolean): void {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query === '(prefers-reduced-motion: reduce)',
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

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('カルーセル / U-28', () => {
  it('U-28 カルーセルは名前と「カルーセル」という役割の説明を持つ領域で、スライドは位置の名前と「スライド」という役割の説明を持つ group', () => {
    render(<Carousel label="お知らせ" items={[...ITEMS.slice(0, 2), { ...ITEMS[2]!, label: 'メンバーの招待' }]} data-section="news" />);
    expect(region()).toHaveAttribute('aria-roledescription', 'カルーセル');
    expect(region()).toHaveAttribute('data-section', 'news');
    const slides = within(region())
      .getAllByRole('group')
      .filter((group) => group.getAttribute('aria-roledescription') === 'スライド');
    expect(slides.map((slide) => slide.getAttribute('aria-label'))).toEqual(['3件中1件目', '3件中2件目', 'メンバーの招待']);
    // 自動で送らないなら、止めるボタンは置かない
    expect(within(region()).queryByRole('button', { name: /自動再生/ })).toBeNull();
  });

  it('U-28 次へ・前へで先頭のスライドが移り、端では押せない。位置の変化を読み上げ、変わったときだけ onIndexChange を呼ぶ', () => {
    const onIndexChange = vi.fn();
    render(<Carousel label="お知らせ" items={ITEMS} onIndexChange={onIndexChange} />);
    const previous = within(region()).getByRole('button', { name: '前へ' });
    const next = within(region()).getByRole('button', { name: '次へ' });
    expect(onIndexChange).not.toHaveBeenCalled();
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(previous);
    expect(currentDot()).toBe(0);

    fireEvent.click(next);
    expect(currentDot()).toBe(1);
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    expect(status()).toHaveAttribute('aria-live', 'polite');
    expect(status()).toHaveTextContent('3件中2件目');

    fireEvent.click(next);
    expect(next).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(next);
    expect(currentDot()).toBe(2);
  });

  it('U-28 loop なら端から反対の端へ回る', () => {
    render(<Carousel label="お知らせ" items={ITEMS} loop />);
    const previous = within(region()).getByRole('button', { name: '前へ' });
    expect(previous).not.toHaveAttribute('aria-disabled');
    fireEvent.click(previous);
    expect(currentDot()).toBe(2);
    fireEvent.click(within(region()).getByRole('button', { name: '次へ' }));
    expect(currentDot()).toBe(0);
  });

  it('U-28 点はスライドを選ぶボタンで、今の点だけが aria-current。Tab で止まるのは 1 つで、←→・Home・End で移って選ぶ', () => {
    render(<Carousel label="お知らせ" items={ITEMS} />);
    expect(dots().map((dot) => dot.getAttribute('aria-label'))).toEqual(['1枚目のスライド', '2枚目のスライド', '3枚目のスライド']);
    expect(dots().map((dot) => dot.tabIndex)).toEqual([0, -1, -1]);

    fireEvent.click(dots()[2]!);
    expect(currentDot()).toBe(2);
    expect(dots().map((dot) => dot.tabIndex)).toEqual([-1, -1, 0]);

    dots()[2]!.focus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowLeft' });
    expect(currentDot()).toBe(1);
    expect(document.activeElement).toBe(dots()[1]);
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(currentDot()).toBe(0);
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(currentDot()).toBe(2);
    expect(document.activeElement).toBe(dots()[2]);
  });

  it('U-28 perView で 1 度に見せる枚数を決め、点は先頭に置ける位置の数だけ出す', () => {
    const items = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, content: <p>{id}</p> }));
    render(<Carousel label="お知らせ" items={items} perView={2} />);
    expect(dots()).toHaveLength(4);
    expect(region().style.getPropertyValue('--g-carousel-per-view')).toBe('2');
    fireEvent.click(dots()[3]!);
    expect(within(region()).getByRole('button', { name: '次へ' })).toHaveAttribute('aria-disabled', 'true');
    // すべて見えているなら、前へ・次へも点も置かない
    render(<Carousel label="少ない" items={items.slice(0, 2)} perView={2} />);
    const few = screen.getByRole('region', { name: '少ない' });
    expect(within(few).queryByRole('button')).toBeNull();
  });

  it('U-28 data-* を器へ渡し、項目の id が重複すると開発時に警告する（D-13）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Carousel label="お知らせ" items={[ITEMS[0]!, { ...ITEMS[1]!, id: 'a' }]} data-testid="news" />);
    expect(screen.getByTestId('news')).toBe(region());
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Carousel'));
  });
});

describe('カルーセルの自動再生 / U-29', () => {
  it('U-29 自動で送るときは止めるボタンを先頭に置き、時間が来ると次へ送り、最後から最初へ回る。送っている間は位置を読み上げない', () => {
    reduceMotion(false);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    render(<Carousel label="お知らせ" items={ITEMS} autoplay={1000} />);
    const buttons = within(region()).getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName('スライドの自動再生を止める');
    expect(region()).toHaveAttribute('data-playing');
    expect(status()).toHaveAttribute('aria-live', 'off');

    act(() => vi.advanceTimersByTime(1000));
    expect(currentDot()).toBe(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(currentDot()).toBe(2);
    act(() => vi.advanceTimersByTime(1000));
    expect(currentDot()).toBe(0);
  });

  it('U-29 ポインタが乗っている間とフォーカスが中にある間は止まり、離れると止めた所から数える。止めるボタンで止めると、離れても送らない', () => {
    reduceMotion(false);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    render(<Carousel label="お知らせ" items={ITEMS} autoplay={1000} />);

    act(() => vi.advanceTimersByTime(600));
    fireEvent.pointerEnter(region());
    expect(region()).toHaveAttribute('data-paused');
    act(() => vi.advanceTimersByTime(5000));
    expect(currentDot()).toBe(0);
    fireEvent.pointerLeave(region());
    act(() => vi.advanceTimersByTime(399));
    expect(currentDot()).toBe(0);
    act(() => vi.advanceTimersByTime(1));
    expect(currentDot()).toBe(1);

    const stop = within(region()).getByRole('button', { name: 'スライドの自動再生を止める' });
    fireEvent.focusIn(stop);
    act(() => vi.advanceTimersByTime(3000));
    expect(currentDot()).toBe(1);
    fireEvent.click(stop);
    expect(stop).toHaveAccessibleName('スライドの自動再生を始める');
    expect(region()).not.toHaveAttribute('data-playing');
    fireEvent.focusOut(stop, { relatedTarget: document.body });
    act(() => vi.advanceTimersByTime(3000));
    expect(currentDot()).toBe(1);
    expect(status()).toHaveAttribute('aria-live', 'polite');
  });

  it('U-29 動きを減らす設定では、自動再生を止めた状態で始める（始めるボタンで動かせる）', () => {
    reduceMotion(true);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    render(<Carousel label="お知らせ" items={ITEMS} autoplay />);
    const start = within(region()).getByRole('button', { name: 'スライドの自動再生を始める' });
    act(() => vi.advanceTimersByTime(20000));
    expect(currentDot()).toBe(0);
    fireEvent.click(start);
    act(() => vi.advanceTimersByTime(6000));
    expect(currentDot()).toBe(1);
  });
});
