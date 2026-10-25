import { useState, type ReactNode } from 'react';

import { CompanyFields, MyNumberField, Phrase, isMyNumber, type CompanyInfo } from '@genelab/gassan';
import { COMPANY_SAMPLES } from '../data/japan';
import { useDemoText } from '../i18n';

// t:lookup
function lookup(corporateNumber: string): Promise<{ name: string } | null> {
  return new Promise((resolve) =>
    setTimeout(() => {
      const name = COMPANY_SAMPLES[corporateNumber];
      resolve(name ? { name } : null);
    }, 400),
  );
}

export default function RegistrationNumbers(): ReactNode {
  const t = useDemoText('registrationNumbers');
  const [myNumber, setMyNumber] = useState('');
  const [company, setCompany] = useState<CompanyInfo>({ name: '', corporateNumber: '', department: '', position: '', employees: '' });

  return (
    <div className="s-demo-wide">
      {/* t:myNumber */}
      <MyNumberField value={myNumber} onValueChange={setMyNumber} />
      {/* t:check */}
      <output className="s-demo-log s-jp-values">{JSON.stringify({ myNumber, isMyNumber: isMyNumber(myNumber) }, null, 2)}</output>
      {/* t:company */}
      <CompanyFields value={company} onValueChange={setCompany} lookup={lookup} />
      <p className="s-demo-note">
        <Phrase>{t.try}</Phrase>
      </p>
    </div>
  );
}
