import { type ReactNode } from 'react';

import { ModalSegmented } from './choices';
import { ModalField, ModalFieldset, type FieldControlProps } from './fields';
import { ModalInput } from './inputs';
import { usePatchable } from './internal/controllable';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { digitsOf, normalizeText, toKatakana, YUCHO_BANK_CODE, yuchoToBranch } from './japanese';
import { useLabels } from './labels';
import { usePhrase } from './phrase';
import { ModalCombobox, type SelectOption } from './select';

/** 預金種目。 */
export type BankAccountType = 'ordinary' | 'checking' | 'savings';

/** 振込先の口座。ゆうちょ銀行では、記号・番号から振込用の店番・種目・口座番号を埋める。 */
export interface BankAccount {
  /** 金融機関コード（4 桁）。 */
  bankCode: string;
  /** 店番（3 桁）。 */
  branchCode: string;
  accountType: BankAccountType;
  /** 口座番号（7 桁）。 */
  accountNumber: string;
  /** 口座名義。全角のカタカナで持つ。全銀の形（半角カナ）が要るなら送るときに toZenginKana を通す。 */
  accountHolder: string;
  /** ゆうちょ銀行の記号（5 桁）と番号（8 桁まで）。 */
  yuchoSymbol: string;
  yuchoNumber: string;
}

type BankAccountErrorKey = 'bank' | 'branch' | 'accountType' | 'accountNumber' | 'accountHolder' | 'yuchoSymbol' | 'yuchoNumber';

const EMPTY_ACCOUNT: BankAccount = {
  bankCode: '',
  branchCode: '',
  accountType: 'ordinary',
  accountNumber: '',
  accountHolder: '',
  yuchoSymbol: '',
  yuchoNumber: '',
};

/** 口座名義: かなを全角のカタカナに、英数字を半角の大文字に（「ﾔﾏﾀﾞ」「やまだ」「ｇｅｎｅｌａｂ」どれでも）。 */
const normalizeHolder = (value: string): string => toKatakana(normalizeText(value)).toUpperCase();
const digitsUpTo = (length: number) => (value: string): string => digitsOf(value).slice(0, length);

export interface BankAccountFieldsProps extends DataAttributes {
  /** 束の名前（legend。「振込先の口座」）。 */
  label: ReactNode;
  /** 金融機関の候補。value は 4 桁の金融機関コード、label は名前。keywords に読みがなを入れると、かなでも探せる。 */
  banks: readonly SelectOption[];
  /** 選んだ金融機関の支店の候補（value は 3 桁の店番）。金融機関が変わったら、利用側がその支店を読み直して渡す。 */
  branches: readonly SelectOption[];
  value?: BankAccount;
  defaultValue?: Partial<BankAccount>;
  onValueChange?: (value: BankAccount) => void;
  /** 選べる預金種目。既定は普通と当座。 */
  accountTypes?: readonly BankAccountType[];
  /** 欄ごとのエラー。 */
  errors?: Partial<Record<BankAccountErrorKey, ReactNode>>;
  help?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** ネイティブの form 送信の名前の頭。"payout" なら payout.bankCode など。 */
  name?: string;
  className?: string;
}

/**
 * 振込先の銀行口座。I-31。
 *
 * 金融機関と支店は、打って絞り込む Combobox（漢字・かな・コードのどれでも探せる）。データはライブラリが持たず、利用側が渡す。
 * 口座名義は、ひらがな・半角カナ・全角の英字で打っても全角のカタカナにそろえる（「半角カナで入力してください」と言わない）。
 * 口座番号は数字だけ 7 桁まで。ゆうちょ銀行（9900）を選ぶと、支店・種目・口座番号の代わりに通帳の記号と番号を聞き、
 * ほかの銀行から振り込むときの店名・種目・口座番号に直して見せ、値にも入れる。金融機関を変えたら支店を外す。
 */
