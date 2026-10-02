/**
 * data-* の受け渡し（D-11）。
 *
 * 1 コンポーネントずつ思い出して書くのではなく、公開面を総なめにする。
 * 新しいコンポーネントを足して受け渡しを忘れたら、ここが落ちる。
 *
 * 背景: TypeScript はハイフンを含む JSX 属性名を過剰プロパティ検査から外す。
 * つまり閉じた props interface でも `data-testid` は型エラーにならず、
 * 実装が捨てれば「型は通るのに消える」になる。実測で確かめた上での対策である。
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Modal } from '../src/index';
import { RESERVED_DATA, CONSUMER_DATA } from '../src/internal/passthrough';
import { resetWarnings } from '../src/internal/dom';

const TID = 'probe';

/** Root の中に置いて描画する。文脈を必要とする子のため。 */
function inRoot(child: ReactNode) {
  return render(
    <Modal.Root open onOpenChange={() => {}}>
      {child}
    </Modal.Root>,
  );
}

const noop = () => {};

/** 公開コンポーネントと、最小限の必須 props。 */
const CASES: Array<{ name: string; render: () => void }> = [
  {
    name: 'Modal.Root',
    render: () => {
      render(
        <Modal.Root open onOpenChange={noop} data-testid={TID}>
          <Modal.Body>b</Modal.Body>
        </Modal.Root>,
      );
    },
  },
  { name: 'Modal.Header', render: () => inRoot(<Modal.Header data-testid={TID}>h</Modal.Header>) },
  {
    name: 'Modal.Controls',
    render: () => inRoot(<Modal.Controls data-testid={TID} start={<span />} />),
  },
  { name: 'Modal.Back', render: () => inRoot(<Modal.Back data-testid={TID} />) },
  { name: 'Modal.Close', render: () => inRoot(<Modal.Close data-testid={TID} />) },
  {
    name: 'Modal.Indicator',
    render: () => inRoot(<Modal.Indicator current={1} total={3} data-testid={TID} />),
  },
  { name: 'Modal.Title', render: () => inRoot(<Modal.Title data-testid={TID}>t</Modal.Title>) },
  {
    name: 'Modal.Description',
    render: () => inRoot(<Modal.Description data-testid={TID}>d</Modal.Description>),
  },
  { name: 'Modal.Body', render: () => inRoot(<Modal.Body data-testid={TID}>b</Modal.Body>) },
  {
    name: 'Modal.Section',
    render: () => inRoot(<Modal.Section data-testid={TID}>s</Modal.Section>),
  },
  { name: 'Modal.Footer', render: () => inRoot(<Modal.Footer data-testid={TID}>f</Modal.Footer>) },
  { name: 'Modal.Button', render: () => inRoot(<Modal.Button data-testid={TID}>ok</Modal.Button>) },
  {
    name: 'Modal.Consent',
    render: () => inRoot(<Modal.Consent gate="g" data-testid={TID}>agree</Modal.Consent>),
  },
  {
    // 妨げが 1 つも無いと何も描かない（設計どおり）。未充足のゲートを 1 つ置いて描かせる。
    name: 'Modal.GateStatus',
    render: () =>
      inRoot(
        <>
          <Modal.Gate name="g" satisfied={false} reason="まだ" />
          <Modal.GateStatus data-testid={TID} />
        </>,
      ),
  },
  { name: 'Modal.Media', render: () => inRoot(<Modal.Media src="/a.png" alt="a" data-testid={TID} />) },
  {
    name: 'Modal.Gallery',
    render: () =>
      inRoot(
        <Modal.Gallery
          label="g"
          items={[{ id: '1', content: <span>1</span> }]}
          data-testid={TID}
        />,
      ),
  },
  {
    name: 'Modal.Field',
    render: () =>
      inRoot(
        <Modal.Field label="l" data-testid={TID}>
          {(c) => <input {...c} />}
        </Modal.Field>,
      ),
  },
  {
    name: 'Modal.Chips',
    render: () =>
      inRoot(
        <Modal.Chips
          label="c"
          options={[{ value: 'a', label: 'A' }]}
          value={[]}
          onChange={noop}
          data-testid={TID}
        />,
      ),
  },
  {
    name: 'Modal.Switch',
    render: () =>
      inRoot(
        <Modal.Switch checked={false} onCheckedChange={noop} data-testid={TID}>
          s
        </Modal.Switch>,
      ),
  },
  {
    name: 'Modal.Table',
    render: () =>
      inRoot(
        <Modal.Table label="t" data-testid={TID}>
          <table>
            <tbody>
              <tr>
                <td>1</td>
              </tr>
            </tbody>
          </table>
        </Modal.Table>,
      ),
  },
  { name: 'Modal.Alert', render: () => inRoot(<Modal.Alert data-testid={TID}>e</Modal.Alert>) },
  {
    name: 'Modal.Chart',
    render: () =>
      inRoot(
        <Modal.Chart label="c" summary="s" data-testid={TID}>
          <svg />
        </Modal.Chart>,
      ),
  },
  {
    name: 'Modal.Handle',
    render: () =>
      render(
        <Modal.Root open onOpenChange={noop} placement="sheet">
          <Modal.Handle data-testid={TID} />
          <Modal.Body>b</Modal.Body>
        </Modal.Root>,
      ),
  },
];

