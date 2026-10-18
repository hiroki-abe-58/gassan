import { useRef, useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function FieldForm(): ReactNode {
  const t = useDemoText('fieldForm');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [seats, setSeats] = useState(3);
  const [errors, setErrors] = useState<string[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  const emailError = errors.includes('email') ? t.emailError : undefined;

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root
        kind="form"
        open={open}
        onOpenChange={setOpen}
        onExited={() => {
          setEmail('');
          setErrors([]);
        }}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* t:summary */}
          {errors.length > 0 ? <Modal.Alert tone="error">{fmt(t.alert, String(errors.length))}</Modal.Alert> : null}

          {/* t:field */}
          <Modal.Field label={t.email} required error={emailError} help={t.emailHelp}>
            {(control) => (
              <Modal.Input
                {...control}
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
          </Modal.Field>

          {/* t:group */}
          <Modal.Fieldset label={t.plan}>
            <Modal.RadioGroup
              value={plan}
              onValueChange={setPlan}
              options={[
                { value: 'free', label: t.planFree },
                { value: 'pro', label: t.planPro },
              ]}
            />
          </Modal.Fieldset>

          {/* t:native */}
          <Modal.Field label={t.seats}>
            {(control) => (
              <Modal.Slider
                {...control}
                min={1}
                max={20}
                value={seats}
                onValueChange={setSeats}
                showValue
                formatValue={(value) => fmt(t.seatsHelp, String(value))}
              />
            )}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          <Modal.Button
            variant="primary"
            onClick={() => {
              const next = email.includes('@') ? [] : ['email'];
              setErrors(next);
              if (next.length > 0) {
                emailRef.current?.focus();
                return;
              }
              setOpen(false);
            }}
          >
            {t.submit}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
