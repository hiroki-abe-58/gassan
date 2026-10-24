import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';

import { ModalCheckbox } from '../choices';
import { ModalAlert } from '../fields';
import { usePhrase } from '../phrase';

/**
 * onSubmit が返せるもの。error を返すとフォームの上に出す（入力はそのまま残す）。
 * error: true はテンプレートの既定の文（ログインなら「メールアドレスかパスワードが違います」）を出す。
 */
export type SubmitResult = void | { error?: ReactNode };

export type FormErrors<V> = Partial<Record<keyof V & string, string>>;

interface TemplateFormOptions<V> {
  initial: V;
  /** 直す所を返す。返した順に、まとめと各欄に出す。 */
  validate: (values: V) => FormErrors<V>;
  onSubmit?: (values: V) => SubmitResult | Promise<SubmitResult>;
  /** onSubmit が error を返さずに終わったとき。 */
  onSuccess?: (values: V) => void;
  /** onSubmit が例外を投げたときに出す文（例外の文はそのまま見せない。中身は開発者向けにコンソールへ出す）。 */
  submitFailed: string;
  /** onSubmit が error: true を返したときの文。既定は submitFailed。 */
  defaultError?: ReactNode;
  /** 失敗したとき（入力を消す・フォーカスを戻すなど）。 */
  onFailure?: () => void;
}

/**
 * テンプレートのフォームの状態。P-03。
 *
 * 送信するまではエラーを出さない（打っている途中で責めない）。送信して直す所があれば、フォームの上に
 * まとめを出してフォーカスを移し、各欄にもエラーを付ける。その後は打つたびにエラーを直す。
 * 送信の間は二度押しできず、失敗しても入力は消さない。
 */
export function useTemplateForm<V extends { [K in keyof V]: string | boolean }>({
  initial,
  validate,
  onSubmit,
  onSuccess,
  submitFailed,
  defaultError,
  onFailure,
}: TemplateFormOptions<V>) {
  const base = useId();
  const [values, setValues] = useState<V>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<ReactNode>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const focusSummary = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // まとめは描いた後にしか無いので、描き終えてからフォーカスを移す。
  useEffect(() => {
    if (!focusSummary.current) return;
    focusSummary.current = false;
    summaryRef.current?.focus();
  });

  const errors: FormErrors<V> = submitted ? validate(values) : {};
  const idOf = (name: keyof V & string): string => `${base}-${name}`;
  const set = <K extends keyof V>(name: K, value: V[K]): void => setValues((current) => ({ ...current, [name]: value }));

  const run = async (current: V): Promise<void> => {
    setFormError(null);
    setPending(true);
    try {
      const result = await onSubmit?.(current);
      if (result && result.error) {
        setFormError(result.error === true ? (defaultError ?? submitFailed) : result.error);
        onFailure?.();
      } else onSuccess?.(current);
    } catch (error) {
      console.error('[gassan] onSubmit rejected.', error);
      setFormError(submitFailed);
      onFailure?.();
    } finally {
      if (mounted.current) setPending(false);
    }
  };

  const attempt = (current: V): void => {
    if (pending) return;
    setSubmitted(true);
    if (Object.keys(validate(current)).length > 0) {
      setFormError(null);
      focusSummary.current = true;
      return;
    }
    void run(current);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    attempt(values);
  };

  /** 値を足して、すぐ送る（確認コードの桁がそろったとき）。同じイベントの中では state がまだ古いので、値を渡す。 */
  const submitWith = (partial: Partial<V>): void => {
    const next = { ...values, ...partial };
    setValues(next);
    attempt(next);
  };

  /** 値を戻し、欄のエラーを送信する前の状態に戻す（コードが違ったときに欄を空にする。空の欄を責めない）。 */
  const reset = (partial: Partial<V>): void => {
    setValues((current) => ({ ...current, ...partial }));
    setSubmitted(false);
  };

  /** まとめに並べる [入力欄の id, 文]。 */
  const summary = (Object.entries(errors) as [keyof V & string, string | undefined][])
    .filter((entry): entry is [keyof V & string, string] => Boolean(entry[1]))
    .map(([name, message]) => [idOf(name), message] as const);

  return { values, set, errors, pending, formError, handleSubmit, submitWith, reset, idOf, summary, summaryRef };
}

/**
 * 送信したときの、直す所のまとめ。P-03。
 *
 * 器にフォーカスを移し、中の role="alert" で読み上げる。各行は欄へのリンクで、押すと欄へフォーカスを移す
 * （ページ内リンクの既定の動きは、スクロールするだけで入力欄にフォーカスを渡さないブラウザがある）。
 */
