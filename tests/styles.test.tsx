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
import { renderModal, rulesOf, splitSelectors } from './utils';
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
    expect(rules).toMatch(/\.g-footer-actions\s*\{[^}]*flex:\s*auto;/);
    expect(rules).toMatch(
      /\.g-footer-actions > \.g-btn\[data-variant="tertiary"\]:first-child\s*\{\s*margin-inline-end:\s*auto;/,
    );
  });

  it('ボタン列が補足と同じ行に収まらないときは、ボタンを縮めずに次の行へ送り、補足は左に残す', () => {
    // flex: 1 は基準幅が 0 なので、折り返しの判定でボタン列が必ず収まる扱いになり、ボタンが押し縮められる
    expect(rules).not.toMatch(/\.g-footer-actions\s*\{[^}]*flex:\s*1;/);
    expect(rules).toMatch(/\.g-footer\s*\{[^}]*flex-wrap:\s*wrap;/);
    expect(rules).toMatch(/\.g-footer-note\s*\{[^}]*margin-inline-end:\s*auto;/);
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

  it('横の面（start / end）は出てきた端へ抜け、右から左の言語では出てくる向きを裏返す', () => {
    const side = String.raw`\.g-dialog:is\(\[data-placement="start"\], \[data-placement="end"\]\)`;
    // 入る前・開いた後・退出の 3 つが同じ変数（出てくる端）を使う。値がずれると close() の瞬間に跳ねる
    expect(rules).toMatch(new RegExp(String.raw`${side} \.g-panel\s*\{[^}]*translate:\s*var\(--g-side-from\) 0;`));
    expect(rules).toMatch(new RegExp(String.raw`${side}\[open\]\[data-exiting\] \.g-panel\s*\{[^}]*translate:\s*var\(--g-side-from\) 0;`));
    expect(rules).toMatch(/\.g-dialog\[data-placement="start"\]:dir\(rtl\)\s*\{\s*--g-side-from:\s*100%;/);
    expect(rules).toMatch(/\.g-dialog\[data-placement="end"\]:dir\(rtl\)\s*\{\s*--g-side-from:\s*-100%;/);
    // 画面の上下の端まで伸びるので、安全領域を空ける
    expect(rules).toMatch(new RegExp(String.raw`${side} \.g-header\s*\{[^}]*env\(safe-area-inset-top\)`));
    expect(rules).toMatch(new RegExp(String.raw`${side} \.g-footer\s*\{[^}]*env\(safe-area-inset-bottom\)`));
  });

  it('横の面は placement の値をそのまま DOM に出す（auto は横に解決しない）', () => {
    renderModal({ label: 'ナビゲーション', placement: 'start', children: <Modal.Body>本文</Modal.Body> });
    expect(document.querySelector('.g-dialog')).toHaveAttribute('data-placement', 'start');
  });

  it('退出中は discrete transition を止め、二重待ちを起こさない', () => {
    expect(rules).toMatch(/\.g-dialog\[data-exiting\]\s*\{\s*transition:\s*none;/);
  });

  it('z-index の保険は使わない（top layer の外側の話なので効かない）', () => {
    expect(rules).not.toMatch(/z-index/);
  });
});

describe('styles / text inputs (I-03)', () => {
  it('枠の中の input は幅を % で持ち、固有の幅（size の 20 文字ぶん）を最小幅に入れない', () => {
    // 実測（Chrome 155、幅 320px、ラテン文字を Verdana）: auto のままだと FAQ の検索欄の最小幅が 286px になり、
    // 文書が 334px に広がった。% なら最小幅は 90px で、好みの幅（304px）は変わらない（§10-37）
    const bare = /(^|\n)\s*\.g-bare\s*\{([^}]*)\}/.exec(rules)?.[2] ?? '';
    expect(bare).toMatch(/(^|[;\s])inline-size:\s*100%;/);
    expect(bare).toMatch(/(^|[;\s])min-inline-size:\s*0;/);
  });
});

describe('styles / labels (I-09)', () => {
  it('「必須 / 任意」の印は縮めず 1 語のまま置き、長いラベルの方を折り返す', () => {
    // 実測（Chrome、幅 320px）: 長い問いの legend（外国 PEPs）で、印が 1 字幅まで縮んで「必｜須」と折れた。
    // ラベルの文は min-inline-size: 0 で縮むので、印の側を flex-shrink: 0 と nowrap で守る
    const badge = /(^|\n)\s*\.g-label-badge\s*\{([^}]*)\}/.exec(rules)?.[2] ?? '';
    expect(badge).toMatch(/(^|[;\s])flex-shrink:\s*0;/);
    expect(badge).toMatch(/(^|[;\s])white-space:\s*nowrap;/);
  });
});

describe('styles / scroll containers (B-13)', () => {
  it('横に送る器は position を持つ（中の読み上げ専用の文字が器の外を基準に置かれ、文書を横に広げない）', () => {
    // 実測（Chrome 155、幅 320px）: 表の器に position が無く、操作の列の読み上げ専用の見出しがアプリの枠を基準に
    // 置かれて、文書が 731px まで広がった（§10-36）。ダイアログの中の器は、ダイアログが基準になって切り抜くので除く
    // （本文に position を付けると、本文の中身がヘッダとフッタの影より後に塗られて影が隠れる）
    const insideDialog = new Set(['.g-body', '.g-command-body']);
    for (const file of ['src/styles.css', 'src/templates.css']) {
      const all = rulesOf(readFileSync(resolve(process.cwd(), file), 'utf8'));
      const positioned = new Set(
        all
          .filter(([, body]) => /(^|[;\s])position:\s*(relative|absolute|fixed|sticky)/.test(body))
          .flatMap(([selector]) => splitSelectors(selector)),
      );
      const scrollers = all
        .filter(([, body]) => /overflow(-x|-y)?:\s*(auto|scroll)/.test(body))
        .flatMap(([selector]) => splitSelectors(selector))
        .filter((selector) => !insideDialog.has(selector));
      expect(scrollers.length, file).toBeGreaterThan(0);
      expect(
        scrollers.filter((selector) => !positioned.has(selector)),
        file,
      ).toEqual([]);
    }
  });
});
