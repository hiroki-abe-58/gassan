import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-18', 'P-19'];

export function ConversationTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, templateDocs } = useT();
  const t = templateDocs.conversations;
  return (
    <ComponentPage
      path="/templates/conversations"
      rest={rest}
      title={nav.pages.templatesConversations}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="setup" title={t.setup.title} intro={t.setup.intro}>
            <CodeBlock lang="tsx" code={t.setup.code} />
          </Section>
          <Section id="chat" title={t.chat.title} intro={t.chat.intro}>
            <TemplateFrame title={t.chat.title} height={720} variants={[{ name: 'app-chat', label: t.chat.title }]} />
          </Section>
          <Section id="assistant" title={t.assistant.title} intro={t.assistant.intro}>
            <TemplateFrame title={t.assistant.title} height={720} variants={[{ name: 'app-assistant', label: t.assistant.title }]} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ChatPageProps" title="ChatPage" />
          <ApiTable name="ChatConversation" />
          <ApiTable name="AssistantPageProps" title="AssistantPage" />
          <ApiTable name="AssistantThread" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
