import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import Playground from '../../demos/Playground';
import playgroundSource from '../../demos/Playground.tsx?raw';
import KindForm from '../../demos/KindForm';
import formSource from '../../demos/KindForm.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const REASONS: readonly { reason: string; from: string; refuse: string }[] = [
  { reason: 'esc', from: 'Esc キー。ネイティブの cancel を必ず止め、ここに合流させる', refuse: 'dismiss.esc / onRequestClose' },
  { reason: 'backdrop', from: 'スクリムの押下。押した点と離した点の両方がスクリム上のときだけ', refuse: 'dismiss.backdrop / onRequestClose' },
  { reason: 'close-button', from: 'Modal.Close、または closeOnClick="close-button" のボタン', refuse: 'onRequestClose' },
  { reason: 'back-button', from: 'closeOnBack のときのブラウザバック（最前面の 1 枚だけが応答）', refuse: 'onRequestClose' },
  { reason: 'submit', from: 'closeOnClick="submit" のボタン、または <form method="dialog">', refuse: 'onRequestClose（ボタン経由のとき）' },
  { reason: 'programmatic', from: '外部から dialog.close() が呼ばれた', refuse: '—（既に閉じている。後始末だけ行う）' },
  { reason: 'swipe', from: 'シートの下フリック（swipeToDismiss）', refuse: 'dismiss.backdrop / onRequestClose' },
  { reason: 'route-change', from: 'routeKey が変わった（Next.js なら usePathname() を渡す）', refuse: 'onRequestClose' },
];

export function RootPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/root"
      rest={rest}
      title="Modal.Root"
      lead="層 1〜3 を受け持つ器。<dialog> と showModal() に top layer・フォーカス・Esc を任せ、スクリム・パネル・ライブリージョンを置き、閉じる要求を理由つきで 1 本の経路に集める。"
      ids={['L-03', 'L-08', 'L-09', 'L-10', 'D-02']}
      overview={() => (
        <>
          <Section id="playground" title="kind で決まること" intro="kind・size・placement・scrim を変えて開く。閉じない設定のとき、Esc や背景を押すと揺れて理由が読み上げられる。">
            <Example title="Modal.Root のプレイグラウンド" code={playgroundSource}>
              <Playground />
            </Example>
          </Section>

          <Section id="reasons" title="閉じる理由" intro="onOpenChange(false, reason) は必ず理由を伴う。「Esc で閉じたときだけ下書きを保存する」のような分岐が書ける。">
            <div className="s-table-wrap" role="group" tabIndex={0} aria-label="閉じる理由の一覧">
              <table className="s-table">
                <caption className="s-sr-only">CloseReason の 8 種</caption>
                <thead>
                  <tr>
                    <th scope="col">reason</th>
                    <th scope="col">発生源</th>
                    <th scope="col">拒否できる経路</th>
                  </tr>
                </thead>
                <tbody>
                  {REASONS.map((row) => (
                    <tr key={row.reason}>
                      <th scope="row">
                        <code>{row.reason}</code>
                      </th>
                      <td>{row.from}</td>
                      <td>{row.refuse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="guard" title="引き止める" intro="onRequestClose が false（または false に解決する Promise）を返すと閉じない。拒否したときは無言にせず、揺らして理由を読み上げる。">
            <Example title="書きかけのフォームを引き止める" description="何か入力してから Esc か × を押す。確認がもう 1 枚上に重なる。" code={formSource}>
              <KindForm />
            </Example>
          </Section>

          <Section id="mount" title="常時マウントと後始末">
            <Prose>
              <p>
                モーダルは常に描いておき、<code>open</code> で開閉する。閉じる要求を受けると <code>data-exiting</code> を付けて退出を描き、
                <code>--g-dur-out</code> 待ってから <code>close()</code> する。中身のリセット（<code>resetOnClose</code>）・フォーカスの復帰・
                スクロールロックの解除・<code>onExited</code> は、すべて <code>close()</code> の後に行う。
              </p>
            </Prose>
            <Callout>
              入れ子もできる（L-11）。内側の Esc や Cmd/Ctrl + Enter が外側まで届かないよう、イベントは「最も近い dialog が自分のときだけ」通している。
              2 枚重ねてもスクリムは 1 枚ぶんの濃さのまま（L-12）。
            </Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalRootProps" title="Modal.Root" />
          <ApiTable name="DismissPolicy" />
        </>
      )}
      a11y={() => (
        <>
          <Prose>
            <p>
              フォーカスの閉じ込め・背景の inert 化・Esc・フォーカスの復帰は <code>showModal()</code> が行う。
              Root が自分で持つのは、名前の配線、ライブリージョン 1 つ、初期フォーカスの置き場所、閉じる経路の一本化である。
            </p>
          </Prose>
          <SpecTable
            ids={['L-01', 'L-02', 'L-08', 'L-09', 'L-10', 'L-12', 'A-01', 'A-03', 'A-05', 'K-03', 'K-04', 'K-06', 'S-08', 'S-10']}
            caption="Modal.Root が満たす仕様"
          />
        </>
      )}
    />
  );
}
