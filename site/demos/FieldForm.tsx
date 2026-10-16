import { useRef, useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function FieldForm(): ReactNode {
  const t = useDemoText('fieldForm');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<string>('free');
  const [seats, setSeats] = useState(3);
  const [errors, setErrors] = useState<string[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  const PLANS = [
    { value: 'free', label: t.planFree },
    { value: 'pro', label: t.planPro },
  ] as const;
  const emailError = errors.includes('email') ? t.emailError : undefined;

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
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
              <input
                {...control}
                ref={emailRef}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
          </Modal.Field>

          {/* t:group */}
          <fieldset className="s-demo-fieldset">
            <legend className="g-label">{t.plan}</legend>
            {PLANS.map((option) => (
              <label key={option.value} className="s-demo-choice">
                <input
                  type="radio"
                  name="plan"
                  value={option.value}
                  checked={plan === option.value}
                  onChange={() => setPlan(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          {/* t:native */}
          <Modal.Field label={t.seats} help={fmt(t.seatsHelp, String(seats))}>
            {(control) => (
              <input
                {...control}
                type="range"
                min={1}
                max={20}
                value={seats}
                onChange={(event) => setSeats(Number(event.target.value))}
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
