import { useState, type CSSProperties, type ReactNode } from 'react';

import { data } from '../../data';
import { bezier, durationMs, token } from '../../data/tokens';
import { CodeBlock } from '../../ui/Code';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';
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
  const [shown, setShown] = useState(true);
  return (
    <div className="s-replay">
      <div className="s-replay-stage" aria-hidden="true">
        <span className="s-replay-panel" data-shown={shown ? '' : undefined} />
      </div>
      <button type="button" className="s-btn s-btn-tonal" onClick={() => setShown((v) => !v)} aria-pressed={!shown}>
        {shown ? '閉じる（120ms）' : '開く（180ms）'}
      </button>
    </div>
  );
}

export function Motion(): ReactNode {
  const durIn = token('--g-dur-in').light;
  const durOut = token('--g-dur-out').light;
  const easeIn = token('--g-ease-in').light;
  const easeOut = token('--g-ease-out').light;
  const max = Math.max(durationMs(durIn), durationMs(durOut));
  const core = data.code['7#0'];

  return (
    <>
      <PageHeader
        eyebrow="スタイル"
        title="モーション"
        lead="入場も退出も CSS だけで描く。JS のアニメーションライブラリは使わない。JS が担うのは「退出が見えるまで close() を待つ」ことだけ。"
        ids={['L-04', 'L-05', 'L-07', 'S-03', 'S-05']}
      />

      <Section id="durations" title="時間" intro="退出は入場より速く。人は「開く」を待てるが「閉じる」を待てない。">
        <ul className="s-durations">
          {[
            { label: '入場', name: '--g-dur-in', value: durIn },
            { label: '退出', name: '--g-dur-out', value: durOut },
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

      <Section id="easing" title="イージング">
        <ul className="s-curves">
          {[
            { label: '入場（減速して止まる）', name: '--g-ease-in', value: easeIn },
            { label: '退出（加速して去る）', name: '--g-ease-out', value: easeOut },
          ].map((c) => (
            <li key={c.name}>
              <Curve value={c.value} />
              <p>{c.label}</p>
              <code>{c.name}</code>
              <code className="s-curve-value">{c.value}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="exit" title="退出アニメと overlay">
        <Prose>
          <p>
            退出を CSS で描く要は <code>transition-behavior: allow-discrete</code> と <code>overlay</code> の 2 つ。
            ただし <code>overlay</code> はまだ Baseline ではない。対応していないブラウザでは <code>close()</code> した瞬間に top layer から外れて消える。
          </p>
          <p>
            そこで gassan は、閉じる要求を受けたら <code>close()</code> を呼ばずに <code>data-exiting</code> を付け、dialog を開いたまま退出状態へ遷移させる。
            <code>--g-dur-out</code> だけ待ってから <code>close()</code> する。待ち時間は CSS のトークンから読むので、JS に同じ数値を二重に持たない（L-07）。
          </p>
        </Prose>
        {core ? <CodeBlock code={core.text} lang="css" caption="modal.skill.md §7" /> : null}
      </Section>

      <Section id="reduced" title="動きを減らす設定">
        <Callout>
          <code>prefers-reduced-motion: reduce</code> ではフェードを 1ms にする。0 にはしない。0 にすると discrete な遷移
          （<code>display</code> と <code>overlay</code>）が壊れる（S-05）。退出の待ち時間も 0 になるが、経路は同じコードを通す。
        </Callout>
        <SpecTable ids={['L-04', 'L-05', 'L-06', 'L-07', 'S-03', 'S-05']} caption="モーションの仕様" />
      </Section>
    </>
  );
}
