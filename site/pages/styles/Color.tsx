import type { CSSProperties, ReactNode } from 'react';

import { data } from '../../data';
import { CONTRAST_PAIRS, contrastRatio, isHex6 } from '../../data/color';
import { token } from '../../data/tokens';
import { CodeBlock } from '../../ui/Code';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';

function Swatch({ value }: { value: string }): ReactNode {
  return <span className="s-swatch" style={{ '--s-swatch': value } as CSSProperties} aria-hidden="true" />;
}

function ContrastTable({ scheme }: { scheme: 'light' | 'dark' }): ReactNode {
  const value = (name: string): string => {
    const t = token(`--g-${name}`);
    return scheme === 'dark' ? (t.dark ?? t.light) : t.light;
  };
  const caption = `${scheme === 'light' ? 'ライト' : 'ダーク'}のコントラスト比`;
  return (
    <div className="s-table-wrap" role="group" tabIndex={0} aria-label={caption}>
      <table className="s-table s-contrast-table" data-scheme={scheme}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">見本</th>
            <th scope="col">組</th>
            <th scope="col">用途</th>
            <th scope="col">比</th>
            <th scope="col">基準</th>
          </tr>
        </thead>
        <tbody>
          {CONTRAST_PAIRS.map(([fg, bg, min, what]) => {
            const f = value(fg);
            const b = value(bg);
            const ratio = isHex6(f) && isHex6(b) ? contrastRatio(f, b) : Number.NaN;
            const pass = ratio >= min;
            return (
              <tr key={`${fg}/${bg}`}>
                <td>
                  <span className="s-contrast-sample" style={{ color: f, background: b }} aria-hidden="true">
                    Aa あ
                  </span>
                </td>
                <th scope="row">
                  <code>--g-{fg}</code>
                  <br />
                  <code>--g-{bg}</code>
                </th>
                <td>{what}</td>
                <td className="s-num">{Number.isNaN(ratio) ? '—' : `${ratio.toFixed(2)}:1`}</td>
                <td>
                  <span className="s-pass" data-pass={pass ? '' : undefined}>
                    {pass ? `合格（${String(min)}:1 以上）` : `不足（${String(min)}:1 未満）`}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Color(): ReactNode {
  const surface = data.tokens.find((g) => g.name === 'surface');

  return (
    <>
      <PageHeader
        eyebrow="スタイル"
        title="色とコントラスト"
        lead="すべての色はカスタムプロパティで、ライトとダークの 2 組を持つ。どの組が何の文字を載せるかを決め、その比をテストで計算している。"
        ids={['D-06', 'S-07', 'G-10', 'K-07', 'F-06']}
      />

      {surface ? (
        <Section id="tokens" title="色のトークン" intro="src/styles.css の @layer gassan.tokens から読んでいる。ダーク欄が空のものは、ライトの値をそのまま使う。">
          <div className="s-table-wrap" role="group" tabIndex={0} aria-label="色のトークン">
            <table className="s-table s-token-table">
              <caption className="s-sr-only">色のトークン</caption>
              <thead>
                <tr>
                  <th scope="col">トークン</th>
                  <th scope="col">ライト</th>
                  <th scope="col">ダーク</th>
                </tr>
              </thead>
              <tbody>
                {surface.tokens.map((t) => (
                  <tr key={t.name}>
                    <th scope="row">
                      <code>{t.name}</code>
                    </th>
                    <td>
                      <span className="s-token-value">
                        <Swatch value={t.light} />
                        <code>{t.light}</code>
                      </span>
                    </td>
                    <td>
                      {t.dark ? (
                        <span className="s-token-value">
                          <Swatch value={t.dark} />
                          <code>{t.dark}</code>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      <Section
        id="contrast"
        title="コントラスト比"
        intro="下の表はこのページを開いた時点のトークンから計算している。同じ組と同じ計算を tests/tokens.test.ts が使い、基準を割ると CI が落ちる。"
      >
        <ContrastTable scheme="light" />
        <ContrastTable scheme="dark" />
        <Callout>
          ゲート中の primary（<code>--g-accent-muted</code>）は、かつて白文字で 3.16:1 しかなかった。コメントには「4.5:1 を維持する」と書いてあり、
          追跡表でも「値は検査済み」と主張していたが、比そのものは誰も計算していなかった。このページで比を表示しようとして見つかった。
        </Callout>
      </Section>

      <Section id="gated" title="押せないボタンこそ、読めなければならない">
        <Prose>
          <p>
            <code>disabled</code> の要素は WCAG のコントラスト要件から除外される。だが gassan のゲート中のボタンは <code>aria-disabled</code> で、
            フォーカスでき、押せば理由を返す「使える」ボタンである。除外規定には頼れない。だから専用のトークンで 4.5:1 を保ち、
            <code>opacity</code> で薄くして済ませることはしない（G-10）。
          </p>
          <p>
            背景用のトークンを文字色に流用しないことも決めている。ダークでは、明るい文字を載せる背景と、暗い面に載る文字の両方で 4.5:1 を取れる色は存在しない。
          </p>
        </Prose>
      </Section>

      <Section id="theme" title="自分の色にする" intro="トークンは @layer gassan.tokens の中にあるので、レイヤの外から書けば詳細度を気にせず上書きできる。">
        <CodeBlock
          lang="css"
          caption="app.css"
          code={`:root {\n  --g-accent: #0b5cad;\n  --g-on-accent: #ffffff;\n  --g-accent-muted: #5f7184; /* 白文字で 4.5:1 以上を確かめてから */\n  --g-radius: 20px;\n}`}
        />
      </Section>
    </>
  );
}
