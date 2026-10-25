/**
 * スクロールバー（U-35）。
 *
 * jsdom はレイアウトを持たないので、窓とバーの大きさは要素に直に定義して測らせる。
 * 重なり・太さ・出し入れの見た目はヘッドレス Chrome で確かめる。ここでは測り方・出し方の印・操作・CSS の不変条件を見る。
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChatThread, CodeBlock, GassanProvider, Modal, PageScrollbar, ScrollArea, Table } from '../src';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

type Size = 'clientHeight' | 'scrollHeight' | 'clientWidth' | 'scrollWidth' | 'offsetHeight' | 'offsetWidth';

/** 要素に寸法を与える（jsdom はどれも 0 を返す）。 */
function size(el: Element, sizes: Partial<Record<Size, number>>): void {
  for (const [key, value] of Object.entries(sizes)) Object.defineProperty(el, key, { configurable: true, value });
}

/** 測り直しは次の描画の前（requestAnimationFrame）に走る。 */
const nextFrame = (): Promise<void> =>
  act(async () => {
    await new Promise((done) => setTimeout(done, 32));
  });

function setup(props: Partial<Parameters<typeof ScrollArea>[0]> = {}) {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <ScrollArea ref={ref} label="変更の記録" {...props}>
      <p>本文</p>
    </ScrollArea>,
  );
  const viewport = screen.getByRole('group', { name: '変更の記録' });
  const bar = view.container.querySelector('.g-scrollbar[data-axis="y"]') as HTMLElement;
  return { view, ref, viewport, bar, thumb: bar.firstElementChild as HTMLElement };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('ScrollArea / U-35', () => {
  it('U-35 窓は名前のあるまとまりで Tab で止まり、バーは窓の後ろの兄弟の飾り。ref は窓を指す', () => {
    const { ref, viewport, bar, view } = setup();
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(viewport).toHaveClass('g-scroll-viewport');
    expect(ref.current).toBe(viewport);
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(viewport.nextElementSibling).toBe(bar);
    expect(view.container.firstElementChild).toHaveAttribute('data-orientation', 'vertical');
    // 名前を渡さなければ、窓は領域にもならず Tab でも止まらない（中のフォーカスできる物で送る）
    view.unmount();
    const plain = render(<ScrollArea>中身</ScrollArea>);
    const window_ = plain.container.querySelector('.g-scroll-viewport') as HTMLElement;
    expect(window_).not.toHaveAttribute('role');
    expect(window_).not.toHaveAttribute('tabindex');
  });

  it('U-35 つまみの長さは見えている割合、位置はスクロールの割合。あふれていなければ出さない', async () => {
    const { viewport, bar } = setup();
    size(viewport, { clientHeight: 200, scrollHeight: 800 });
    size(bar, { clientHeight: 196 });
    viewport.scrollTop = 300;
    fireEvent.scroll(viewport);
    await nextFrame();
    expect(bar).toHaveAttribute('data-overflow');
    // 長さ 196 × 200 / 800 = 49、位置 (196 − 49) × 300 / 600 = 73.5 → 74
    expect(bar.style.getPropertyValue('--g-scrollbar-thumb-size')).toBe('49px');
    expect(bar.style.getPropertyValue('--g-scrollbar-thumb-offset')).toBe('74px');

    // 中身がとても長くても、つまみは掴める長さ（24px）を残す
    size(viewport, { clientHeight: 200, scrollHeight: 20000 });
    fireEvent.scroll(viewport);
    await nextFrame();
    expect(bar.style.getPropertyValue('--g-scrollbar-thumb-size')).toBe('24px');

    size(viewport, { clientHeight: 200, scrollHeight: 200 });
    fireEvent.scroll(viewport);
    await nextFrame();
    expect(bar).not.toHaveAttribute('data-overflow');
  });

  it('U-35 右から左の言語の横は、始まりの端（右）からの距離でつまみを置く', async () => {
    const view = render(
      <div dir="rtl">
        <ScrollArea orientation="horizontal" label="表">
          中身
        </ScrollArea>
      </div>,
    );
    const viewport = screen.getByRole('group', { name: '表' });
    const bar = view.container.querySelector('.g-scrollbar[data-axis="x"]') as HTMLElement;
    expect(view.container.querySelector('.g-scrollbar[data-axis="y"]')).toBeNull();
    size(viewport, { clientWidth: 300, scrollWidth: 900 });
    size(bar, { clientWidth: 296 });
    viewport.scrollLeft = -600;
    fireEvent.scroll(viewport);
    await nextFrame();
    // 長さ 296 × 300 / 900 ≒ 99、位置は端まで送ったので (296 − 99)
    expect(bar.style.getPropertyValue('--g-scrollbar-thumb-size')).toBe('99px');
    expect(bar.style.getPropertyValue('--g-scrollbar-thumb-offset')).toBe('197px');
  });

  it('U-35 スクロールしている間だけ「スクロール中」の印を付け、止まって約 1 秒で外す', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    const { viewport, bar } = setup();
    size(viewport, { clientHeight: 200, scrollHeight: 800 });
    fireEvent.scroll(viewport);
    expect(bar).toHaveAttribute('data-scrolling');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.scroll(viewport);
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(bar).toHaveAttribute('data-scrolling');
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(bar).not.toHaveAttribute('data-scrolling');
  });

  it('U-35 出し方は部品の visibility、無ければ近い data-g-scrollbars（GassanProvider の scrollbars）、無ければ auto。後から変えても読み直す', async () => {
    const view = render(
      <GassanProvider scrollbars="always">
        <ScrollArea label="外">中身</ScrollArea>
        <ScrollArea label="内" visibility="hover">
          中身
        </ScrollArea>
      </GassanProvider>,
    );
    const bars = view.container.querySelectorAll('.g-scrollbar');
    expect(bars[0]).toHaveAttribute('data-visibility', 'always');
    expect(bars[1]).toHaveAttribute('data-visibility', 'hover');
    expect(view.container.querySelector('[data-g-scrollbars]')).toHaveStyle({ display: 'contents' });
    view.unmount();

    const plain = render(<ScrollArea label="既定">中身</ScrollArea>);
    const bar = plain.container.querySelector('.g-scrollbar') as HTMLElement;
    expect(bar).toHaveAttribute('data-visibility', 'auto');
    document.documentElement.setAttribute('data-g-scrollbars', 'scroll');
    await act(async () => {
      await Promise.resolve();
    });
    expect(bar).toHaveAttribute('data-visibility', 'scroll');
    document.documentElement.removeAttribute('data-g-scrollbars');
  });

  it('U-35 つまみを掴んで動かすと、動かした分を中身の長さに引き伸ばして送る。溝を押すとその向きへ 1 画面ぶん送る', async () => {
    const { viewport, bar, thumb } = setup();
    size(viewport, { clientHeight: 200, scrollHeight: 800 });
    size(bar, { clientHeight: 196 });
    size(thumb, { offsetHeight: 49 });
    viewport.scrollTop = 0;
    fireEvent.pointerDown(thumb, { pointerId: 1, button: 0, clientY: 10 });
    expect(bar).toHaveAttribute('data-dragging');
    fireEvent.pointerMove(bar, { pointerId: 1, clientY: 59 });
    // 49px 動かす × 600 / (196 − 49) = 200
    expect(viewport.scrollTop).toBe(200);
    fireEvent.pointerUp(bar, { pointerId: 1, clientY: 59 });
    expect(bar).not.toHaveAttribute('data-dragging');
    fireEvent.pointerMove(bar, { pointerId: 1, clientY: 150 });
    expect(viewport.scrollTop).toBe(200);

    const scrollBy = vi.fn();
    viewport.scrollBy = scrollBy as unknown as typeof viewport.scrollBy;
    thumb.getBoundingClientRect = () => ({ top: 60, bottom: 109, left: 0, right: 10, width: 10, height: 49, x: 0, y: 60, toJSON: () => ({}) });
    fireEvent.pointerDown(bar, { pointerId: 2, button: 0, clientY: 180 });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 175, behavior: expect.stringMatching(/^(auto|smooth)$/) });
    fireEvent.pointerDown(bar, { pointerId: 3, button: 0, clientY: 20 });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -175, behavior: expect.stringMatching(/^(auto|smooth)$/) });
    // 右ボタンでは何もしない
    fireEvent.pointerDown(bar, { pointerId: 4, button: 2, clientY: 180 });
    expect(scrollBy).toHaveBeenCalledTimes(2);
  });

  it('U-35 PageScrollbar は置いている間だけ html のネイティブのバーを隠し、バーは body の末尾へ置く。サーバーでは何も描かない', () => {
    expect(renderToString(<PageScrollbar />)).toBe('');
    const view = render(<PageScrollbar visibility="always" />);
    expect(document.documentElement).toHaveAttribute('data-g-page-scrollbar');
    const bar = document.body.querySelector(':scope > .g-page-scrollbar') as HTMLElement;
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(bar).toHaveAttribute('data-visibility', 'always');
    view.unmount();
    expect(document.documentElement).not.toHaveAttribute('data-g-page-scrollbar');
    expect(document.body.querySelector('.g-page-scrollbar')).toBeNull();
  });

  it('U-35 ライブラリの中のスクロールする所（本文・コード・表・図・会話）は、窓の後ろに自前のバーを置く。窓の役割と名前は変えない', () => {
    const view = render(
      <>
        <Modal.Root open onOpenChange={() => undefined} label="規約">
          <Modal.Body label="規約の本文">
            <p>本文</p>
          </Modal.Body>
        </Modal.Root>
        <CodeBlock code="npm install @genelab/gassan" language="sh" />
        <Table label="料金の表">
          <table>
            <tbody>
              <tr>
                <td>Pro</td>
              </tr>
            </tbody>
          </table>
        </Table>
        <ChatThread label="サポート" messages={[]} currentUserId="me" />
      </>,
    );
    const pairs: [HTMLElement, string][] = [
      [screen.getByRole('group', { name: '規約の本文' }), 'y'],
      [screen.getByRole('group', { name: 'sh のコード' }), 'x'],
      [screen.getByRole('group', { name: '料金の表' }), 'x'],
      [screen.getByRole('log', { name: 'サポート' }), 'y'],
    ];
    for (const [viewport, axis] of pairs) {
      expect(viewport).toHaveClass('g-scroll-viewport');
      expect(viewport.nextElementSibling).toHaveClass('g-scrollbar');
      expect(viewport.nextElementSibling).toHaveAttribute('data-axis', axis);
      expect(viewport.nextElementSibling).toHaveAttribute('aria-hidden', 'true');
    }
    // 本文のバーは、パネルの grid で本文と同じ升に入る
    expect(view.baseElement.querySelector('.g-panel > .g-body + .g-scrollbar')).not.toBeNull();
    expect(css).toMatch(/\.g-panel > \.g-scrollbar \{ grid-row: 2; grid-column: 1; \}/);
    expect(css).toMatch(/\.g-panel > \.g-body \{ grid-column: 1; \}/);
  });

  it('U-35 CSS: 窓のネイティブのバーを隠し、バーは窓と同じ升に重ねる。出し方ごとの条件・タッチでは押せない・文書を止めている間は出さない', () => {
    expect(css).toMatch(/\.g-scroll-viewport \{ scrollbar-width: none; \}/);
    expect(css).toMatch(/\.g-scroll-viewport::-webkit-scrollbar \{ display: none; \}/);
    expect(css).toMatch(/\.g-scroll > :is\(\.g-scroll-viewport, \.g-scrollbar\) \{ grid-area: 1 \/ 1; \}/);
    expect(css).toContain('.g-scrollbar[data-overflow]:is([data-visibility="always"], [data-dragging], :hover),');
    expect(css).toContain('.g-scrollbar[data-overflow][data-scrolling]:is([data-visibility="auto"], [data-visibility="scroll"]),');
    expect(css).toContain('.g-scroll-viewport:hover ~ .g-scrollbar[data-overflow]:is([data-visibility="auto"], [data-visibility="hover"])');
    // 押せるようにするのは、細かく指せるポインタの間だけ
    const fine = /@media \(any-pointer: fine\) \{([\s\S]*?)\n {2}\}/.exec(css)?.[1] ?? '';
    expect(fine).toContain('pointer-events: auto;');
    expect(css).toMatch(/\.g-scrollbar \{[^}]*pointer-events: none;/);
    expect(css).toContain(':where(html):has(dialog.g-dialog:modal) .g-page-scrollbar,');
    expect(css).toMatch(/@media print \{\s*\.g-scrollbar \{ display: none; \}/);
  });
});
