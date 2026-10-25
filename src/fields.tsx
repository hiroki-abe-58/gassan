import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react';

import { warnDuplicateKeys } from './internal/dom';
import { useLabels } from './labels';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useScrollbars } from './internal/scrollbars';
import { usePhrase } from './phrase';

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

export interface FieldControlProps {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  'aria-required': true | undefined;
}

/**
 * gassan の入力部品が受ける配線。FieldControlProps をそのまま広げて渡せる。
 * Field の外で使うときは aria-label か aria-labelledby で名前を付ける。I-01。
 */
export interface ControlAria {
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
}

/**
 * 浮くラベルの Field の中か。入力部品はこれを見て、空のときだけ「出る」空白のプレースホルダを持つ
 * （値が空かどうかを CSS の :placeholder-shown で見るため。I-24）。
 */
export const FloatingLabelContext = createContext(false);

/** Field と Fieldset が共有する、ヘルプとエラーの id と aria-describedby。 */
function useMessages(baseId: string, help: ReactNode, error: ReactNode) {
  const phrase = usePhrase();
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  const messages = (
    <>
      {help ? (
        <p className="g-help" id={helpId}>
          {phrase(help)}
        </p>
      ) : null}
      {error ? (
        <p className="g-error" id={errorId}>
          {phrase(error)}
        </p>
      ) : null}
    </>
  );
  return { describedBy, messages };
}

/**
 * 囲む Fieldset の見出しが出した「必須 / 任意」（true / false）。出していなければ null。
 * 中の Field は、見出しと同じなら繰り返さず、違うとき（必須の住所の中の任意の建物名）だけ出す。
 */
const FieldsetRequiredContext = createContext<boolean | null>(null);

/** ラベルの中身。文言と「必須 / 任意」のバッジ（requiredBadge が false なら「任意」だけ）。 */
function LabelContent({ label, required, requiredBadge }: { label: ReactNode; required: boolean; requiredBadge: boolean }): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const group = useContext(FieldsetRequiredContext);
  return (
    <>
      <span className="g-label-text">{phrase(label)}</span>
      {(required && !requiredBadge) || group === required ? null : (
        <span className="g-label-badge" data-required={required ? '' : undefined}>
          {required ? labels.required : labels.optional}
        </span>
      )}
    </>
  );
}

export interface ModalFieldProps extends DataAttributes {
  label: ReactNode;
  children: (control: FieldControlProps) => ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** 「必須」のバッジを出すか。既定 true。false は全部が必須の短いフォーム（ログインなど）向けで、任意の項目にだけ「任意」を出す。 */
  requiredBadge?: boolean;
  /**
   * ラベルの置き場所。既定 'top'（入力欄の上）。'floating' は入力欄の枠の中に置き、フォーカスか値があると
   * 左上へ縮んで退く（I-24）。前に飾りの無い Input / PasswordInput 向けで、ほかの部品では 'top' と同じ形で出す。
   */
  labelPlacement?: 'top' | 'floating';
  id?: string;
  className?: string;
}

/**
 * ラベル・補助テキスト・エラーの配線を1箇所に閉じ込める。B-07。
 *
 * render prop にしているのは、中身をライブラリが決めないため。
 * ネイティブの input でも、Base UI の Select でも、同じ配線が使える。
 *
 * エラーに role="alert" は付けない。
 * 入力のたびに読み上げが割り込むと、かえって入力できなくなる。
 * 送信時のまとめは <Modal.Alert> の役目。
 *
 * labelPlacement="floating" では、ラベルと入力欄を 1 つの器（.g-float）に入れて重ねる。ラベルが浮くか
 * 中央に休むかは、入力欄のフォーカスと値から CSS が決める（I-24）。ラベルはいつも本物の <label> で、
 * 名前と説明の配線は変わらない。
 */