export function BankAccountFields({
  label,
  banks,
  branches,
  value,
  defaultValue,
  onValueChange,
  accountTypes = ['ordinary', 'checking'],
  errors,
  help,
  required = false,
  disabled,
  name,
  className,
  ...rest
}: BankAccountFieldsProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const [current, update, latest] = usePatchable<BankAccount>(value, { ...EMPTY_ACCOUNT, ...defaultValue }, onValueChange);
  const fieldName = (key: keyof BankAccount): string | undefined => (name ? `${name}.${key}` : undefined);
  const yucho = current.bankCode === YUCHO_BANK_CODE;
  const transfer = yucho ? yuchoToBranch(current.yuchoSymbol, current.yuchoNumber) : null;

  /** ゆうちょ銀行の記号か番号が変わったら、振込用の店番・種目・口座番号も合わせる（直せなければ空に）。 */
  const updateYucho = (patch: Pick<Partial<BankAccount>, 'yuchoSymbol' | 'yuchoNumber'>): void => {
    const next = { ...latest.current, ...patch };
    const converted = yuchoToBranch(next.yuchoSymbol, next.yuchoNumber);
    update({
      ...patch,
      branchCode: converted?.branchCode ?? '',
      accountType: converted?.accountType ?? 'ordinary',
      accountNumber: converted?.accountNumber ?? '',
    });
  };

  /** 金融機関を変えたら支店を外す。ゆうちょ銀行へは記号・番号から振込用の値を作り直し、ゆうちょ銀行からはそれを外す。 */
  const changeBank = (bankCode: string): void => {
    const was = latest.current.bankCode;
    if (bankCode === was) return;
    if (bankCode === YUCHO_BANK_CODE) {
      update({ bankCode });
      updateYucho({});
      return;
    }
    update({ bankCode, branchCode: '', ...(was === YUCHO_BANK_CODE ? { accountType: 'ordinary', accountNumber: '' } : null) });
  };

  const textField = (key: 'accountNumber' | 'accountHolder' | 'yuchoSymbol' | 'yuchoNumber', fieldLabel: string, normalize: (value: string) => string, numeric: boolean) => (
    <ModalField label={fieldLabel} required={required} error={errors?.[key]} className={numeric ? 'g-bank-number' : undefined}>
      {(control: FieldControlProps) => (
        <ModalInput
          {...control}
          name={fieldName(key)}
          value={current[key]}
          inputMode={numeric ? 'numeric' : undefined}
          autoComplete={numeric ? 'off' : undefined}
          disabled={disabled}
          normalize={normalize}
          onChange={(event) => (key === 'yuchoSymbol' || key === 'yuchoNumber' ? updateYucho({ [key]: event.target.value }) : update({ [key]: event.target.value }))}
        />
      )}
    </ModalField>
  );

  return (
    <ModalFieldset
      {...domPassthrough(rest, 'BankAccountFields')}
      label={label}
      help={help}
      required={required}
      className={className ? `g-bank ${className}` : 'g-bank'}
    >
      <ModalField label={labels.bank} required={required} error={errors?.bank}>
        {(control: FieldControlProps) => (
          <ModalCombobox
            {...control}
            name={fieldName('bankCode')}
            options={banks}
            value={current.bankCode || null}
            disabled={disabled}
            onValueChange={(bankCode) => changeBank(bankCode ?? '')}
          />
        )}
      </ModalField>
      {yucho ? (
        <>
          <div className="g-bank-row">
            {textField('yuchoSymbol', labels.yuchoSymbol, digitsUpTo(5), true)}
            {textField('yuchoNumber', labels.yuchoNumber, digitsUpTo(8), true)}
          </div>
          <p className="g-help g-live g-bank-transfer" role="status">
            {transfer
              ? phrase(labels.yuchoTransfer(`${transfer.branchName}（${transfer.branchCode}）`, labels.accountTypeName(transfer.accountType), transfer.accountNumber))
              : null}
          </p>
        </>
      ) : (
        <>
          <ModalField label={labels.bankBranch} required={required} error={errors?.branch}>
            {(control: FieldControlProps) => (
              <ModalCombobox
                {...control}
                name={fieldName('branchCode')}
                options={branches}
                value={current.branchCode || null}
                disabled={disabled || current.bankCode === ''}
                onValueChange={(branchCode) => update({ branchCode: branchCode ?? '' })}
              />
            )}
          </ModalField>
          <ModalFieldset label={labels.accountType} required={required} error={errors?.accountType}>
            <ModalSegmented
              name={fieldName('accountType')}
              options={accountTypes.map((type) => ({ value: type, label: labels.accountTypeName(type) }))}
              value={current.accountType}
              disabled={disabled}
              onValueChange={(type) => {
                const accountType = accountTypes.find((candidate) => candidate === type);
                if (accountType) update({ accountType });
              }}
            />
          </ModalFieldset>
          {textField('accountNumber', labels.accountNumber, digitsUpTo(7), true)}
        </>
      )}
      {textField('accountHolder', labels.accountHolder, normalizeHolder, false)}
    </ModalFieldset>
  );
}
