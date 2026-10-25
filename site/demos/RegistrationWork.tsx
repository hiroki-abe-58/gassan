import { useState, type ReactNode } from 'react';

import { OccupationField, PurposeField, Segmented, type Occupation, type PurposeKind } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function RegistrationWork(): ReactNode {
  const t = useDemoText('registrationWork');
  const [kind, setKind] = useState<PurposeKind>('deposit');
  const [occupation, setOccupation] = useState<Occupation | ''>('');
  const [purposes, setPurposes] = useState<string[]>([]);

  return (
    <div className="s-demo-wide">
      {/* t:kind */}
      <Segmented
        aria-label={t.kind}
        value={kind}
        onValueChange={(next) => {
          setKind(next as PurposeKind);
          setPurposes([]);
        }}
        options={[
          { value: 'deposit', label: t.deposit },
          { value: 'securities', label: t.securities },
          { value: 'crypto', label: t.crypto },
          { value: 'remittance', label: t.remittance },
          { value: 'card', label: t.card },
        ]}
      />
      {/* t:fields */}
      <OccupationField required value={occupation} onValueChange={setOccupation} />
      <PurposeField kind={kind} required value={purposes} onValueChange={setPurposes} />
      <output className="s-demo-log s-jp-values">{JSON.stringify({ occupation, purposes }, null, 2)}</output>
    </div>
  );
}
