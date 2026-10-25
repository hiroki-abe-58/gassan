import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { data } from '../data';
import { useT } from '../i18n';
import { InlineMd, md } from './Markdown';
import { TableScroll } from './TableScroll';

/**
 * 型定義から抜き出した props の表。
 * 説明文は src の JSDoc そのもの（原文のまま）。ここに手で書き足すと、型と表が別々に古くなる。
 */
export function ApiTable({ name, title }: { name: string; title?: string }): ReactNode {
  const t = useT().common.api;
  const def = data.api[name];
  if (!def) {
    if (import.meta.env.DEV) throw new Error(`公開型に ${name} が無い`);
    return null;
  }

  const passthrough = def.extends.includes('DataAttributes');
  const inherited = def.extends.filter((e) => e !== 'DataAttributes');

  return (
    <section className="s-api" aria-labelledby={`api-${name}`}>
      <h3 id={`api-${name}`} className="s-api-title">
        <code>{title ?? name}</code>
        {title ? <span className="s-api-type">{name}</span> : null}
      </h3>
      {def.doc ? (
        <p className="s-api-doc">
          <InlineMd text={def.doc} />
        </p>
      ) : null}
      <TableScroll label={t.propsOf(name)}>
        <table className="s-table s-api-table">
          <caption className="s-sr-only">{t.propsOf(name)}</caption>
          <thead>
            <tr>
              <th scope="col">{t.name}</th>
              <th scope="col">{t.type}</th>
              <th scope="col">{t.default}</th>
              <th scope="col">{t.description}</th>
            </tr>
          </thead>
          <tbody>
            {def.props.map((prop) => (
              <tr key={prop.name}>
                <th scope="row">
                  <code className="s-api-name">{prop.name}</code>
                  {prop.optional ? null : <span className="s-required">{t.required}</span>}
                </th>
                <td>
                  <code className="s-api-typecode">{prop.type}</code>
                </td>
                <td>{prop.defaultValue ? <code>{prop.defaultValue}</code> : <span aria-label={t.none}>—</span>}</td>
                <td>{prop.doc ? <InlineMd text={prop.doc} /> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      {passthrough || inherited.length > 0 ? (
        <ul className="s-api-notes">
          {passthrough ? (
            <li>
              <Phrase>{md(t.passthrough)}</Phrase>
            </li>
          ) : null}
          {inherited.map((e) => (
            <li key={e}>
              <Phrase>{md(t.inherits(e))}</Phrase>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
