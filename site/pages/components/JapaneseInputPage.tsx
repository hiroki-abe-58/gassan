import type { ReactNode } from 'react';

import {
  ageOn,
  digitsOf,
  formatPostalCode,
  isCarrierEmail,
  isCorporateNumber,
  isInvoiceNumber,
  isKana,
  isMobilePhone,
  isMyNumber,
  isPhoneNumber,
  isPostalCode,
  japaneseEra,
  normalizeAddress,
  normalizeEmail,
  normalizeInvoiceNumber,
  normalizePhone,
  normalizeText,
  suggestEmail,
  toFullWidth,
  toHalfWidth,
  toHiragana,
  toKatakana,
  toZenginKana,
  yuchoToBranch,
} from '@genelab/gassan';

import type { PageProps } from '../../routes';
import JapaneseAddress from '../../demos/JapaneseAddress';
import japaneseAddressSource from '../../demos/JapaneseAddress.tsx?raw';
import JapaneseBank from '../../demos/JapaneseBank';
import japaneseBankSource from '../../demos/JapaneseBank.tsx?raw';
import JapaneseBirthDate from '../../demos/JapaneseBirthDate';
import japaneseBirthDateSource from '../../demos/JapaneseBirthDate.tsx?raw';
import JapaneseEmail from '../../demos/JapaneseEmail';
import japaneseEmailSource from '../../demos/JapaneseEmail.tsx?raw';
import JapaneseName from '../../demos/JapaneseName';
import japaneseNameSource from '../../demos/JapaneseName.tsx?raw';
import JapaneseNormalize from '../../demos/JapaneseNormalize';
import japaneseNormalizeSource from '../../demos/JapaneseNormalize.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const IDS = ['I-25', 'I-26', 'I-27', 'I-28', 'I-29', 'I-30', 'I-31'];

/**
 * 関数の表。例の値は日本の入力そのものなので、どの言語でも同じ文字列を使い、結果はその場で関数に通して出す
 * （表と実装をずらさない）。
 */
const FUNCTIONS: readonly { name: string; input: string; run: (value: string) => unknown }[] = [
  { name: 'toHalfWidth', input: 'ＡＢＣ１２３　＠', run: toHalfWidth },
  { name: 'toFullWidth', input: 'ABC 123 ｶﾞｯｺｳ', run: toFullWidth },
  { name: 'normalizeText', input: 'ｶﾌﾞｼｷｶﾞｲｼｬ　Ｇｅｎｅ', run: normalizeText },
  { name: 'normalizeAddress', input: '千代田１－１ー１ ﾒｿﾞﾝ', run: normalizeAddress },
  { name: 'toKatakana', input: 'やまだ ﾀﾛｳ', run: toKatakana },
  { name: 'toHiragana', input: 'ヤマダ ﾀﾛｳ', run: toHiragana },
  { name: 'isKana', input: 'ヤマダ・タロウ', run: isKana },
  { name: 'toZenginKana', input: 'ヤマダ　キョウコ', run: toZenginKana },
  { name: 'digitsOf', input: '口座 １２３-4567', run: digitsOf },
  { name: 'formatPostalCode', input: '〒１００ー０００１', run: formatPostalCode },
  { name: 'isPostalCode', input: '100-0001', run: isPostalCode },
  { name: 'normalizePhone', input: '+81 (90) 1234-5678', run: normalizePhone },
  { name: 'isPhoneNumber', input: '03-1234-5678', run: isPhoneNumber },
  { name: 'isMobilePhone', input: '080 1234 5678', run: isMobilePhone },
  { name: 'isCorporateNumber', input: '7000012050002', run: isCorporateNumber },
  { name: 'normalizeInvoiceNumber', input: 't-7000012050002', run: normalizeInvoiceNumber },
  { name: 'isInvoiceNumber', input: 'T7000012050002', run: isInvoiceNumber },
  { name: 'isMyNumber', input: '1234 5678 9018', run: isMyNumber },
  { name: 'normalizeEmail', input: 'Ｔａｒｏ＠Ｇｍａｉｌ。ｃｏｍ', run: normalizeEmail },
  { name: 'suggestEmail', input: 'taro@gmial.com', run: suggestEmail },
  { name: 'isCarrierEmail', input: 'taro@docomo.ne.jp', run: isCarrierEmail },
  { name: 'yuchoToBranch', input: '10180, 12345671', run: (value) => yuchoToBranch(...(value.split(', ') as [string, string])) },
  { name: 'ageOn', input: '{ year: 2000, month: 4, day: 2 }, 2026-04-01', run: () => ageOn({ year: 2000, month: 4, day: 2 }, new Date(2026, 3, 1)) },
  { name: 'japaneseEra', input: '2019-05-01', run: (value) => japaneseEra(new Date(`${value}T00:00:00Z`)) },
];

