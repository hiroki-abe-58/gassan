import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import BodyScroll from '../../demos/BodyScroll';
import bodySource from '../../demos/BodyScroll.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function BodyPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/body"
      rest={rest}
      title="Body と Section"
      lead="モーダルの中で唯一のスクロール領域。キーボードでも読めるようにフォーカスでき、名前を持つ。読了ゲートもここに付ける。"
      ids={['B-01', 'B-02', 'B-03', 'B-07', 'G-03']}
      overview={() => (
        <>
          <Section id="scroll" title="スクロールは本文だけ" intro="ヘッダとフッタは固定。本文の端に届いていないあいだは、上下に影が出る。">
            <Example title="更新履歴" description="Tab で本文にフォーカスし、矢印キー・PageDown・Space でスクロールできる。" code={bodySource}>
              <BodyScroll />
            </Example>
          </Section>

          <Section id="focusable" title="フォーカスできるスクロール領域">
            <Prose>
              <p>
                Firefox 以外のブラウザは、スクロールできる要素を自動ではフォーカス可能にしない。マウスを持たない利用者は、
                本文にたどり着けないまま読むことができなくなる。gassan の本文は <code>tabIndex={'{0}'}</code> と
                <code>role="group"</code>、そしてアクセシブルネームを持つ。名前の無いフォーカス可能な要素は作らない（B-02 / B-03）。
              </p>
            </Prose>
            <Guidelines>
              <Guideline
                tone="do"
                visual={
                  <MockScreen>
                    <MockPanel title="更新履歴" lines={5} width={60}>
                      <span className="s-mock-focusring" />
                    </MockPanel>
                  </MockScreen>
                }
              >
                本文に Tab で入れて、キーで読める。名前は「更新履歴の本文」のように label で付ける。
              </Guideline>
              <Guideline
                tone="dont"
                visual={
                  <MockScreen>
                    <MockPanel title="更新履歴" lines={5} width={60}>
                      <span className="s-mock-scrollbar" />
                    </MockPanel>
                  </MockScreen>
                }
              >
                <code>{'<div className="overflow-y-auto">'}</code> だけで済ませない。キーボードの利用者には読めない領域になる。
              </Guideline>
            </Guidelines>
          </Section>

          <Section id="read-gate" title="読了ゲート">
            <Prose>
              <p>
                <code>readGate="read"</code> を渡すと、本文を読み終えたかどうかが名前付きのゲートとして登録される。
                判定は「末尾が見えた」「末尾にフォーカスが届いた」「そもそもスクロール不要」の論理和で、一度満たしたら取り消さない。
                閉じているあいだは寸法が 0 になるので判定しない（§10-1）。使い方は <a href="#/components/gate">活性化ゲート</a> にある。
              </p>
            </Prose>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalBodyProps" title="Modal.Body" />
          <ApiTable name="ModalSectionProps" title="Modal.Section" />
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'B-06', 'B-07', 'K-09', 'G-03', 'G-04', 'G-05', 'D-12']}
          caption="本文が満たす仕様"
        />
      )}
    />
  );
}
