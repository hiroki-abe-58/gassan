import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from './button';
import { ModalField, ModalFieldset, type FieldControlProps } from './fields';
import { ModalInput, type ModalInputProps } from './inputs';
import { usePatchable } from './internal/controllable';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { digitsOf, formatPostalCode, normalizeAddress, PREFECTURES } from './japanese';
import { useLabels } from './labels';
import { ModalNativeSelect } from './native-select';
import { usePhrase } from './phrase';

/** 日本の住所。郵便番号は「123-4567」の形。 */
export interface JapaneseAddress {
  postalCode: string;
  /** 都道府県（PREFECTURES のどれか）。 */
  prefecture: string;
  /** 市区町村（「千代田区」「横浜市中区」）。 */
  city: string;
  /** 町名・番地（「千代田1-1」）。 */
  line1: string;
  /** 建物名・部屋番号。 */
  line2: string;
}

/** 郵便番号から引いた住所の候補。town は町域（「千代田」。番地は含まない）。 */
export interface PostalAddress {
  prefecture: string;
  city: string;
  town: string;
}

const EMPTY_ADDRESS: JapaneseAddress = { postalCode: '', prefecture: '', city: '', line1: '', line2: '' };
const PREFECTURE_OPTIONS = /* @__PURE__ */ PREFECTURES.map((name) => ({ value: name, label: name }));

/** 「東京」「東京都」のどちらでも PREFECTURES の名前にそろえる。当てはまらなければそのまま。 */
const toPrefecture = (name: string): string => PREFECTURES.find((prefecture) => prefecture === name || prefecture.startsWith(name)) ?? name;

type LookupState =
  | { status: 'idle' }
  | { status: 'searching' }
  | { status: 'filled'; address: string }
  | { status: 'candidates'; candidates: readonly PostalAddress[] }
  | { status: 'none' }
  | { status: 'failed' };

export interface AddressFieldsProps extends DataAttributes {
  /** 束の名前（legend。「お届け先の住所」）。 */
  label: ReactNode;
  value?: JapaneseAddress;
  defaultValue?: Partial<JapaneseAddress>;
  onValueChange?: (value: JapaneseAddress) => void;
  /**
   * 郵便番号（7 桁の数字）から住所の候補を返す。ライブラリは住所のデータを持たず、どこにも送らない。
   * 日本郵便のデータを自分のサーバーで引く・外部の API を呼ぶなどを、利用側が渡す。渡さなければ自動では入れない。
   */
  lookup?: (postalCode: string) => readonly PostalAddress[] | Promise<readonly PostalAddress[]>;
  /** 市区町村・町名番地・建物名の文字のそろえ方。既定は normalizeAddress（英数字とハイフンは半角、カナは全角）。全角にそろえるなら toFullWidth。 */
  normalize?: (value: string) => string;
  /** 欄ごとのエラー。 */
  errors?: Partial<Record<keyof JapaneseAddress, ReactNode>>;
  help?: ReactNode;
  /** 郵便番号・都道府県・市区町村・町名番地を必須にする（建物名はいつも任意）。 */
  required?: boolean;
  disabled?: boolean;
  /** autocomplete の頭（'shipping' / 'billing'）。届け先と請求先を 1 つのページに並べるとき、自動入力を分ける。 */
  autoCompleteSection?: 'shipping' | 'billing';
  /** ネイティブの form 送信の名前の頭。"shipping" なら shipping.postalCode など。 */
  name?: string;
  className?: string;
}

/**
 * 日本の住所。I-27。
 *
 * 郵便番号・都道府県（ネイティブの select。自動入力とスマートフォンのピッカーが効く）・市区町村・町名番地・建物名を、
 * autocomplete の postal-code / address-level1 / address-level2 / address-line1 / address-line2 で並べる。
 * 郵便番号は書き方を問わず「123-4567」にそろえ、7 桁がそろったら lookup で住所を引いて、空の欄（と前に自動で入れた欄）だけを埋める。
 * 利用者やブラウザの自動入力が入れた値は上書きしない。郵便番号を直したときは、自動で入れた町域を新しい町域に差し替え、
 * 後ろに打った番地は残す。入れた結果・候補が複数あること・見つからないこと・失敗は、欄の下に出して読み上げにも知らせる
 * （role="status"。エラーにはしない）。フォーカスは動かさない（打っている人の手元を奪わない）。
 * 候補が複数なら選ぶボタンを並べ、選んだら町名番地の欄へフォーカスを移す（押したボタンが消えるため）。
 */
