import { useState, type ReactNode } from 'react';

import { GuardianFields, MarketingConsentField, Phrase, type GuardianConsent } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function RegistrationGuardian(): ReactNode {
  const t = useDemoText('registrationGuardian');
  const [guardian, setGuardian] = useState<GuardianConsent>({ name: '', relationship: '', email: '', consent: false });
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="s-demo-wide">
      <p className="s-demo-note">
        <Phrase>{t.note}</Phrase>
      </p>
      {/* t:guardian */}
      <GuardianFields value={guardian} onValueChange={setGuardian} />
      {/* t:marketing */}
      <MarketingConsentField checked={marketing} onCheckedChange={setMarketing} />
      <output className="s-demo-log s-jp-values">{JSON.stringify({ guardian, marketing }, null, 2)}</output>
    </div>
  );
}
