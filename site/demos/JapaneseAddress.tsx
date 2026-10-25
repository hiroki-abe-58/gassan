import { useState, type ReactNode } from 'react';

import { AddressFields, Phrase, type JapaneseAddress, type PostalAddress } from '@genelab/gassan';
import { POSTAL_SAMPLES } from '../data/japan';
import { useDemoText } from '../i18n';

// t:lookup
function lookup(postalCode: string): Promise<readonly PostalAddress[]> {
  return new Promise((resolve) => setTimeout(() => resolve(POSTAL_SAMPLES[postalCode] ?? []), 400));
}

export default function JapaneseAddressDemo(): ReactNode {
  const t = useDemoText('japaneseAddress');
  const [address, setAddress] = useState<JapaneseAddress>({ postalCode: '', prefecture: '', city: '', line1: '', line2: '' });

  return (
    <div className="s-demo-wide">
      {/* t:fields */}
      <AddressFields label={t.label} required lookup={lookup} autoCompleteSection="shipping" value={address} onValueChange={setAddress} />
      <p className="s-demo-note">
        <Phrase>{t.tryLead}</Phrase>
      </p>
      <ul className="s-jp-codes">
        {t.tryCodes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <output className="s-demo-log s-jp-values">{JSON.stringify(address, null, 2)}</output>
    </div>
  );
}
