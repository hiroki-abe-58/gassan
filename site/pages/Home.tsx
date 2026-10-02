import type { ReactNode } from 'react';

import { KIND_DEFAULTS, type ModalKind } from '@genelab/gassan';

import { allItems, data } from '../data';
import KindConfirm from '../demos/KindConfirm';
import KindConsent from '../demos/KindConsent';
import KindFlow from '../demos/KindFlow';
import KindForm from '../demos/KindForm';
import KindView from '../demos/KindView';
import { to } from '../router';
import { CodeBlock } from '../ui/Code';
import { MockPanel, MockScreen } from '../ui/Guidelines';
import { LayerStack } from '../ui/LayerStack';
import { Section, Stats } from '../ui/Page';
import { STATUS_ORDER, StatusBadge } from '../ui/Spec';

const PROMISES: readonly {
  title: string;
  body: ReactNode;
  href: string;
  visual: ReactNode;
}[] = [
  {
    title: '活性化ゲート',
    body: '「最後まで読んだら」「チェックしたら」押せるボタンを、disabled を使わずに作る。押せば、何が足りないかを読み上げてそこへ連れて行く。',
    href: '/components/gate',
    visual: (
      <MockPanel title="利用規約の更新" lines={2} buttons={[{ label: '同意して続ける', variant: 'gated' }]}>
        <span className="s-mock-note">本文を最後まで読んでください</span>
      </MockPanel>
    ),
  },
  {
    title: 'タイトルの省略',
    body: 'DOM の文字列を切らず、CSS の line-clamp だけで省略する。読み上げられる名前は常に完全。溢れたときだけ「全文を表示」が出る。',
    href: '/components/title',
    visual: (
      <MockPanel
        title={
          <>
            <span className="s-mock-clamp">2026年度 第3四半期 東北エリア 店舗別売上レポートの共有設定を変更する</span>
            <span className="s-mock-toggle">全文を表示</span>
          </>
        }
        lines={2}
      />
    ),
  },
  {
    title: '閉じる理由',
    body: 'Esc・背景・×・送信・スワイプ・戻る・ページ遷移・外部からの close()。8 種を区別し、拒否するときも無言にしない。',
    href: '/components/root',
    visual: (
      <span className="s-mock-reasons">
        {['esc', 'backdrop', 'close-button', 'back-button', 'submit', 'programmatic', 'swipe', 'route-change'].map(
          (reason) => (
            <code key={reason}>{reason}</code>
          ),
        )}
      </span>
    ),
  },
  {
    title: 'スクリムのトークン',
    body: '黒 60% の決め打ちをやめ、意図別の 4 段階にする。既定は 32%・blur なし。モーダル唯一の強みである「文脈」を消さない。',
    href: '/styles/scrim',
    visual: (
      <span className="s-mock-scrims">
        {[0.2, 0.32, 0.5, 0.72].map((a) => (
          <span key={a} className="s-mock-scrim-swatch" style={{ background: `rgb(0 0 0 / ${String(a)})` }}>
            {Math.round(a * 100)}%
          </span>
        ))}
      </span>
    ),
  },
];

const KIND_DEMOS: readonly { kind: ModalKind; label: string; use: string; Demo: () => ReactNode }[] = [
  { kind: 'confirm', label: '確認', use: '取り消せない操作の確認', Demo: KindConfirm },
  { kind: 'form', label: '入力', use: '文脈を保ったままの副次入力', Demo: KindForm },
  { kind: 'view', label: '閲覧', use: '詳細・メディアの拡大', Demo: KindView },
  { kind: 'consent', label: '同意', use: '規約・権限の明示同意', Demo: KindConsent },
  { kind: 'flow', label: 'フロー', use: '複数ステップの手続き', Demo: KindFlow },
];

const yesNo = (allowed: boolean): string => (allowed ? '閉じる' : '閉じない');

