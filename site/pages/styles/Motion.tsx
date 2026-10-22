import { useState, type CSSProperties, type ReactNode } from 'react';

import { GassanProvider, MOTION_PRESETS, Modal, Phrase, type MotionPreset } from '@genelab/gassan';

import { data } from '../../data';
import { bezier, durationMs, token } from '../../data/tokens';
import { SPEC_LANG, useT } from '../../i18n';
import { useTheme } from '../../theme/store';
import { CodeBlock } from '../../ui/Code';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, PageHeader, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

type Point = readonly [x: number, y: number];

/** cubic-bezier() と linear() を、進み方の点列（x: 時間、y: 進み）にする。図のためだけに使う。 */
function easingPoints(value: string): Point[] | undefined {
  const b = bezier(value);
  if (b) {
    const [x1, y1, x2, y2] = b;
    const at = (p1: number, p2: number, t: number): number => 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3;
    return Array.from({ length: 41 }, (_, i) => [at(x1, x2, i / 40), at(y1, y2, i / 40)] as const);
  }
  const m = /^linear\((.+)\)$/.exec(value.trim());
  if (!m?.[1]) return undefined;
  const stops = m[1].split(',').map((part) => part.trim().split(/\s+/));
  return stops.map(([y = '0', x], i) => [x ? Number.parseFloat(x) / 100 : i === 0 ? 0 : 1, Number(y)] as const);
}

