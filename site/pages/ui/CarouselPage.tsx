import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import CarouselCases from '../../demos/CarouselCases';
import carouselCasesSource from '../../demos/CarouselCases.tsx?raw';
import CarouselNews from '../../demos/CarouselNews';
import carouselNewsSource from '../../demos/CarouselNews.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const IDS = ['U-28', 'U-29'];

export function UiCarouselPage({ rest }: PageProps): ReactNode {
  const { nav, uiCarousel: t } = useT();
  return (
    <ComponentPage
      path="/ui/carousel"
      rest={rest}
      title={nav.pages.uiCarousel}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="news" title={t.news.title} intro={t.news.intro}>
            <Example title={t.news.exampleTitle} description={t.news.exampleDescription} code={carouselNewsSource} demo="carouselNews">
              <CarouselNews />
            </Example>
          </Section>

          <Section id="cases" title={t.cases.title} intro={t.cases.intro}>
            <Example title={t.cases.exampleTitle} description={t.cases.exampleDescription} code={carouselCasesSource} demo="carouselCases">
              <CarouselCases />
            </Example>
          </Section>

          <Section id="rules" title={t.rules.title} intro={t.rules.intro}>
            <DataTable caption={t.rules.tableCaption} head={[t.rules.head.when, t.rules.head.then]} rows={t.rules.rows.map((row) => [row.when, row.then])} />
          </Section>

          <Section id="access" title={t.access.title} intro={t.access.intro}>
            <DataTable caption={t.access.tableCaption} head={[t.access.head.key, t.access.head.action]} rows={t.access.rows.map((row) => [row.key, row.action])} />
          </Section>

          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="CarouselProps" title="Carousel" />
          <ApiTable name="CarouselItem" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
