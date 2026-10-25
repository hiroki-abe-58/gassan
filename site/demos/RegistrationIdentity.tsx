import { useState, type ReactNode } from 'react';

import { IdentityMethodField, Segmented, type IdentityMethod, type IdentityRegime } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function RegistrationIdentity(): ReactNode {
  const t = useDemoText('registrationIdentity');
  const [regime, setRegime] = useState<IdentityRegime>('aml');
  const [day, setDay] = useState('2027-03-31');
  const [method, setMethod] = useState<IdentityMethod | null>(null);

  return (
    <div className="s-demo-wide">
      {/* t:regime */}
      <Segmented
        aria-label={t.regime}
        value={regime}
        onValueChange={(next) => {
          setRegime(next as IdentityRegime);
          setMethod(null);
        }}
        options={[
          { value: 'aml', label: t.aml },
          { value: 'telecom', label: t.telecom },
          { value: 'reuse', label: t.reuse },
          { value: 'matching', label: t.matching },
        ]}
      />
      {/* t:day */}
      <Segmented
        aria-label={t.day}
        value={day}
        onValueChange={setDay}
        options={[
          { value: '2027-03-31', label: t.before },
          { value: '2027-04-01', label: t.after },
        ]}
      />
      <IdentityMethodField regime={regime} on={new Date(`${day}T00:00:00`)} value={method} onValueChange={setMethod} />
    </div>
  );
}
