import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import { contrastRatio } from '../../data/color';
import FooterButtons from '../../demos/FooterButtons';
import footerSource from '../../demos/FooterButtons.tsx?raw';
import GateCustom from '../../demos/GateCustom';
import gateSource from '../../demos/GateCustom.tsx?raw';
import { useT } from '../../i18n';
import { useTheme } from '../../theme/store';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TableScroll } from '../../ui/TableScroll';

/* -------------------------------------------------------------------------- */
/* 種類と状態                                                                 */
/* -------------------------------------------------------------------------- */

/** 文言は i18n の button.variants.items / button.states.items に、同じキーで持つ。 */
type VariantId = 'primary' | 'secondary' | 'tertiary' | 'danger';

const VARIANTS: readonly VariantId[] = ['primary', 'secondary', 'tertiary', 'danger'];

type StateId = 'rest' | 'hover' | 'focus' | 'loading' | 'gated' | 'unavailable';

const STATES: readonly StateId[] = ['rest', 'hover', 'focus', 'loading', 'gated', 'unavailable'];

/* -------------------------------------------------------------------------- */
/* 描画された色から比を測る                                                   */
/* -------------------------------------------------------------------------- */

type Rgba = readonly [r: number, g: number, b: number, a: number];

const WHITE: Rgba = [255, 255, 255, 1];

/** getComputedStyle が返す rgb() / rgba() を読む。トークンは #rrggbb で書いているので、この 2 形だけで足りる。 */
function parseColor(value: string): Rgba | undefined {
  const body = /^rgba?\(([^)]+)\)$/.exec(value.trim())?.[1];
  if (!body) return undefined;
  const [r, g, b, a = 1] = body.split(/[\s,/]+/).filter(Boolean).map(Number);
  if (r === undefined || g === undefined || b === undefined || [r, g, b, a].some(Number.isNaN)) return undefined;
  return [r, g, b, a];
}

/** 半透明の色を下の色に重ねた結果。 */
function over(top: Rgba | undefined, bottom: Rgba): Rgba {
  if (!top) return bottom;
  const a = top[3];
  const mix = (i: 0 | 1 | 2): number => Math.round(top[i] * a + bottom[i] * (1 - a));
  return [mix(0), mix(1), mix(2), 1];
}

const hex = ([r, g, b]: Rgba): string => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

interface Measure {
  /** 何の比か。ラベルは描くときに文言（button.measure）から引く */
  what: 'ink' | 'spinner' | 'ring';
  ratio: number;
  /** 基準。undefined は WCAG の対象外（本物の disabled） */
  min?: number;
}

function measure(button: HTMLElement, state: StateId): Measure[] {
  const stage = button.closest<HTMLElement>('.s-btn-stage');
  const surface = over(parseColor(stage ? getComputedStyle(stage).backgroundColor : ''), WHITE);
  const style = getComputedStyle(button);
  const fill = over(parseColor(style.backgroundColor), surface);
  const ink = over(parseColor(style.color), fill);
  const ratio = contrastRatio(hex(ink), hex(fill));
  const results: Measure[] = [
    state === 'loading'
      ? { what: 'spinner', ratio, min: 3 }
      : { what: 'ink', ratio, ...(state === 'unavailable' ? {} : { min: 4.5 }) },
  ];
  if (state === 'focus') {
    const ring = over(parseColor(style.outlineColor), surface);
    results.push({ what: 'ring', ratio: contrastRatio(hex(ring), hex(surface)), min: 3 });
  }
  return results;
}

/* -------------------------------------------------------------------------- */
/* 見本                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * 状態を付けた本物の .g-btn。見本なので inert で操作も読み上げもさせず、測った比を隣に文字で出す。
 * hover と focus は属性（data-preview）で再現する（site.css。src/styles.css の該当規則と同じ見た目）。
 */
