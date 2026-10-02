import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import KindView from '../../demos/KindView';
import viewSource from '../../demos/KindView.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function MediaPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/media"
      rest={rest}
      title="Media と Gallery"
      lead="画像・動画・音声と、それを横に送るギャラリー。比率を先に確保して揺れを消し、自動再生はしない。ギャラリーは scroll-snap が実体で、ボタンとキーは位置を指示するだけ。"
      ids={['B-10', 'B-11', 'B-12', 'K-10']}
      overview={() => (
        <>
          <Section id="gallery" title="ギャラリー" intro="前後のボタン、矢印キー、Home / End、指のスクロール、どれで動かしても同じ位置を指す。位置は読み上げられる。">
            <Example title="稜線の習作" description="開いたら ← → で送る。タイトルの「n / 5」は onIndexChange で更新している。" code={viewSource}>
              <KindView />
            </Example>
          </Section>

          <Section id="media" title="メディアの既定">
            <Prose>
              <p>
                <code>ratio="16 / 9"</code> を渡すと、読み込み前から場所を確保する。読み込み後に高さが変わると、モーダルが飛び跳ねるからだ（B-10）。
                比率はキャプションを含む <code>figure</code> ではなく、中の <code>img</code> / <code>video</code> に掛ける（§10-7）。
              </p>
              <p>
                動画と音声は <code>autoplay</code> なし、<code>controls</code> あり、<code>preload="metadata"</code>。
                モーダルが開いた瞬間に音が出る体験は、「今これに集中してほしい」という意図を裏切る（B-11）。
              </p>
            </Prose>
            <Callout>
              画像に <code>alt</code> を渡し忘れると、開発時に警告する。装飾なら <code>alt=""</code> を明示する。
            </Callout>
          </Section>

          <Section id="notify" title="位置の通知">
            <Prose>
              <p>
                <code>onIndexChange</code> は、利用者に見えている位置が変わったときだけ鳴る。マウントしただけでは鳴らない。
                <code>items</code> が縮んで位置が切り詰められたときは「変わった」ので鳴る（D-14）。
                <code>items[].id</code> が重複していたら、どの値かを名指しで警告する（D-13）。
              </p>
            </Prose>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalMediaProps" title="Modal.Media" />
          <ApiTable name="ModalGalleryProps" title="Modal.Gallery" />
          <ApiTable name="ModalGalleryItem" />
        </>
      )}
      a11y={() => <SpecTable ids={['B-10', 'B-11', 'B-12', 'K-10', 'D-13', 'D-14']} caption="メディアとギャラリーが満たす仕様" />}
    />
  );
}
