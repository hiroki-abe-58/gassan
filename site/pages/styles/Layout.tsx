import type { CSSProperties, ReactNode } from 'react';

import { data } from '../../data';
import { token } from '../../data/tokens';
import { CodeBlock } from '../../ui/Code';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const SIZES = ['sm', 'md', 'lg', 'xl'] as const;

const PLACEMENTS: readonly { name: string; when: string; align: 'center' | 'top' | 'bottom' }[] = [
  { name: 'center', when: 'デスクトップの既定', align: 'center' },
  { name: 'top', when: '内容の高さが大きく変わるとき。中央寄せだと高さの変化で上下に暴れる', align: 'top' },
  { name: 'sheet', when: '幅 600px 未満の既定。片手で届く場所に primary を置ける', align: 'bottom' },
];

export function Layout(): ReactNode {
  const max = Number.parseFloat(token('--g-size-xl').light);
  const containerIds = data.categories.find((c) => c.letter === 'C')?.items.map((i) => i.id) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="スタイル"
        title="寸法と配置"
        lead="幅はトークンで、高さは CSS Grid と dvh で決める。JS で高さを計算しない。スクロールするのは本文だけ。"
        ids={['C-01', 'C-02', 'C-03', 'C-05', 'M-09']}
      />

      <Section id="size" title="幅のトークン" intro="パネルの幅は min(100%, トークン)。狭い画面ではみ出さず、広い画面では読みやすい行長に収まる。">
        <ul className="s-size-bars">
          {SIZES.map((size) => {
            const value = token(`--g-size-${size}`).light;
            return (
              <li key={size}>
                <code>{size}</code>
                <span className="s-size-track" aria-hidden="true">
                  <span className="s-size-fill" style={{ '--s-size': Number.parseFloat(value) / max } as CSSProperties} />
                </span>
                <span className="s-num">{value}</span>
              </li>
            );
          })}
          <li>
            <code>full</code>
            <span className="s-size-track" aria-hidden="true">
              <span className="s-size-fill" data-full="" />
            </span>
            <span className="s-num">100%</span>
          </li>
        </ul>
      </Section>

      <Section id="placement" title="配置" intro="placement=&quot;auto&quot; は JS で center か sheet に解決してから DOM に流す。">
        <ul className="s-placements">
          {PLACEMENTS.map((p) => (
            <li key={p.name}>
              <div className="s-placement-visual" aria-hidden="true">
                <MockScreen align={p.align}>
                  <MockPanel title="経路" lines={2} width={p.name === 'sheet' ? 100 : 58} sheet={p.name === 'sheet'} />
                </MockScreen>
              </div>
              <p>
                <code>{p.name}</code>
              </p>
              <p className="s-placement-when">{p.when}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="grid" title="パネルの格子" intro="ヘッダ・本文・フッタの 3 行。本文の行が minmax(0, 1fr) でないと、本文が縮まずスクロールしない。">
        <CodeBlock
          lang="css"
          code={`.g-panel {\n  inline-size: min(100%, var(--g-panel-max));\n  max-block-size: 100%;           /* 100vh は使わない */\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n}\n.g-header { grid-row: 1; }\n.g-body   { grid-row: 2; overflow: auto; overscroll-behavior: contain; }\n.g-footer { grid-row: 3; }`}
          caption="考え方（実際の規則は src/styles.css）"
        />
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel title="更新履歴" lines={6} width={60} buttons={[{ label: '閉じる', variant: 'primary' }]}>
                  <span className="s-mock-scrollbar" />
                </MockPanel>
              </MockScreen>
            }
          >
            スクロールするのは本文だけ。ヘッダとフッタは常に見えている（B-01 / H-10）。
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen align="top">
                <MockPanel lines={9} width={60}>
                  <span className="s-mock-cut">タイトルが画面の上に切れている</span>
                </MockPanel>
              </MockScreen>
            }
          >
            <code>max-h-[90vh]</code> や <code>1fr</code> 単体で済ませない。モバイルのアドレスバーで高さが破綻し、中央寄せで上端が切れる。
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="touch" title="触れる大きさ">
        <Prose>
          <p>
            ボタンとアイコンボタンの的は <code>{token('--g-tap').light}</code>。WCAG 2.5.8 の最低は 24px だが、Apple HIG の 44px を採る。
            「戻る」と「×」のあいだは 8px 以上空ける。この 2 つの押し間違いが、いちばん高くつく事故だからである（H-03 / H-04）。
          </p>
        </Prose>
        <Callout>
          セーフエリアは必ず <code>max()</code> で包む。<code>env(safe-area-inset-bottom)</code> が 0 の端末で余白が消えないように（C-04 / F-12）。
        </Callout>
      </Section>

      <Section id="spec" title="コンテナの項目">
        <SpecTable ids={containerIds} caption="コンテナの仕様" />
      </Section>
    </>
  );
}
