import { useRef, useState, type ReactNode } from 'react';

import { Button, Field, Input, PasswordInput } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function FloatingSignIn(): ReactNode {
  const t = useDemoText('floatingSignIn');
  const [account, setAccount] = useState('');
  const [missing, setMissing] = useState(false);
  const accountRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="s-float-demo"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const empty = account.trim() === '';
        setMissing(empty);
        if (empty) accountRef.current?.focus();
      }}
    >
      {/* t:floating */}
      <Field label={t.account} labelPlacement="floating" required requiredBadge={false} error={missing ? t.accountError : undefined}>
        {(control) => (
          <Input
            {...control}
            ref={accountRef}
            type="text"
            name="account"
            autoComplete="username"
            value={account}
            onChange={(event) => {
              setAccount(event.target.value);
              setMissing(false);
            }}
          />
        )}
      </Field>

      {/* t:password */}
      <Field label={t.password} labelPlacement="floating" required requiredBadge={false}>
        {(control) => <PasswordInput {...control} name="password" autoComplete="current-password" />}
      </Field>

      <Button type="submit" variant="primary">
        {t.submit}
      </Button>
    </form>
  );
}
