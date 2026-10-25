import type { ReactNode } from 'react';

import { REGISTRATION_PRESETS, REGISTRATION_PRESET_IDS, SiteProvider, type RegistrationPreset } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import RegistrationDeclarations from '../../demos/RegistrationDeclarations';
import registrationDeclarationsSource from '../../demos/RegistrationDeclarations.tsx?raw';
import RegistrationGuardian from '../../demos/RegistrationGuardian';
import registrationGuardianSource from '../../demos/RegistrationGuardian.tsx?raw';
import RegistrationIdentity from '../../demos/RegistrationIdentity';
import registrationIdentitySource from '../../demos/RegistrationIdentity.tsx?raw';
import RegistrationNumbers from '../../demos/RegistrationNumbers';
import registrationNumbersSource from '../../demos/RegistrationNumbers.tsx?raw';
import RegistrationWork from '../../demos/RegistrationWork';
import registrationWorkSource from '../../demos/RegistrationWork.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { md } from '../../ui/Markdown';
import { KeyPoint, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { TemplateFrame } from '../../ui/TemplateFrame';

const IDS = ['P-31', 'I-33', 'I-34', 'I-35', 'I-36', 'I-37'];

export function RegistrationPresetsTemplatesPage({ rest }: PageProps): ReactNode {
  const { nav, registrationPresets: t, registration: r } = useT();
  const ageOf = (preset: RegistrationPreset): string =>
    preset.minAge !== undefined ? t.presets.minAge(preset.minAge) : preset.guardianUnder !== undefined ? t.presets.guardianUnder(preset.guardianUnder) : t.presets.noAge;
  const demos = [
    { id: 'work', copy: t.fields.work, code: registrationWorkSource, demo: 'registrationWork', node: <RegistrationWork /> },
    { id: 'declarations', copy: t.fields.declarations, code: registrationDeclarationsSource, demo: 'registrationDeclarations', node: <RegistrationDeclarations /> },
    { id: 'numbers', copy: t.fields.numbers, code: registrationNumbersSource, demo: 'registrationNumbers', node: <RegistrationNumbers /> },
    { id: 'identity', copy: t.fields.identity, code: registrationIdentitySource, demo: 'registrationIdentity', node: <RegistrationIdentity /> },
    { id: 'guardian', copy: t.fields.guardian, code: registrationGuardianSource, demo: 'registrationGuardian', node: <RegistrationGuardian /> },
  ] as const;
  return (
    <ComponentPage
      path="/templates/registration-presets"
      rest={rest}
      title={nav.pages.templatesRegistrationPresets}
      lead={t.lead}
      eyebrow={nav.sections.templates}
      ids={IDS}
      overview={() => (
        // 欄の部品の見本も、サイトの言語の登録の文言で描く（既定は日本語と英語だけ）
        <SiteProvider registrationLabels={r}>
          <Section id="presets" title={t.presets.title} intro={md(t.presets.intro)}>
            <DataTable
              caption={t.presets.tableCaption}
              head={[t.presets.head.preset, t.presets.head.steps, t.presets.head.age, t.presets.head.laws]}
              rows={REGISTRATION_PRESET_IDS.map((id) => {
                const preset = REGISTRATION_PRESETS[id];
                return [
                  r.presets[id].title,
                  r.list(preset.steps.map((step) => r.steps[step.id].title)),
                  ageOf(preset),
                  <ul key="laws" className="s-law-list">
                    {preset.laws.map((law) => (
                      <li key={`${law.law}-${law.article}`}>
                        <a href={law.url} target="_blank" rel="noreferrer">
                          {r.laws[law.law]} <span lang="ja">{law.article}</span>
                        </a>
                      </li>
                    ))}
                  </ul>,
                ];
              })}
            />
          </Section>

          <Section id="law" title={t.law.title}>
            <KeyPoint tone="caution">{t.law.body}</KeyPoint>
          </Section>

          <Section id="sample" title={t.sample.title} intro={md(t.sample.intro)}>
            <TemplateFrame
              title={nav.pages.templatesRegistrationPresets}
              variants={REGISTRATION_PRESET_IDS.map((id) => ({ name: `industry-${id}`, label: r.presets[id].title }))}
            />
          </Section>

          <Section id="flow" title={t.flow.title} intro={md(t.flow.intro)}>
            <CodeBlock lang="tsx" code={t.flow.code} />
          </Section>

          <Section id="timing" title={t.timing.title} intro={md(t.timing.intro)}>
            <DataTable
              caption={t.timing.tableCaption}
              head={[t.timing.head.stage, t.timing.head.items, t.timing.head.how]}
              rows={t.timing.rows.map((row, index) => [row.stage, row.items, md(row.how, `how${String(index)}`)])}
            />
          </Section>

          <Section id="fields" title={t.fields.title} intro={md(t.fields.intro)}>
            {null}
          </Section>
          {demos.map((item) => (
            <Section key={item.id} id={item.id} title={item.copy.title} intro={md(item.copy.intro)}>
              <Example title={item.copy.exampleTitle} description={item.copy.exampleDescription} code={item.code} demo={item.demo}>
                {item.node}
              </Example>
            </Section>
          ))}

          <Section id="amendments" title={t.amendments.title} intro={md(t.amendments.intro)}>
            <DataTable
              caption={t.amendments.tableCaption}
              head={[t.amendments.head.date, t.amendments.head.change, t.amendments.head.gassan]}
              rows={t.amendments.rows.map((row, index) => [row.date, row.change, md(row.gassan, `gassan${String(index)}`)])}
            />
          </Section>

          <Section id="customize" title={t.customize.title} intro={md(t.customize.intro)}>
            <CodeBlock lang="tsx" code={t.customize.code} />
          </Section>
        </SiteProvider>
      )}
      api={() => (
        <>
          <ApiTable name="RegistrationPresetPageProps" title="RegistrationPresetPage" />
          <ApiTable name="RegistrationPreset" />
          <ApiTable name="RegistrationPresetStep" />
          <ApiTable name="LawReference" />
          <ApiTable name="RegistrationValues" />
          <ApiTable name="OccupationFieldProps" title="OccupationField" />
          <ApiTable name="PurposeFieldProps" title="PurposeField" />
          <ApiTable name="PepsFieldProps" title="PepsField" />
          <ApiTable name="TaxResidencyFieldProps" title="TaxResidencyField" />
          <ApiTable name="TaxResidency" />
          <ApiTable name="UsPersonFieldProps" title="UsPersonField" />
          <ApiTable name="UsPerson" />
          <ApiTable name="DeclarationFieldProps" title="DeclarationField" />
          <ApiTable name="MyNumberFieldProps" title="MyNumberField" />
          <ApiTable name="CompanyFieldsProps" title="CompanyFields" />
          <ApiTable name="CompanyInfo" />
          <ApiTable name="IdentityMethodFieldProps" title="IdentityMethodField" />
          <ApiTable name="GuardianFieldsProps" title="GuardianFields" />
          <ApiTable name="GuardianConsent" />
          <ApiTable name="MarketingConsentFieldProps" title="MarketingConsentField" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'P-24', 'P-25', 'I-09']} caption={t.a11yCaption} />}
    />
  );
}
