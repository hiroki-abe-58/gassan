import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

export default function KindFlow(): ReactNode {
  const t = useDemoText('kindFlow');
  const STEPS = [t.stepAddress, t.stepPayment, t.stepConfirm] as const;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const last = STEPS.length - 1;

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
      </button>

      <Modal.Root kind="flow" open={open} onOpenChange={setOpen} onExited={() => setStep(0)}>
        <Modal.Header>
          {/* t:slots */}
          <Modal.Controls
            start={step > 0 ? <Modal.Back onClick={() => setStep((s) => s - 1)} /> : undefined}
            center={<Modal.Indicator current={step + 1} total={STEPS.length} />}
            end={<Modal.Close />}
          />
          <Modal.Title>{fmt(t.title, STEPS[step] ?? '')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {step === 0 ? (
            <Modal.Field label={t.address} required>
              {(control) => <Modal.Input {...control} defaultValue={t.addressValue} />}
            </Modal.Field>
          ) : null}
          {step === 1 ? (
            <Modal.Field label={t.card} required help={t.cardHelp}>
              {(control) => <Modal.Input {...control} inputMode="numeric" autoComplete="cc-number" />}
            </Modal.Field>
          ) : null}
          {step === 2 ? (
            <Modal.Alert tone="info">{t.confirmNote}</Modal.Alert>
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          {step < last ? (
            <Modal.Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              {t.next}
            </Modal.Button>
          ) : (
            <Modal.Button variant="primary" closeOnClick="submit">
              {t.submit}
            </Modal.Button>
          )}
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
