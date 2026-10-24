import type { ReactNode } from 'react';

import { Button, ButtonLink, CopyButton, IconButton } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Glyph } from '../../ui/Glyph';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

const IDS = ['U-01', 'U-02', 'U-03'];

export function UiButtonsPage({ rest }: PageProps): ReactNode {
  const { nav, uiButtons: t } = useT();
  const { labels: l, sample: s } = t;
  return (
    <ComponentPage
      path="/ui/buttons"
      rest={rest}
      title={nav.pages.uiButtons}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="variants" title={t.variants.title} intro={t.variants.intro}>
            <Specimens
              caption={t.variants.title}
              items={[
                { label: l.primary, render: () => <Button variant="primary">{s.save}</Button> },
                { label: l.secondary, render: () => <Button>{s.cancel}</Button> },
                { label: l.tertiary, render: () => <Button variant="tertiary">{s.details}</Button> },
                { label: l.danger, render: () => <Button variant="danger">{s.remove}</Button> },
              ]}
            />
          </Section>

          <Section id="sizes" title={t.sizes.title} intro={t.sizes.intro}>
            <Specimens
              caption={t.sizes.title}
              items={[
                { label: l.sm, render: () => <Button size="sm">{s.create}</Button> },
                { label: l.md, render: () => <Button>{s.create}</Button> },
                { label: l.lg, render: () => <Button size="lg" variant="primary">{s.create}</Button> },
              ]}
            />
          </Section>

          <Section id="states" title={t.states.title} intro={t.states.intro}>
            <Specimens
              caption={t.states.title}
              items={[
                {
                  label: l.loading,
                  render: () => (
                    <Button variant="primary" loading>
                      {s.save}
                    </Button>
                  ),
                },
                {
                  label: l.iconStart,
                  render: () => (
                    <Button variant="primary" iconStart={<Glyph name="plus" />}>
                      {s.create}
                    </Button>
                  ),
                },
                { label: l.block, render: () => <Button block>{s.details}</Button> },
                {
                  label: l.link,
                  render: () => (
                    <ButtonLink href="#/ui/buttons" iconEnd={<Glyph name="arrow" />}>
                      {s.pricing}
                    </ButtonLink>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="icon" title={t.icon.title} intro={t.icon.intro}>
            <Specimens
              caption={t.icon.title}
              items={[
                {
                  label: l.ghost,
                  render: () => (
                    <IconButton label={s.settings}>
                      <Glyph name="gear" />
                    </IconButton>
                  ),
                },
                {
                  label: l.tonal,
                  render: () => (
                    <IconButton label={s.more} variant="tonal">
                      <Glyph name="more" />
                    </IconButton>
                  ),
                },
                {
                  label: l.small,
                  render: () => (
                    <IconButton label={s.filter} size="sm">
                      <Glyph name="filter" />
                    </IconButton>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="copy" title={t.copy.title} intro={t.copy.intro}>
            <Specimens
              caption={t.copy.title}
              items={[
                { label: l.copyIcon, render: () => <CopyButton value={t.copy.value} label={t.copy.label} variant="tonal" /> },
                { label: l.copyText, render: () => <CopyButton value={t.copy.value}>{s.copyLink}</CopyButton> },
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
          <ApiTable name="ButtonProps" title="Button" />
          <ApiTable name="ButtonLinkProps" title="ButtonLink" />
          <ApiTable name="IconButtonProps" title="IconButton" />
          <ApiTable name="CopyButtonProps" title="CopyButton" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'V-06', 'F-08']} caption={t.a11yCaption} />}
    />
  );
}
