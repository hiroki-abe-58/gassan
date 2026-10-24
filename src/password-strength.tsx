import type { ReactNode } from 'react';

import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels, type GassanLabels } from './labels';
import { usePhrase } from './phrase';

export interface PasswordRule {
  /** 識別子。 */
  id: string;
  label: ReactNode;
  test: (password: string) => boolean;
}

export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export interface ModalPasswordStrengthProps extends DataAttributes {
  /** 確かめるパスワード（入力欄の値）。 */
  value: string;
  /** 満たしてほしい条件。既定は「minLength 文字以上・数字・記号・大文字と小文字」。 */
  rules?: readonly PasswordRule[];
  /** 既定の長さの条件の文字数。既定 8。rules を渡したときは使わない。 */
  minLength?: number;
  /** 強さ（0〜4）。既定は満たした条件の割合から決める。長さを重く見る推定（zxcvbn など）を使うなら、その点を渡す。 */
  score?: PasswordScore;
  /** 入力欄の aria-describedby から指すための id。 */
  id?: string;
  className?: string;
}

/** 既定の条件。文言は labels から引く（言語を切り替えると変わる）。 */
function defaultRules(labels: GassanLabels, minLength: number): PasswordRule[] {
  return [
    { id: 'length', label: labels.passwordLength(minLength), test: (password) => [...password].length >= minLength },
    { id: 'number', label: labels.passwordNumber, test: (password) => /\p{Nd}/u.test(password) },
    { id: 'symbol', label: labels.passwordSymbol, test: (password) => /[^\p{L}\p{N}\s]/u.test(password) },
    { id: 'case', label: labels.passwordCase, test: (password) => /\p{Lu}/u.test(password) && /\p{Ll}/u.test(password) },
  ];
}

/** 強さの色。弱いうちは注意の色、半ばは警告、満たせば成功。 */
const TONES = ['error', 'error', 'warning', 'success', 'success'] as const;

/**
 * パスワードの強さと条件。I-22。
 *
 * 4 つの区切りのメーターと強さの言葉（「普通」）、条件ごとの印と状態（「満たしています」）を出す。
 * 色と印だけに頼らず、言葉でも伝える。打つたびに読み上げると入力の邪魔なので、ライブリージョンにはしない。
 * 入力欄の aria-describedby からこの id を指せば、入力欄に入ったときに条件が読まれる。
 */
export function ModalPasswordStrength({ value, rules, minLength = 8, score, id, className, ...rest }: ModalPasswordStrengthProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const list = rules ?? defaultRules(labels, minLength);
  const results = list.map((rule) => ({ rule, met: rule.test(value) }));
  const met = results.filter((result) => result.met).length;
  const level = score ?? (list.length > 0 ? (Math.round((met / list.length) * 4) as PasswordScore) : 0);
  const empty = value === '';
  return (
    <div
      {...domPassthrough(rest, 'Modal.PasswordStrength')}
      id={id}
      className={className ? `g-strength ${className}` : 'g-strength'}
      data-tone={empty ? 'neutral' : TONES[level]}
    >
      <div className="g-strength-row">
        <div className="g-strength-meter" aria-hidden="true">
          {[1, 2, 3, 4].map((step) => (
            <span key={step} className="g-strength-segment" data-filled={!empty && step <= level ? '' : undefined} />
          ))}
        </div>
        {empty ? null : <p className="g-strength-label">{labels.passwordStrength(level)}</p>}
      </div>
      {list.length > 0 ? (
        <ul className="g-strength-rules">
          {results.map(({ rule, met: ok }) => (
            <li key={rule.id} className="g-strength-rule" data-state={ok ? 'met' : undefined}>
              <Icon name={ok ? 'check' : 'minus'} className="g-strength-mark" />
              <span>{phrase(rule.label)}</span>
              <span className="g-sr-only">{ok ? labels.ruleMet : labels.ruleUnmet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
