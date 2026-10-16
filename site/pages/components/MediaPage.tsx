import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import KindView from '../../demos/KindView';
import viewSource from '../../demos/KindView.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { Callout, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

export function MediaPage({ rest }: PageProps): ReactNode {
  const { nav, media: t } = useT();
  return (
    <ComponentPage
      path="/components/media"
      rest={rest}
      title={nav.pages.media}
      lead={t.lead}
      ids={['B-10', 'B-11', 'B-12', 'K-10']}
      overview={() => (
        <>
          <Section id="gallery" title={t.gallery.title} intro={t.gallery.intro}>
            <Example
              title={t.gallery.exampleTitle}
              description={t.gallery.exampleDescription}
              code={viewSource}
              demo="kindView"
            >
              <KindView />
            </Example>
          </Section>

          <Section id="media" title={t.media.title}>
            <Prose>
              <Paras items={t.media.body} />
            </Prose>
            <Callout>{md(t.media.callout)}</Callout>
          </Section>

          <Section id="notify" title={t.notify.title}>
            <Prose>
              <Paras items={t.notify.body} />
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
      a11y={() => <SpecTable ids={['B-10', 'B-11', 'B-12', 'K-10', 'D-13', 'D-14']} caption={t.a11yCaption} />}
    />
  );
}
