import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import SheetDetents from '../../demos/SheetDetents';
import sheetSource from '../../demos/SheetDetents.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const RULES: readonly { title: string; body: string }[] = [
  {
    title: '速い下フリックは閉じない。1 段下げる',
    body: '段がある以上、利用者は「少し縮めたい」つもりで投げる。閉じるのは、最下段からさらに下へ投げたときだけ。',
  },
  {
    title: 'つまみはドラッグ専用にしない',
    body: '段があるときは role="slider" になり、矢印キー・Home / End・クリックでも段を移れる。ドラッグできない人の経路を消さない。',
  },
  {
    title: '段を指定しなければ、内容なりの高さ',
    body: 'つまみは飾り（aria-hidden）に落ちる。動かせないものを操作子として読み上げさせない。',
  },
];

export function SheetPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/sheet"
      rest={rest}
      title="シートと Handle"
      lead="placement=&quot;sheet&quot; は下から出るパネルになる。detents を渡すと peek / half / full で止まる。つまみは見た目の飾りではなく、キーボードでも動かせる操作子である。"
      ids={['M-01', 'M-02', 'M-03', 'H-09', 'C-08']}
      overview={() => (
        <>
          <Section id="detents" title="段で止まるシート" intro="つまみをドラッグ、またはフォーカスして ↑ ↓ で段を移る。いまの段は onDetentChange で受け取れる。">
            <Example title="月山への経路" description="狭い画面なら指で、広い画面ならキーボードとクリックで試せる。" code={sheetSource}>
              <SheetDetents />
            </Example>
          </Section>

          <Section id="rules" title="3 つの決めごと">
            <ol className="s-rules">
              {RULES.map((rule) => (
                <li key={rule.title}>
                  <h3>{rule.title}</h3>
                  <p>{rule.body}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="release" title="指を離したあと">
            <Prose>
              <p>
                ドラッグの判定そのものより、指を離したあとにブラウザが勝手に起こすことのほうが壊れやすい。
                ドラッグ直後の合成 click で段が二重に動く、パネルの外で指を離すと固まる、同じ段に戻ると高さの指定が消える——
                どれも実際に踏んで、直して、テストで固定してある（§10-13〜§10-15）。
              </p>
            </Prose>
            <Callout>
              行き先の判定は <code>resolveDetents</code> / <code>snapToDetent</code> という純粋関数に切り出してあり、単体で import できる。
              レイアウトを持たないテスト環境でも検証できるようにするためだ。
            </Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalHandleProps" title="Modal.Handle" />
          <Prose>
            <p>
              段そのものは <code>Modal.Root</code> の <code>detents</code> / <code>defaultDetent</code> / <code>onDetentChange</code> /{' '}
              <code>swipeToDismiss</code> で指定する（<a href="#/components/root/api">Modal.Root の API</a>）。
            </p>
          </Prose>
        </>
      )}
      a11y={() => (
        <SpecTable ids={['M-01', 'M-02', 'M-03', 'M-04', 'M-05', 'M-06', 'M-07', 'M-09', 'H-09', 'C-08', 'F-12']} caption="シートとモバイルの仕様" />
      )}
    />
  );
}
