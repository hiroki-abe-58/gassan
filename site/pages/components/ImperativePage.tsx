import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ImperativeConfirm from '../../demos/ImperativeConfirm';
import imperativeSource from '../../demos/ImperativeConfirm.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function ImperativePage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/imperative"
      rest={rest}
      title="命令的 API"
      lead="確認ダイアログを宣言的に書くと、open の state と結果の受け渡しで行数が膨らむ。useModals().confirm() は結果を Promise で返す。"
      ids={['D-03', 'L-14', 'L-15']}
      overview={() => (
        <>
          <Section id="confirm" title="await で受け取る" intro="同時に 2 つ呼んでも、1 枚ずつ順に出る。2 枚重なると、利用者はどちらに答えているのか分からなくなる。">
            <Example title="confirm()" code={imperativeSource}>
              <ImperativeConfirm />
            </Example>
          </Section>

          <Section id="host" title="ModalHost を 1 つだけ置く">
            <CodeBlock
              lang="tsx"
              caption="app.tsx"
              code={`export function App() {\n  return (\n    <>\n      <Routes />\n      <ModalHost />\n    </>\n  );\n}`}
            />
            <Prose>
              <p>
                <code>confirm()</code> の Promise は、描画先が無いと永久に解決しない。だから出口を 3 つ保証している（L-15）。
              </p>
              <ul>
                <li>ホストが無いまま待たされていたら警告する。判定は 1 ティック遅らせる（子の effect は親より先に走るので、正しい構成でも同期判定では誤報になる）。</li>
                <li>ホストが 2 つ以上あったら警告する。同じキューの先頭を各々が描き、1 つの回答が全部を解決してしまう。</li>
                <li>待機中にホストが消えたら警告する。黙って握りつぶすと「await が返らない」だけが残り、原因を辿れない。</li>
              </ul>
            </Prose>
            <Callout>
              確認の中身が単純なうちは命令的 API、ゲートや独自の本文が要るなら <code>Modal.Root</code> で宣言的に書く。
              <code>consent</code> を渡せば、同意のチェックが必須の確認になる。
            </Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalsApi" title="useModals()" />
          <ApiTable name="ConfirmOptions" />
        </>
      )}
      a11y={() => <SpecTable ids={['D-03', 'L-14', 'L-15', 'K-05', 'F-06']} caption="命令的 API が満たす仕様" />}
    />
  );
}
