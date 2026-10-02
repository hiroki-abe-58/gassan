/**
 * トークンと CSS 不変条件の値検査。
 *
 * 追跡表の「記述」は弱い。文字列が存在することしか言えていないからだ。
 * ここでは一段だけ強くする。**約束した「値」が正しいか**を見る。
 * 依然としてレイアウトの結果は保証しない（それは v0.4.0 の実ブラウザ CI）が、
 * 「32% と決めたスクリムが誰かの手で 60% に戻る」類の後退はここで止まる。
 *
 * 対象: S-01 S-02 S-04 S-07 C-02 C-03 C-05 C-06 C-10 H-03 H-04 H-10
 *       B-01 B-04 B-10 F-05 F-12 G-10 K-07 M-05 M-09 D-06
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// 比の計算と検査する組は、ドキュメントサイトの色のページと共有する（表示と検査を別々に持たない）。
import { CONTRAST_PAIRS, contrastRatio } from '../site/data/color';

const raw = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
/** コメントを落とした本文。コメント中の語に反応させないため。 */
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

/** `--name: value;` を最初の 1 件だけ取る。 */
function token(name: string): string {
  const m = css.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  if (!m?.[1]) throw new Error(`token --${name} not found`);
  return m[1].trim();
}

/**
 * セレクタのブロック本文を取る（最初の 1 件、ネストなし前提）。
 *
 * 行頭に錨を打つのが要。`.g-panel` で素朴に検索すると
 * `.g-dialog[data-g-covered] .g-panel { scale: .985 }` を先に掴んでしまう。
 */
function block(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`(?:^|\\})[ \\t]*${escaped}\\s*\\{([^{}]*)\\}`, 'm'));
  if (!m?.[1]) throw new Error(`block ${selector} not found`);
  return m[1];
}

/** @media の中身を取る。 */
function atMedia(query: string): string {
  const i = css.indexOf(`@media (${query})`);
  if (i < 0) throw new Error(`@media (${query}) not found`);
  const open = css.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < css.length; j += 1) {
    if (css[j] === '{') depth += 1;
    else if (css[j] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, j);
    }
  }
  throw new Error(`@media (${query}) is unbalanced`);
}

/* ========================================================================== */
/* スクリム S-01 S-02 S-04 D-06                                               */
/* ========================================================================== */

