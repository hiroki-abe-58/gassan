import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import KindFlow from '../../demos/KindFlow';
import flowSource from '../../demos/KindFlow.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function HeaderPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/header"
      rest={rest}
      title="Header と Controls"
      lead="ヘッダは grid の 1 行目に固定される。コントロールは「戻る・現在地・閉じる」の 3 スロットで、タイトルとは別の行に置く。"
      ids={['H-01', 'H-02', 'H-05', 'H-06', 'H-10']}
      overview={() => (
        <>
          <Section id="slots" title="3 つのスロット" intro="start に戻る、center に現在地、end に閉じる。戻るの有無で中央がずれないよう、格子は 1fr auto 1fr。">
            <Example title="注文手続き（3 ステップ）" description="「次へ」で進むと左に戻るが現れる。中央の「1 / 3」は位置を変えない。" code={flowSource}>
              <KindFlow />
            </Example>
          </Section>

          <Section id="title-row" title="タイトルはコントロールの行に置かない">
            <Guidelines>
              <Guideline
                tone="do"
                visual={
                  <MockScreen>
                    <MockPanel width={62} lines={2}>
                      <span className="s-mock-controls">
                        <i data-icon="back" />
                        <b>2 / 3</b>
                        <i data-icon="close" />
                      </span>
                      <span className="s-mock-title">ご注文の手続き — 支払い方法の選択</span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                コントロールとタイトルは別の行。タイトルが長くなっても、戻ると閉じるにぶつからない（H-05）。
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel width={62} lines={2}>
                      <span className="s-mock-controls" data-crowded="">
                        <i data-icon="back" />
                        <b>ご注文の手続き — 支払い方法…</b>
                        <i data-icon="close" />
                      </span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                タイトルを戻ると閉じるの間に挟まない。長文で必ず干渉し、押し間違いの距離も縮む。
              </Guideline>
            </Guidelines>
          </Section>

          <Section id="indicator" title="現在地の読み上げ">
            <Prose>
              <p>
                <code>Modal.Indicator</code> の「2 / 3」は見た目のためのもので、そのまま読むと「2 スラッシュ 3」になる。
                視覚用は <code>aria-hidden</code> にして、読み上げ用に「3 ステップ中 2 ステップ目」を別に持つ。ステップが変わったら知らせる（H-06）。
              </p>
              <p>
                アイコンだけのボタンには「戻る」「閉じる」の名前が付く（A-07）。文言は <code>GassanProvider</code> で差し替えられる。
              </p>
            </Prose>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalHeaderProps" title="Modal.Header" />
          <ApiTable name="ModalControlsProps" title="Modal.Controls" />
          <ApiTable name="ModalIconButtonProps" title="Modal.Back / Modal.Close" />
          <ApiTable name="ModalIndicatorProps" title="Modal.Indicator" />
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['H-01', 'H-02', 'H-03', 'H-04', 'H-05', 'H-06', 'H-07', 'H-08', 'H-10', 'A-06', 'A-07', 'K-08']}
          caption="ヘッダとコントロールが満たす仕様"
        />
      )}
    />
  );
}
