import type { CSSProperties, ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { data } from '../../data';
import { CONTRAST_PAIRS, contrastRatio, isHex6 } from '../../data/color';
import { token } from '../../data/tokens';
import { useT } from '../../i18n';
import { CodeBlock } from '../../ui/Code';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, PageHeader, Prose, Section } from '../../ui/Page';
import { TableScroll } from '../../ui/TableScroll';

function Swatch({ value }: { value: string }): ReactNode {
  return <span className="s-swatch" style={{ '--s-swatch': value } as CSSProperties} aria-hidden="true" />;
}

function ContrastTable({ scheme }: { scheme: 'light' | 'dark' }): ReactNode {
  const { color, common } = useT();
  const t = color.contrast;
  const sample = common.contrastSample;
  // 前景のトークン名で引く。CONTRAST_PAIRS の名前は string なので、ここで広げて受ける
  const uses: Readonly<Record<string, string | undefined>> = t.uses;
  const value = (name: string): string => {
    const found = token(`--g-${name}`);
    return scheme === 'dark' ? (found.dark ?? found.light) : found.light;
  };
  const caption = t.tableCaption[scheme];
  return (
    <TableScroll label={caption}>
      <table className="s-table s-contrast-table" data-scheme={scheme}>
        <caption>
          <Phrase>{caption}</Phrase>
        </caption>
        <thead>
          <tr>
            <th scope="col">{t.sample}</th>
            <th scope="col">{t.pair}</th>
            <th scope="col">{t.use}</th>
            <th scope="col">{t.ratio}</th>
            <th scope="col">{t.min}</th>
          </tr>
        </thead>
        <tbody>
          {CONTRAST_PAIRS.map(([fg, bg, min]) => {
            const f = value(fg);
            const b = value(bg);
            const ratio = isHex6(f) && isHex6(b) ? contrastRatio(f, b) : Number.NaN;
            const pass = ratio >= min;
            return (
              <tr key={`${fg}/${bg}`}>
                <td>
                  <span className="s-contrast-sample" style={{ color: f, background: b }} aria-hidden="true">
                    {sample}
                  </span>
                </td>
                <th scope="row">
                  <code>--g-{fg}</code>
                  <br />
                  <code>--g-{bg}</code>
                </th>
                <td>
                  <Phrase>{uses[fg]}</Phrase>
                </td>
                <td className="s-num">{Number.isNaN(ratio) ? '—' : `${ratio.toFixed(2)}:1`}</td>
                <td>
                  <span className="s-pass" data-pass={pass ? '' : undefined}>
                    {pass ? t.pass(min) : t.fail(min)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScroll>
  );
}

export function Color(): ReactNode {
  const { nav, color: t } = useT();
  const surface = data.tokens.find((g) => g.name === 'surface');

  return (
    <>
      <PageHeader
        eyebrow={nav.sections.styles}
        title={nav.pages.color}
        lead={t.lead}
        ids={['D-06', 'S-07', 'G-10', 'K-07', 'F-06']}
      />

      {surface ? (
        <Section id="tokens" title={t.tokens.title} intro={t.tokens.intro}>
          <TableScroll label={t.tokens.tableCaption}>
            <table className="s-table s-token-table">
              <caption className="s-sr-only">{t.tokens.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.tokens.token}</th>
                  <th scope="col">{t.tokens.light}</th>
                  <th scope="col">{t.tokens.dark}</th>
                </tr>
              </thead>
              <tbody>
                {surface.tokens.map((item) => (
                  <tr key={item.name}>
                    <th scope="row">
                      <code>{item.name}</code>
                    </th>
                    <td>
                      <span className="s-token-value">
                        <Swatch value={item.light} />
                        <code>{item.light}</code>
                      </span>
                    </td>
                    <td>
                      {item.dark ? (
                        <span className="s-token-value">
                          <Swatch value={item.dark} />
                          <code>{item.dark}</code>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </Section>
      ) : null}

      <Section id="contrast" title={t.contrast.title} intro={t.contrast.intro}>
        <ContrastTable scheme="light" />
        <ContrastTable scheme="dark" />
        <KeyPoint>{md(t.contrast.callout)}</KeyPoint>
      </Section>

      <Section id="gated" title={t.gated.title}>
        <Prose>
          <Paras items={t.gated.body} />
        </Prose>
      </Section>

      <Section id="theme" title={t.theme.title} intro={t.theme.intro}>
        <CodeBlock lang="css" caption="app.css" code={t.theme.code} />
      </Section>
    </>
  );
}
