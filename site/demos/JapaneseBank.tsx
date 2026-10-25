import { useState, type ReactNode } from 'react';

import { BankAccountFields, Phrase, toZenginKana, type BankAccount } from '@genelab/gassan';
import { BANK_SAMPLES, BRANCH_SAMPLES } from '../data/japan';
import { useDemoText } from '../i18n';

export default function JapaneseBank(): ReactNode {
  const t = useDemoText('japaneseBank');
  const [account, setAccount] = useState<BankAccount | null>(null);

  return (
    <div className="s-demo-wide">
      {/* t:fields */}
      <BankAccountFields label={t.label} banks={BANK_SAMPLES} branches={BRANCH_SAMPLES} required onValueChange={setAccount} />
      <p className="s-demo-note">
        <Phrase>{t.hint}</Phrase>
      </p>
      {/* t:zengin */}
      <output className="s-demo-log s-jp-values">{JSON.stringify(account && { ...account, accountHolder: toZenginKana(account.accountHolder) }, null, 2)}</output>
    </div>
  );
}
