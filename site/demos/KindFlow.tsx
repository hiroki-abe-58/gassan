import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

const STEPS = ['配送先', '支払い', '確認'] as const;

export default function KindFlow(): ReactNode {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const last = STEPS.length - 1;

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        注文手続きへ
      </button>

      <Modal.Root kind="flow" open={open} onOpenChange={setOpen} onExited={() => setStep(0)}>
        <Modal.Header>
          {/* 1fr auto 1fr の 3 スロット。戻るの有無で中央がずれない（H-01） */}
          <Modal.Controls
            start={step > 0 ? <Modal.Back onClick={() => setStep((s) => s - 1)} /> : undefined}
            center={<Modal.Indicator current={step + 1} total={STEPS.length} />}
            end={<Modal.Close />}
          />
          <Modal.Title>{`ご注文の手続き — ${STEPS[step] ?? ''}`}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {step === 0 ? (
            <Modal.Field label="住所" required>
              {(control) => <input {...control} type="text" defaultValue="山形県鶴岡市羽黒町" />}
            </Modal.Field>
          ) : null}
          {step === 1 ? (
            <Modal.Field label="カード番号" required help="数字のみ">
              {(control) => <input {...control} type="text" inputMode="numeric" autoComplete="cc-number" />}
            </Modal.Field>
          ) : null}
          {step === 2 ? (
            <Modal.Alert tone="info">内容を確認して確定してください。確定後の変更はできません。</Modal.Alert>
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          {step < last ? (
            <Modal.Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              次へ
            </Modal.Button>
          ) : (
            <Modal.Button variant="primary" closeOnClick="submit">
              確定する
            </Modal.Button>
          )}
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
