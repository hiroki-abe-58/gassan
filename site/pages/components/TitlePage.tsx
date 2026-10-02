import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import TitleClamp from '../../demos/TitleClamp';
import titleSource from '../../demos/TitleClamp.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function TitlePage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/title"
      rest={rest}
      title="Title と Description"
      lead="ダイアログの名前と説明。名前は h2 の内側の span へ、説明は aria-describedby へ、自動で配線される。省略は CSS だけで行い、名前は欠けない。"
      ids={['T-01', 'T-03', 'T-04', 'T-08', 'A-02']}
      overview={() => (
        <>
          <Section id="clamp" title="長いタイトル" intro="既定は 2 行で省略。溢れているときだけ「全文を表示」のトグルが出る。">
            <Example title="長いタイトルの省略" description="省略されていても、スクリーンリーダーには全文が読まれる。" code={titleSource}>
              <TitleClamp />
            </Example>
          </Section>

          <Section id="why" title="なぜ CSS だけで省略するのか">
            <Prose>
              <p>
                文字列を JS で切ると、DOM のテキストそのものが欠ける。<code>aria-labelledby</code> が指す名前も一緒に欠け、
                スクリーンリーダーの利用者は「第3四半期 東北エリア 店舗別売…」というダイアログに入ることになる。
                <code>line-clamp</code> は見た目だけを切るので、名前は常に完全なまま残る。
              </p>
            </Prose>
            <Guidelines>
              <Guideline
                tone="do"
                visual={
                  <MockScreen>
                    <MockPanel
                      width={64}
                      lines={2}
                      title={
                        <>
                          <span className="s-mock-clamp">第3四半期 東北エリア 店舗別売上レポートの共有設定を変更する</span>
                          <span className="s-mock-toggle">全文を表示</span>
                        </>
                      }
                    />
                  </MockScreen>
                }
              >
                押して開く明示的なボタンで全文を見せる。<code>aria-expanded</code> と <code>aria-controls</code> を持つ（T-08）。
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel width={64} lines={2} title="第3四半期 東北エリア 店舗別売…">
                      <span className="s-mock-tooltip">長押しで全文</span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                hover・<code>title</code> 属性・長押しに頼らない。タッチで出ず、OS のコンテキストメニューとも衝突する（T-05 / T-06）。
              </Guideline>
            </Guidelines>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalTitleProps" title="Modal.Title" />
          <ApiTable name="ModalDescriptionProps" title="Modal.Description" />
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07', 'T-08', 'T-09', 'A-01', 'A-02', 'A-08']}
          caption="タイトルと説明が満たす仕様"
        />
      )}
    />
  );
}
