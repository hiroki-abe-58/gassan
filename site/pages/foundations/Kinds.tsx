import type { ReactNode } from 'react';

import { data } from '../../data';
import KindConfirm from '../../demos/KindConfirm';
import confirmSource from '../../demos/KindConfirm.tsx?raw';
import KindConsent from '../../demos/KindConsent';
import consentSource from '../../demos/KindConsent.tsx?raw';
import KindFlow from '../../demos/KindFlow';
import flowSource from '../../demos/KindFlow.tsx?raw';
import KindForm from '../../demos/KindForm';
import formSource from '../../demos/KindForm.tsx?raw';
import KindView from '../../demos/KindView';
import viewSource from '../../demos/KindView.tsx?raw';
import { to } from '../../router';
import { CodeBlock } from '../../ui/Code';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { MdTable } from '../../ui/Markdown';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';

export function Kinds(): ReactNode {
  const kinds = data.tables['2'];
  const placement = data.tables['3-2'];
  const dismiss = data.tables['3-3'];
  const footer = data.code['3-4#0'];
  const gates = data.tables['3-5'];

  return (
    <>
      <PageHeader
        eyebrow="設計思想"
        title="5 つの類型と決め方"
        lead="作る前に、これから作るものがどれかを 1 つ選ぶ。型が決まれば、スクリム・配置・閉じ方・フッタの順序は意思決定マトリクスで自動的に決まる。"
        ids={['S-01', 'M-01', 'L-09', 'L-10', 'F-02']}
      />

      {kinds ? (
        <Section id="kinds" title="5 つの類型" intro="複数に当てはまるなら、それは分割すべき 2 つのモーダルである。">
          <MdTable table={kinds} caption="モーダルの 5 類型" />
        </Section>
      ) : null}

      <Section id="live" title="動かしてみる" intro="どれも本物の gassan。閉じない設定の類型で Esc や背景を押すと、パネルが揺れて理由が読み上げられる。">
        <div className="s-example-grid">
          <Example title="confirm — 確認" description="小さく、中央に。Esc でも背景でも閉じられる。" code={confirmSource}>
            <KindConfirm />
          </Example>
          <Example title="form — 入力" description="背景クリックでは閉じない。書きかけなら引き止める。" code={formSource}>
            <KindForm />
          </Example>
          <Example title="view — 閲覧" description="immersive スクリムのライトボックス。矢印キーで送れる。" code={viewSource}>
            <KindView />
          </Example>
          <Example title="consent — 同意" description="読了と同意が揃うまで primary は押せない。押せば理由が返る。" code={consentSource}>
            <KindConsent />
          </Example>
          <Example title="flow — フロー" description="戻る・現在地・閉じるの 3 スロット。" code={flowSource}>
            <KindFlow />
          </Example>
        </div>
      </Section>

      <Section id="scrim" title="スクリム">
        <Prose>
          <p>
            既定は黒 32%・blur なし。60〜80% の黒は背後の文脈を殺し、モーダル唯一の優位性を自ら捨てる。
            意図別の 4 段階と、blur を許す条件は <a href={to('/styles/scrim')}>スクリム</a> のページにまとめた。
          </p>
        </Prose>
      </Section>

      {placement ? (
        <Section id="placement" title="配置">
          <MdTable table={placement} caption="配置の条件" />
          <Callout>
            <code>placement="auto"</code> は JS（matchMedia）で <code>center</code> か <code>sheet</code> に解決してから DOM に流す。
            CSS のメディアクエリで分岐させると、配置ごとの <code>@starting-style</code> を二重に持つことになり、必ず片方が腐る。
          </Callout>
        </Section>
      ) : null}

      {dismiss ? (
        <Section id="dismiss" title="閉じ方の可否" intro="○ は閉じる、✕ は閉じない、△ は条件付き（未保存の確認を挟むなど）。">
          <MdTable table={dismiss} caption="類型ごとの閉じ方" align={[undefined, 'center', 'center', 'center']} />
          <Guidelines>
            <Guideline
              tone="do"
              visual={
                <MockScreen>
                  <MockPanel title="利用規約の更新" lines={2} width={60}>
                    <span className="s-mock-note">このダイアログはまだ閉じられません</span>
                  </MockPanel>
                </MockScreen>
              }
            >
              閉じない設定でも、Esc や背景クリックは「閉じたい」という明確な意思表示として受け取る。パネルを揺らし、理由を
              <code>role="status"</code> で読み上げる（L-10）。
            </Guideline>
            <Guideline
              tone="dont"
              visual={
                <MockScreen>
                  <MockPanel title="利用規約の更新" lines={2} width={60} />
                </MockScreen>
              }
            >
              無言で無視しない。何も起きなければ、利用者は壊れていると判断する。
            </Guideline>
          </Guidelines>
        </Section>
      ) : null}

      {footer ? (
        <Section id="footer" title="フッタのボタン順序" intro="DOM 順 = 視覚順 = Tab 順 = 読み上げ順。狭い画面でも反転させない。">
          <CodeBlock code={footer.text} lang="text" caption="modal.skill.md §3-4" />
          <Guidelines>
            <Guideline
              tone="do"
              visual={
                <MockScreen>
                  <MockPanel
                    title="記事を公開する"
                    lines={1}
                    width={46}
                    stack
                    buttons={[
                      { label: 'キャンセル', variant: 'tertiary' },
                      { label: '下書き保存', variant: 'secondary' },
                      { label: '公開する', variant: 'primary' },
                    ]}
                  />
                </MockScreen>
              }
            >
              狭幅では DOM 順のまま縦に積む。primary を上に置きたいなら、CSS ではなく DOM の順序そのものを変える。
            </Guideline>
            <Guideline
              tone="dont"
              visual={
                <MockScreen>
                  <MockPanel
                    title="記事を公開する"
                    lines={1}
                    width={46}
                    stack
                    buttons={[
                      { label: '公開する', variant: 'primary' },
                      { label: '下書き保存', variant: 'secondary' },
                      { label: 'キャンセル', variant: 'tertiary' },
                    ]}
                  />
                </MockScreen>
              }
            >
              <code>column-reverse</code> や <code>order</code> で見た目だけ入れ替えない。Tab と読み上げの順が視覚と逆になる（WCAG 1.3.2 / 2.4.3）。
            </Guideline>
          </Guidelines>
          <Guidelines>
            <Guideline
              tone="do"
              visual={
                <MockScreen>
                  <MockPanel
                    title="プロジェクトを削除"
                    lines={1}
                    width={70}
                    buttons={[
                      { label: 'やめる', variant: 'tertiary' },
                      { label: '削除する', variant: 'danger' },
                    ]}
                  />
                </MockScreen>
              }
            >
              破壊的な操作は、位置はいつもの primary のまま、色だけ danger にする（F-06）。
            </Guideline>
            <Guideline
              tone="dont"
              visual={
                <MockScreen>
                  <MockPanel
                    title="プロジェクトを削除"
                    lines={1}
                    width={70}
                    buttons={[
                      { label: '削除する', variant: 'danger' },
                      { label: 'やめる', variant: 'primary' },
                    ]}
                  />
                </MockScreen>
              }
            >
              色と位置を同時に変えない。筋肉記憶が外れて、かえって誤操作を生む。
            </Guideline>
          </Guidelines>
        </Section>
      ) : null}

      {gates ? (
        <Section id="gates" title="活性化ゲートの選び方" intro="押せない状態を作ってよい条件は限られている。時間で待たせるのと、スクロール位置だけで判定するのは禁止。">
          <MdTable table={gates} caption="ゲートに使ってよい条件" />
          <p className="s-more">
            <a href={to('/components/gate')}>活性化ゲートの使い方 →</a>
          </p>
        </Section>
      ) : null}
    </>
  );
}
