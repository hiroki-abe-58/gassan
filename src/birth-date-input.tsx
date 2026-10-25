import { useMemo, useState, type ReactNode } from 'react';

import { ModalFieldset } from './fields';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { ageOn, japaneseEra } from './japanese';
import { useLabels } from './labels';
import { ModalNativeSelect } from './native-select';
import { usePhrase } from './phrase';

interface DateParts {
  year: string;
  month: string;
  day: string;
}

const EMPTY_PARTS: DateParts = { year: '', month: '', day: '' };

/** その月の日数。年が分からなければうるう年として（2 月 29 日を選べる）、月が分からなければ 31。 */
function daysIn(year: string, month: string): number {
  if (!month) return 31;
  return new Date(Date.UTC(year ? Number(year) : 2000, Number(month), 0)).getUTCDate();
}

/** 'YYYY-MM-DD' を年・月・日に。形が違うか、無い日付なら空。 */
function parse(value: string | null | undefined): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return EMPTY_PARTS;
  const [year, month, day] = [match[1] ?? '', String(Number(match[2])), String(Number(match[3]))];
  return Number(day) >= 1 && Number(month) >= 1 && Number(month) <= 12 && Number(day) <= daysIn(year, month) ? { year, month, day } : EMPTY_PARTS;
}

/** 年・月・日がそろっていれば 'YYYY-MM-DD'、そろっていなければ null。 */
function isoOf({ year, month, day }: DateParts): string | null {
  return year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : null;
}

export interface BirthDateInputProps extends DataAttributes {
  /** 束の名前（legend。「生年月日」）。 */
  label: ReactNode;
  /** 'YYYY-MM-DD'。年・月・日がそろうまでは null。渡すと制御になる。 */
  value?: string | null;
  defaultValue?: string | null;
  /** 年・月・日がそろうと日付で、どれかを外すと null で呼ばれる。 */
  onValueChange?: (value: string | null) => void;
  /** 選べる年の幅を、今日の年齢で（既定 0〜120 歳）。年齢の条件そのものは利用側が ageOn で確かめる。 */
  minAge?: number;
  maxAge?: number;
  /** 年に和暦を添える（「1990年（平成2年）」）。既定は言語が日本語のとき true。 */
  era?: boolean;
  /** 日付がそろったら満年齢を出す（選び間違いに気づける）。既定 true。 */
  showAge?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** 渡すと hidden input を置き、ネイティブの form 送信に 'YYYY-MM-DD' を載せる。 */
  name?: string;
  className?: string;
}

/**
 * 生年月日。I-29。
 *
 * 年・月・日の 3 つのネイティブの select（bday-year / bday-month / bday-day。自動入力とスマートフォンのピッカーが効く）。
 * 何十年も前の日付をカレンダーで送らせない。年は新しい順で、和暦を添える（改元の年は「昭和64年・平成元年」）。
 * 日は選んだ年と月にある日だけ。月や年を変えて無い日付になったら、日を空に戻す（黙って別の日にしない）。
 * そろったら満年齢を出す。値は 'YYYY-MM-DD' で、そろうまでは null。
 */
export function BirthDateInput({
  label,
  value,
  defaultValue = null,
  onValueChange,
  minAge = 0,
  maxAge = 120,
  era,
  showAge = true,
  help,
  error,
  required = false,
  disabled,
  name,
  className,
  ...rest
}: BirthDateInputProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const locale = labels.locale;
  const withEra = era ?? locale.startsWith('ja');
  const [parts, setParts] = useState(() => parse(value === undefined ? defaultValue : value));
  // 外から value が変わったら合わせる。自分が送った null（そろっていない途中）では、選びかけの年や月を消さない
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    if (value !== undefined && value !== isoOf(parts) && (value !== null || isoOf(parts) !== null)) setParts(parse(value));
  }

  const thisYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone: 'UTC' });
    const options = [];
    for (let year = thisYear - minAge; year >= thisYear - maxAge; year -= 1) {
      const text = format.format(new Date(Date.UTC(year, 6, 1)));
      const eras = [...new Set([japaneseEra(new Date(Date.UTC(year, 0, 1))), japaneseEra(new Date(Date.UTC(year, 11, 31)))])];
      options.push({ value: String(year), label: withEra ? labels.withEra(text, eras.join('・')) : text });
    }
    return options;
  }, [locale, thisYear, minAge, maxAge, withEra, labels]);
  const monthOptions = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
    return Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1), label: format.format(new Date(Date.UTC(2000, index, 1))) }));
  }, [locale]);
  const dayFormat = useMemo(() => new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' }), [locale]);
  const dayOptions = Array.from({ length: daysIn(parts.year, parts.month) }, (_, index) => ({
    value: String(index + 1),
    label: dayFormat.format(new Date(Date.UTC(2000, 0, index + 1))),
  }));

  const change = (patch: Partial<DateParts>): void => {
    let next = { ...parts, ...patch };
    if (next.day && Number(next.day) > daysIn(next.year, next.month)) next = { ...next, day: '' };
    setParts(next);
    const iso = isoOf(next);
    if (iso !== isoOf(parts)) onValueChange?.(iso);
  };

  const iso = isoOf(parts);
  const age = iso ? ageOn({ year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) }) : -1;
  const select = (part: keyof DateParts, partLabel: string, options: readonly { value: string; label: string }[], token: string): ReactNode => (
    <ModalNativeSelect
      aria-label={partLabel}
      aria-invalid={error ? true : undefined}
      aria-required={required ? true : undefined}
      autoComplete={token}
      disabled={disabled}
      options={options}
      placeholder={partLabel}
      value={parts[part]}
      onChange={(event) => change({ [part]: event.target.value })}
    />
  );

  return (
    <ModalFieldset
      {...domPassthrough(rest, 'BirthDateInput')}
      label={label}
      help={help}
      error={error}
      required={required}
      className={className ? `g-birthdate ${className}` : 'g-birthdate'}
    >
      <div className="g-birthdate-row">
        {select('year', labels.birthYear, yearOptions, 'bday-year')}
        {select('month', labels.birthMonth, monthOptions, 'bday-month')}
        {select('day', labels.birthDay, dayOptions, 'bday-day')}
      </div>
      {showAge ? (
        <p className="g-help g-live g-birthdate-age" role="status">
          {age >= 0 ? phrase(labels.age(age)) : null}
        </p>
      ) : null}
      {name ? <input type="hidden" name={name} value={iso ?? ''} /> : null}
    </ModalFieldset>
  );
}
