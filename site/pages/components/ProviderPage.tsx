import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ProviderEnglish from '../../demos/ProviderEnglish';
import providerSource from '../../demos/ProviderEnglish.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function ProviderPage({ rest }: PageProps): ReactNode {
  const { nav, provider: t } = useT();
  return (
    <ComponentPage
      path="/components/provider"
      rest={rest}
      title={nav.pages.provider}
      lead={t.lead}
      ids={['G-12', 'A-07', 'H-06']}
      overview={() => (
        <>
          <Section id="english" title={t.english.title} intro={t.english.intro}>
            <Example
              title="englishLabels"
              description={t.english.exampleDescription}
              code={providerSource}
              demo="providerEnglish"
            >
              <ProviderEnglish />
            </Example>
          </Section>

          <Section id="why" title={t.why.title}>
            <Prose>
              <Paras items={t.why.body} />
            </Prose>
            <Callout>{md(t.why.callout)}</Callout>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="GassanProviderProps" title="GassanProvider" />
          <ApiTable name="GassanLabels" />
        </>
      )}
      a11y={() => <SpecTable ids={['A-05', 'A-07', 'G-05', 'G-07', 'G-12', 'H-06']} caption={t.a11yCaption} />}
    />
  );
}
