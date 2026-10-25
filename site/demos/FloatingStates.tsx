import { useState, type ReactNode } from 'react';

import { Button, Field, Input } from '@genelab/gassan';
import { useDemoText } from '../i18n';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FloatingStates(): ReactNode {
  const t = useDemoText('floatingStates');
  const [email, setEmail] = useState(t.emailValue);

  return (
    // t:reset
    <form className="s-float-demo" onReset={() => setEmail(t.emailValue)}>
      {/* t:initial */}
      <Field label={t.name} labelPlacement="floating">
        {(control) => <Input {...control} name="name" autoComplete="name" defaultValue={t.nameValue} />}
      </Field>

      {/* t:error */}
      <Field label={t.email} labelPlacement="floating" error={EMAIL.test(email) ? undefined : t.emailError}>
        {(control) => (
          <Input {...control} type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        )}
      </Field>

      {/* t:disabled */}
      <Field label={t.workspace} labelPlacement="floating" help={t.workspaceHelp}>
        {(control) => <Input {...control} name="workspace" defaultValue={t.workspaceValue} disabled />}
      </Field>

      <Button type="reset" variant="secondary">
        {t.reset}
      </Button>
    </form>
  );
}
