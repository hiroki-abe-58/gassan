import type { ReactNode } from 'react';

import { data } from '../../data';
import { CodeBlock } from '../../ui/Code';
import { LayerStack } from '../../ui/LayerStack';
import { MdTable } from '../../ui/Markdown';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';

export function Layers(): ReactNode {
  const premise = data.tables['1-3'];
  const coreCss = data.code['7#0'];
  const coreTsx = data.code['7#1'];

  return (
    <>
      <PageHeader
        eyebrow="設計思想"
        title="4 層モデル"
        lead="モーダルの実装は 4 つの層に分けられる。層を混ぜると必ず破綻する。gassan の設計はすべて、この分け方から出てくる。"
        ids={['L-01', 'L-02', 'K-01', 'D-01']}
      />

      <Section id="model" title="層と、それぞれの正解">
        <LayerStack detailed />
      </Section>

      <Section id="effort" title="労力の 9 割を、どこに使うか">
        <Callout>
          多くのモーダル実装が納得いかない原因は、層 1 と層 2 に労力の 9 割を使い、層 4 に 1 割しか使っていないこと。
          層 1 は既に解かれている。
        </Callout>
        <Prose>
          <p>
            <code>showModal()</code> を呼べば、top layer への昇格・背景の inert 化・フォーカスの閉じ込め・Esc・フォーカスの復帰は
            ブラウザが行う。gassan はこれを<strong>一行も再実装していない</strong>。再実装した瞬間に、このライブラリの存在理由が消えるからだ。
          </p>
          <p>
            空いた手で層 4 をやる。名前の配線、スクロール領域の名前、ゲートと理由の読み上げ、閉じる理由の分類、
            フッタの順序。ライブラリが解いてくれない、本当の設計の仕事である。
          </p>
        </Prose>
      </Section>

      {premise ? (
        <Section
          id="premise"
          title="前提が変わった"
          intro="AI の学習データには 2022 年以前のモーダル実装が大量に含まれている。次の 3 点で、その前提はもう古い。"
        >
          <MdTable table={premise} caption="旧来の前提と現在の前提" />
        </Section>
      ) : null}

      {coreCss && coreTsx ? (
        <Section id="core" title="実装の核" intro="退出アニメーションが成立する最小構成。CSS が主で、JS は「待ってから close() する」だけを担う。">
          <CodeBlock code={coreCss.text} lang="css" caption="modal.skill.md §7（CSS）" />
          <CodeBlock code={coreTsx.text} lang="tsx" caption="modal.skill.md §7（開閉の同期）" />
        </Section>
      ) : null}
    </>
  );
}
