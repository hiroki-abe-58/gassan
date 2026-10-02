import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ChartReport from '../../demos/ChartReport';
import chartSource from '../../demos/ChartReport.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function ChartPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/chart"
      rest={rest}
      title="Modal.Chart"
      lead="グラフの器。描画はしない。持ち込んだ図に、名前と傾向の要約と元データの開閉を配線する。canvas 単体は、読み上げでは情報ゼロだからだ。"
      ids={['B-14']}
      overview={() => (
        <>
          <Section id="report" title="名前・要約・元データ" intro="label と summary は必須。図そのものは既定で aria-hidden になり、要約と元データが唯一の経路になる。">
            <Example title="月次レポート" description="「元データを表示」を開くと、同じ数値が表で読める。" code={chartSource}>
              <ChartReport />
            </Example>
          </Section>

          <Section id="why" title="なぜ描かないのか">
            <Prose>
              <p>
                描画ライブラリは選択肢が多く、用途によって最適解が違う。gassan が持つと、どれかを選んだ瞬間に残りの利用者を裏切ることになる。
                だから図は SVG でも canvas でも、任意のライブラリでもよい。gassan が引き受けるのは、どの図にも共通して欠けがちな
                「名前」「傾向のテキスト代替」「元データへの到達」の 3 つだけである。
              </p>
              <p>
                図自体がキーボードで辿れるなど、それだけでアクセシブルなら <code>visualAccessible</code> で <code>aria-hidden</code> を外せる。
              </p>
            </Prose>
            <Guidelines>
              <Guideline
                tone="do"
                visual={
                  <MockScreen>
                    <MockPanel title="月別の売上（万円）" lines={0} width={70}>
                      <span className="s-mock-bars">
                        <i style={{ height: '40%' }} />
                        <i style={{ height: '62%' }} />
                        <i style={{ height: '92%' }} />
                        <i style={{ height: '80%' }} />
                        <i style={{ height: '78%' }} />
                      </span>
                      <span className="s-mock-note">3月が最大の120万円。4月以降は横ばい。</span>
                      <span className="s-mock-disclosure">元データを表示</span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                図には名前と傾向の要約を添え、元データは表で開けるようにする。
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel lines={0} width={70}>
                      <span className="s-mock-bars">
                        <i style={{ height: '40%' }} />
                        <i style={{ height: '62%' }} />
                        <i style={{ height: '92%' }} />
                        <i style={{ height: '80%' }} />
                        <i style={{ height: '78%' }} />
                      </span>
                    </MockPanel>
                  </MockScreen>
                }
              >
                canvas や SVG を置いただけにしない。見えない人には「何もない」のと同じになる。
              </Guideline>
            </Guidelines>
          </Section>
        </>
      )}
      api={() => <ApiTable name="ModalChartProps" title="Modal.Chart" />}
      a11y={() => <SpecTable ids={['B-14', 'B-13', 'A-06']} caption="Modal.Chart が満たす仕様" />}
    />
  );
}
