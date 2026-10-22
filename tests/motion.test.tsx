/**
 * 動き（V-01〜V-08）。
 *
 * 段はトークンの差し替えだけで、部品の CSS は同じ規則を使う。ここでは
 *   - 段と「動きを減らす設定」の書き方（網羅・並び・値）を、CSS の文字列として検査する
 *   - ポップアップの退出の待ち方と、セグメントの板の置き方を、DOM で検査する
 * 描いた結果（行き過ぎの見え方・板の滑り）は実ブラウザでしか見えないので、
 * ヘッドレス Chrome のスクリーンショットで確かめている（VERIFICATION.md）。
 */
import { readFileSync } from 'node:fs';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { GassanProvider, MOTION_PRESETS, Modal } from '../src';
import { resetModalStack } from '../src/internal/stack';
import { renderModal } from './utils';

const css = readFileSync('src/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** selector の後の最初の `{` から、対応する `}` までの中身。from より後ろを探す。 */
function bodyOf(selector: string, from = 0): string {
  const at = css.indexOf(selector, from);
  if (at < 0) throw new Error(`${selector} が無い`);
  const open = css.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`${selector} の括弧が閉じていない`);
}

/** `--name: value;` の並び。 */
function tokens(body: string): Map<string, string> {
  return new Map([...body.matchAll(/(--g-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1] ?? '', (m[2] ?? '').trim()]));
}

const preset = (name: string): Map<string, string> => tokens(bodyOf(`:where([data-g-motion="${name}"])`));

/** 段が書くトークン。どの段も全部書く（入れ子の内側で外側の値を引きずらない）。 */
const PRESET_TOKENS = [
  '--g-dur-in',
  '--g-dur-out',
  '--g-dur-fast',
  '--g-dur-slow',
  '--g-ease-in',
  '--g-ease-move',
  '--g-motion-distance',
  '--g-motion-scale',
  '--g-motion-blur',
  '--g-stagger',
  '--g-enter',
  '--g-press-scale',
];

const SEGMENTS = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
];

