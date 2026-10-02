import type { ReactNode } from 'react';

import { data } from '../../data';
import { scrimLevels, token } from '../../data/tokens';
import ScrimLevels from '../../demos/ScrimLevels';
import scrimSource from '../../demos/ScrimLevels.tsx?raw';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { inline, MdTable } from '../../ui/Markdown';
import { PageHeader, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function Scrim(): ReactNode {
  const levels = scrimLevels();
  const blur = Number.parseFloat(token('--g-scrim-blur-immersive').light);
  const table = data.tables['3-1'];
  const blurConditions = (data.code['3-1#0']?.text ?? '')
    .split('\n')
    .map((line) => /^□\s*(.+)$/.exec(line.trim())?.[1])
    .filter((line): line is string => Boolean(line));
  const scrimIds = data.categories.find((c) => c.letter === 'S')?.items.map((i) => i.id) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="スタイル"
        title="スクリム"
        lead="スクリムの仕事は「背後は今は触れない」と伝えること。背後を消すことではない。既定は黒 32%・blur なしで、意図に応じて 4 段階から選ぶ。"
        ids={['S-01', 'S-02', 'S-04', 'S-07']}
      />

      <Section id="levels" title="4 つの段階" intro="数値は src/styles.css のトークンから読んでいる。">
        <ul className="s-scrim-grid">
          {levels.map((level) => (
            <li key={level.token}>
              <figure className="s-scrim-sample">
                <div aria-hidden="true">
                  <MockScreen scrim={level.alpha} blur={level.token === 'immersive' ? blur / 3 : 0}>
                    <MockPanel title="下書きを削除しますか" lines={1} width={70} buttons={[{ label: '削除する', variant: 'danger' }]} />
                  </MockScreen>
                </div>
                <figcaption>
                  <code>{level.token}</code>
                  <span>
                    {Math.round(level.alpha * 100)}%{level.token === 'immersive' ? ` + blur ${String(blur)}px` : ''}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {table ? <MdTable table={table} caption="スクリムのトークンと使う場面" align={[undefined, 'right', 'right']} /> : null}
      </Section>

      <Section id="try" title="開いて比べる">
        <Example title="scrim の 4 段階" description="同じパネルを各段階のスクリムで開く。" code={scrimSource}>
          <ScrimLevels />
        </Example>
      </Section>

      <Section id="why" title="なぜ 60% ではないのか">
        <Prose>
          <p>
            32% は Material Design 3 の scrim 規定と一致する。60〜80% の黒は、背後の文脈——モーダルが他の手段より優れている唯一の点——を
            自分で消してしまう。誰を削除しようとしているのか、どの行の詳細を見ているのかが分からなくなる。
          </p>
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen scrim={0.32}>
                <MockPanel title="この行を削除しますか" lines={1} width={58} buttons={[{ label: '削除する', variant: 'danger' }]} />
              </MockScreen>
            }
          >
            既定の 32%。背後の一覧が読めるので、何に対する操作かを見失わない。
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen scrim={0.78}>
                <MockPanel title="この行を削除しますか" lines={1} width={58} buttons={[{ label: '削除する', variant: 'danger' }]} />
              </MockScreen>
            }
          >
            黒 60〜80% を既定にしない。文脈を保つというモーダル唯一の強みを捨てている（§5 の 9）。
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="blur" title="blur を使ってよいとき" intro="blur は明示 opt-in（immersive）だけ。次をすべて満たす場合に限る。">
        <ul className="s-checks">
          {blurConditions.map((line) => (
            <li key={line}>{inline(line)}</li>
          ))}
        </ul>
        <Prose>
          <p>
            blur を切るときの代替は「不透明度を上げる」。<code>prefers-reduced-transparency: reduce</code> では gassan が自動で blur を外し、
            そのぶん濃度を足す。ぼかしだけ消して 32% のままにすると、透明度を下げている人には何も伝わらない。
          </p>
        </Prose>
      </Section>

      <Section id="dark" title="ダークテーマ" intro="黒いスクリムは暗い UI の上では機能しない。暗い背景に暗い膜を重ねても、分離は生まれない。">
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <div className="s-dark-sample" data-variant="lift">
                <MockScreen scrim={0.32}>
                  <MockPanel title="設定を保存しますか" lines={1} width={60} buttons={[{ label: '保存', variant: 'primary' }]} />
                </MockScreen>
              </div>
            }
          >
            面を明るくし、境界線を 1px 引いて分離する（S-07）。
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <div className="s-dark-sample" data-variant="darken">
                <MockScreen scrim={0.72}>
                  <MockPanel title="設定を保存しますか" lines={1} width={60} buttons={[{ label: '保存', variant: 'primary' }]} />
                </MockScreen>
              </div>
            }
          >
            スクリムを濃くして分離しようとしない。暗さが増えるだけで、パネルの輪郭は出てこない。
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="spec" title="スクリムの項目">
        <SpecTable ids={scrimIds} caption="スクリムの仕様" />
      </Section>
    </>
  );
}