describe('tokens / scrim (S-01 S-02 S-04 D-06)', () => {
  it('既定のスクリムは 32%。黒 60% の慣習を採らない', () => {
    expect(Number(token('g-scrim-a-default'))).toBe(0.32);
  });

  it('4段の濃度は単調に増える（意図の段階が逆転していない）', () => {
    const ladder = ['subtle', 'default', 'strong', 'immersive'].map((k) =>
      Number(token(`g-scrim-a-${k}`)),
    );
    expect(ladder).toEqual([...ladder].sort((a, b) => a - b));
    expect(new Set(ladder).size).toBe(4);
    for (const value of ladder) expect(value).toBeLessThan(1);
  });

  it('blur は immersive だけの opt-in（既定では 1 箇所も掛からない）', () => {
    const uses = [...css.matchAll(/([^\n{}]*)\{[^{}]*backdrop-filter:\s*(?!none)/g)].map((m) =>
      (m[1] ?? '').trim(),
    );
    expect(uses.length).toBeGreaterThan(0);
    for (const selector of uses) expect(selector).toContain('immersive');
  });

  it('透明度を下げている人には blur を切り、切ったぶん濃度で補う', () => {
    const reduced = atMedia('prefers-reduced-transparency: reduce');
    expect(reduced).toMatch(/backdrop-filter:\s*none/);
    // 補償しないと、blur を消したぶん分離そのものが消える。
    const compensated = [...reduced.matchAll(/--g-scrim-a:\s*([\d.]+)/g)].map((m) => Number(m[1]));
    expect(compensated.length).toBe(4);
    expect(Math.min(...compensated)).toBeGreaterThanOrEqual(0.32);
    expect(compensated[1]).toBeGreaterThan(Number(token('g-scrim-a-default')));
  });
});

/* ========================================================================== */
/* 配色 S-07                                                                   */
/* ========================================================================== */

describe('tokens / color scheme (S-07)', () => {
  it('ダークでは面を明るくして分離する（スクリムを濃くして誤魔化さない）', () => {
    const dark = atMedia('prefers-color-scheme: dark');
    expect(dark).toMatch(/--g-surface:/);
    expect(dark).toMatch(/--g-border:/);
    // ダークで濃度だけ上げるのは「暗い上に暗い」で分離しない。
    expect(dark).not.toMatch(/--g-scrim-a-default:/);
  });
});

/* ========================================================================== */
/* コンテナ C-02 C-03 C-05 C-06 C-10 M-09                                     */
/* ========================================================================== */

describe('tokens / container (C-02 C-03 C-05 C-06 C-10 M-09)', () => {
  it('パネル幅は min(100%, 上限) で、狭い画面からはみ出さない', () => {
    expect(block('.g-panel')).toMatch(/inline-size:\s*min\(100%,/);
  });

  it('本文行は minmax(0, 1fr)。1fr 単体だと縮まずスクロールしない', () => {
    expect(block('.g-panel')).toMatch(/grid-template-rows:\s*auto minmax\(0, *1fr\) auto/);
  });

  it('3行はすべて明示。暗黙行に落ちると minmax が効かなくなる', () => {
    expect(css).toMatch(/\.g-panel > \.g-header\s*\{\s*grid-row:\s*1;/);
    expect(css).toMatch(/\.g-panel > \.g-body\s*\{\s*grid-row:\s*2;/);
    expect(css).toMatch(/\.g-panel > \.g-footer\s*\{\s*grid-row:\s*3;/);
  });

  it('説明文は自分で左右の余白を持たない（ヘッダにも本文にも余白があり、二重に字下げされる）', () => {
    // Modal.Description はヘッダか本文の中に置く。どちらも --g-pad-inline の余白を持っている。
    expect(block('.g-desc')).not.toMatch(/padding/);
  });

  it('H-09: つまみを置いたときは 4 行にし、つまみを 1 行目に置く（行が無いとフッタの下に落ちる）', () => {
    // 行を割り当てないと、自動配置で暗黙の 4 行目に入り、シートの下端につまみが出る。
    // jsdom はレイアウトを計算しないので、配置の規則そのものを固定する。
    expect(css).toMatch(
      /\.g-panel:has\(> \.g-handle\)\s*\{\s*grid-template-rows:\s*auto auto minmax\(0, 1fr\) auto;/,
    );
    expect(css).toMatch(/\.g-panel > \.g-handle\s*\{\s*grid-row:\s*1;/);
    expect(css).toMatch(/\.g-panel:has\(> \.g-handle\) > \.g-header\s*\{\s*grid-row:\s*2;/);
    expect(css).toMatch(/\.g-panel:has\(> \.g-handle\) > \.g-body\s*\{\s*grid-row:\s*3;/);
    expect(css).toMatch(/\.g-panel:has\(> \.g-handle\) > \.g-footer\s*\{\s*grid-row:\s*4;/);
  });

  it('100vh を使わない（モバイルのアドレスバーで高さが破綻する）', () => {
    const offenders = [...css.matchAll(/\b\d+vh\b/g)].map((m) => m[0]);
    expect(offenders).toEqual([]);
    expect(token('g-sheet-max-block')).toMatch(/dvh$/);
  });

  it('シートの最大高は 100dvh 未満（掴む余地を必ず残す）', () => {
    const value = Number(token('g-sheet-max-block').replace('dvh', ''));
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(100);
  });

  it('dialog 側で縦溢れを封じる（中央寄せで上端が切れる古典バグを構造的に消す）', () => {
    const dialog = block('.g-dialog');
    expect(dialog).toMatch(/overflow:\s*hidden/);
    expect(dialog).toMatch(/position:\s*fixed/);
    expect(dialog).toMatch(/inset:\s*0/);
    // dialog はビューポートを占め、寸法の制約はパネル側だけが持つ。
    expect(dialog).toMatch(/max-block-size:\s*none/);
    expect(block('.g-panel')).toMatch(/max-block-size:\s*100%/);
  });

  it('閉じている間はクリックを奪わない（描画が残るあいだの当たり判定を消す）', () => {
    expect(css).toMatch(/\.g-dialog:not\(\[open\]\)\s*\{[^}]*pointer-events:\s*none/);
  });
});

/* ========================================================================== */
/* セーフエリア C-04 F-12 M-05                                                 */
/* ========================================================================== */

describe('tokens / safe area (C-04 F-12 M-05)', () => {
  it('セーフエリアは必ず max() で包む（0 の端末で余白が消えない）', () => {
    const uses = [...css.matchAll(/env\(safe-area-inset-[a-z]+\)/g)];
    expect(uses.length).toBeGreaterThan(0);
    for (const use of uses) {
      const head = css.slice(Math.max(0, use.index - 80), use.index);
      expect(head).toMatch(/max\(/);
    }
  });
});

/* ========================================================================== */
/* タップ領域 H-03 F-05                                                        */
/* ========================================================================== */

describe('tokens / tap target (H-03 F-05)', () => {
  it('タップ領域は WCAG 2.5.8 の 24px を上回る', () => {
    const size = Number(token('g-tap').replace('px', ''));
    expect(size).toBeGreaterThanOrEqual(24);
    expect(size).toBeGreaterThanOrEqual(44); // Apple HIG
  });

  it('粗いポインタではさらに広げる', () => {
    const coarse = atMedia('pointer: coarse');
    const size = Number(/--g-tap:\s*(\d+)px/.exec(coarse)?.[1]);
    expect(size).toBeGreaterThan(Number(token('g-tap').replace('px', '')));
  });

  it('アイコンボタンとフッタのボタンはトークンを共有する（片方だけ小さくならない）', () => {
    expect(block('.g-iconbtn')).toMatch(/inline-size:\s*var\(--g-tap\)/);
    expect(block('.g-iconbtn')).toMatch(/block-size:\s*var\(--g-tap\)/);
    expect(block('.g-controls')).toMatch(/min-block-size:\s*var\(--g-tap\)/);
  });
});

/* ========================================================================== */
/* ヘッダ H-04 H-10                                                            */
/* ========================================================================== */

describe('tokens / header (H-04 H-10)', () => {
  it('コントロール行は 1fr auto 1fr。戻るの有無で中央がズレない', () => {
    expect(block('.g-controls')).toMatch(/grid-template-columns:\s*1fr auto 1fr/);
  });

  it('「戻る」と「×」の距離は 8px 以上（最も高コストな誤タップを防ぐ）', () => {
    const gap = Number(token('g-gap').replace('px', ''));
    expect(gap).toBeGreaterThanOrEqual(8);
    expect(block('.g-controls')).toMatch(/gap:\s*var\(--g-gap\)/);
  });

  it('ヘッダは grid の行1で固定する（position: sticky を使わない）', () => {
    expect(css).not.toMatch(/\.g-header\s*\{[^}]*position:\s*sticky/);
    expect(css).toMatch(/\.g-panel > \.g-header\s*\{\s*grid-row:\s*1;/);
  });

  it('スロットは列番号で固定する（DOM の順序に依存しない）', () => {
    expect(css).toMatch(/\[data-slot="start"\][^{]*\{[^}]*grid-column:\s*1/);
    expect(css).toMatch(/\[data-slot="center"\][^{]*\{[^}]*grid-column:\s*2/);
    expect(css).toMatch(/\[data-slot="end"\][^{]*\{[^}]*grid-column:\s*3/);
  });
});

/* ========================================================================== */
/* ボディ B-01 B-04 B-10                                                       */
/* ========================================================================== */

describe('tokens / body (B-01 B-04 B-10)', () => {
  it('スクロールするのは本文だけで、連鎖を外に漏らさない', () => {
    const body = block('.g-body');
    expect(body).toMatch(/overflow:\s*auto/);
    expect(body).toMatch(/overscroll-behavior:\s*contain/);
    expect(body).toMatch(/scrollbar-gutter:\s*stable/);
  });

  it('横スクロールする領域も連鎖を止める（戻るジェスチャを誤発火させない）', () => {
    const lateral = [...css.matchAll(/overscroll-behavior-x:\s*contain/g)];
    expect(lateral.length).toBeGreaterThanOrEqual(2);
  });

  it('メディアは比率を先に確保する（読み込み後にレイアウトが飛ばない）', () => {
    expect(css).toMatch(/aspect-ratio:\s*var\(--g-ratio,\s*16 \/ 9\)/);
  });
});

/* ========================================================================== */
/* ゲート G-10                                                                 */
/* ========================================================================== */

describe('tokens / gated button (G-10)', () => {
  const gated = () => block('.g-btn[data-gated]');

  it('ゲート中でもポインタを殺さない（押して理由を聞ける、が設計の核）', () => {
    expect(gated()).not.toMatch(/pointer-events/);
  });

  it('opacity で潰さない（コントラストが落ちて理由が読めなくなる）', () => {
    expect(gated()).not.toMatch(/opacity/);
    expect(gated()).toMatch(/--g-accent-muted/);
  });

  it('押せないことは cursor で伝える', () => {
    expect(gated()).toMatch(/cursor:\s*not-allowed/);
  });

  it('強制カラーモードでも「押せない」が伝わる', () => {
    const forced = atMedia('forced-colors: active');
    expect(forced).toMatch(/\.g-btn\[data-gated\][^{]*\{[^}]*GrayText/);
  });

  it('ゲート中の secondary / tertiary は、背景用のトークンを文字色に流用しない', () => {
    // --g-accent-muted は「明るい文字を載せる背景」。ダークでは暗い面の上の文字として
    // 4.5:1 を取れない（明るい文字にも暗い面にも 4.5:1 を取れる色は存在しない）。
    const quiet = block('.g-btn[data-gated][data-variant="secondary"],\n  .g-btn[data-gated][data-variant="tertiary"]');
    expect(quiet).toMatch(/color:\s*var\(--g-fg-muted\)/);
    expect(quiet).not.toMatch(/color:\s*var\(--g-accent-muted\)/);
  });
});

/* ========================================================================== */
/* 色のコントラスト G-10 K-07 F-06 S-07                                       */
/* ========================================================================== */

/** トークンの値（ライトと、ダークで上書きされたもの）。#rrggbb だけを扱う。 */
function palette(scheme: 'light' | 'dark'): (name: string) => string {
  const darkBlock = atMedia('prefers-color-scheme: dark');
  return (name) => {
    const re = new RegExp(`--g-${name}\\s*:\\s*(#[0-9a-fA-F]{6})\\s*;`);
    const value = (scheme === 'dark' ? re.exec(darkBlock)?.[1] : undefined) ?? re.exec(css)?.[1];
    if (!value) throw new Error(`--g-${name} は #rrggbb で書かれていない`);
    return value;
  };
}

/** 最低比を割っている組を「何の組か: 実測」で返す。空なら合格。 */
function shortfalls(scheme: 'light' | 'dark'): string[] {
  const color = palette(scheme);
  return CONTRAST_PAIRS.flatMap(([fg, bg, min, what]) => {
    const ratio = contrastRatio(color(fg), color(bg));
    return ratio >= min ? [] : [`${what}: --g-${fg} / --g-${bg} = ${ratio.toFixed(2)}:1（${String(min)}:1 未満）`];
  });
}

describe('tokens / contrast (G-10 K-07 F-06 S-07)', () => {
  // it.each は使わない。check-trace はテストを it( の出現で数えるので、件数が文書とずれる。
  it('ライトのトークンの組はすべて最低コントラスト比を満たす（ゲート中の primary を含む）', () => {
    expect(shortfalls('light')).toEqual([]);
  });

  it('ダークのトークンの組はすべて最低コントラスト比を満たす（ゲート中の primary を含む）', () => {
    expect(shortfalls('dark')).toEqual([]);
  });
});

/* ========================================================================== */
/* 残りの CSS 不変条件 S-06 C-07 C-11 H-08 T-09 B-05 D-05                      */
/* ========================================================================== */

describe('tokens / remaining invariants (S-06 C-07 C-11 H-08 T-09 B-05 D-05)', () => {
  it('強制カラーモードでは枠で分離する（影と blur は無視されるため）', () => {
    const forced = atMedia('forced-colors: active');
    expect(forced).toMatch(/\.g-panel\s*\{[^}]*border:\s*2px solid CanvasText/);
    expect(forced).toMatch(/box-shadow:\s*none/);
  });

  it('角丸は 1 つのトークンから派生する（部位ごとに手書きしない）', () => {
    expect(Number(token('g-radius').replace('px', ''))).toBeGreaterThan(0);
    expect(css).toMatch(/border-radius:\s*var\(--g-radius\)/);
    expect(() => token('g-radius-control')).not.toThrow();
    expect(() => token('g-radius-sheet')).not.toThrow();
  });

  it('パネルはコンテナクエリの基準になる（ビューポートではなく自分の幅で分岐する）', () => {
    const panel = block('.g-panel');
    expect(panel).toMatch(/container-type:\s*inline-size/);
    expect(panel).toMatch(/container-name:\s*g-panel/);
    expect(css).toMatch(/@container g-panel \(/);
  });

  it('スクロールシャドウは :has() で本文の端の状態から引く（JS で class を付けない）', () => {
    expect(css).toMatch(
      /\.g-panel:has\(> \.g-body:not\(\[data-at-start\]\)\) > \.g-header\s*\{[^}]*box-shadow/,
    );
    expect(css).toMatch(
      /\.g-panel:has\(> \.g-body:not\(\[data-at-end\]\)\) > \.g-footer\s*\{[^}]*box-shadow/,
    );
  });

  it('タイトルは text-wrap: pretty で、最終行に 1 文字だけ落とさない', () => {
    expect(block('.g-title')).toMatch(/text-wrap:\s*pretty/);
    // 省略は CSS だけで行う。DOM のテキストは常に完全に保つ（T-03）。
    expect(css).toMatch(/\.g-title-text\[data-clamped\]\s*\{[^}]*-webkit-line-clamp/);
  });

  it('スクロールバー幅ぶんのレイアウトシフトを恒久的に殺す', () => {
    expect(css).toMatch(/:where\(html\)\s*\{\s*scrollbar-gutter:\s*stable/);
    expect(block('.g-body')).toMatch(/scrollbar-gutter:\s*stable/);
  });

  it('@layer の順序を先頭で確定させる（利用側が上書きしやすい）', () => {
    const decl = /@layer ([^;]+);/.exec(css);
    expect(decl?.[1]).toBe('gassan.reset, gassan.tokens, gassan.core, gassan.theme');
    // 宣言はファイルの先頭側にあること。後から現れると順序が確定しない。
    expect(css.indexOf('@layer gassan.reset,')).toBeLessThan(css.indexOf('@layer gassan.tokens {'));
  });

  it('レイヤの外に規則を漏らさない（利用側の素の CSS と詳細度で殴り合わない）', () => {
    let depth = 0;
    let inLayer = false;
    const stripped = css.replace(/@layer [^;{]+;/g, '');
    const tokens = [...stripped.matchAll(/@layer[^{]*\{|[{}]/g)];
    let leaked = 0;
    let cursor = 0;
    for (const t of tokens) {
      const text = stripped.slice(cursor, t.index).trim();
      if (depth === 0 && !inLayer && text && !text.startsWith('/*')) leaked += 1;
      if (t[0].startsWith('@layer')) {
        inLayer = true;
        depth += 1;
      } else if (t[0] === '{') depth += 1;
      else {
        depth -= 1;
        if (depth === 0) inLayer = false;
      }
      cursor = t.index + t[0].length;
    }
    expect(leaked).toBe(0);
  });
});

/* ========================================================================== */
/* フォーカス K-07                                                             */
/* ========================================================================== */

describe('tokens / focus ring (K-07)', () => {
  it('フォーカスリングは :focus-visible にだけ出す', () => {
    expect(block('.g-dialog :focus-visible')).toMatch(/outline:\s*2px solid/);
  });

  it('outline: none を裸で置かない（リングを消したまま代替を出し忘れない）', () => {
    const naked = [...css.matchAll(/([^\n{}]*)\{[^{}]*outline:\s*none[^{}]*\}/g)].map((m) =>
      (m[1] ?? '').trim(),
    );
    for (const selector of naked) {
      // パネル本体だけは例外。プログラム的フォーカスにリングを出さないため。
      expect(selector).toContain('.g-panel');
    }
  });
});

/* ========================================================================== */
/* シートのディテントとつまみ（M-03 / H-09 / C-08）                            */
/* ========================================================================== */

describe('sheet detents and handle', () => {
  it('M-03: 段を使わないシートは従来どおり内容なりの高さに落ちる', () => {
    const sheet = block('.g-dialog[data-placement="sheet"] .g-panel');
    // 変数が無いときの既定が auto であること。ここが 100% だと
    // 段を使わないシートまで全画面になり、後方互換が壊れる。
    expect(sheet).toMatch(/block-size:\s*var\(--g-sheet-detent,\s*auto\)/);
    expect(sheet).toMatch(/max-block-size:\s*min\(100%,\s*var\(--g-sheet-max-block\)\)/);
  });

  it('M-03: full の割合が CSS の上限 92dvh と一致している', () => {
    expect(token('g-sheet-max-block')).toBe('92dvh');
  });

  it('C-08: 段のあるシートだけ高さを遷移させる', () => {
    const anim = block('.g-dialog[data-placement="sheet"] .g-panel[style*="--g-sheet-detent"]');
    expect(anim).toMatch(/interpolate-size:\s*allow-keywords/);
    expect(anim).toMatch(/transition:[\s\S]*block-size/);
  });

  it('M-02: ドラッグ中は遷移を切る（指に遅れて追従すると壊れて見える）', () => {
    const dragging = block('.g-dialog[data-placement="sheet"] .g-panel[data-g-dragging]');
    expect(dragging).toMatch(/transition:\s*none/);
  });

  it('H-09: つまみの的が 44px 以上の指の面積を持つ', () => {
    const grip = block('.g-handle-grip');
    const minBlock = grip.match(/min-block-size:\s*(\d+)px/)?.[1];
    const minInline = grip.match(/min-inline-size:\s*(\d+)px/)?.[1];
    const pad = block('.g-handle').match(/padding-block:\s*(\d+)px\s+(\d+)px/);
    expect(Number(minInline)).toBeGreaterThanOrEqual(44);
    // 的の高さは grip 本体 + .g-handle の上下パディング
    const total = Number(minBlock) + Number(pad?.[1] ?? 0) + Number(pad?.[2] ?? 0);
    expect(total).toBeGreaterThanOrEqual(44);
  });

  it('H-09: つまみはキーボードでも見える（focus-visible に輪郭がある）', () => {
    expect(block('.g-handle-grip:focus-visible')).toMatch(/outline:\s*var\(--g-focus-width\)/);
  });

  it('H-09: ドラッグ中にブラウザのスクロールへ奪われない', () => {
    expect(block('.g-handle')).toMatch(/touch-action:\s*none/);
    expect(block('.g-handle-grip')).toMatch(/touch-action:\s*none/);
  });

  it('H-09: シート以外ではつまみを出さない', () => {
    expect(css).toMatch(
      /\.g-dialog:not\(\[data-placement="sheet"\]\)\s*\.g-handle\s*\{\s*display:\s*none/,
    );
  });
});