describe('動きの段 / V-01', () => {
  it('段は 4 つで弱い順に並び、どの段も同じトークンの組を全部書く', () => {
    const found = [...css.matchAll(/:where\(\[data-g-motion="(\w+)"\]\)\s*\{/g)].map((m) => m[1]);
    expect(found).toEqual([...MOTION_PRESETS]);
    for (const name of MOTION_PRESETS) expect([...preset(name).keys()].sort()).toEqual([...PRESET_TOKENS].sort());
  });

  it('GassanProvider の motion は data-g-motion の器（display: contents）で包み、省略すると器を足さない', () => {
    const { container, rerender } = render(
      <GassanProvider motion="expressive">
        <p>中身</p>
      </GassanProvider>,
    );
    const scope = container.firstElementChild as HTMLElement;
    expect(scope).toHaveAttribute('data-g-motion', 'expressive');
    expect(scope.style.display).toBe('contents');
    rerender(
      <GassanProvider>
        <p>中身</p>
      </GassanProvider>,
    );
    expect(container.firstElementChild?.tagName).toBe('P');
  });

  it('モーダル 1 枚にも段を渡せる（data-g-motion は予約していないので dialog に届き、警告しない）', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Modal.Root open onOpenChange={() => {}} label="テスト" data-g-motion="subtle">
        <Modal.Body>本文</Modal.Body>
      </Modal.Root>,
    );
    expect(document.querySelector('dialog')).toHaveAttribute('data-g-motion', 'subtle');
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('動きを減らす設定 / V-02', () => {
  it(':root と段の器の両方を最短に書き直し、段より後ろに置く（器が持つ値は継承した値に勝つため）', () => {
    const selector = ':where(:root, [data-g-motion])';
    const at = css.indexOf(selector);
    expect(css.lastIndexOf('@media (prefers-reduced-motion: reduce)', at)).toBeGreaterThan(
      css.indexOf(':where([data-g-motion="expressive"])'),
    );
    const reduced = tokens(bodyOf(selector));
    for (const name of ['--g-dur-in', '--g-dur-out', '--g-dur-fast', '--g-dur-slow']) expect(reduced.get(name)).toBe('1ms');
    expect(reduced.get('--g-motion-distance')).toBe('0px');
    expect(reduced.get('--g-motion-scale')).toBe('1');
    expect(reduced.get('--g-motion-blur')).toBe('0px');
    expect(reduced.get('--g-enter')).toBe('none');
    expect(reduced.get('--g-press-scale')).toBe('1');
  });

  it('動きを減らす設定では、豊かな段のモーダルでも退出を待たない（JS の待ちも最短になる）', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
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
      const { dialog, setOpen } = renderModal({ 'data-g-motion': 'expressive' });
      act(() => setOpen(false));
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(dialog().open).toBe(false);
    } finally {
      vi.useRealTimers();
      resetModalStack();
    }
  });
});

describe('バネ / V-03', () => {
  it('バネは linear() の点列で 0 から 1 へ進み、行き過ぎは 1 割未満。豊かな段だけが入場と移る印に使う', () => {
    const spring = tokens(bodyOf(':where(:root)')).get('--g-ease-spring') ?? '';
    const values = (/^linear\((.+)\)$/.exec(spring)?.[1] ?? '').split(',').map((part) => Number(part.trim().split(/\s+/)[0]));
    expect(values[0]).toBe(0);
    expect(values.at(-1)).toBe(1);
    expect(Math.max(...values)).toBeGreaterThan(1);
    expect(Math.max(...values)).toBeLessThan(1.1);
    expect(preset('expressive').get('--g-ease-in')).toBe('var(--g-ease-spring)');
    expect(preset('expressive').get('--g-ease-move')).toBe('var(--g-ease-spring)');
    for (const name of ['none', 'subtle', 'standard']) expect(preset(name).get('--g-ease-in')).not.toContain('spring');
  });

  it('シートはどの段でもバネを使わない（行き過ぎた分だけ下端に隙間が開く）', () => {
    expect(css).toMatch(/\.g-dialog\[data-placement="sheet"\]\[open\] \.g-panel\s*\{[^}]*transition-timing-function:\s*var\(--g-ease-settle\)/);
    const settle = tokens(bodyOf(':where(:root)')).get('--g-ease-settle') ?? '';
    expect(settle).toMatch(/^cubic-bezier\(/);
    const [, y1, , y2] = settle.replace(/[^\d.,-]/g, '').split(',').map(Number);
    expect(Math.max(y1 ?? 0, y2 ?? 0)).toBeLessThanOrEqual(1);
    for (const name of MOTION_PRESETS) expect(preset(name).has('--g-ease-settle')).toBe(false);
  });
});

describe('ポップアップの出入り / V-04', () => {
  function Harness(): ReturnType<typeof Modal.Select> {
    return (
      <Modal.Select
        aria-label="色"
        options={[
          { value: 'red', label: '赤' },
          { value: 'blue', label: '青' },
        ]}
      />
    );
  }

  /** ポップアップにだけ、計算済みの transition の長さを返す（jsdom は CSS を読まないので 0 になる）。 */
  function withExitTransition(ms: number): void {
    const original = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) =>
      element instanceof HTMLElement && element.classList.contains('g-popup')
        ? ({ transitionDuration: `${String(ms / 1000)}s`, transitionDelay: '0s' } as CSSStyleDeclaration)
        : original(element, pseudo),
    );
  }

  it('遷移の無い環境（CSS を読まないテスト・動きを減らす設定）では、閉じたらその場で外す', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox', { name: '色' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('閉じても data-exiting で退出を描き、計算済みの transition の長さだけ待ってから外す', async () => {
    withExitTransition(60);
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('combobox', { name: '色' }));
    await user.keyboard('{Escape}');
    const popup = document.querySelector('.g-popup');
    expect(popup).toHaveAttribute('data-exiting');
    await waitFor(() => expect(document.querySelector('.g-popup')).toBeNull());
  });

  it('退出の途中で開き直すと、外さずに元へ戻す', async () => {
    withExitTransition(60);
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('combobox', { name: '色' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    await user.click(trigger);
    const popup = document.querySelector('.g-popup');
    expect(popup).not.toHaveAttribute('data-exiting');
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(document.querySelector('.g-popup')).toBe(popup);
  });
});

