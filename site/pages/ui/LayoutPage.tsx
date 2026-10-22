import type { ReactNode } from 'react';

import { Button, Card, DescriptionList, Divider, EmptyState, Stat, Timeline } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import DashboardSample from '../../demos/DashboardSample';
import dashboardSampleSource from '../../demos/DashboardSample.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Glyph } from '../../ui/Glyph';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

const IDS = ['U-10', 'U-11', 'U-12', 'U-13', 'U-14', 'U-15'];

export function UiLayoutPage({ rest }: PageProps): ReactNode {
  const { nav, uiLayout: t } = useT();
  const { labels: l, sample: s } = t;
  return (
    <ComponentPage
      path="/ui/layout"
      rest={rest}
      title={nav.pages.uiLayout}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="dashboard" title={t.dashboard.title} intro={t.dashboard.intro}>
            <Example
              title={t.dashboard.exampleTitle}
              description={t.dashboard.exampleDescription}
              code={dashboardSampleSource}
              demo="dashboardSample"
            >
              <DashboardSample />
            </Example>
          </Section>

          <Section id="card" title={t.card.title} intro={t.card.intro}>
            <Specimens
              caption={t.card.title}
              items={[
                {
                  label: l.plain,
                  render: () => (
                    <Card title={s.planTitle} description={s.planDescription} actions={<Button size="sm">{s.change}</Button>}>
                      {s.planBody}
                    </Card>
                  ),
                },
                {
                  label: l.link,
                  render: () => (
                    <Card title={s.projectTitle} description={s.projectDescription} href="#/ui/layout">
                      {s.projectBody}
                    </Card>
                  ),
                },
                {
                  label: l.footer,
                  render: () => (
                    <Card
                      title={s.projectTitle}
                      footer={
                        <>
                          <Button size="sm" variant="primary">
                            {s.open}
                          </Button>
                          <Button size="sm" variant="tertiary">
                            {s.archive}
                          </Button>
                        </>
                      }
                    >
                      {s.projectBody}
                    </Card>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="stat" title={t.stat.title} intro={t.stat.intro}>
            <Specimens
              caption={t.stat.title}
              items={[
                {
                  label: l.up,
                  render: () => <Stat label={s.revenue} value={s.revenueValue} delta={s.revenueDelta} trend="up" description={s.vsLastMonth} />,
                },
                {
                  label: l.down,
                  render: () => (
                    <Stat label={s.churn} value={s.churnValue} delta={s.churnDelta} trend="down" goodWhen="down" description={s.vsLastMonth} />
                  ),
                },
                {
                  label: l.flat,
                  render: () => <Stat label={s.seats} value={s.seatsValue} delta={s.seatsDelta} description={s.vsLastMonth} />,
                },
              ]}
            />
          </Section>

          <Section id="empty" title={t.empty.title} intro={t.empty.intro}>
            <Specimens
              caption={t.empty.title}
              items={[
                {
                  label: l.search,
                  render: () => (
                    <EmptyState
                      headingLevel={3}
                      title={s.noResults}
                      description={s.noResultsHint}
                      actions={<Button size="sm">{s.clearFilters}</Button>}
                    />
                  ),
                },
                {
                  label: l.first,
                  render: () => (
                    <EmptyState
                      headingLevel={3}
                      title={s.noProjects}
                      description={s.noProjectsHint}
                      actions={
                        <Button variant="primary" iconStart={<Glyph name="plus" />}>
                          {s.createProject}
                        </Button>
                      }
                    />
                  ),
                },
              ]}
            />
          </Section>

          <Section id="list" title={t.list.title} intro={t.list.intro}>
            <Specimens
              caption={t.list.title}
              items={[
                {
                  label: l.inline,
                  render: () => (
                    <DescriptionList
                      items={[
                        { term: s.plan, details: s.planValue },
                        { term: s.billingEmail, details: s.billingEmailValue },
                        { term: s.nextBilling, details: s.nextBillingValue },
                        { term: s.paymentMethod, details: s.paymentMethodValue },
                      ]}
                    />
                  ),
                },
                {
                  label: l.stacked,
                  render: () => (
                    <DescriptionList
                      layout="stacked"
                      items={[
                        { term: s.plan, details: s.planValue },
                        { term: s.billingEmail, details: s.billingEmailValue },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Section>

          <Section id="timeline" title={t.timeline.title} intro={t.timeline.intro}>
            <Timeline
              items={[
                { title: s.ordered, time: '2026-10-20T14:02', timeLabel: '10/20 14:02', tone: 'success' },
                { title: s.paid, time: '2026-10-20T14:05', timeLabel: '10/20 14:05', tone: 'success' },
                { title: s.shipped, time: '2026-10-22T10:30', timeLabel: '10/22 10:30', tone: 'accent', description: s.shippedDetail },
                { title: s.delivered, time: '2026-10-24', timeLabel: '10/24' },
              ]}
            />
          </Section>

          <Section id="divider" title={t.divider.title} intro={t.divider.intro}>
            <Specimens
              caption={t.divider.title}
              items={[
                { label: l.horizontal, render: () => <Divider /> },
                { label: l.labelled, render: () => <Divider label={t.divider.or} /> },
                {
                  label: l.vertical,
                  render: () => (
                    <span className="s-demo-row s-toolbar">
                      <Button size="sm" variant="tertiary">
                        {s.toolbarBold}
                      </Button>
                      <Button size="sm" variant="tertiary">
                        {s.toolbarItalic}
                      </Button>
                      <Divider orientation="vertical" />
                      <Button size="sm" variant="tertiary">
                        {s.toolbarLink}
                      </Button>
                    </span>
                  ),
                },
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
          <ApiTable name="CardProps" title="Card" />
          <ApiTable name="StatProps" title="Stat" />
          <ApiTable name="EmptyStateProps" title="EmptyState" />
          <ApiTable name="DescriptionListProps" title="DescriptionList" />
          <ApiTable name="DescriptionItem" />
          <ApiTable name="TimelineProps" title="Timeline" />
          <ApiTable name="TimelineItem" />
          <ApiTable name="DividerProps" title="Divider" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
