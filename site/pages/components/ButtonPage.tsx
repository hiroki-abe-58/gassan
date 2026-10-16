import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import { to } from '../../router';
import { contrastRatio } from '../../data/color';
import FooterButtons from '../../demos/FooterButtons';
import footerSource from '../../demos/FooterButtons.tsx?raw';
import GateCustom from '../../demos/GateCustom';
import gateSource from '../../demos/GateCustom.tsx?raw';
import { useTheme } from '../../theme/store';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

/* -------------------------------------------------------------------------- */
/* 種類と状態                                                                 */
/* -------------------------------------------------------------------------- */

type VariantId = 'primary' | 'secondary' | 'tertiary' | 'danger';

interface Variant {
  id: VariantId;
  label: string;
  role: string;
  look: string;
  reasons: readonly ReactNode[];
}

const VARIANTS: readonly Variant[] = [
  {
    id: 'primary',
    label: '公開する',
    role: 'その画面の目的を果たす操作。1 画面に 1 つだけ（F-01）。',
    look: 'アクセントの塗りに、それに合わせた文字色。',
    reasons: [
      '塗りは同じ大きさでも最も目を引く。目が最初に止まる場所を 1 つに絞るため、塗るのは primary だけにする。',
      '文字と塗りは 4.5:1 以上。サイトのテーマで色を変えても、計算で保証している。',
      '列の最後に置く。DOM 順 = 見た目の順 = Tab 順なので、読み終えた位置に来る（F-02）。⌘ / Ctrl + Enter でも押せる（F-10）。',
    ],
  },
  {
    id: 'secondary',
    label: '下書き保存',
    role: 'primary と並ぶ、もう 1 つの選択肢。下書き保存・戻るなど。',
    look: '塗らずに、濃いめの輪郭と本文と同じ文字色。',
    reasons: [
      '塗らないことで primary との主従を示し、輪郭で押せる範囲を示す。',
      'ボタンだと分かる手がかりは文字（本文と同じ色で 4.5:1 以上）が担う。輪郭は主従を見せるための補助で、コントラストを上げる設定（prefers-contrast: more）では文字色まで濃くする。',
    ],
  },
  {
    id: 'tertiary',
    label: 'やめる',
    role: '退く操作。やめる・あとで・詳しく見るなど。',
    look: '塗りも輪郭も無く、補足と同じ文字色。列の左端に離す（F-03）。',
    reasons: [
      'いちばん弱い見た目にし、位置も primary から離して、急いでいるときに押し間違えないようにする。',
      '補足の文字色でも、面に対して 4.5:1 以上ある。',
      '左右の余白だけを詰め、高さは 44px のまま（F-05）。文字に近い見た目でも、押せる面積は減らさない。',
    ],
  },
  {
    id: 'danger',
    label: '削除する',
    role: '取り返しのつかない操作。primary の代わりに使う。',
    look: 'primary の位置のまま、赤の塗り。',
    reasons: [
      '位置は変えず、色だけを変える（F-06）。いつもの場所を押す手の記憶が、別の操作を押させないように。',
      'このボタンには初期フォーカスを当てない（K-05）。Enter 1 回で取り返しがつかなくなる。',
      '赤だけに頼らず、ラベルの動詞で何が起きるかを言う。色が見分けにくくても、読めば分かる。',
    ],
  },
];

type StateId = 'rest' | 'hover' | 'focus' | 'loading' | 'gated' | 'unavailable';

interface ButtonState {
  id: StateId;
  name: string;
  /** どう書けばこの状態になるか */
  api: string;
  look: string;
  why: ReactNode;
}