function StateButton({ variant, state }: { variant: VariantId; state: StateId }): ReactNode {
  const t = useT().button;
  const ref = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const [measures, setMeasures] = useState<readonly Measure[]>([]);

  // テーマを変えるたびに測り直す。store は CSS 変数を書いてから通知するので、ここでは新しい色が読める
  useLayoutEffect(() => {
    if (ref.current) setMeasures(measure(ref.current, state));
  }, [theme, state]);

  return (
    <figure className="s-btn-cell">
      <div className="s-btn-frame" inert>
        <button
          ref={ref}
          type="button"
          className="g-btn"
          data-variant={variant}
          data-preview={state === 'hover' || state === 'focus' ? state : undefined}
          data-loading={state === 'loading' ? '' : undefined}
          data-gated={state === 'gated' ? '' : undefined}
          disabled={state === 'unavailable'}
        >
          <span className="g-btn-label">
            <Phrase>{t.variants.items[variant].label}</Phrase>
          </span>
          {state === 'loading' ? <span className="g-btn-spinner" /> : null}
        </button>
      </div>
      <figcaption>
        <span className="s-btn-cell-name">{variant}</span>
        {measures.map((m) => (
          <span key={m.what} className="s-btn-cell-ratio" data-pass={m.min === undefined || m.ratio >= m.min ? '' : undefined}>
            {t.measure[m.what]} {m.ratio.toFixed(2)}:1
            <span className="s-btn-cell-min">
              {m.min === undefined ? t.measure.exempt : m.ratio >= m.min ? t.measure.meets(m.min) : t.measure.fails(m.min)}
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function VariantCard({ variant }: { variant: VariantId }): ReactNode {
  const v = useT().button.variants.items[variant];
  return (
    <article className="s-variant" aria-labelledby={`variant-${variant}`}>
      <div className="s-btn-stage" data-single="">
        <StateButton variant={variant} state="rest" />
      </div>
      <div className="s-variant-text">
        <h3 id={`variant-${variant}`}>
          <code>{variant}</code>
        </h3>
        <Phrase>
          <p className="s-variant-role">{md(v.role)}</p>
          <p className="s-variant-look">{md(v.look)}</p>
          <ul>
            {v.reasons.map((reason, i) => (
              <li key={i}>{md(reason)}</li>
            ))}
          </ul>
        </Phrase>
      </div>
    </article>
  );
}

function StateRow({ state }: { state: StateId }): ReactNode {
  const t = useT().button.states;
  const s = t.items[state];
  return (
    <article className="s-state" aria-labelledby={`state-${state}`}>
      <header className="s-state-head">
        <h3 id={`state-${state}`}>
          <Phrase>{s.name}</Phrase>
        </h3>
        <code>{s.api}</code>
      </header>
      <div className="s-btn-stage">
        {VARIANTS.map((variant) => (
          <StateButton key={variant} variant={variant} state={state} />
        ))}
      </div>
      <dl className="s-state-text">
        <div>
          <dt>{t.look}</dt>
          <dd>
            <Phrase>{md(s.look)}</Phrase>
          </dd>
        </div>
        <div>
          <dt>{t.why}</dt>
          <dd>
            <Phrase>{md(s.why)}</Phrase>
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function ButtonPage({ rest }: PageProps): ReactNode {
  const { nav, button: t } = useT();
  return (
    <ComponentPage
      path="/components/button"
      rest={rest}
      title={nav.pages.button}
      lead={t.lead}
      ids={['F-01', 'F-05', 'F-06', 'F-07', 'G-01', 'G-10', 'K-07']}
      overview={() => (
        <>
          <Section id="variants" title={t.variants.title} intro={t.variants.intro}>
            <div className="s-variants">
              {VARIANTS.map((variant) => (
                <VariantCard key={variant} variant={variant} />
              ))}
            </div>
          </Section>

          <Section id="states" title={t.states.title} intro={t.states.intro}>
            <div className="s-states">
              {STATES.map((state) => (
                <StateRow key={state} state={state} />
              ))}
            </div>
            <KeyPoint>{md(t.states.callout)}</KeyPoint>
          </Section>

          <Section id="gated" title={t.gated.title} intro={t.gated.intro}>
            <TableScroll label={t.gated.tableCaption}>
              <table className="s-table">
                <caption className="s-sr-only">{t.gated.tableCaption}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t.gated.aspect}</th>
                    <th scope="col">{t.gated.gated}</th>
                    <th scope="col">{t.gated.unavailable}</th>
                  </tr>
                </thead>
                <tbody>
                  <Phrase>
                    {t.gated.rows.map((row) => (
                      <tr key={row.aspect}>
                        <th scope="row">{row.aspect}</th>
                        <td>{row.gated}</td>
                        <td>{row.unavailable}</td>
                      </tr>
                    ))}
                  </Phrase>
                </tbody>
              </table>
            </TableScroll>
            <Prose>
              <Paras items={t.gated.body} />
            </Prose>
            <Example
              title={t.gated.exampleTitle}
              description={t.gated.exampleDescription}
              code={gateSource}
              demo="gateCustom"
            >
              <GateCustom />
            </Example>
          </Section>

          <Section id="live" title={t.live.title} intro={t.live.intro}>
            <Example
              title={t.live.exampleTitle}
              description={t.live.exampleDescription}
              code={footerSource}
              demo="footerButtons"
            >
              <FooterButtons />
            </Example>
          </Section>

          <Section id="size" title={t.size.title}>
            <ol className="s-rules">
              <Phrase>
                {t.size.rules.map((rule) => (
                  <li key={rule.title}>
                    <h3>{rule.title}</h3>
                    <p>{md(rule.body)}</p>
                  </li>
                ))}
              </Phrase>
            </ol>
          </Section>
        </>
      )}
      api={() => <ApiTable name="ModalButtonProps" title="Modal.Button" />}
      a11y={() => (
        <SpecTable
          ids={['F-01', 'F-02', 'F-04', 'F-05', 'F-06', 'F-07', 'F-08', 'G-01', 'G-07', 'G-08', 'G-10', 'K-05', 'K-07', 'W-01']}
          caption={t.a11yCaption}
        />
      )}
    />
  );
}