export function JapaneseInputPage({ rest }: PageProps): ReactNode {
  const { nav, japaneseInput: t } = useT();
  return (
    <ComponentPage
      path="/components/japanese-input"
      rest={rest}
      title={nav.pages.japaneseInput}
      lead={t.lead}
      ids={IDS}
      overview={() => (
        <>
          <Section id="principles" title={t.principles.title}>
            <Prose>
              <Paras items={t.principles.rows} />
            </Prose>
          </Section>

          <Section id="normalize" title={t.normalize.title} intro={md(t.normalize.intro)}>
            <Example title={t.normalize.exampleTitle} description={t.normalize.exampleDescription} code={japaneseNormalizeSource} demo="japaneseNormalize">
              <JapaneseNormalize />
            </Example>
          </Section>

          <Section id="address" title={t.address.title} intro={md(t.address.intro)}>
            <Example title={t.address.exampleTitle} description={t.address.exampleDescription} code={japaneseAddressSource} demo="japaneseAddress">
              <JapaneseAddress />
            </Example>
          </Section>

          <Section id="name" title={t.name.title} intro={md(t.name.intro)}>
            <Example title={t.name.exampleTitle} description={t.name.exampleDescription} code={japaneseNameSource} demo="japaneseName">
              <JapaneseName />
            </Example>
          </Section>

          <Section id="birth-date" title={t.birthDate.title} intro={md(t.birthDate.intro)}>
            <Example title={t.birthDate.exampleTitle} description={t.birthDate.exampleDescription} code={japaneseBirthDateSource} demo="japaneseBirthDate">
              <JapaneseBirthDate />
            </Example>
          </Section>

          <Section id="email" title={t.email.title} intro={md(t.email.intro)}>
            <Example title={t.email.exampleTitle} description={t.email.exampleDescription} code={japaneseEmailSource} demo="japaneseEmail">
              <JapaneseEmail />
            </Example>
          </Section>

          <Section id="bank" title={t.bank.title} intro={md(t.bank.intro)}>
            <Example title={t.bank.exampleTitle} description={t.bank.exampleDescription} code={japaneseBankSource} demo="japaneseBank">
              <JapaneseBank />
            </Example>
          </Section>

          <Section id="recipes" title={t.recipes.title} intro={md(t.recipes.intro)}>
            <DataTable
              caption={t.recipes.tableCaption}
              head={[t.recipes.head.field, t.recipes.head.use, t.recipes.head.value]}
              rows={t.recipes.rows.map((row, index) => [row.field, md(row.use, `use${String(index)}`), md(row.value, `value${String(index)}`)])}
            />
          </Section>

          <Section id="functions" title={t.functions.title} intro={md(t.functions.intro)}>
            <DataTable
              caption={t.functions.tableCaption}
              head={[t.functions.head.name, t.functions.head.input, t.functions.head.output]}
              rows={FUNCTIONS.map((fn) => [<code key="name">{fn.name}</code>, <code key="input">{fn.input}</code>, <code key="output">{JSON.stringify(fn.run(fn.input))}</code>])}
            />
          </Section>

          <Section id="lookup" title={t.lookup.title} intro={md(t.lookup.intro)}>
            <CodeBlock lang="tsx" code={t.lookup.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalInputProps" title="Input" />
          <ApiTable name="ModalNativeSelectProps" title="NativeSelect" />
          <ApiTable name="ModalEmailInputProps" title="EmailInput" />
          <ApiTable name="AddressFieldsProps" title="AddressFields" />
          <ApiTable name="JapaneseAddress" />
          <ApiTable name="PostalAddress" />
          <ApiTable name="NameFieldsProps" title="NameFields" />
          <ApiTable name="PersonName" />
          <ApiTable name="BirthDateInputProps" title="BirthDateInput" />
          <ApiTable name="BankAccountFieldsProps" title="BankAccountFields" />
          <ApiTable name="BankAccount" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'I-09', 'I-12']} caption={t.a11yCaption} />}
    />
  );
}
