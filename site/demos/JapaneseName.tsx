import { useState, type ReactNode } from 'react';

import { NameFields, Phrase, type PersonName } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function JapaneseName(): ReactNode {
  const t = useDemoText('japaneseName');
  const [name, setName] = useState<PersonName>({ familyName: '', givenName: '', familyNameKana: '', givenNameKana: '' });

  return (
    <div className="s-demo-wide">
      {/* t:fields */}
      <NameFields label={t.label} required value={name} onValueChange={setName} />
      <p className="s-demo-note">
        <Phrase>{t.hint}</Phrase>
      </p>
      <output className="s-demo-log s-jp-values">{JSON.stringify(name, null, 2)}</output>
    </div>
  );
}
