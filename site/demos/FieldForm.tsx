import { useRef, useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';

const PLANS = [
  { value: 'free', label: 'フリー' },
  { value: 'pro', label: 'プロ（月 980 円）' },
] as const;

export default function FieldForm(): ReactNode {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<string>('free');
  const [seats, setSeats] = useState(3);
  const [errors, setErrors] = useState<string[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  const emailError = errors.includes('email') ? '@ を含むメールアドレスを入力してください' : undefined;

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        メンバーを招待
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
          <Modal.Title>メンバーを招待</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* 送信失敗のまとめは 1 箇所に。フォーカスは最初のエラー項目へ（B-09） */}
          {errors.length > 0 ? <Modal.Alert tone="error">入力内容を確認してください（{errors.length} 件）</Modal.Alert> : null}

          {/* 1 つの入力は Modal.Field。ラベル・ヘルプ・エラーの配線を引き受ける（B-08） */}
          <Modal.Field label="メールアドレス" required error={emailError} help="招待メールが届きます">
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

          {/* 選択肢のグループは label ではなく fieldset / legend で名前を付ける */}
          <fieldset className="s-demo-fieldset">
            <legend className="g-label">プラン</legend>
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

          {/* range も date も、作り直さずネイティブを包むだけ */}
          <Modal.Field label="席数" help={`${String(seats)} 席`}>
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
            キャンセル
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
            招待する
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
