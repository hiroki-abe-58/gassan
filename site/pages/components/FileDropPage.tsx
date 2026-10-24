import type { ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import FileForm from '../../demos/FileForm';
import fileFormSource from '../../demos/FileForm.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { md } from '../../ui/Markdown';
import { KeyPoint, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

export function FileDropPage({ rest }: PageProps): ReactNode {
  const { nav, fileDrop: t } = useT();
  const { items } = t.gallery;
  return (
    <ComponentPage
      path="/components/file-drop"
      rest={rest}
      title={nav.pages.fileDrop}
      lead={t.lead}
      ids={['I-14']}
      overview={() => (
        <>
          <Section id="gallery" title={t.gallery.title} intro={t.gallery.intro}>
            <Specimens
              caption={t.gallery.title}
              items={[
                { label: items.single, render: (id) => <Modal.FileDrop aria-labelledby={id} /> },
                { label: items.multiple, render: (id) => <Modal.FileDrop aria-labelledby={id} accept="image/*" multiple /> },
                { label: items.disabled, render: (id) => <Modal.FileDrop aria-labelledby={id} disabled /> },
              ]}
            />
          </Section>

          <Section id="modal" title={t.modal.title} intro={t.modal.intro}>
            <Example title={t.modal.exampleTitle} description={t.modal.exampleDescription} code={fileFormSource} demo="fileForm">
              <FileForm />
            </Example>
          </Section>

          <Section id="reject" title={t.reject.title}>
            <KeyPoint>{md(t.reject.callout)}</KeyPoint>
          </Section>
        </>
      )}
      api={() => <ApiTable name="ModalFileDropProps" title="Modal.FileDrop" />}
      a11y={() => <SpecTable ids={['I-01', 'I-14', 'B-08']} caption={t.a11yCaption} />}
    />
  );
}
