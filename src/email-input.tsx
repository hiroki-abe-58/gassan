import { forwardRef, useId, useRef, useState } from 'react';

import { Button } from './button';
import { ModalInput, type ModalInputProps } from './inputs';
import { mergeRefs } from './internal/controllable';
import { setNativeValue } from './internal/normalize';
import { COMMON_EMAIL_DOMAINS, isCarrierEmail, normalizeEmail, suggestEmail } from './japanese';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

export interface ModalEmailInputProps extends Omit<ModalInputProps, 'type' | 'normalize' | 'end'> {
  /** 打ち間違いの候補を探すドメイン。既定は COMMON_EMAIL_DOMAINS。空の配列で候補を出さない。 */
  domains?: readonly string[];
  /** 携帯会社のメールのときに出す注意。既定 true。確認のメールを送らない欄（ログインなど）では false に。 */
  carrierNotice?: boolean;
  /** 確認のメールの送り主（「example.com」「no-reply@example.com」）。携帯会社のメールへの注意に入れる。 */
  sender?: string;
}

/**
 * メールアドレスの入力。I-30。
 *
 * 全角・IME のまま打った「。」「ー」・空白を、打つたびに直す（I-25 の normalizeEmail）。
 * 欄を離れたとき、よく使われるドメインの打ち間違い（gmial.com）に「もしかして 〜 ですか？」と候補を出し、
 * ボタンで直せる。勝手には直さない（社内のドメインを書き換えない）。候補は読み上げにも知らせる（role="status"）。
 * 携帯会社のメール（docomo.ne.jp など）には、迷惑メールの設定で確認のメールが届かないことへの注意を、
 * 欄の説明として出す（エラーにはしない）。
 * autoComplete の既定は "email"。ログインの欄では "username" を渡す。
 */
// forwardRef の前の PURE の注釈は、使わないアプリの束から部品ごと外せるようにするため（src/japanese.ts の先頭の注を参照）
export const ModalEmailInput = /* @__PURE__ */ forwardRef<HTMLInputElement, ModalEmailInputProps>(function ModalEmailInput(
  { domains = COMMON_EMAIL_DOMAINS, carrierNotice = true, sender, onBlur, onChange, 'aria-describedby': describedBy, ...inputProps },
  ref,
) {
  const labels = useLabels();
  const phrase = usePhrase();
  const inputRef = useRef<HTMLInputElement>(null);
  const noticeId = `${useId()}-notice`;
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [value, setValue] = useState(String(inputProps.value ?? inputProps.defaultValue ?? ''));
  const current = inputProps.value !== undefined ? String(inputProps.value) : value;
  const carrier = carrierNotice && isCarrierEmail(current);

  return (
    <>
      {/* 濾過は Modal.Input が行う。 */}
      <ModalInput
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        {...inputProps}
        ref={mergeRefs(ref, inputRef)}
        normalize={normalizeEmail}
        aria-describedby={[describedBy, carrier ? noticeId : null].filter(Boolean).join(' ') || undefined}
        onChange={(event) => {
          setValue(event.target.value);
          setSuggestion(null);
          onChange?.(event);
        }}
        onBlur={(event) => {
          setSuggestion(suggestEmail(event.target.value, domains));
          onBlur?.(event);
        }}
      />
      <div className="g-email-suggest">
        <p className="g-help g-live" role="status">
          {suggestion ? phrase(labels.emailSuggestion(suggestion)) : null}
        </p>
        {suggestion ? (
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => {
              const input = inputRef.current;
              if (!input) return;
              setNativeValue(input, suggestion);
              input.focus();
            }}
          >
            {labels.emailSuggestionApply}
          </Button>
        ) : null}
      </div>
      {carrier ? (
        <p className="g-help" id={noticeId}>
          {phrase(labels.emailCarrierNotice(sender))}
        </p>
      ) : null}
    </>
  );
});