/** 名前で引いて描画し、data-testid がホスト要素に出たことを確かめる。 */
function sweep(name: string): void {
  const c = CASES.find((x) => x.name === name);
  if (!c) throw new Error(`CASES に ${name} が無い`);
  c.render();
  expect(screen.queryByTestId(TID)).not.toBeNull();
}

describe('data-* の受け渡し（D-11）', () => {
  beforeEach(() => {
    resetWarnings();
  });

  it('Modal.Root は data-* をホスト要素へ渡す', () => sweep('Modal.Root'));
  it('Modal.Header は data-* をホスト要素へ渡す', () => sweep('Modal.Header'));
  it('Modal.Controls は data-* をホスト要素へ渡す', () => sweep('Modal.Controls'));
  it('Modal.Back は data-* をホスト要素へ渡す', () => sweep('Modal.Back'));
  it('Modal.Close は data-* をホスト要素へ渡す', () => sweep('Modal.Close'));
  it('Modal.Indicator は data-* をホスト要素へ渡す', () => sweep('Modal.Indicator'));
  it('Modal.Title は data-* をホスト要素へ渡す', () => sweep('Modal.Title'));
  it('Modal.Description は data-* をホスト要素へ渡す', () => sweep('Modal.Description'));
  it('Modal.Body は data-* をホスト要素へ渡す', () => sweep('Modal.Body'));
  it('Modal.Section は data-* をホスト要素へ渡す', () => sweep('Modal.Section'));
  it('Modal.Footer は data-* をホスト要素へ渡す', () => sweep('Modal.Footer'));
  it('Modal.Button は data-* をホスト要素へ渡す', () => sweep('Modal.Button'));
  it('Modal.Consent は data-* をホスト要素へ渡す', () => sweep('Modal.Consent'));
  it('Modal.GateStatus は data-* をホスト要素へ渡す', () => sweep('Modal.GateStatus'));
  it('Modal.Media は data-* をホスト要素へ渡す', () => sweep('Modal.Media'));
  it('Modal.Gallery は data-* をホスト要素へ渡す', () => sweep('Modal.Gallery'));
  it('Modal.Field は data-* をホスト要素へ渡す', () => sweep('Modal.Field'));
  it('Modal.Chips は data-* をホスト要素へ渡す', () => sweep('Modal.Chips'));
  it('Modal.Switch は data-* をホスト要素へ渡す', () => sweep('Modal.Switch'));
  it('Modal.Table は data-* をホスト要素へ渡す', () => sweep('Modal.Table'));
  it('Modal.Alert は data-* をホスト要素へ渡す', () => sweep('Modal.Alert'));
  it('Modal.Chart は data-* をホスト要素へ渡す', () => sweep('Modal.Chart'));
  it('Modal.Handle は data-* をホスト要素へ渡す', () => sweep('Modal.Handle'));

  it('Modal.Gate は要素を描かないので受け渡しの対象外', () => {
    inRoot(<Modal.Gate name="g" satisfied reason="r" />);
    expect(document.querySelector('[data-testid]')).toBeNull();
  });

  it('公開コンポーネントは 1 つ残らず受け渡しを検査している', () => {
    // 新しいコンポーネントを足して CASES に書き忘れたら、ここで落ちる。
    // 除外は Gate だけ（要素を描かないため）。
    const exported = Object.keys(Modal).map((k) => `Modal.${k}`);
    const covered = new Set([...CASES.map((c) => c.name), 'Modal.Gate']);
    expect(exported.filter((n) => !covered.has(n))).toEqual([]);
  });
});

describe('予約された data-* は上書きできない', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetWarnings();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('kasane が書く data-kind は消費者の値で壊れない', () => {
    render(
      <Modal.Root open onOpenChange={noop} kind="confirm" data-kind="hijacked">
        <Modal.Body>b</Modal.Body>
      </Modal.Root>,
    );
    expect(document.querySelector('dialog')?.getAttribute('data-kind')).toBe('confirm');
  });

  it('予約語を渡すと開発時に警告する', () => {
    render(
      <Modal.Root open onOpenChange={noop} data-scrim="nope">
        <Modal.Body>b</Modal.Body>
      </Modal.Root>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('data-scrim'));
  });

  it('aria-* は受け取らず、警告して落とす（名前は label / Modal.Title を使う）', () => {
    render(
      <Modal.Root open onOpenChange={noop} label="named" aria-label="ignored">
        <Modal.Body>b</Modal.Body>
      </Modal.Root>,
    );
    const dlg = document.querySelector('dialog')!;
    // label prop の値が残り、aria-label で横から奪われていない
    expect(dlg.getAttribute('aria-label')).toBe('named');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aria-label'));
  });

  it('aria-* を渡しても label が無ければ名前は付かない（黙って名前が付く事故を防ぐ）', () => {
    render(
      <Modal.Root open onOpenChange={noop} aria-label="ignored">
        <Modal.Body>b</Modal.Body>
      </Modal.Root>,
    );
    expect(document.querySelector('dialog')?.getAttribute('aria-label')).toBeNull();
  });

  it('消費者が置く data-k-no-swipe は予約していない', () => {
    for (const name of CONSUMER_DATA) {
      expect(RESERVED_DATA.has(name)).toBe(false);
    }
  });
});

