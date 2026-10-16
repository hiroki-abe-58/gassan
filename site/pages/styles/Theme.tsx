import type { CSSProperties, ReactNode } from 'react';

import { PRESETS, hexToOklch, type ContrastCheck, type Scheme } from '../../theme/engine';
import { themeFor, useTheme } from '../../theme/store';
import { Phrase } from '@genelab/gassan';

import { CodeBlock } from '../../ui/Code';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';
import { ThemeControls } from '../../ui/ThemePicker';

function Swatch({ color, label }: { color: string; label: string }): ReactNode {
  return (
    <figure className="s-tone">
      <span className="s-tone-chip" style={{ background: color }} aria-hidden="true" />
      <figcaption>
        <span>
          <Phrase>{label}</Phrase>
        </span>
        <code>{color}</code>
      </figcaption>
    </figure>
  );
}

function ChecksTable({ checks, caption }: { checks: readonly ContrastCheck[]; caption: string }): ReactNode {
  return (
    <div className="s-table-wrap" role="group" tabIndex={0} aria-label={caption}>
      <table className="s-table s-contrast-table">
        <caption className="s-sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">見本</th>
            <th scope="col">組</th>
            <th scope="col">比</th>
            <th scope="col">基準</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((c) => (
            <tr key={c.what}>
              <td>
                <span className="s-contrast-sample" style={{ color: c.fg, background: c.bg }} aria-hidden="true">
                  Aa あ
                </span>
              </td>
              <th scope="row">
                <Phrase>{c.what}</Phrase>
              </th>
              <td className="s-num">{c.ratio.toFixed(2)}:1</td>
              <td>
                <span className="s-pass" data-pass={c.pass ? '' : undefined}>
                  {c.pass ? `合格（${String(c.min)}:1 以上）` : `不足（${String(c.min)}:1 未満）`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** そのテーマでいちばん厳しい組（基準に対して余裕が最も小さいもの）。 */
function tightest(checks: readonly ContrastCheck[]): ContrastCheck | undefined {
  return [...checks].sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0];
}

export function Theme(): ReactNode {
  const { state, theme } = useTheme();
  const schemes: readonly Scheme[] = ['light', 'dark'];

  return (
    <>
      <PageHeader
        eyebrow="スタイル"
        title="テーマ"
        lead="表示（ライト・ダーク）とプライマリカラーを自由に切り替えられる。どの色を選んでも、文字と塗りが WCAG の基準を下回らないように、色を導いている。"
        ids={['D-06', 'G-10', 'K-07', 'S-07']}
      />

      <Section id="controls" title="切り替える" intro="ここでの設定は、ページ上部の「テーマ」と同じもの。サイト全体と、モーダルのデモに効く。">
        <div className="s-theme-inline">
          <ThemeControls />
        </div>
      </Section>

      <Section id="now" title="いまのテーマ" intro="選んだ色から導いた 4 色と、それを使う組のコントラスト比。この表は今の設定で計算している。">
        <div className="s-tones">
          <Swatch color={theme.accent.accent} label="アクセント（塗り・リンク・フォーカス）" />
          <Swatch color={theme.accent.onAccent} label="アクセントの上の文字" />
          <Swatch color={theme.accent.soft} label="淡い面" />
          <Swatch color={theme.accent.onSoft} label="淡い面の上の文字" />
        </div>
        <ChecksTable checks={theme.checks} caption="いまのテーマのコントラスト比" />
      </Section>

      <Section
        id="presets"
        title="すべてのプリセット"
        intro="種の色と、ライト・ダークそれぞれで実際に使う色。右の数字は、そのテーマでいちばん余裕の小さい組の比。"
      >
        <div className="s-table-wrap" role="group" tabIndex={0} aria-label="プリセットの検証">
          <table className="s-table s-preset-table">
            <caption className="s-sr-only">プリセットごとの色と、いちばん厳しい組の比</caption>
            <thead>
              <tr>
                <th scope="col">プリセット</th>
                <th scope="col">種の色</th>
                <th scope="col">ライト</th>
                <th scope="col">ダーク</th>
              </tr>
            </thead>
            <tbody>
              {PRESETS.map((preset) => (
                <tr key={preset.id} data-current={state.preset === preset.id ? '' : undefined}>
                  <th scope="row">
                    <Phrase>{preset.label}</Phrase>
                    {state.preset === preset.id ? <span className="s-preset-current">選択中</span> : null}
                  </th>
                  <td>
                    <span className="s-token-value">
                      <span className="s-swatch" style={{ '--s-swatch': preset.seed } as CSSProperties} aria-hidden="true" />
                      <code>{preset.seed}</code>
                    </span>
                  </td>
                  {schemes.map((scheme) => {
                    const t = themeFor({ ...state, preset: preset.id }, scheme);
                    const worst = tightest(t.checks);
                    const pass = t.checks.every((c) => c.pass);
                    return (
                      <td key={scheme}>
                        <span className="s-token-value">
                          <span className="s-swatch" style={{ '--s-swatch': t.accent.accent } as CSSProperties} aria-hidden="true" />
                          <code>{t.accent.accent}</code>
                        </span>
                        <span className="s-pass s-preset-result" data-pass={pass ? '' : undefined}>
                          {pass ? '全項目合格' : '不足あり'}
                          {worst ? `・最小 ${worst.ratio.toFixed(2)}:1（基準 ${String(worst.min)}:1）` : ''}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Prose>
          <p>
            同じ組み合わせを、テストでも総当たりしている（<code>tests/theme.test.ts</code>）。プリセットに加えて、色相 24 方向 × 明度 5 段 × 彩度 4 段の任意の色すべてで、ライトとダークの全項目が基準を満たすこと、色相がずれないこと、隣り合うプリセットが見分けられることを確かめる。
          </p>
        </Prose>
      </Section>

      <Section id="how" title="色の決め方">
        <ol className="s-rules">
          <Phrase>
            <li>
              <h3>色相は保ち、明度だけを動かす</h3>
              <p>
                選ばれた色を OKLCH（人の目の感じ方に近い色空間）に移し、色相と彩度を保ったまま明度を動かす。RGB のまま暗くすると色相が転び、黄色が緑や茶に見えてしまう。
              </p>
            </li>
            <li>
              <h3>すべての面に対して 4.5:1 を取る</h3>
              <p>
                アクセントはリンクや選択中の文字にも使うので、ページの背景・面・沈んだ面・淡い面のすべてに対して 4.5:1 を取るまで動かす。ライトでは暗い方へ、ダークでは明るい方へ。種に最も近い明度で止める。
              </p>
            </li>
            <li>
              <h3>文字はライトで白、ダークで暗色</h3>
              <p>
                面に対して 4.5:1 を取った色は、ライトでは白い文字に対しても、ダークではどの面より暗い文字に対しても、必ず 4.5:1 以上になる。塗りのボタンの文字は、計算で保証される。
              </p>
            </li>
            <li>
              <h3>淡い面の文字は 7:1 を目標にする</h3>
              <p>選択中のナビや補足の囲みのように、長い文を載せる場所なので、AA ではなく AAA を目標にする。</p>
            </li>
          </Phrase>
        </ol>
        <Callout>
          黄色や黄緑のように明るい色相は、白い面の上で 4.5:1 を取るために、ライトではからし色やオリーブまで暗くなる。色を選ぶ自由より、読めることを優先した結果である。ダークでは元の鮮やかさのまま使える。色相{' '}
          {Math.round(hexToOklch(PRESETS.find((p) => p.id === 'yellow')?.seed ?? '#e8d000').h)}° の「黄色」で、プリセットの表を見比べてほしい。
        </Callout>
      </Section>

      <Section id="own" title="自分のアプリで色を変える" intro="gassan のモーダルの色は、カスタムプロパティを上書きするだけで変えられる。@layer の外から書けば、詳細度を気にしなくてよい。">
        <CodeBlock
          lang="css"
          caption="app.css"
          code={`:root {\n  --g-accent: ${theme.accent.accent};     /* primary の塗り・スイッチ・選択中のチップ */\n  --g-on-accent: ${theme.accent.onAccent};  /* その上の文字 */\n  --g-focus: ${theme.accent.accent};      /* フォーカスリング */\n}`}
        />
        <Prose>
          <p>
            上の値は、いま選んでいるテーマから導いたもの。自分で色を決めるときは、このページの表と同じ組（accent と on-accent、面に対する accent と focus）で比を確かめること。
          </p>
        </Prose>
      </Section>
    </>
  );
}
