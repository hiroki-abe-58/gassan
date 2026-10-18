import type { CSSProperties, ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { useT } from '../../i18n';
import {
  PRESETS,
  TINTED_GASSAN_TOKENS,
  hexToOklch,
  type ContrastCheck,
  type PresetId,
  type Scheme,
} from '../../theme/engine';
import { themeFor, useTheme } from '../../theme/store';
import { CodeBlock } from '../../ui/Code';
import { md, Paras } from '../../ui/Markdown';
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
  const { common, theme: t } = useT();
  return (
    <div className="s-table-wrap" role="group" tabIndex={0} aria-label={caption}>
      <table className="s-table s-contrast-table">
        <caption className="s-sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{t.checksTable.sample}</th>
            <th scope="col">{t.checksTable.pair}</th>
            <th scope="col">{t.checksTable.ratio}</th>
            <th scope="col">{t.checksTable.min}</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((c) => (
            <tr key={c.id}>
              <td>
                <span className="s-contrast-sample" style={{ color: c.fg, background: c.bg }} aria-hidden="true">
                  {common.contrastSample}
                </span>
              </td>
              <th scope="row">
                <Phrase>{common.theme.checks[c.id]}</Phrase>
              </th>
              <td className="s-num">{c.ratio.toFixed(2)}:1</td>
              <td>
                <span className="s-pass" data-pass={c.pass ? '' : undefined}>
                  {c.pass ? t.checksTable.pass(c.min) : t.checksTable.fail(c.min)}
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

/** プリセットの種の色相（OKLCH の度）。 */
function presetHue(id: PresetId): number {
  const seed = PRESETS.find((p) => p.id === id)?.seed;
  return seed ? Math.round(hexToOklch(seed).h) : Number.NaN;
}

export function Theme(): ReactNode {
  const { nav, common, theme: t } = useT();
  const { state, theme } = useTheme();
  const schemes: readonly Scheme[] = ['light', 'dark'];
  // 背景を色づけているときは、モーダルの面・枠線・文字の値もコードに足す
  const tintedLines = TINTED_GASSAN_TOKENS.map((name) => `\n  ${name}: ${theme.vars[name] ?? ''};`).join('');
  const tinted = state.tint === 'neutral' ? '' : `\n\n  /* ${t.own.tintedComment} */${tintedLines}`;

  return (
    <>
      <PageHeader eyebrow={nav.sections.styles} title={nav.pages.theme} lead={t.lead} ids={['D-06', 'G-10', 'K-07', 'S-07']} />

      <Section id="controls" title={t.controls.title} intro={t.controls.intro}>
        <div className="s-theme-inline">
          <ThemeControls />
        </div>
      </Section>

      <Section id="now" title={t.now.title} intro={t.now.intro}>
        <div className="s-tones">
          <Swatch color={theme.accent.accent} label={t.now.tones.accent} />
          <Swatch color={theme.accent.onAccent} label={t.now.tones.onAccent} />
          <Swatch color={theme.accent.soft} label={t.now.tones.soft} />
          <Swatch color={theme.accent.onSoft} label={t.now.tones.onSoft} />
          <Swatch color={theme.vars['--s-bg'] ?? ''} label={t.now.tones.bg} />
          <Swatch color={theme.vars['--s-surface'] ?? ''} label={t.now.tones.surface} />
          <Swatch color={theme.vars['--s-surface-1'] ?? ''} label={t.now.tones.surface1} />
          <Swatch color={theme.vars['--g-surface'] ?? ''} label={t.now.tones.modal} />
        </div>
        <ChecksTable checks={theme.checks} caption={t.now.tableCaption} />
      </Section>

      <Section id="presets" title={t.presets.title} intro={t.presets.intro}>
        <div className="s-table-wrap" role="group" tabIndex={0} aria-label={t.presets.tableLabel}>
          <table className="s-table s-preset-table">
            <caption className="s-sr-only">{t.presets.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.presets.preset}</th>
                <th scope="col">{t.presets.seed}</th>
                <th scope="col">{t.presets.light}</th>
                <th scope="col">{t.presets.dark}</th>
              </tr>
            </thead>
            <tbody>
              {PRESETS.map((preset) => (
                <tr key={preset.id} data-current={state.preset === preset.id ? '' : undefined}>
                  <th scope="row">
                    <Phrase>{common.theme.presets[preset.id]}</Phrase>
                    {state.preset === preset.id ? <span className="s-preset-current">{t.presets.current}</span> : null}
                  </th>
                  <td>
                    <span className="s-token-value">
                      <span className="s-swatch" style={{ '--s-swatch': preset.seed } as CSSProperties} aria-hidden="true" />
                      <code>{preset.seed}</code>
                    </span>
                  </td>
                  {schemes.map((scheme) => {
                    const themed = themeFor({ ...state, preset: preset.id }, scheme);
                    const worst = tightest(themed.checks);
                    const pass = themed.checks.every((c) => c.pass);
                    const verdict = pass ? t.presets.pass : t.presets.fail;
                    return (
                      <td key={scheme}>
                        <span className="s-token-value">
                          <span
                            className="s-swatch"
                            style={{ '--s-swatch': themed.accent.accent } as CSSProperties}
                            aria-hidden="true"
                          />
                          <code>{themed.accent.accent}</code>
                        </span>
                        <span className="s-pass s-preset-result" data-pass={pass ? '' : undefined}>
                          <Phrase>
                            {worst ? t.presets.withTightest(verdict, worst.ratio.toFixed(2), worst.min) : verdict}
                          </Phrase>
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
          <Paras items={t.presets.body} />
        </Prose>
      </Section>

      <Section id="how" title={t.how.title}>
        <ol className="s-rules">
          <Phrase>
            {t.how.rules.map((rule) => (
              <li key={rule.title}>
                <h3>{rule.title}</h3>
                <p>{md(rule.body)}</p>
              </li>
            ))}
          </Phrase>
        </ol>
        <Callout>{md(t.how.callout(presetHue('yellow'), presetHue('lime')))}</Callout>
      </Section>

      <Section id="own" title={t.own.title} intro={t.own.intro}>
        <CodeBlock lang="css" caption="app.css" code={t.own.code(theme.accent.accent, theme.accent.onAccent, tinted)} />
        <Prose>
          <Paras items={t.own.body} />
        </Prose>
      </Section>
    </>
  );
}