export function Home(): ReactNode {
  const { meta } = data;
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    count: allItems.filter((item) => item.status === status).length,
  })).filter((entry) => entry.count > 0);
  const proven = byStatus.find((entry) => entry.status === '実装')?.count ?? 0;

  return (
    <div className="s-home">
      <section className="s-hero" aria-labelledby="page-title">
        <div className="s-hero-copy">
          <p className="s-eyebrow">React のモーダルシェル</p>
          <h1 id="page-title" tabIndex={-1}>
            層 1 は、
            <br />
            ブラウザに任せる。
          </h1>
          <p className="s-lead">
            gassan はネイティブの <code>&lt;dialog&gt;</code> を土台にした React のモーダルシェル。
            フォーカストラップも Esc も背景の inert 化も、一行も実装していない。その代わり、
            既存のライブラリがほとんど手を付けてこなかった層——情報構造、活性化ゲート、閉じる理由——に全部を注ぐ。
          </p>
          <div className="s-hero-actions">
            <a className="s-btn s-btn-lg" href={to('/start')}>
              はじめる
            </a>
            <a className="s-btn s-btn-lg s-btn-tonal" href={to('/foundations/layers')}>
              設計思想を読む
            </a>
          </div>
        </div>
        <LayerStack />
      </section>

      <Stats
        items={[
          { value: meta.items, label: '列挙した振る舞い' },
          { value: meta.tests, label: '自動テスト' },
          { value: `${String(Math.round((proven / meta.items) * 100))}%`, label: 'テストで証明済みの振る舞い' },
          { value: 0, label: '自前のフォーカストラップ' },
        ]}
      />

      <Section
        id="promises"
        title="ほかのライブラリが解いていない 4 つ"
        intro="層 1（top layer・フォーカス・Esc）はブラウザがもう解いている。gassan が時間を使うのは、その上の設計の仕事である。"
      >
        <ul className="s-cards s-cards-2">
          {PROMISES.map((promise) => (
            <li key={promise.title} className="s-card">
              <div className="s-card-visual" aria-hidden="true">
                <MockScreen scrim={0.12}>{promise.visual}</MockScreen>
              </div>
              <h3>
                <a href={to(promise.href)} className="s-card-link">
                  {promise.title}
                </a>
              </h3>
              <p>{promise.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="kinds"
        title="5 つの類型から選ぶ"
        intro="kind を 1 つ決めると、スクリムの濃さ・Esc と背景クリックの可否・配置の既定が決まる。複数に当てはまるなら、それは分割すべき 2 つのモーダルである。ボタンを押すと本物が開く。"
      >
        <ul className="s-kinds">
          {KIND_DEMOS.map(({ kind, label, use, Demo }) => {
            const defaults = KIND_DEFAULTS[kind];
            return (
              <li key={kind} className="s-kind">
                <p className="s-kind-name">
                  <code>{kind}</code>
                  <span>{label}</span>
                </p>
                <p className="s-kind-use">{use}</p>
                <dl className="s-kind-defaults">
                  <div>
                    <dt>スクリム</dt>
                    <dd>{defaults.scrim}</dd>
                  </div>
                  <div>
                    <dt>Esc</dt>
                    <dd>{yesNo(defaults.dismiss.esc)}</dd>
                  </div>
                  <div>
                    <dt>背景</dt>
                    <dd>{yesNo(defaults.dismiss.backdrop)}</dd>
                  </div>
                </dl>
                <div className="s-kind-demo">
                  <Demo />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="s-more">
          <a href={to('/foundations/kinds')}>類型の決め方と意思決定マトリクス →</a>
        </p>
      </Section>

      <Section
        id="verified"
        title="主張ではなく、検査結果として"
        intro={`仕様書の ${String(meta.items)} 項目は、1 件残らずテスト名・CSS・ロードマップのどれかに結び付いている。存在しないテスト名を根拠に書くと CI が落ちる。`}
      >
        <div className="s-status-bar" role="img" aria-label={byStatus.map((e) => `${e.status} ${String(e.count)} 項目`).join('、')}>
          {byStatus.map((entry) => (
            <span
              key={entry.status}
              className="s-status-seg"
              data-status={entry.status}
              style={{ flexGrow: entry.count }}
            />
          ))}
        </div>
        <ul className="s-status-legend">
          {byStatus.map((entry) => (
            <li key={entry.status}>
              <StatusBadge status={entry.status} /> {entry.count} 項目
            </li>
          ))}
        </ul>
        <div className="s-home-links">
          <a className="s-btn s-btn-tonal" href={to('/spec')}>
            {meta.items} 項目の振る舞い仕様を見る
          </a>
          <a className="s-btn s-btn-text" href={to('/verification')}>
            何を検証し、何を検証していないか →
          </a>
        </div>
      </Section>

      <Section id="install" title="入れる">
        <CodeBlock code={`npm install github:hiroki-abe-58/gassan`} lang="bash" caption="インストール（npm 公開前のため GitHub から）" />
        <p className="s-more">
          <a href={to('/start')}>最小の例とブラウザ要件 →</a>
        </p>
      </Section>
    </div>
  );
}
