import type { ReactNode } from 'react';

import type { PageProps } from '../../routes';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-01', 'P-07', 'P-08', 'P-09', 'P-10', 'P-11', 'P-40'];

export function PublicTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, templateDocs } = useT();
  const t = templateDocs.public;
  return (
    <ComponentPage
      path="/templates/public"
      rest={rest}
      title={nav.pages.templatesPublic}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        <>
          <Section id="site" title={t.site.title} intro={t.site.intro}>
            <CodeBlock lang="tsx" code={t.site.code} />
          </Section>
          <Section id="pricing" title={t.pricing.title} intro={t.pricing.intro}>
            <TemplateFrame title={t.pricing.title} height={900} variants={[{ name: 'pricing', label: t.pricing.title }]} />
          </Section>
          <Section id="faq" title={t.faq.title} intro={t.faq.intro}>
            <TemplateFrame title={t.faq.title} height={820} variants={[{ name: 'faq', label: t.faq.title }]} />
          </Section>
          <Section id="contact" title={t.contact.title} intro={t.contact.intro}>
            <TemplateFrame title={t.contact.title} height={900} variants={[{ name: 'contact', label: t.contact.title }]} />
          </Section>
          <Section id="document" title={t.document.title} intro={t.document.intro}>
            <TemplateFrame
              title={t.document.title}
              height={900}
              variants={[
                { name: 'terms', label: t.document.variants.terms },
                { name: 'privacy', label: t.document.variants.privacy },
                { name: 'legal', label: t.document.variants.legal },
              ]}
            />
          </Section>
          <Section id="changelog" title={t.changelog.title} intro={t.changelog.intro}>
            <TemplateFrame title={t.changelog.title} height={820} variants={[{ name: 'changelog', label: t.changelog.title }]} />
          </Section>
          <Section id="search" title={t.search.title} intro={t.search.intro}>
            <TemplateFrame title={t.search.title} height={820} variants={[{ name: 'search', label: t.search.title }]} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="SiteLayoutProps" title="SiteLayout" />
          <ApiTable name="SiteNavLink" />
          <ApiTable name="SiteFooterColumn" />
          <ApiTable name="PricingPageProps" title="PricingPage" />
          <ApiTable name="PricingPlan" />
          <ApiTable name="PricingComparisonRow" />
          <ApiTable name="FaqPageProps" title="FaqPage" />
          <ApiTable name="FaqItem" />
          <ApiTable name="ContactPageProps" title="ContactPage" />
          <ApiTable name="DocumentPageProps" title="DocumentPage" />
          <ApiTable name="DocumentSection" />
          <ApiTable name="ChangelogPageProps" title="ChangelogPage" />
          <ApiTable name="ChangelogEntry" />
          <ApiTable name="SearchPageProps" title="SearchPage" />
          <ApiTable name="SearchResult" />
          <ApiTable name="SearchQuery" />
          <ApiTable name="SearchFacet" />
          <ApiTable name="SearchFacetOption" />
        </>
      )}
      a11y={() => <SpecTable ids={IDS} caption={t.a11yCaption} />}
    />
  );
}
