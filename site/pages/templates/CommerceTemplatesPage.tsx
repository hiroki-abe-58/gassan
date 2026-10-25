import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { md } from '../../ui/Markdown';
import { KeyPoint, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-32', 'P-33', 'P-34', 'P-35'];

export function CommerceTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, commerce: t } = useT();
  const frames = [
    { id: 'cookie-consent', copy: t.cookieConsent },
    { id: 'external-transmission', copy: t.externalTransmission },
    { id: 'cancel-subscription', copy: t.cancel },
  ];
  return (
    <ComponentPage
      path="/templates/commerce"
      rest={rest}
      title={nav.pages.templatesCommerce}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="law" title={t.law.title}>
            <KeyPoint tone="caution">{t.law.body}</KeyPoint>
          </Section>
          <Section id="order-review" title={t.orderReview.title} intro={md(t.orderReview.intro)}>
            <DataTable
              caption={t.orderReview.tableCaption}
              head={[t.orderReview.head.item, t.orderReview.head.prop]}
              rows={t.orderReview.rows.map((row, index) => [row.item, md(row.prop, `prop${String(index)}`)])}
            />
            <TemplateFrame title={t.orderReview.title} variants={[{ name: 'order-review', label: t.orderReview.title }]} />
          </Section>
          {frames.map((frame) => (
            <Section key={frame.id} id={frame.id} title={frame.copy.title} intro={md(frame.copy.intro)}>
              <TemplateFrame title={frame.copy.title} variants={[{ name: frame.id, label: frame.copy.title }]} />
            </Section>
          ))}
          <Section id="setup" title={t.setup.title} intro={md(t.setup.intro)}>
            <CodeBlock lang="tsx" code={t.setup.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="OrderReviewPageProps" title="OrderReviewPage" />
          <ApiTable name="OrderItem" />
          <ApiTable name="OrderAmount" />
          <ApiTable name="OrderSubscription" />
          <ApiTable name="CookieConsentProps" title="CookieConsent" />
          <ApiTable name="ExternalTransmissionListProps" title="ExternalTransmissionList" />
          <ApiTable name="ExternalTransmission" />
          <ApiTable name="CancelSubscriptionPageProps" title="CancelSubscriptionPage" />
          <ApiTable name="CancelReason" />
          <ApiTable name="RetentionOffer" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'P-01', 'P-03']} caption={t.a11yCaption} />}
    />
  );
}