describe('予約表は src の実態と一致する', () => {
  it('src が書く data-* はすべて RESERVED_DATA に載っている', () => {
    const dir = 'src';
    const files: string[] = [];
    const walk = (p: string) => {
      for (const e of readdirSync(p, { withFileTypes: true })) {
        const full = join(p, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(e.name) && !full.includes('passthrough')) files.push(full);
      }
    };
    walk(dir);

    const found = new Set<string>();
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      // JSX 属性 (data-foo=) と文字列リテラル ('data-foo') の両方を拾う
      for (const m of text.matchAll(/(?:^|[\s({[])(data-[a-z][a-z0-9-]*)=/gm)) {
        if (m[1]) found.add(m[1]);
      }
      for (const m of text.matchAll(/['"`](data-[a-z][a-z0-9-]*)['"`]/g)) {
        if (m[1]) found.add(m[1]);
      }
    }

    const consumer = new Set(CONSUMER_DATA);
    const missing = [...found].filter((n) => !RESERVED_DATA.has(n) && !consumer.has(n)).sort();
    expect(missing).toEqual([]);
  });
});

describe('スプレッドの位置（消費者の値で内部状態を壊させない）', () => {
  /**
   * 実際に kasane の内部 data-* を守っているのは RESERVED_DATA のガードではなく、
   * **JSX のスプレッド順**である。後勝ちなので、スプレッドが data-* より後ろに
   * 移動した瞬間、消費者が data-kind や data-gated を書き換えられるようになる。
   * ガードを外しても「上書きされない」側のテストは通ってしまうことを実測で確かめたので、
   * 順序そのものを静的に固定する。
   */
  const tsxFiles = (): string[] => {
    const out: string[] = [];
    const walk = (p: string) => {
      for (const e of readdirSync(p, { withFileTypes: true })) {
        const full = join(p, e.name);
        if (e.isDirectory()) walk(full);
        else if (/\.tsx$/.test(e.name)) out.push(full);
      }
    };
    walk('src');
    return out;
  };

  const spreads = (text: string): number[] => {
    const at: number[] = [];
    // 濾過関数が増えても取りこぼさないよう、スプレッド全般を拾う。
    // ここで拾い損ねると「順序が固定されている」という主張だけが残る。
    for (const m of text.matchAll(/\{\.\.\.(?:[A-Za-z][A-Za-z0-9_]*\([^)]*\)|rest)\}/g)) {
      at.push(m.index ?? 0);
    }
    return at;
  };

  it('kasane が書く data-* は 1 つ残らずスプレッドより後ろにある', () => {
    const violations: string[] = [];
    for (const file of tsxFiles()) {
      const text = readFileSync(file, 'utf8');
      for (const at of spreads(text)) {
        let open = -1;
        for (const t of text.matchAll(/<[A-Za-z][A-Za-z0-9.]*/g)) {
          const i = t.index ?? 0;
          if (i < at) open = i;
          else break;
        }
        if (open === -1) continue;
        const early = text.slice(open, at).match(/\bdata-[a-z][a-z0-9-]*=/g);
        if (early) {
          const line = text.slice(0, at).split('\n').length;
          violations.push(`${file}:${line} ${early.join(' ')}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('濾過を通さない生の {...rest} は 1 箇所も無い', () => {
    // かつては Modal.Button だけが生だった。ButtonHTMLAttributes を
    // そのまま受けるので domPassthrough（data-* 以外は捨てる）を当てられず、
    // 「スプレッド順で後勝ちだから実害は無い」で済ませていた。
    // それだと順序を入れ替えた瞬間に無言で壊れ、予約語の警告も出ない。
    // いまは stripReservedData を通す。生 rest が復活したら、ここで落ちる。
    const where: string[] = [];
    for (const file of tsxFiles()) {
      const text = readFileSync(file, 'utf8');
      for (const _ of text.matchAll(/\{\.\.\.rest\}/g)) where.push(file);
    }
    expect(where).toEqual([]);
  });

  it('公開コンポーネントの数だけ濾過の呼び出しがある', () => {
    let calls = 0;
    for (const file of tsxFiles()) {
      const text = readFileSync(file, 'utf8');
      calls += [...text.matchAll(/(?:domPassthrough|stripReservedData)\(rest, '/g)].length;
    }
    // Modal.Handle は段の有無で 2 経路に分かれ、Modal.Section も同様。
    // 23 コンポーネントすべてが濾過を通ること。
    expect(calls).toBeGreaterThanOrEqual(23);
  });
});
