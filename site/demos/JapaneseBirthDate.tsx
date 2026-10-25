import { useState, type ReactNode } from 'react';

import { ageOn, BirthDateInput } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function JapaneseBirthDate(): ReactNode {
  const t = useDemoText('japaneseBirthDate');
  const [birthday, setBirthday] = useState<string | null>(null);
  // t:age
  const [year = 0, month = 0, day = 0] = birthday ? birthday.split('-').map(Number) : [];
  const underage = birthday !== null && ageOn({ year, month, day }) < 20;

  return (
    <div className="s-demo-wide">
      <BirthDateInput label={t.label} help={t.help} required value={birthday} onValueChange={setBirthday} error={underage ? t.underage : undefined} />
      <output className="s-demo-log">{JSON.stringify(birthday)}</output>
    </div>
  );
}
