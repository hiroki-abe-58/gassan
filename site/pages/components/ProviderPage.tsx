import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ProviderEnglish from '../../demos/ProviderEnglish';
import providerSource from '../../demos/ProviderEnglish.tsx?raw';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function ProviderPage({ rest }: PageProps): ReactNode {
  return (
    <ComponentPage
      path="/components/provider"
      rest={rest}
      title="GassanProvider"
      lead="ライブラリが出す文字列は、例外なくここを通る。既定は日本語で、englishLabels を同梱している。部分指定でよい。"
      ids={['G-12', 'A-07', 'H-06']}
      overview={() => (
        <>
          <Section id="english" title="英語にする" intro="「閉じる」「本文の終わりです」「5 ステップ中 2 ステップ目」「同意が必要です」まで、読み上げ用の文言もすべて差し替わる。">
            <Example title="englishLabels" description="読む前にボタンを押すと、英語で理由が読み上げられる。" code={providerSource}>
              <ProviderEnglish />
            </Example>
          </Section>

          <Section id="why" title="めったに出ない文言ほど、ベタ書きされる">
            <Prose>
              <p>
                「登録が出揃う前のゲート」の理由は、かつて日本語のベタ書きだった。<code>englishLabels</code> を入れていても、そこだけ日本語が出ていた。
                めったに出ない文言ほどベタ書きされやすく、だから最後まで残る（§10-21）。いまはライブラリが出す文字列をすべてここに集めている。
              </p>
            </Prose>
            <Callout>
              ステップの読み上げや段の名前のように、数や名前を埋め込む文言は関数で渡す。語順は言語ごとに違うので、文字列の連結では作らない。
            </Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="GassanProviderProps" title="GassanProvider" />
          <ApiTable name="GassanLabels" />
        </>
      )}
      a11y={() => <SpecTable ids={['A-05', 'A-07', 'G-05', 'G-07', 'G-12', 'H-06']} caption="文言が関わる仕様" />}
    />
  );
}