describe('移る印 / V-05', () => {
  it('セグメントの板は選択中の区画を測って置き、測り終えて初めて data-indicator を付ける', async () => {
    // jsdom はレイアウトを持たないので、区画の位置を並び順から作る（1 区画 40px）。
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('g-segment') ? 40 * [...(this.parentElement?.children ?? [])].indexOf(this) : 0;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('g-segment') ? 40 : 0;
    });
    const user = userEvent.setup();
    const { container } = render(<Modal.Segmented aria-label="表示" defaultValue="a" options={SEGMENTS} />);
    const group = container.querySelector<HTMLElement>('.g-segmented');
    // 先頭の子は板なので、最初の区画は 2 番目（40px）。
    expect(group).toHaveAttribute('data-indicator');
    expect(group?.style.getPropertyValue('--g-ind-x')).toBe('40px');
    expect(group?.style.getPropertyValue('--g-ind-w')).toBe('40px');
    await user.click(screen.getByRole('radio', { name: 'C' }));
    expect(group?.style.getPropertyValue('--g-ind-x')).toBe('120px');
  });

  it('SSR では板を隠したまま（data-indicator が無い）、選択中の区画そのものを塗る', () => {
    const html = renderToString(<Modal.Segmented aria-label="表示" defaultValue="a" options={SEGMENTS} />);
    expect(html).toContain('g-segment-indicator');
    expect(html).not.toContain('data-indicator');
    expect(css).toMatch(/\.g-segmented\[data-indicator\] \.g-segment-input:checked \+ \.g-segment-label\s*\{\s*background:\s*transparent/);
  });
});

describe('押した手応え / V-06', () => {
  it('押している間だけ縮む。ゲート中・処理中・使用不可は縮まない。スイッチの摘みは伸びる', () => {
    expect(css).toMatch(/\.g-btn:not\(:disabled, \[data-gated\], \[data-loading\]\):active\s*\{\s*scale:\s*var\(--g-press-scale\)/);
    expect(css).toMatch(/\.g-chip:active\s*\{\s*scale:\s*var\(--g-press-scale\)/);
    expect(css).toMatch(/\.g-iconbtn:not\(\[aria-disabled="true"\]\):active\s*\{\s*scale:\s*var\(--g-press-scale\)/);
    expect(css).toMatch(/\.g-switch:active \.g-switch-thumb\s*\{\s*inline-size:\s*24px/);
  });
});

describe('印の描き方 / V-07', () => {
  it('チェックの印は線を引くように、ラジオの点は中心から広がって出る', () => {
    render(<Modal.Checkbox>同意する</Modal.Checkbox>);
    expect(document.querySelector('.g-check-icon path')).toHaveAttribute('pathLength', '1');
    expect(css).toMatch(/\.g-check-icon > path\s*\{[^}]*stroke-dasharray:\s*1;[^}]*stroke-dashoffset:\s*1;/);
    expect(css).toMatch(/\.g-check:is\(:checked, :indeterminate\) \+ \.g-check-icon > path\s*\{\s*stroke-dashoffset:\s*0;/);
    expect(css).toMatch(/\.g-radio\s*\{[^}]*box-shadow:\s*inset 0 0 0 10px var\(--g-surface\)/);
    expect(css).toMatch(/\.g-radio:checked\s*\{[^}]*box-shadow:\s*inset 0 0 0 3px var\(--g-surface\)/);
  });
});

describe('順に出す / V-08', () => {
  it('キーフレームを入れるのは豊かな段だけで、遅れは 8 個目で頭打ち', () => {
    expect(tokens(bodyOf(':where(:root)')).get('--g-enter')).toBe('none');
    expect(preset('expressive').get('--g-enter')).toBe('g-rise');
    for (const name of ['none', 'subtle', 'standard']) expect(preset(name).get('--g-enter')).toBe('none');
    expect(css).toMatch(/animation:\s*var\(--g-enter\)/);
    expect(css).toMatch(/animation-delay:\s*calc\(var\(--g-i, 0\) \* var\(--g-stagger\)\)/);
    expect(css).toMatch(/:nth-child\(n \+ 8\)\s*\{\s*--g-i:\s*7;/);
  });
});