export function ModalField({
  label,
  children,
  help,
  error,
  required = false,
  requiredBadge = true,
  labelPlacement = 'top',
  id,
  className,
  ...rest
}: ModalFieldProps): ReactNode {
  const reactId = useId();
  const fieldId = id ?? `gassan-field-${reactId}`;
  const { describedBy, messages } = useMessages(fieldId, help, error);
  const floating = labelPlacement === 'floating';

  const labelElement = (
    <label className="g-label" htmlFor={fieldId}>
      <LabelContent label={label} required={required} requiredBadge={requiredBadge} />
    </label>
  );
  const control = (
    <FloatingLabelContext.Provider value={floating}>
      {children({
        id: fieldId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
    </FloatingLabelContext.Provider>
  );

  return (
    <div
      {...domPassthrough(rest, 'Modal.Field')}
      className={className ? `g-field ${className}` : 'g-field'}
      data-invalid={error ? '' : undefined}
      data-label-placement={floating ? 'floating' : undefined}
    >
      {floating ? (
        <div className="g-float">
          {labelElement}
          {control}
        </div>
      ) : (
        <>
          {labelElement}
          {control}
        </>
      )}

      {messages}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fieldset                                                                   */
/* -------------------------------------------------------------------------- */

export interface ModalFieldsetProps extends DataAttributes {
  /** legend になる。グループの名前。 */
  label: ReactNode;
  children: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** 「必須」のバッジを出すか。既定 true（Field と同じ）。 */
  requiredBadge?: boolean;
  id?: string;
  className?: string;
}

/**
 * 選択肢の束（ラジオ・チェックボックス・評価・2 つ摘みのスライダー）の配線。B-08 / I-09。
 *
 * 1 つの欄に名前を付ける Field と違い、束には fieldset と legend で名前を付ける。
 * <label> で束を包むと、中の各選択肢のラベルと名前が混ざる。
 * ヘルプとエラーは fieldset の aria-describedby に載せ、束に入ったときに読ませる。
 */
export function ModalFieldset({
  label,
  children,
  help,
  error,
  required = false,
  requiredBadge = true,
  id,
  className,
  ...rest
}: ModalFieldsetProps): ReactNode {
  const reactId = useId();
  const { describedBy, messages } = useMessages(id ?? `gassan-fieldset-${reactId}`, help, error);
  const outer = useContext(FieldsetRequiredContext);
  return (
    <fieldset
      {...domPassthrough(rest, 'Modal.Fieldset')}
      id={id}
      className={className ? `g-field g-fieldset ${className}` : 'g-field g-fieldset'}
      data-invalid={error ? '' : undefined}
      aria-describedby={describedBy}
    >
      <legend className="g-label">
        <LabelContent label={label} required={required} requiredBadge={requiredBadge} />
      </legend>
      {/* 見出しが「必須 / 任意」を出したら、中の Field はそれを繰り返さない（見出しが出さないなら外の束に従う） */}
      <FieldsetRequiredContext.Provider value={required && !requiredBadge ? outer : required}>{children}</FieldsetRequiredContext.Provider>
      {messages}
    </fieldset>
  );
}

/* -------------------------------------------------------------------------- */
/* Chips                                                                      */
/* -------------------------------------------------------------------------- */

export interface ChipOption {
  value: string;
  label: ReactNode;
}

export interface ModalChipsProps extends DataAttributes {
  label: string;
  options: readonly ChipOption[];
  value: readonly string[];
  onChange: (next: string[]) => void;
  className?: string;
}

/**
 * タグ／ジャンルの追加・解除。
 *
 * aria-pressed のトグルボタン群にする。role="listbox" にしないのは、
 * 「選ぶ」より「押して付け外しする」ほうが実態に近く、
 * listbox に必要な複雑なキーボード規約を持ち込まずに済むため。
 */
export function ModalChips({
  label,
  options,
  value,
  onChange,
  className,
  ...rest
}: ModalChipsProps): ReactNode {
  const phrase = usePhrase();
  const selected = new Set(value);

  const values = options.map((option) => option.value).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('Modal.Chips', 'options[].value', values.split('\u0000'));
  }, [values]);

  return (
    <div
      {...domPassthrough(rest, 'Modal.Chips')}
      className={className ? `g-chips ${className}` : 'g-chips'}
      role="group"
      aria-label={label}
    >
      {options.map((option) => {
        const isOn = selected.has(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className="g-chip"
            aria-pressed={isOn}
            onClick={() => {
              const next = new Set(selected);
              if (isOn) next.delete(option.value);
              else next.add(option.value);
              onChange([...next]);
            }}
          >
            <span className="g-chip-mark" aria-hidden="true">
              {isOn ? '×' : '+'}
            </span>
            <span>{phrase(option.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Switch                                                                     */
/* -------------------------------------------------------------------------- */

export interface ModalSwitchProps extends DataAttributes {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
  id?: string;
  /** 補足の文の id。スイッチの説明として読ませる（名前には混ぜない）。 */
  'aria-describedby'?: string;
}

/** role="switch" のトグル。ネイティブ button なので Space / Enter が既に効く。 */
export function ModalSwitch({
  checked,
  onCheckedChange,
  children,
  className,
  id,
  'aria-describedby': describedBy,
  ...rest
}: ModalSwitchProps): ReactNode {
  const phrase = usePhrase();
  return (
    <button
      {...domPassthrough(rest, 'Modal.Switch')}
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-describedby={describedBy}
      className={className ? `g-switch ${className}` : 'g-switch'}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="g-switch-track" aria-hidden="true">
        <span className="g-switch-thumb" />
      </span>
      <span className="g-switch-label">{phrase(children)}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Table                                                                      */
/* -------------------------------------------------------------------------- */

export interface ModalTableProps extends DataAttributes {
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * 横スクロールするテーブルのラッパ。B-13。
 * スクロールできる領域には名前とフォーカスを与える。
 * これが無いと、キーボードだけの利用者は右側の列に到達できない。
 */
export function ModalTable({
  label,
  children,
  className,
  ...rest
}: ModalTableProps): ReactNode {
  const phrase = usePhrase();
  const wrapRef = useRef<HTMLDivElement>(null);
  const bars = useScrollbars(wrapRef, { axes: ['x'] });
  return (
    // 横に送る窓（利用側の className と data-* は今までどおり窓に付ける）と、自前のバー（U-35）を重ねる器
    <div className="g-scroll">
      <div
        {...domPassthrough(rest, 'Modal.Table')}
        ref={wrapRef}
        className={className ? `g-table-wrap g-scroll-viewport ${className}` : 'g-table-wrap g-scroll-viewport'}
        role="group"
        tabIndex={0}
        aria-label={label}
      >
        {/* セルの文字列にも効かせる。<table> は素の HTML 要素なので、中まで潜って変換できる */}
        {phrase(children)}
      </div>
      {bars}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Alert                                                                      */
/* -------------------------------------------------------------------------- */

export interface ModalAlertProps extends DataAttributes {
  children: ReactNode;
  tone?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
  /** 送信失敗のまとめなど、即座に割り込ませたいときだけ true。 */
  assertive?: boolean;
}

/** 送信結果や検証エラーのまとめ。F-08。 */
export function ModalAlert({
  children,
  tone = 'error',
  className,
  assertive = false,
  ...rest
}: ModalAlertProps): ReactNode {
  const phrase = usePhrase();
  return (
    <div
      {...domPassthrough(rest, 'Modal.Alert')}
      className={className ? `g-alert ${className}` : 'g-alert'}
      data-tone={tone}
      role={assertive ? 'alert' : 'status'}
    >
      {phrase(children)}
    </div>
  );
}
