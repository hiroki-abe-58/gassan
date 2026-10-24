import type { ReactNode } from 'react';

import { Banner, Button, Progress, Skeleton, Spinner } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import ChecklistStart from '../../demos/ChecklistStart';
import checklistStartSource from '../../demos/ChecklistStart.tsx?raw';
import NotifyBell from '../../demos/NotifyBell';
import notifyBellSource from '../../demos/NotifyBell.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

const IDS = ['U-06', 'U-07', 'U-08', 'U-16', 'U-32', 'U-33'];

export function UiFeedbackPage({ rest }: PageProps): ReactNode {
  const { nav, uiFeedback: t } = useT();
  const { labels: l, sample: s } = t;
  return (
    <ComponentPage
      path="/ui/feedback"
      rest={rest}
      title={nav.pages.uiFeedback}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="progress" title={t.progress.title} intro={t.progress.intro}>
            <Specimens
              caption={t.progress.title}
              items={[
                { label: l.value, render: () => <Progress label={s.upload} value={45} /> },
                {
                  label: l.custom,
                  render: () => <Progress label={s.storage} value={17} max={20} tone="warning" valueText={s.storageText} />,
                },
                { label: l.small, render: () => <Progress label={s.sync} value={80} size="sm" tone="success" /> },
                { label: l.indeterminate, render: () => <Progress label={s.preparing} /> },
              ]}
            />
          </Section>

          <Section id="spinner" title={t.spinner.title} intro={t.spinner.intro}>
            <Specimens
              caption={t.spinner.title}
              items={[
                {
                  label: l.sizes,
                  render: () => (
                    <span className="s-demo-row">
                      <Spinner size="sm" />
                      <Spinner />
                      <Spinner size="lg" />
                    </span>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="skeleton" title={t.skeleton.title} intro={t.skeleton.intro}>
            <Specimens
              caption={t.skeleton.title}
              items={[
                { label: l.text, render: () => <Skeleton lines={3} /> },
                {
                  label: l.card,
                  render: () => (
                    <span className="s-skeleton-card">
                      <Skeleton shape="circle" />
                      <span className="s-skeleton-card-lines">
                        <Skeleton width="60%" />
                        <Skeleton width="90%" />
                      </span>
                    </span>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="banner" title={t.banner.title} intro={t.banner.intro}>
            <div className="s-banner-stack">
              <Banner title={s.maintenanceTitle}>{s.maintenance}</Banner>
              <Banner tone="error" title={s.paymentTitle} action={<Button size="sm">{s.update}</Button>}>
                {s.payment}
              </Banner>
              <Banner tone="warning" action={<Button size="sm" variant="primary">{s.upgrade}</Button>} onDismiss={() => undefined}>
                {s.trial}
              </Banner>
              <Banner tone="success">{s.saved}</Banner>
            </div>
          </Section>

          <Section id="notifications" title={t.notifications.title} intro={t.notifications.intro}>
            <Example title={t.notifications.exampleTitle} description={t.notifications.exampleDescription} code={notifyBellSource} demo="notifyBell">
              <NotifyBell />
            </Example>
          </Section>

          <Section id="checklist" title={t.checklist.title} intro={t.checklist.intro}>
            <Example title={t.checklist.exampleTitle} description={t.checklist.exampleDescription} code={checklistStartSource} demo="checklistStart">
              <ChecklistStart />
            </Example>
          </Section>

          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ProgressProps" title="Progress" />
          <ApiTable name="SpinnerProps" title="Spinner" />
          <ApiTable name="SkeletonProps" title="Skeleton" />
          <ApiTable name="BannerProps" title="Banner" />
          <ApiTable name="NotificationCenterProps" title="NotificationCenter" />
          <ApiTable name="NotificationEntry" />
          <ApiTable name="ChecklistProps" title="Checklist" />
          <ApiTable name="ChecklistItem" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'V-02']} caption={t.a11yCaption} />}
    />
  );
}
