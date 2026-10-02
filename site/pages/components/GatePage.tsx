import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import GateCustom from '../../demos/GateCustom';
import gateSource from '../../demos/GateCustom.tsx?raw';
import KindConsent from '../../demos/KindConsent';
import consentSource from '../../demos/KindConsent.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const SELECTORS: readonly { code: string; before: string; meaning: string }[] = [
  { code: 'gate / gate={true}', before: '閉じる', meaning: '登録済みの全ゲートを見る。登録が出揃うまでは「まだ分からない」' },
  { code: "gate={['terms']}", before: '閉じる', meaning: '名前で指定する。未登録の名前は未充足として扱う' },
  { code: 'gate={[]}', before: '開く', meaning: '条件ゼロと確定している。待つ理由が無い' },
];

export function GatePage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/gate"
      rest={rest}
      title="活性化ゲート"
      lead="「最後まで読んだら」「チェックしたら」「3 つ選んだら」押せるボタンを、disabled を使わずに作る。押せば、何が足りないかを読み上げ、そこへ連れて行く。"
      ids={['G-01', 'G-02', 'G-03', 'G-07', 'G-08', 'G-12']}
      overview={() => (
        <>
          <Section id="consent" title="読了と同意" intro="Modal.Body の readGate と Modal.Consent が、それぞれ名前付きのゲートを登録する。gate を付けたボタンは、全部が満たされるまで押せない。">
            <Example title="利用規約の更新" description="読む前に「同意して続ける」を押してみる。理由が読み上げられ、本文へ 1 画面ぶん送られる。" code={consentSource}>
              <KindConsent />
            </Example>
          </Section>

          <Section id="custom" title="任意の条件" intro="Modal.Gate に satisfied と reason を渡せば、どんな条件でもゲートにできる。focus を渡すと、押されたときにそこへ連れて行く。">
            <Example title="3 つ以上選ぶ" code={gateSource}>
              <GateCustom />
            </Example>
          </Section>

          <Section id="selector" title="ボタンがどのゲートを見るか">
            <div className="s-table-wrap" role="group" tabIndex={0} aria-label="gate の書き方">
              <table className="s-table">
                <caption className="s-sr-only">gate の書き方と、登録前の状態</caption>
                <thead>
                  <tr>
                    <th scope="col">書き方</th>
                    <th scope="col">登録前</th>
                    <th scope="col">意味</th>
                  </tr>
                </thead>
                <tbody>
                  {SELECTORS.map((row) => (
                    <tr key={row.code}>
                      <th scope="row">
                        <code>{row.code}</code>
                      </th>
                      <td>{row.before}</td>
                      <td>{row.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Prose>
              <p>
                ゲートは子の effect で登録される。サーバーでは effect が走らず、クライアントでも最初のレンダーでは走っていない。
                その窓で登録簿は空になるが、それは「条件が無い」ではなく「まだ分からない」である。だから <code>gate</code> を付けたボタンは、
                サーバー側のマークアップでも <code>aria-disabled="true"</code> で出て、マウント後に実際の条件へ差し替わる。
                サーバーと初回レンダーが一致するので、hydration のずれも起きない（G-12）。
              </p>
            </Prose>
          </Section>

          <Section id="rules" title="ゲートにしてはいけない条件">
            <Callout tone="warn">
              「N 秒待ったら押せる」は作らない（WCAG 2.2.1）。「スクロール位置が末尾に来たら」だけで判定しない（仮想カーソルの利用者が永久に進めない）。
              押せない状態を作ってよいのは、フォームの妥当性・明示の同意・法的に必要な読了だけである。
            </Callout>
            <CodeBlock
              lang="tsx"
              caption="押されたときに起きること"
              code={`// 1. 理由を role="status" のライブリージョンで読み上げる（G-07）\n// 2. 詰まっている場所へ連れて行く（G-08）\n//    未読なら本文を 1 画面ぶん送る。末尾まで一気に送らない（ゲートの意味が消える）\n//    未チェックならチェックボックスへフォーカス\n// 3. onClick は呼ばない`}
            />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalGateProps" title="Modal.Gate" />
          <ApiTable name="ModalConsentProps" title="Modal.Consent" />
          <ApiTable name="ModalGateStatusProps" title="Modal.GateStatus" />
          <ApiTable name="GateEntry" />
        </>
      )}
      a11y={() => {
        const ids = ['G-01', 'G-02', 'G-03', 'G-04', 'G-05', 'G-06', 'G-07', 'G-08', 'G-09', 'G-10', 'G-11', 'G-12'];
        return <SpecTable ids={ids} caption="活性化ゲートの仕様" />;
      }}
    />
  );
}
