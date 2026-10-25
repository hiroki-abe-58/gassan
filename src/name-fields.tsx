import { useRef, type ChangeEvent, type CompositionEvent, type ReactNode } from 'react';

import { ModalField, ModalFieldset, type FieldControlProps } from './fields';
import { ModalInput, type ModalInputProps } from './inputs';
import { usePatchable } from './internal/controllable';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { normalizeText, toHiragana, toKatakana } from './japanese';
import { useLabels } from './labels';

/** 姓・名とフリガナ。 */
export interface PersonName {
  familyName: string;
  givenName: string;
  familyNameKana: string;
  givenNameKana: string;
}

type NamePart = 'family' | 'given';

const EMPTY_NAME: PersonName = { familyName: '', givenName: '', familyNameKana: '', givenNameKana: '' };
const NAME_KEY = { family: 'familyName', given: 'givenName' } as const;
const KANA_KEY = { family: 'familyNameKana', given: 'givenNameKana' } as const;

/** 変換前の読み（かなと長音だけの文字列）。変換した後の漢字や、ローマ字の打ちかけ（「やまd」）は読みにしない。 */
const READING = /^[ぁ-ゖゝゞァ-ヺーヽヾ]+$/;

export interface NameFieldsProps extends DataAttributes {
  /** 束の名前（legend。「お名前」）。 */
  label: ReactNode;
  value?: PersonName;
  defaultValue?: Partial<PersonName>;
  onValueChange?: (value: PersonName) => void;
  /** フリガナの欄。'katakana'（既定。セイ・メイ）・'hiragana'（せい・めい）・false（出さない）。 */
  kana?: 'katakana' | 'hiragana' | false;
  /** 名前を IME で打ったときの変換前の読みから、フリガナを入れる。既定 true。フリガナの欄を自分で直したら止める。 */
  autoKana?: boolean;
  /** 欄ごとのエラー。 */
  errors?: Partial<Record<keyof PersonName, ReactNode>>;
  help?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** ネイティブの form 送信の名前の頭。"customer" なら customer.familyName など。 */
  name?: string;
  className?: string;
}

/**
 * 姓・名とフリガナ。I-28。
 *
 * 姓と名を分けて（autocomplete の family-name / given-name。ブラウザの自動入力が効く）、その下にフリガナ。
 * 名前を IME で打つと、変換する前のかな（compositionupdate の文字列）を覚えておき、確定したときにフリガナの欄へ足す。
 * 名前の欄を空にするとフリガナも消し、全体を選んで打ち直すとフリガナも置き換える。フリガナの欄を自分で直したら、
 * そこから先は触らない（空にすれば戻る）。読みは推測なので、フリガナの欄はいつでも直せる
 * （ライブ変換や予測変換で、変換前のかなが届かないことがある）。
 * 打った文字は、名前は normalizeText で、フリガナはカタカナかひらがなにそろえる（エラーにしない）。
 */
export function NameFields({
  label,
  value,
  defaultValue,
  onValueChange,
  kana = 'katakana',
  autoKana = true,
  errors,
  help,
  required = false,
  disabled,
  name,
  className,
  ...rest
}: NameFieldsProps): ReactNode {
  const labels = useLabels();
  const [current, update, latest] = usePatchable<PersonName>(value, { ...EMPTY_NAME, ...defaultValue }, onValueChange);
  const toScript = kana === 'hiragana' ? toHiragana : toKatakana;
  /** いま変換している文字列の読み。 */
  const readings = useRef<Record<NamePart, string>>({ family: '', given: '' });
  /** 変換が名前の全体を置き換えるか（全体を選んで打ち直した）。 */
  const replacing = useRef<Record<NamePart, boolean>>({ family: false, given: false });
  /** フリガナを自動で入れてよいか。利用者がフリガナの欄を打ったら false、空にしたら true。 */
  const owned = useRef<Record<NamePart, boolean>>({ family: current.familyNameKana === '', given: current.givenNameKana === '' });
  const auto = (part: NamePart): boolean => kana !== false && autoKana && owned.current[part];
  const fieldName = (key: keyof PersonName): string | undefined => (name ? `${name}.${key}` : undefined);

  const nameInput = (part: NamePart): ModalInputProps => ({
    name: fieldName(NAME_KEY[part]),
    value: current[NAME_KEY[part]],
    autoComplete: part === 'family' ? 'family-name' : 'given-name',
    normalize: normalizeText,
    onCompositionStart: (event: CompositionEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      readings.current[part] = '';
      replacing.current[part] = input.value !== '' && input.selectionStart === 0 && input.selectionEnd === input.value.length;
    },
    onCompositionUpdate: (event: CompositionEvent<HTMLInputElement>) => {
      if (READING.test(event.data)) readings.current[part] = event.data;
    },
    onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => {
      const reading = READING.test(event.data) ? event.data : readings.current[part];
      readings.current[part] = '';
      if (!reading || !auto(part)) return;
      const before = replacing.current[part] ? '' : latest.current[KANA_KEY[part]];
      update({ [KANA_KEY[part]]: before + toScript(reading) });
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      update({ [NAME_KEY[part]]: next, ...(next === '' && auto(part) ? { [KANA_KEY[part]]: '' } : null) });
    },
  });

  const kanaInput = (part: NamePart): ModalInputProps => ({
    name: fieldName(KANA_KEY[part]),
    value: current[KANA_KEY[part]],
    normalize: toScript,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      owned.current[part] = event.target.value === '';
      update({ [KANA_KEY[part]]: event.target.value });
    },
  });

  const field = (key: keyof PersonName, fieldLabel: string, input: ModalInputProps): ReactNode => (
    <ModalField label={fieldLabel} required={required} error={errors?.[key]}>
      {(control: FieldControlProps) => <ModalInput {...control} {...input} disabled={disabled} />}
    </ModalField>
  );

  return (
    <ModalFieldset
      {...domPassthrough(rest, 'NameFields')}
      label={label}
      help={help}
      required={required}
      className={className ? `g-name-fields ${className}` : 'g-name-fields'}
    >
      <div className="g-name-grid">
        {field('familyName', labels.familyName, nameInput('family'))}
        {field('givenName', labels.givenName, nameInput('given'))}
        {kana !== false ? field('familyNameKana', labels.nameKana('family', kana), kanaInput('family')) : null}
        {kana !== false ? field('givenNameKana', labels.nameKana('given', kana), kanaInput('given')) : null}
      </div>
    </ModalFieldset>
  );
}
