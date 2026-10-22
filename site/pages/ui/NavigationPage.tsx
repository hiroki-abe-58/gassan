import type { ReactNode } from 'react';

import { Accordion, Badge, Breadcrumbs, Pagination, Steps, Tabs } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import ProjectSettings from '../../demos/ProjectSettings';
import projectSettingsSource from '../../demos/ProjectSettings.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

const IDS = ['U-17', 'U-18', 'U-22', 'U-23', 'U-24'];

export function UiNavigationPage({ rest }: PageProps): ReactNode {
  const { nav, uiNavigation: t } = useT();
  const { labels: l, sample: s } = t;
  const projectTabs = [
    { value: 'overview', label: s.overview, content: <p className="s-demo-note">{s.overviewBody}</p> },
    { value: 'activity', label: s.activity, content: <p className="s-demo-note">{s.activityBody}</p> },
    { value: 'settings', label: s.settings, content: <p className="s-demo-note">{s.settingsBody}</p> },
  ];
  const steps = [
    { label: s.stepAccount, description: s.stepAccountDescription },
    { label: s.stepPlan, description: s.stepPlanDescription },
    { label: s.stepPayment, description: s.stepPaymentDescription },
    { label: s.stepDone },
  ];
  return (
    <ComponentPage
      path="/ui/navigation"
      rest={rest}
      title={nav.pages.uiNavigation}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="example" title={t.example.title} intro={t.example.intro}>
            <Example
              title={t.example.exampleTitle}
              description={t.example.exampleDescription}
              code={projectSettingsSource}
              demo="projectSettings"
            >
              <ProjectSettings />
            </Example>
          </Section>

          <Section id="tabs" title={t.tabs.title} intro={t.tabs.intro}>
            <Specimens
              caption={t.tabs.title}
              wide
              items={[
                { label: l.line, render: () => <Tabs label={s.projectTabs} items={projectTabs} /> },
                { label: l.pill, render: () => <Tabs label={s.projectTabs} items={projectTabs} variant="pill" /> },
                {
                  label: l.badge,
                  render: () => (
                    <Tabs
                      label={s.inbox}
                      items={[
                        { value: 'inbox', label: s.inbox, badge: <Badge tone="accent">12</Badge> },
                        { value: 'unread', label: s.unread, badge: <Badge>3</Badge> },
                        { value: 'archived', label: s.archived },
                      ]}
                    />
                  ),
                },
                { label: l.manual, render: () => <Tabs label={s.projectTabs} items={projectTabs} activation="manual" /> },
              ]}
            />
          </Section>

          <Section id="accordion" title={t.accordion.title} intro={t.accordion.intro}>
            <Specimens
              caption={t.accordion.title}
              wide
              items={[
                {
                  label: l.single,
                  render: () => (
                    <Accordion
                      type="single"
                      defaultValue={['refund']}
                      items={[
                        { value: 'refund', title: s.faqRefund, content: s.faqRefundBody },
                        { value: 'invoice', title: s.faqInvoice, content: s.faqInvoiceBody },
                        { value: 'seats', title: s.faqSeats, content: s.faqSeatsBody },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Section>

          <Section id="breadcrumbs" title={t.breadcrumbs.title} intro={t.breadcrumbs.intro}>
            <Specimens
              caption={t.breadcrumbs.title}
              items={[
                {
                  label: l.trail,
                  render: () => (
                    <Breadcrumbs
                      items={[
                        { label: s.home, href: '#/ui/navigation' },
                        { label: s.projects, href: '#/ui/navigation' },
                        { label: s.project },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Section>

          <Section id="pagination" title={t.pagination.title} intro={t.pagination.intro}>
            <Specimens
              caption={t.pagination.title}
              wide
              items={[
                { label: l.many, render: () => <Pagination count={20} defaultPage={8} /> },
                {
                  label: l.narrow,
                  render: () => (
                    <div className="s-narrow">
                      <Pagination count={20} defaultPage={3} />
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="steps" title={t.steps.title} intro={t.steps.intro}>
            <Specimens
              caption={t.steps.title}
              wide
              items={[
                { label: l.horizontal, render: () => <Steps label={s.stepsLabel} current={2} items={steps} orientation="horizontal" /> },
                { label: l.vertical, render: () => <Steps label={s.stepsLabel} current={1} items={steps} orientation="vertical" /> },
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
          <ApiTable name="TabsProps" title="Tabs" />
          <ApiTable name="TabItem" />
          <ApiTable name="AccordionProps" title="Accordion" />
          <ApiTable name="AccordionItem" />
          <ApiTable name="BreadcrumbsProps" title="Breadcrumbs" />
          <ApiTable name="BreadcrumbItem" />
          <ApiTable name="PaginationProps" title="Pagination" />
          <ApiTable name="StepsProps" title="Steps" />
          <ApiTable name="StepItem" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'V-05']} caption={t.a11yCaption} />}
    />
  );
}
