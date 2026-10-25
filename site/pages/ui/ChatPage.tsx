import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import ChatAssistant from '../../demos/ChatAssistant';
import chatAssistantSource from '../../demos/ChatAssistant.tsx?raw';
import ChatBot from '../../demos/ChatBot';
import chatBotSource from '../../demos/ChatBot.tsx?raw';
import ChatTeam from '../../demos/ChatTeam';
import chatTeamSource from '../../demos/ChatTeam.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const IDS = ['E-01', 'E-02', 'E-03', 'E-04', 'E-05', 'E-06', 'E-07', 'E-08', 'E-09'];

export function UiChatPage({ rest }: PageProps): ReactNode {
  const { nav, uiChat: t } = useT();
  return (
    <ComponentPage
      path="/ui/chat"
      rest={rest}
      title={nav.pages.uiChat}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="team" title={t.team.title} intro={t.team.intro}>
            <Example title={t.team.exampleTitle} description={t.team.exampleDescription} code={chatTeamSource} demo="chatTeam">
              <ChatTeam />
            </Example>
          </Section>

          <Section id="assistant" title={t.assistant.title} intro={t.assistant.intro}>
            <Example title={t.assistant.exampleTitle} description={t.assistant.exampleDescription} code={chatAssistantSource} demo="chatAssistant">
              <ChatAssistant />
            </Example>
          </Section>

          <Section id="widget" title={t.widget.title} intro={t.widget.intro}>
            <Example title={t.widget.exampleTitle} description={t.widget.exampleDescription} code={chatBotSource} demo="chatBot">
              <ChatBot />
            </Example>
            <DataTable caption={t.widget.tableCaption} head={[t.widget.head.when, t.widget.head.then]} rows={t.widget.rows.map((row) => [row.when, row.then])} />
          </Section>

          <Section id="behavior" title={t.behavior.title} intro={t.behavior.intro}>
            <DataTable caption={t.behavior.tableCaption} head={[t.behavior.head.when, t.behavior.head.then]} rows={t.behavior.rows.map((row) => [row.when, row.then])} />
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
          <ApiTable name="ChatThreadProps" title="ChatThread" />
          <ApiTable name="ChatMessage" />
          <ApiTable name="ChatAuthor" />
          <ApiTable name="ChatComposerProps" title="ChatComposer" />
          <ApiTable name="TypingIndicatorProps" title="TypingIndicator" />
          <ApiTable name="ChatSuggestionsProps" title="ChatSuggestions" />
          <ApiTable name="ChatSuggestion" />
          <ApiTable name="ChatWidgetProps" title="ChatWidget" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
