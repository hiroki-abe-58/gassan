import type { ReactNode } from 'react';

import { Avatar, AvatarGroup, Badge, Kbd } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

const IDS = ['U-04', 'U-05', 'U-09'];

export function UiBadgesPage({ rest }: PageProps): ReactNode {
  const { nav, uiBadges: t } = useT();
  const { labels: l, sample: s } = t;
  const members = ['Mina Carter', '佐藤 葵', 'Diego Ramos', '李 静', 'Aiko Mori', 'Tom Baker'];
  return (
    <ComponentPage
      path="/ui/badges"
      rest={rest}
      title={nav.pages.uiBadges}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="badges" title={t.badges.title} intro={t.badges.intro}>
            <Specimens
              caption={t.badges.title}
              items={[
                { label: l.neutral, render: () => <Badge>{s.draft}</Badge> },
                { label: l.accent, render: () => <Badge tone="accent">{s.beta}</Badge> },
                { label: l.success, render: () => <Badge tone="success">{s.paid}</Badge> },
                { label: l.info, render: () => <Badge tone="info">{s.review}</Badge> },
                { label: l.warning, render: () => <Badge tone="warning">{s.overdue}</Badge> },
                { label: l.error, render: () => <Badge tone="error">{s.failed}</Badge> },
                {
                  label: l.dot,
                  render: () => (
                    <Badge tone="success" dot>
                      {s.online}
                    </Badge>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="avatars" title={t.avatars.title} intro={t.avatars.intro}>
            <Specimens
              caption={t.avatars.title}
              items={[
                { label: l.initials, render: () => <Avatar name={s.personEn} /> },
                { label: l.japanese, render: () => <Avatar name={s.personJa} /> },
                { label: l.square, render: () => <Avatar name={s.team} shape="square" /> },
                {
                  label: l.sizes,
                  render: () => (
                    <span className="s-demo-row">
                      <Avatar name={s.personEn} size="xs" />
                      <Avatar name={s.personEn} size="sm" />
                      <Avatar name={s.personEn} />
                      <Avatar name={s.personEn} size="lg" />
                    </span>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="group" title={t.group.title} intro={t.group.intro}>
            <Specimens
              caption={t.group.title}
              items={[
                {
                  label: l.group,
                  render: () => (
                    <AvatarGroup label={t.group.label} max={3}>
                      {members.map((name) => (
                        <Avatar key={name} name={name} />
                      ))}
                    </AvatarGroup>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="kbd" title={t.kbd.title} intro={t.kbd.intro}>
            <Specimens
              caption={t.kbd.title}
              items={[
                {
                  label: `${l.shortcut}: ${s.search}`,
                  render: () => (
                    <span className="s-demo-row">
                      <Kbd>⌘</Kbd>
                      <Kbd>K</Kbd>
                    </span>
                  ),
                },
                { label: `${l.shortcut}: ${s.close}`, render: () => <Kbd>Esc</Kbd> },
              ]}
            />
          </Section>

          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="BadgeProps" title="Badge" />
          <ApiTable name="AvatarProps" title="Avatar" />
          <ApiTable name="AvatarGroupProps" title="AvatarGroup" />
          <ApiTable name="KbdProps" title="Kbd" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
