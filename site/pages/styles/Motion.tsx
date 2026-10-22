import { useState, type CSSProperties, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { data } from '../../data';
import { bezier, durationMs, token } from '../../data/tokens';
import { SPEC_LANG, useT } from '../../i18n';
import { CodeBlock } from '../../ui/Code';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, PageHeader, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

/** cubic-bezier の曲線を描く。図は飾りで、値は隣の表に書いてある。 */
function Curve({ value }: { value: string }): ReactNode {
  const points = bezier(value);
  if (!points) return null;
  const [x1, y1, x2, y2] = points;
  const s = 100;
  const p = (x: number, y: number): string => `${String(x * s)} ${String(s - y * s)}`;
  return (
    <svg className="s-curve" viewBox="-8 -8 116 116" aria-hidden="true">
      <rect x="0" y="0" width={s} height={s} className="s-curve-frame" />
      <line x1="0" y1={s} x2={x1 * s} y2={s - y1 * s} className="s-curve-handle" />
      <line x1={s} y1="0" x2={x2 * s} y2={s - y2 * s} className="s-curve-handle" />
      <path d={`M ${p(0, 0)} C ${p(x1, y1)}, ${p(x2, y2)}, ${p(1, 1)}`} className="s-curve-path" />
    </svg>
  );
}

/** 入場と退出を、トークンの時間とイージングで再生する。 */
function Replay(): ReactNode {
  const t = useT().motion.durations;
  const [shown, setShown] = useState(true);
  return (
    <div className="s-replay">
      <div className="s-replay-stage" aria-hidden="true">
        <span className="s-replay-panel" data-shown={shown ? '' : undefined} />
      </div>
      <button type="button" className="s-btn s-btn-tonal" onClick={() => setShown((v) => !v)} aria-pressed={!shown}>
        {shown ? t.replayClose : t.replayOpen}
      </button>
    </div>
  );
}

export function Motion(): ReactNode {
  const { nav, motion: t } = useT();
  const durIn = token('--g-dur-in').light;
  const durOut = token('--g-dur-out').light;
  const easeIn = token('--g-ease-in').light;
  const easeOut = token('--g-ease-out').light;
  const max = Math.max(durationMs(durIn), durationMs(durOut));
  const core = data.code['7#0'];

  return (
    <>
      <PageHeader
        eyebrow={nav.sections.styles}
        title={nav.pages.motion}
        lead={t.lead}
        ids={['L-04', 'L-05', 'L-07', 'S-03', 'S-05']}
      />

      <Section id="durations" title={t.durations.title} intro={t.durations.intro}>
        <ul className="s-durations">
          {[
            { label: t.durations.in, name: '--g-dur-in', value: durIn },
            { label: t.durations.out, name: '--g-dur-out', value: durOut },
          ].map((d) => (
            <li key={d.name}>
              <span className="s-duration-label">{d.label}</span>
              <span className="s-duration-track" aria-hidden="true">
                <span className="s-duration-fill" style={{ '--s-ratio': durationMs(d.value) / max } as CSSProperties} />
              </span>
              <code>{d.name}</code>
              <span className="s-num">{d.value}</span>
            </li>
          ))}
        </ul>
        <Replay />
      </Section>

      <Section id="easing" title={t.easing.title}>
        <ul className="s-curves">
          {[
            { label: t.easing.in, name: '--g-ease-in', value: easeIn },
            { label: t.easing.out, name: '--g-ease-out', value: easeOut },
          ].map((c) => (
            <li key={c.name}>
              <Curve value={c.value} />
              <p>
                <Phrase>{c.label}</Phrase>
              </p>
              <code>{c.name}</code>
              <code className="s-curve-value">{c.value}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="exit" title={t.exit.title}>
        <Prose>
          <Paras items={t.exit.body} />
        </Prose>
        {core ? <CodeBlock code={core.text} lang="css" caption="modal.skill.md §7" textLang={SPEC_LANG} /> : null}
      </Section>

      <Section id="reduced" title={t.reduced.title}>
        <KeyPoint>{md(t.reduced.callout)}</KeyPoint>
        <SpecTable ids={['L-04', 'L-05', 'L-06', 'L-07', 'S-03', 'S-05']} caption={t.reduced.tableCaption} />
      </Section>
    </>
  );
}
