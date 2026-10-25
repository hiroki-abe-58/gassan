import { useState, type ReactNode } from 'react';

import { Field, Input, formatPostalCode, normalizeInvoiceNumber, normalizePhone, normalizeText, toFullWidth, toKatakana } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function JapaneseNormalize(): ReactNode {
  const t = useDemoText('japaneseNormalize');
  const [values, setValues] = useState({ postalCode: '', phone: '', kana: '', company: '', invoice: '', legacy: '' });
  const set = (key: keyof typeof values) => (event: { target: { value: string } }) => setValues({ ...values, [key]: event.target.value });

  return (
    <div className="s-demo-wide">
      <div className="s-jp-grid">
        {/* t:postalCode */}
        <Field label={t.postalCode} help={t.postalCodeHelp}>
          {(control) => <Input {...control} inputMode="numeric" autoComplete="postal-code" normalize={formatPostalCode} value={values.postalCode} onChange={set('postalCode')} />}
        </Field>
        {/* t:phone */}
        <Field label={t.phone} help={t.phoneHelp}>
          {(control) => <Input {...control} type="tel" autoComplete="tel" normalize={normalizePhone} value={values.phone} onChange={set('phone')} />}
        </Field>
        <Field label={t.kana} help={t.kanaHelp}>
          {(control) => <Input {...control} normalize={toKatakana} value={values.kana} onChange={set('kana')} />}
        </Field>
        <Field label={t.company} help={t.companyHelp}>
          {(control) => <Input {...control} autoComplete="organization" normalize={normalizeText} value={values.company} onChange={set('company')} />}
        </Field>
        <Field label={t.invoice} help={t.invoiceHelp}>
          {(control) => <Input {...control} inputMode="numeric" normalize={normalizeInvoiceNumber} value={values.invoice} onChange={set('invoice')} />}
        </Field>
        {/* t:legacy */}
        <Field label={t.legacy} help={t.legacyHelp}>
          {(control) => <Input {...control} normalize={toFullWidth} value={values.legacy} onChange={set('legacy')} />}
        </Field>
      </div>
      {/* t:received */}
      <output className="s-demo-log s-jp-values">{JSON.stringify(values, null, 2)}</output>
    </div>
  );
}
