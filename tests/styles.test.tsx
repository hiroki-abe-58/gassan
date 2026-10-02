/**
 * styles.css の静的な回帰テスト。
 *
 * jsdom は CSS を適用しない（vitest の css: false）。レイアウトの正しさはここでは保証できず、
 * VERIFICATION.md 第3節の実ブラウザ確認に回している。ここで見るのは
 * 「一度直した規則が、知らないうちに消えたり戻ったりしていないか」だけ。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { Modal } from '../src';
import { renderModal } from './utils';
import { within } from '@testing-library/react';

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
/** コメントを落とした本文。コメント中の語に反応しないため。 */
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '');

describe('styles / footer order (F-02〜F-04)', () => {
  it('column-reverse を使わない（視覚順と Tab 順を逆転させない）', () => {
    expect(rules).not.toMatch(/column-reverse/);
  });

  it('order で見た目の順番を入れ替えない（GateStatus を本文の末尾に置くと先頭へ飛んでいた）', () => {
    // order も column-reverse と同じく、視覚順と読み上げ・Tab 順を食い違わせる。
    expect(rules).not.toMatch(/(^|[^-\w])order\s*:/m);
  });

  it('ボタン列は残り幅を占め、最初の tertiary だけを左へ分離する', () => {
    expect(rules).toMatch(/\.g-footer-actions\s*\{[^}]*flex:\s*1;/);
    expect(rules).toMatch(
      /\.g-footer-actions > \.g-btn\[data-variant="tertiary"\]:first-child\s*\{\s*margin-inline-end:\s*auto;/,
    );
  });

  it('狭幅の縦積み規則は、ボタン列の基本規則より後に置く（詳細度が同じなので順序で勝つ）', () => {
    const base = rules.indexOf('.g-footer-actions {');
    const narrow = rules.indexOf('@container g-panel (max-width: 400px)');
    expect(base).toBeGreaterThan(-1);
    expect(narrow).toBeGreaterThan(base);
  });

  it('フッタの DOM 順は note → [書いた順のボタン]', () => {
    renderModal({
      label: 'テスト',
      children: (
        <Modal.Footer note="あとから変更できます">
          <Modal.Button variant="tertiary">やめる</Modal.Button>
          <Modal.Button variant="secondary">下書き</Modal.Button>
          <Modal.Button variant="primary">保存</Modal.Button>
        </Modal.Footer>
      ),
    });
    const footer = document.querySelector<HTMLElement>('.g-footer');
    if (!footer) throw new Error('footer missing');
    expect(footer.firstElementChild).toHaveClass('g-footer-note');
    const names = within(footer)
      .getAllByRole('button')
      .map((button) => button.textContent);
    expect(names).toEqual(['やめる', '下書き', '保存']);
  });
});

describe('styles / exit fallback (L-07)', () => {
  it('scrim と panel の退出状態を持つ', () => {
    expect(rules).toContain('.g-dialog[open][data-exiting] .g-scrim');
    expect(rules).toContain('.g-dialog[open][data-exiting] .g-panel');
  });

  it('sheet は下へ抜ける退出状態を別に持つ（center / top は共通）', () => {
    expect(rules).toMatch(
      /\.g-dialog\[data-placement="sheet"\]\[open\]\[data-exiting\] \.g-panel\s*\{[^}]*translate:\s*0 100%;/,
    );
  });

  it('退出中は discrete transition を止め、二重待ちを起こさない', () => {
    expect(rules).toMatch(/\.g-dialog\[data-exiting\]\s*\{\s*transition:\s*none;/);
  });

  it('z-index の保険は使わない（top layer の外側の話なので効かない）', () => {
    expect(rules).not.toMatch(/z-index/);
  });
});