export function ErrorSummary({
  title,
  items,
  summaryRef,
}: {
  title: string;
  items: readonly (readonly [string, string])[];
  summaryRef: RefObject<HTMLDivElement | null>;
}): ReactNode {
  const phrase = usePhrase();
  if (items.length === 0) return null;
  return (
    <div ref={summaryRef} className="g-form-summary" tabIndex={-1}>
      <div role="alert">
        <p className="g-form-summary-title">{phrase(title)}</p>
        <ul className="g-form-summary-list">
          {items.map(([id, message]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => {
                  const target = document.getElementById(id);
                  if (!target) return;
                  event.preventDefault();
                  target.focus();
                }}
              >
                {phrase(message)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * ボタン 1 つの操作（送り直す・ログアウトさせる・解約する）を走らせ、失敗の文を返す。成功なら null。
 * error: true は failed（既定の文）にし、投げられた例外の文は見せない（中身は開発者向けにコンソールへ）。P-03。
 */
export async function runAction(action: () => SubmitResult | Promise<SubmitResult>, failed: string): Promise<ReactNode> {
  try {
    const result = await action();
    if (result && result.error) return result.error === true ? failed : result.error;
    return null;
  } catch (error) {
    console.error('[gassan] action rejected.', error);
    return failed;
  }
}

/**
 * 日付を見せる（「2026年4月1日」）。機械が読む値と組にして time 要素に入れる。
 * 日付だけの文字列（'2026-04-01'）は UTC の 0 時として読み、UTC で書く（時差で前の日にならないように）。
 */
export function formatDate(value: Date | string, locale: string, timeZone?: string): { text: string; iso: string } {
  const dateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = value instanceof Date ? value : new Date(value);
  const text = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: dateOnly ? 'UTC' : timeZone }).format(date);
  return { text, iso: dateOnly ? (value as string) : date.toISOString() };
}

/** 日時を見せる（「2026/10/23 9:12」）。機械が読む値と組にして time 要素に入れる。時間帯は useTimeZone() で決める。 */
export function formatDateTime(value: Date | string, locale: string, timeZone?: string): { text: string; iso: string } {
  const date = value instanceof Date ? value : new Date(value);
  return { text: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(date), iso: date.toISOString() };
}

/** 送信に失敗した理由（サーバーからの文）。読み上げを割り込ませる。 */
export function FormError({ children }: { children: ReactNode }): ReactNode {
  return children ? (
    <ModalAlert tone="error" assertive>
      {children}
    </ModalAlert>
  ) : null;
}

/**
 * 同意の欄（規約・プライバシーポリシー）。同意が要るのに無いまま送ったら、欄の下に理由を出して欄に結ぶ。
 * 文の中のリンクは children に入れる（チェックボックスのラベルの中に置く）。
 */
export function ConsentField({
  id,
  checked,
  onCheckedChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  children: ReactNode;
}): ReactNode {
  const phrase = usePhrase();
  const errorId = `${id}-error`;
  return (
    <div className="g-field" data-invalid={error ? '' : undefined}>
      <ModalCheckbox
        id={id}
        name="agree"
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        {children}
      </ModalCheckbox>
      {error ? (
        <p className="g-error" id={errorId}>
          {phrase(error)}
        </p>
      ) : null}
    </div>
  );
}

/** メールアドレスの欄に共通の属性（打ちやすさのため。autocomplete は欄ごとに決める）。 */
export const EMAIL_INPUT = { type: 'email', inputMode: 'email', autoCapitalize: 'none', spellCheck: false } as const;

/** メールアドレスの形か。厳密な検査はサーバーに任せ、打ち間違い（@ が無い・ドメインが無い）だけを拾う。 */
export const looksLikeEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value.trim());

/**
 * 再送の待ち時間。start() から seconds 秒の間、remaining が 0 より大きい。P-04。
 * running なら、描き始めた時点から数え始める（送った直後の画面）。1 秒ごとに描き直す（待っている間だけ）。
 */
export function useCooldown(seconds: number, running = false): { remaining: number; start: () => void } {
  const [until, setUntil] = useState(() => (running ? Date.now() + seconds * 1000 : 0));
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((until - now) / 1000));
  const active = remaining > 0;
  useEffect(() => {
    if (!active) return undefined;
    // 数字は 1 秒ごとに、終わりは時刻ちょうどに描き直す。次の予約を描き直しの後に作ると、描き直しが
    // まとめられたとき（タブが裏にあった・テストで時間を一度に進めた）に、時間が進まなくなる。
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const end = setTimeout(() => setNow(Date.now()), Math.max(0, until - Date.now()));
    return () => {
      clearInterval(tick);
      clearTimeout(end);
    };
  }, [active, until]);
  return {
    remaining,
    start: () => {
      const at = Date.now();
      setNow(at);
      setUntil(at + seconds * 1000);
    },
  };
}
