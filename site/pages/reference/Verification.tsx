import type { ReactNode } from 'react';

import { allItems, data, repoFile } from '../../data';
import { to } from '../../router';
import { inline } from '../../ui/Markdown';
import { Callout, PageHeader, Prose, Section, Stats } from '../../ui/Page';
import { STATUS_ORDER, StatusBadge } from '../../ui/Spec';

const PIPELINE: readonly { command: string; catches: string }[] = [
  { command: 'tsc --noEmit', catches: '型の食い違い' },
  { command: 'eslint .', catches: '静的に分かる書き間違い' },
  { command: 'vitest run', catches: 'アクセシブルネーム、ゲートの論理和、閉じる理由の分類、色のコントラスト比' },
  { command: 'check:trace', catches: '仕様の項目と根拠の欠落・余剰、存在しないテスト名の引用、文書に書いた件数のずれ' },
  { command: 'check:docs', catches: 'README と docs のコード例が、公開 API でコンパイルできないこと' },
  { command: 'tsup', catches: 'ESM / CJS / 型の生成の失敗' },
  { command: 'check:dist', catches: '"use client" の消失、公開 API の欠落、サイズ予算の超過' },
  { command: 'check:ssr', catches: 'レンダー中の window 参照（Next.js App Router で落ちる）、SSR 時点のゲートの fail-open' },
  { command: 'check:pack', catches: 'npm に載る形の事故（LICENSE 欠落、types 条件の取り違え、同梱文書のリンク切れ）' },
];

export function Verification(): ReactNode {
  const { meta, browserChecks } = data;
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    count: allItems.filter((i) => i.status === status).length,
  })).filter((e) => e.count > 0);
  const proven = byStatus.find((e) => e.status === '実装')?.count ?? 0;
  const weakMust = allItems.filter((i) => i.priority === 'M' && (i.status === '記述' || i.status === '未検証'));

  return (
    <>
      <PageHeader
        eyebrow="仕様と検証"
        title="検証"
        lead="「テストが緑である」ことと「保証されている」ことは別物である。何をどの層で検証し、何をまだ検証できていないかを分けて書く。"
      />

      <Stats
        items={[
          { value: meta.tests, label: `テスト（${String(meta.testFiles)} ファイル）` },
          { value: meta.items, label: '振る舞いの項目' },
          { value: proven, label: 'テストで証明済みの項目' },
          { value: browserChecks.length, label: '実機でしか確かめられない項目' },
        ]}
      />

      <Section id="pipeline" title="npm run verify" intro="上から順に走り、1 つでも落ちたら止まる。下の段ほど、上の段では原理的に見つからない事故を捕まえる。">
        <ol className="s-pipeline">
          {PIPELINE.map((step) => (
            <li key={step.command}>
              <code>{step.command}</code>
              <span>{step.catches}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="status" title="項目の状態" intro={`${String(meta.items)} 項目それぞれが、どの強さで保証されているか。`}>
        <ul className="s-status-legend s-status-legend-lg">
          {byStatus.map((e) => (
            <li key={e.status}>
              <StatusBadge status={e.status} /> {e.count} 項目
            </li>
          ))}
        </ul>
        {weakMust.length > 0 ? (
          <Callout tone="warn">
            <p>
              必須（M）なのに「記述」の項目が {weakMust.length} 件ある。値は機械検証しているが、描画結果は実ブラウザでしか確かめられない。
              これがこのライブラリの現在の弱点で、隠さずに出す。
            </p>
            <p className="s-idlist">
              {weakMust.map((i) => (
                <a key={i.id} className="s-idref" href={to(`/spec/${i.id}`)}>
                  {i.id}
                </a>
              ))}
            </p>
          </Callout>
        ) : null}
      </Section>

      <Section
        id="device"
        title="jsdom では検証できないもの"
        intro="top layer・退出アニメ・スクリムの濃さのように、描画しないと真偽が決まらない項目。examples/css-check.html を実機で開くと、同じ項目がチェックボックスになっている。"
      >
        <div className="s-table-wrap" role="group" tabIndex={0} aria-label="実機の検品票">
          <table className="s-table">
            <caption className="s-sr-only">実機の検品票</caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">項目</th>
                <th scope="col">確認方法</th>
                <th scope="col">落ちていたら</th>
              </tr>
            </thead>
            <tbody>
              {browserChecks.map((check) => (
                <tr key={check.id}>
                  <th scope="row" className="s-nowrap">
                    {check.id}
                  </th>
                  <td>{inline(check.item, `${check.id}-i`)}</td>
                  <td>{inline(check.how, `${check.id}-h`)}</td>
                  <td>{inline(check.diagnosis, `${check.id}-d`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Prose>
          <p>
            この {browserChecks.length} 項目は、まだ実機で消化していない（ROADMAP v0.2.0）。実ブラウザでの自動検査（Playwright + axe）は v0.4.0 で入れる。
            詳しくは{' '}
            <a href={repoFile('VERIFICATION.md')} target="_blank" rel="noreferrer">
              VERIFICATION.md
            </a>{' '}
            と{' '}
            <a href={repoFile('ROADMAP.md')} target="_blank" rel="noreferrer">
              ROADMAP.md
            </a>
            。
          </p>
        </Prose>
      </Section>
    </>
  );
}
