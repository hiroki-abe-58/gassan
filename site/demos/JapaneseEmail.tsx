import type { ReactNode } from 'react';

import { EmailInput, Field, Phrase } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function JapaneseEmail(): ReactNode {
  const t = useDemoText('japaneseEmail');

  return (
    <div className="s-demo-wide">
      {/* t:sender */}
      <Field label={t.label} required>
        {(control) => <EmailInput {...control} name="email" sender="example.com" />}
      </Field>
      <p className="s-demo-note">
        <Phrase>{t.hint}</Phrase>
      </p>
    </div>
  );
}