/** 進み方の曲線。行き過ぎ（1 を超える部分）も描けるよう、上に余白を取る。図は飾りで、値は隣に書いてある。 */
function Curve({ value }: { value: string }): ReactNode {
  const points = easingPoints(value);
  if (!points) return null;
  const s = 100;
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${(x * s).toFixed(1)} ${(s - y * s).toFixed(1)}`).join(' ');
  return (
    <svg className="s-curve" viewBox="-8 -20 116 128" aria-hidden="true">
      <rect x="0" y="0" width={s} height={s} className="s-curve-frame" />
      <path d={d} className="s-curve-path" />
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

/** 段を選んで、本物の部品で試す。GassanProvider の motion で包むので、ここだけがその段で動く。 */
function PresetStage({ preset }: { preset: MotionPreset }): ReactNode {
  const t = useT().motion.stage;
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(true);
  return (
    <GassanProvider motion={preset}>
      <div className="s-motion-stage">
        <div className="s-motion-controls">
          <button type="button" className="s-btn" onClick={() => setOpen(true)}>
            <Phrase>{t.open}</Phrase>
          </button>
          <Modal.Switch checked={sound} onCheckedChange={setSound}>
            {t.sound}
          </Modal.Switch>
          <Modal.Segmented
            aria-label={t.view}
            defaultValue="list"
            options={(['list', 'grid', 'map'] as const).map((value) => ({ value, label: t.views[value] }))}
          />
          <Modal.Checkbox defaultChecked>{t.badge}</Modal.Checkbox>
          <Modal.Select
            aria-label={t.channel}
            defaultValue="mail"
            options={(['mail', 'push', 'none'] as const).map((value) => ({ value, label: t.channels[value] }))}
          />
        </div>
        <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
          <Modal.Header>
            <Modal.Controls end={<Modal.Close />} />
            <Modal.Title>{t.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Description>{t.body}</Modal.Description>
            <Modal.Switch checked={sound} onCheckedChange={setSound}>
              {t.sound}
            </Modal.Switch>
            <Modal.Fieldset label={t.channel}>
              <Modal.RadioGroup
                defaultValue="mail"
                options={(['mail', 'push', 'none'] as const).map((value) => ({ value, label: t.channels[value] }))}
              />
            </Modal.Fieldset>
            <Modal.Checkbox defaultChecked>{t.badge}</Modal.Checkbox>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="tertiary" closeOnClick="close-button">
              {t.cancel}
            </Modal.Button>
            <Modal.Button variant="primary" closeOnClick="submit">
              {t.save}
            </Modal.Button>
          </Modal.Footer>
        </Modal.Root>
      </div>
    </GassanProvider>
  );
}

const PLAYGROUND_EASINGS = {
  decelerate: 'cubic-bezier(0.2, 0, 0, 1)',
  spring: 'var(--g-ease-spring)',
  linear: 'linear',
} as const;

type PlaygroundEasing = keyof typeof PLAYGROUND_EASINGS;

/**
 * トークンを好きな値にして、本物のモーダルで再生する。
 * 値は器のインラインのカスタムプロパティに書くので、top layer に出たモーダルにも継承される。
 * 書き出す CSS は :root に置けば、利用者の CSS（レイヤーの外）が段の値に勝つ。
 */
function Playground(): ReactNode {
  const { custom: t, stage } = useT().motion;
  const [duration, setDuration] = useState(320);
  const [distance, setDistance] = useState(12);
  const [scale, setScale] = useState(0.94);
  const [blur, setBlur] = useState(4);
  const [easing, setEasing] = useState<PlaygroundEasing>('spring');
  const [open, setOpen] = useState(false);
  const vars = {
    '--g-dur-in': `${String(duration)}ms`,
    '--g-ease-in': PLAYGROUND_EASINGS[easing],
    '--g-motion-distance': `${String(distance)}px`,
    '--g-motion-scale': String(scale),
    '--g-motion-blur': `${String(blur)}px`,
  };
  const css = `:root {\n${Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')}\n}`;

  return (
    <div className="s-motion-playground" style={vars as CSSProperties}>
      <div className="s-motion-sliders">
        <Modal.Field label={t.duration}>
          {(control) => (
            <Modal.Slider {...control} min={80} max={800} step={20} value={duration} onValueChange={setDuration} formatValue={(v) => `${String(v)}ms`} />
          )}
        </Modal.Field>
        <Modal.Field label={t.distance}>
          {(control) => (
            <Modal.Slider {...control} min={0} max={40} step={1} value={distance} onValueChange={setDistance} formatValue={(v) => `${String(v)}px`} />
          )}
        </Modal.Field>
        <Modal.Field label={t.scale}>
          {(control) => (
            <Modal.Slider {...control} min={0.8} max={1} step={0.01} value={scale} onValueChange={setScale} formatValue={(v) => v.toFixed(2)} />
          )}
        </Modal.Field>
        <Modal.Field label={t.blur}>
          {(control) => (
            <Modal.Slider {...control} min={0} max={12} step={1} value={blur} onValueChange={setBlur} formatValue={(v) => `${String(v)}px`} />
          )}
        </Modal.Field>
        <fieldset className="s-theme-group">
          <legend>{t.easing}</legend>
          <Modal.Segmented
            value={easing}
            onValueChange={(value) => setEasing(value as PlaygroundEasing)}
            options={(Object.keys(PLAYGROUND_EASINGS) as PlaygroundEasing[]).map((value) => ({ value, label: t.easings[value] }))}
          />
        </fieldset>
        <button type="button" className="s-btn" onClick={() => setOpen(true)}>
          <Phrase>{t.replay}</Phrase>
        </button>
      </div>
      <CodeBlock lang="css" caption={t.codeCaption} code={css} />
      <Modal.Root kind="view" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.previewLabel}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>{stage.body}</Modal.Description>
        </Modal.Body>
      </Modal.Root>
    </div>
  );
}

/** 表に出す動きのトークン。段が書く順に並べる（--g-ease-out と --g-ease-settle は段で変わらないので出さない）。 */
const PRESET_TOKENS = [
  '--g-dur-in',
  '--g-dur-out',
  '--g-dur-fast',
  '--g-dur-slow',
  '--g-ease-in',
  '--g-ease-move',
  '--g-motion-distance',
  '--g-motion-scale',
  '--g-motion-blur',
  '--g-stagger',
  '--g-enter',
  '--g-press-scale',
] as const;

export function Motion(): ReactNode {
  const { nav, common, motion: t } = useT();
  const site = useTheme().state.motion;
  const [tried, setTried] = useState<MotionPreset | null>(null);
  const preset = tried ?? site;
  const durIn = token('--g-dur-in').light;
  const durOut = token('--g-dur-out').light;
  const max = Math.max(durationMs(durIn), durationMs(durOut));
  const core = data.code['7#0'];
  const ids = ['V-01', 'V-02', 'V-03', 'V-04', 'V-05', 'V-06', 'V-07', 'V-08'];

  return (
    <>
      <PageHeader
        eyebrow={nav.sections.styles}
        title={nav.pages.motion}
        lead={t.lead}
        ids={['L-04', 'L-05', 'L-07', 'S-03', 'S-05', 'V-01', 'V-02']}
      />

      <Section id="presets" title={t.presets.title} intro={md(t.presets.intro)}>
        <dl className="s-motion-presets">
          {MOTION_PRESETS.map((name) => (
            <div key={name}>
              <dt>{common.theme.motions[name]}</dt>
              <dd>
                <Phrase>{t.presets.descriptions[name]}</Phrase>
              </dd>
            </div>
          ))}
        </dl>
        <h3 className="s-subhead">
          <Phrase>{t.presets.tryTitle}</Phrase>
        </h3>
        <p className="s-section-intro">
          <Phrase>{md(t.presets.tryIntro)}</Phrase>
        </p>
        <fieldset className="s-theme-group s-motion-pick">
          <legend>{t.presets.stageLabel}</legend>
          <Modal.Segmented
            value={preset}
            onValueChange={(value) => setTried(value as MotionPreset)}
            options={MOTION_PRESETS.map((value) => ({ value, label: common.theme.motions[value] }))}
          />
        </fieldset>
        <PresetStage preset={preset} />
        <CodeBlock lang="tsx" caption={t.presets.codeCaption} code={t.presets.code} />
      </Section>

      <Section id="tokens" title={t.tokens.title} intro={md(t.tokens.intro)}>
        <div className="s-table-wrap" role="group" tabIndex={0} aria-label={t.tokens.tableCaption}>
          <table className="s-table s-motion-table">
            <caption className="s-sr-only">{t.tokens.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.tokens.token}</th>
                <th scope="col">{t.tokens.use}</th>
                {data.motionPresets.map((p) => (
                  <th key={p.name} scope="col">
                    {common.theme.motions[p.name as MotionPreset]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRESET_TOKENS.map((name) => (
                <tr key={name}>
                  <th scope="row">
                    <code>{name}</code>
                  </th>
                  <td>
                    <Phrase>{t.tokens.uses[name] ?? ''}</Phrase>
                  </td>
                  {data.motionPresets.map((p) => (
                    <td key={p.name}>
                      <code>{p.tokens[name] ?? '—'}</code>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

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
            { label: t.easing.in, name: '--g-ease-in' },
            { label: t.easing.out, name: '--g-ease-out' },
            { label: t.easing.spring, name: '--g-ease-spring' },
          ].map((c) => {
            const value = token(c.name).light;
            return (
              <li key={c.name}>
                <Curve value={value} />
                <p>
                  <Phrase>{c.label}</Phrase>
                </p>
                <code>{c.name}</code>
                <code className="s-curve-value">{value}</code>
              </li>
            );
          })}
        </ul>
        <Prose>
          <Paras items={[t.easing.springNote]} />
        </Prose>
      </Section>

      <Section id="custom" title={t.custom.title} intro={t.custom.intro}>
        <Playground />
      </Section>

      <Section id="exit" title={t.exit.title}>
        <Prose>
          <Paras items={t.exit.body} />
        </Prose>
        {core ? <CodeBlock code={core.text} lang="css" caption="modal.skill.md §7" textLang={SPEC_LANG} /> : null}
      </Section>

      <Section id="reduced" title={t.reduced.title}>
        <KeyPoint>{md(t.reduced.callout)}</KeyPoint>
        <SpecTable ids={['L-04', 'L-05', 'L-06', 'L-07', 'S-03', 'S-05', ...ids]} caption={t.reduced.tableCaption} />
      </Section>
    </>
  );
}
