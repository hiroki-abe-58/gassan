import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import FooterButtons from '../../demos/FooterButtons';
import footerSource from '../../demos/FooterButtons.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function FooterPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/footer"
      rest={rest}
      title="Footer と Button"
      lead="フッタのボタンは 3 階層まで。DOM 順 = 視覚順 = Tab 順で書き、二重送信は原理的に起きないようにする。"
      ids={['F-01', 'F-02', 'F-06', 'F-07', 'F-08']}
      overview={() => (
        <>
          <Section id="hierarchy" title="ボタンの階層" intro="primary・secondary・tertiary を 1 つずつ。弱い順に書けば、最初の tertiary だけが左へ離れる。">
            <Example
              title="記事を公開する"
              description="「公開する」を連打しても 1 回しか走らない。⌘ / Ctrl + Enter でも primary が押せる。"
              code={footerSource}
            >
              <FooterButtons />
            </Example>
          </Section>

          <Section id="loading" title="処理中">
            <Prose>
              <p>
                <code>onAction</code> が Promise を返すと、解決するまでボタンは処理中になる。そのあいだのクリックは握りつぶすので、
                二重送信は原理的に起きない。外から <code>loading</code> を渡しても、内部の処理中とは<strong>論理和</strong>で合成する。
                <code>loading={'{false}'}</code> は「自分の都合では処理中ではない」であって、「onAction の最中でも押させてよい」ではないからだ（F-08）。
              </p>
              <p>
                処理中のラベルは <code>opacity: 0</code> で隠してスピナーを重ねる。<code>visibility: hidden</code> にすると名前ごと消え、
                「名前のないボタン」になる（F-07 / §10-4）。幅も変わらない。
              </p>
            </Prose>
            <Callout>
              <code>onAction</code> が reject しても処理中は必ず解ける。押せないまま固まるボタンは作らない。
            </Callout>
          </Section>

          <Section id="danger" title="破壊的な操作">
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
                <code>variant="danger"</code> は primary の位置のまま、色だけを変える。
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
                        { label: 'やめる', variant: 'tertiary' },
                        { label: '削除する', variant: 'danger' },
                      ]}
                    >
                      <span className="s-mock-focusring" data-on="danger" />
                    </MockPanel>
                  </MockScreen>
                }
              >
                破壊的なボタンに初期フォーカスを当てない。Enter 一回で取り返しがつかなくなる（K-05）。
              </Guideline>
            </Guidelines>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalFooterProps" title="Modal.Footer" />
          <ApiTable name="ModalButtonProps" title="Modal.Button" />
        </>
      )}
      a11y={() => (
        <SpecTable
          ids={['F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06', 'F-07', 'F-08', 'F-09', 'F-10', 'F-11', 'F-12', 'K-05']}
          caption="フッタとボタンが満たす仕様"
        />
      )}
    />
  );
}