const STATES: readonly ButtonState[] = [
  {
    id: 'rest',
    name: '押せる',
    api: '既定',
    look: '種類ごとの基本の見た目。ポインタは指の形になる。',
    why: '押せるボタンは、種類が違っても同じ高さ（44px、粗いポインタでは 48px）と角の丸みを持つ。押せるものの形をそろえ、押せないものと区別する。',
  },
  {
    id: 'hover',
    name: 'ポインタが乗った',
    api: ':hover',
    look: 'secondary と tertiary は薄い面を敷く。primary と danger は塗りを変えずに影で持ち上げる。',
    why: '塗りのボタンで背景を明るく・暗くすると、テーマで 4.5:1 ぎりぎりに合わせた色が、文字との比を割る。だから色ではなく影で反応させる。',
  },
  {
    id: 'focus',
    name: 'キーボードで来た',
    api: ':focus-visible',
    look: '2px のリングを、ボタンから 2px 離して描く。',
    why: '離して描くので、塗りのボタンでもリングが塗りに溶けない。リングは面に対して 3:1 以上（K-07）。マウスで押したときには出ない。',
  },
  {
    id: 'loading',
    name: '処理中',
    api: 'onAction が Promise を返す / loading',
    look: 'ラベルを透明にしてスピナーを重ねる。幅は変わらない。',
    why: (
      <>
        押しても何も起きない（二重送信の防止、F-08）。ラベルは <code>opacity: 0</code> で隠すので、読み上げの名前は残る。
        <code>visibility: hidden</code> だと名前ごと消え、名前のないボタンになる（F-07）。スピナーは文字ではないので 3:1 以上。
      </>
    ),
  },
  {
    id: 'gated',
    name: 'ゲート中（条件が揃えば押せる）',
    api: 'gate',
    look: '灰色の塗り（secondary と tertiary は細い輪郭）。文字ははっきり読める。',
    why: (
      <>
        <code>disabled</code> ではなく <code>aria-disabled</code> にする（G-01）。フォーカスが当たり、押すと理由を読み上げて、詰まっている場所へ連れて行く（G-07 / G-08）。フォーカスが当たる以上、WCAG の「非活性なら対象外」に頼れないので、
        <code>opacity</code> で薄めずに 4.5:1 を保つ（G-10）。
      </>
    ),
  },
  {
    id: 'unavailable',
    name: '使用不可',
    api: 'unavailable',
    look: '塗りを消して、破線の輪郭。',
    why: (
      <>
        権限が無いなど、この画面ではどうしても押せないときだけ使う本物の <code>disabled</code>。フォーカスも当たらない。ゲート中（塗りのある灰色）と形で見分けられるよう、破線にする。WCAG の対象外だが、文字は補足と同じ色で読める比を保つ。
      </>
    ),
  },
];

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
  what: string;
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
      ? { what: 'スピナー', ratio, min: 3 }
      : { what: '文字', ratio, ...(state === 'unavailable' ? {} : { min: 4.5 }) },
  ];
  if (state === 'focus') {
    const ring = over(parseColor(style.outlineColor), surface);
    results.push({ what: 'リング', ratio: contrastRatio(hex(ring), hex(surface)), min: 3 });
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
function StateButton({ variant, state }: { variant: Variant; state: StateId }): ReactNode {
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
          data-variant={variant.id}
          data-preview={state === 'hover' || state === 'focus' ? state : undefined}
          data-loading={state === 'loading' ? '' : undefined}
          data-gated={state === 'gated' ? '' : undefined}
          disabled={state === 'unavailable'}
        >
          <span className="g-btn-label">
            <Phrase>{variant.label}</Phrase>
          </span>
          {state === 'loading' ? <span className="g-btn-spinner" /> : null}
        </button>
      </div>
      <figcaption>
        <span className="s-btn-cell-name">{variant.id}</span>
        {measures.map((m) => (
          <span key={m.what} className="s-btn-cell-ratio" data-pass={m.min === undefined || m.ratio >= m.min ? '' : undefined}>
            {m.what} {m.ratio.toFixed(2)}:1
            <span className="s-btn-cell-min">
              {m.min === undefined ? '（対象外）' : m.ratio >= m.min ? `（基準 ${String(m.min)}）` : `（基準 ${String(m.min)} に不足）`}
            </span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function VariantCard({ variant }: { variant: Variant }): ReactNode {
  return (
    <article className="s-variant" aria-labelledby={`variant-${variant.id}`}>
      <div className="s-btn-stage" data-single="">
        <StateButton variant={variant} state="rest" />
      </div>
      <div className="s-variant-text">
        <h3 id={`variant-${variant.id}`}>
          <code>{variant.id}</code>
        </h3>
        <Phrase>
          <p className="s-variant-role">{variant.role}</p>
          <p className="s-variant-look">{variant.look}</p>
          <ul>
            {variant.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </Phrase>
      </div>
    </article>
  );
}

function StateRow({ state }: { state: ButtonState }): ReactNode {
  return (
    <article className="s-state" aria-labelledby={`state-${state.id}`}>
      <header className="s-state-head">
        <h3 id={`state-${state.id}`}>
          <Phrase>{state.name}</Phrase>
        </h3>
        <code>{state.api}</code>
      </header>
      <div className="s-btn-stage">
        {VARIANTS.map((variant) => (
          <StateButton key={variant.id} variant={variant} state={state.id} />
        ))}
      </div>
      <dl className="s-state-text">
        <div>
          <dt>見た目</dt>
          <dd>
            <Phrase>{state.look}</Phrase>
          </dd>
        </div>
        <div>
          <dt>根拠</dt>
          <dd>
            <Phrase>{state.why}</Phrase>
          </dd>
        </div>
      </dl>
    </article>
  );
}

const GATED_VS_UNAVAILABLE: readonly (readonly [string, string, string])[] = [
  ['書き方', 'gate（aria-disabled）', 'unavailable（disabled）'],
  ['フォーカス', '当たる', '当たらない'],
  ['押すと', '理由を読み上げ、詰まっている場所へ連れて行く', '何も起きない'],
  ['見た目', '灰色の塗り', '破線の輪郭'],
  ['文字のコントラスト', '4.5:1 を保つ（G-10）', 'WCAG の対象外。それでも読める比を保つ'],
  ['使う場面', '読了・同意・入力が揃えば押せる', '権限が無いなど、この画面では押せない'],
];

export function ButtonPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/button"
      rest={rest}
      title="ボタンの種類と状態"
      lead="primary・secondary・tertiary の 3 段と、取り返しのつかない操作の danger。押せる・処理中・ゲート中・使用不可を、色だけに頼らず形で見分けられるようにしている。"
      ids={['F-01', 'F-05', 'F-06', 'F-07', 'G-01', 'G-10', 'K-07']}
      overview={() => (
        <>
          <Section
            id="variants"
            title="種類"
            intro="重みの違う 3 段で、どれを押せば先へ進むかを一目で分かるようにする。1 つのフッタに置くのは各 1 つまで。"
          >
            <div className="s-variants">
              {VARIANTS.map((variant) => (
                <VariantCard key={variant.id} variant={variant} />
              ))}
            </div>
          </Section>

          <Section
            id="states"
            title="状態"
            intro="6 つの状態を 4 種類すべてで描いた。下の比は、いま画面に描かれている色をその場で測ったもの。テーマを変えると測り直す。"
          >
            <div className="s-states">
              {STATES.map((state) => (
                <StateRow key={state.id} state={state} />
              ))}
            </div>
            <Callout>
              状態は色だけで伝えない。影・リング・スピナー・塗りのある灰色・破線と、形がすべて違う。色が見分けにくい人にも、強制カラーモード（Windows のハイコントラスト）でも区別できる。
            </Callout>
          </Section>

          <Section
            id="gated"
            title="ゲート中と使用不可を分ける"
            intro="どちらも「今は押せない」だが、押せるようになる道があるかどうかが違う。gassan は disabled をほとんど使わない。"
          >
            <div className="s-table-wrap" role="group" tabIndex={0} aria-label="ゲート中と使用不可の違い">
              <table className="s-table">
                <caption className="s-sr-only">ゲート中と使用不可の違い</caption>
                <thead>
                  <tr>
                    <th scope="col">観点</th>
                    <th scope="col">ゲート中</th>
                    <th scope="col">使用不可</th>
                  </tr>
                </thead>
                <tbody>
                  <Phrase>
                    {GATED_VS_UNAVAILABLE.map(([what, gated, unavailable]) => (
                      <tr key={what}>
                        <th scope="row">{what}</th>
                        <td>{gated}</td>
                        <td>{unavailable}</td>
                      </tr>
                    ))}
                  </Phrase>
                </tbody>
              </table>
            </div>
            <Prose>
              <p>
                <code>disabled</code> のボタンにはフォーカスが当たらない。キーボードやスクリーンリーダーの利用者には、ボタンがあることも、なぜ押せないのかも伝わらない。「条件を満たせば押せる」ボタンを{' '}
                <code>disabled</code> にすると、その人だけが先へ進めなくなる。
              </p>
            </Prose>
            <Example
              title="ゲート中のボタンを押してみる"
              description="トピックを選ぶまで「登録する」はゲート中。押すと理由を読み上げ、選択肢へフォーカスを移す。"
              code={gateSource}
            >
              <GateCustom />
            </Example>
          </Section>

          <Section id="live" title="実際に押す" intro="処理中のあいだは何度押しても 1 回しか走らない。">
            <Example
              title="記事を公開する"
              description="tertiary・secondary・primary を弱い順に並べたフッタ。「公開する」を連打してみる。"
              code={footerSource}
            >
              <FooterButtons />
            </Example>
          </Section>

          <Section id="size" title="大きさと置き方">
            <ol className="s-rules">
              <Phrase>
                <li>
                  <h3>高さは 44px 以上</h3>
                  <p>
                    WCAG 2.5.8 の最低 24px より厳しく、Apple の 44pt に合わせる。指で触る端末（<code>pointer: coarse</code>）では 48px にする（F-05）。
                  </p>
                </li>
                <li>
                  <h3>弱い順に書く</h3>
                  <p>
                    tertiary → secondary → primary の順に書けば、DOM 順・見た目の順・Tab 順がそろう（F-02）。狭い画面では同じ順のまま縦に積み、並びを反転させない（F-04）。
                  </p>
                </li>
                <li>
                  <h3>ラベルは文節で折る</h3>
                  <p>
                    狭い画面でラベルが 2 行になっても「プロフィールを｜編集」のように文節の切れ目で折る。
                    <a href={to('/styles/line-break')}>日本語の折り返し</a>を参照。
                  </p>
                </li>
                <li>
                  <h3>動詞で結果を言う</h3>
                  <p>「OK」「はい」ではなく「公開する」「削除する」。ボタンだけを読んでも、押した結果が分かるようにする。</p>
                </li>
              </Phrase>
            </ol>
          </Section>
        </>
      )}
      api={() => <ApiTable name="ModalButtonProps" title="Modal.Button" />}
      a11y={() => (
        <SpecTable
          ids={['F-01', 'F-02', 'F-04', 'F-05', 'F-06', 'F-07', 'F-08', 'G-01', 'G-07', 'G-08', 'G-10', 'K-05', 'K-07', 'W-01']}
          caption="ボタンが満たす仕様"
        />
      )}
    />
  );
}
