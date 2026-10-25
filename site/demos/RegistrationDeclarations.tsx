import { useState, type ReactNode } from 'react';

import { DeclarationField, PepsField, Phrase, TaxResidencyField, UsPersonField, useRegistrationLabels, type Answer, type TaxResidency, type UsPerson } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function RegistrationDeclarations(): ReactNode {
  const t = useDemoText('registrationDeclarations');
  // t:labels
  const r = useRegistrationLabels();
  const [peps, setPeps] = useState<Answer | null>(null);
  const [tax, setTax] = useState<TaxResidency>({ residency: null, countries: [] });
  const [usPerson, setUsPerson] = useState<UsPerson>({ answer: null, tin: '', consent: false });
  const [declared, setDeclared] = useState(false);

  return (
    <div className="s-demo-wide">
      <p className="s-demo-note">
        <Phrase>{t.note}</Phrase>
      </p>
      <PepsField value={peps} onValueChange={setPeps} />
      {/* t:tax */}
      <TaxResidencyField value={tax} onValueChange={setTax} />
      {/* t:usPerson */}
      <UsPersonField value={usPerson} onValueChange={setUsPerson} />
      {/* t:declaration */}
      <DeclarationField checked={declared} onCheckedChange={setDeclared} detailsTitle={r.antiSocial.definitionTitle} details={r.antiSocial.definition}>
        {r.antiSocial.label}
      </DeclarationField>
    </div>
  );
}
