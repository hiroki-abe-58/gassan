import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-20'];

export function MailTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, templateDocs } = useT();
  const t = templateDocs.mail;
  return (
    <ComponentPage
      path="/templates/mail"
      rest={rest}
      title={nav.pages.templatesMail}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="setup" title={t.setup.title} intro={t.setup.intro}>
            <CodeBlock lang="tsx" code={t.setup.code} />
          </Section>
          <Section id="mail" title={t.preview.title} intro={t.preview.intro}>
            <TemplateFrame title={t.preview.title} height={760} variants={[{ name: 'app-mail', label: t.preview.title }]} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="MailboxPageProps" title="MailboxPage" />
          <ApiTable name="MailFolder" />
          <ApiTable name="MailMessage" />
          <ApiTable name="MailAddress" />
          <ApiTable name="MailAttachment" />
          <ApiTable name="MailComposeValues" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