export function AddressFields({
  label,
  value,
  defaultValue,
  onValueChange,
  lookup,
  normalize = normalizeAddress,
  errors,
  help,
  required = false,
  disabled,
  autoCompleteSection,
  name,
  className,
  ...rest
}: AddressFieldsProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const [current, update, latest] = usePatchable<JapaneseAddress>(value, { ...EMPTY_ADDRESS, ...defaultValue }, onValueChange);
  const [lookupState, setLookupState] = useState<LookupState>({ status: 'idle' });
  /** 前に自動で入れた値。これと同じなら、まだ利用者が触っていないとみなして入れ直してよい。 */
  const filled = useRef({ prefecture: '', city: '', town: '' });
  const line1Ref = useRef<HTMLInputElement>(null);
  const lookupRef = useRef(lookup);
  useLayoutEffect(() => {
    lookupRef.current = lookup;
  });

  /**
   * 候補で欄を埋め、知らせる状態を返す（何も入れなければ idle）。都道府県と市区町村は、空か前に自動で入れたままの欄だけ
   * （候補のボタンで選んだときは上書き）。町名番地は、空か前に入れた町域のままなら町域を、前の町域の後ろに番地を打っていれば
   * 町域だけを差し替える。
   */
  const apply = (candidate: PostalAddress, chosen: boolean): LookupState => {
    const now = latest.current;
    const prefecture = toPrefecture(candidate.prefecture);
    const patch: Partial<JapaneseAddress> = {};
    if (chosen || now.prefecture === '' || now.prefecture === filled.current.prefecture) patch.prefecture = prefecture;
    if (chosen || now.city === '' || now.city === filled.current.city) patch.city = candidate.city;
    const town = filled.current.town;
    if (now.line1 === '' || now.line1 === town) patch.line1 = candidate.town;
    else if (town !== '' && now.line1.startsWith(town)) patch.line1 = candidate.town + now.line1.slice(town.length);
    filled.current = { prefecture, city: candidate.city, town: candidate.town };
    if (Object.keys(patch).length === 0) return { status: 'idle' };
    update(patch);
    return { status: 'filled', address: `${prefecture}${candidate.city}${candidate.town}` };
  };

  const digits = digitsOf(current.postalCode);
  useEffect(() => {
    if (!lookupRef.current || digits.length !== 7) {
      setLookupState({ status: 'idle' });
      return undefined;
    }
    let cancelled = false;
    // ブラウザの自動入力は 1 つのタスクで全部の欄を埋める。次のタスクで引けば、自動入力が入れた値を上書きしない
    const timer = setTimeout(() => {
      setLookupState({ status: 'searching' });
      Promise.resolve()
        .then(() => lookupRef.current?.(digits) ?? [])
        .then(
          (candidates) => {
            if (cancelled) return;
            const [first] = candidates;
            if (!first) setLookupState({ status: 'none' });
            else if (candidates.length === 1) setLookupState(apply(first, false));
            else setLookupState({ status: 'candidates', candidates });
          },
          () => {
            if (!cancelled) setLookupState({ status: 'failed' });
          },
        );
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // apply と lookup は最新のものを ref から読むので、郵便番号が変わったときだけ引き直す
  }, [digits]);

  const auto = (token: string): string => (autoCompleteSection ? `${autoCompleteSection} ${token}` : token);
  const fieldName = (key: keyof JapaneseAddress): string | undefined => (name ? `${name}.${key}` : undefined);
  const text = (key: 'city' | 'line1' | 'line2', token: string): ModalInputProps => ({
    name: fieldName(key),
    value: current[key],
    autoComplete: auto(token),
    normalize,
    onChange: (event) => update({ [key]: event.target.value }),
  });

  const status =
    lookupState.status === 'searching'
      ? labels.addressSearching
      : lookupState.status === 'filled'
        ? labels.addressFilled(lookupState.address)
        : lookupState.status === 'candidates'
          ? labels.addressCandidates
          : lookupState.status === 'none'
            ? labels.addressNotFound
            : lookupState.status === 'failed'
              ? labels.addressLookupFailed
              : null;

  return (
    <ModalFieldset
      {...domPassthrough(rest, 'AddressFields')}
      label={label}
      help={help}
      required={required}
      className={className ? `g-address ${className}` : 'g-address'}
    >
      <ModalField label={labels.postalCode} required={required} error={errors?.postalCode} className="g-address-postal">
        {(control: FieldControlProps) => (
          <>
            <ModalInput
              {...control}
              name={fieldName('postalCode')}
              value={current.postalCode}
              autoComplete={auto('postal-code')}
              inputMode="numeric"
              disabled={disabled}
              normalize={formatPostalCode}
              onChange={(event) => update({ postalCode: event.target.value })}
            />
            {lookup ? (
              <p className="g-help g-live g-address-status" role="status" data-status={lookupState.status}>
                {status ? phrase(status) : null}
              </p>
            ) : null}
            {lookupState.status === 'candidates' ? (
              <div className="g-address-candidates" role="group" aria-label={labels.addressCandidates}>
                {lookupState.candidates.map((candidate) => {
                  const address = `${toPrefecture(candidate.prefecture)}${candidate.city}${candidate.town}`;
                  return (
                    <Button
                      key={address}
                      size="sm"
                      disabled={disabled}
                      onClick={() => {
                        setLookupState(apply(candidate, true));
                        line1Ref.current?.focus();
                      }}
                    >
                      {address}
                    </Button>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </ModalField>
      <ModalField label={labels.prefecture} required={required} error={errors?.prefecture} className="g-address-prefecture">
        {(control: FieldControlProps) => (
          <ModalNativeSelect
            {...control}
            name={fieldName('prefecture')}
            value={current.prefecture}
            autoComplete={auto('address-level1')}
            disabled={disabled}
            options={PREFECTURE_OPTIONS}
            placeholder={labels.choose}
            onChange={(event) => update({ prefecture: event.target.value })}
          />
        )}
      </ModalField>
      <ModalField label={labels.addressCity} required={required} error={errors?.city}>
        {(control: FieldControlProps) => <ModalInput {...control} {...text('city', 'address-level2')} disabled={disabled} />}
      </ModalField>
      <ModalField label={labels.addressLine1} required={required} error={errors?.line1}>
        {(control: FieldControlProps) => <ModalInput {...control} {...text('line1', 'address-line1')} ref={line1Ref} disabled={disabled} />}
      </ModalField>
      <ModalField label={labels.addressLine2} error={errors?.line2}>
        {(control: FieldControlProps) => <ModalInput {...control} {...text('line2', 'address-line2')} disabled={disabled} />}
      </ModalField>
    </ModalFieldset>
  );
}
