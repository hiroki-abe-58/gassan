import type { ReactNode } from 'react';

import { data } from '../data';
import { InlineMd } from './Markdown';

/**
 * 型定義から抜き出した props の表。
 * 説明文は src の JSDoc そのもの。ここに手で書き足すと、型と表が別々に古くなる。
 */
export function ApiTable({ name, title }: { name: string; title?: string }): ReactNode {
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
      <div className="s-table-wrap" role="group" tabIndex={0} aria-label={`${name} のプロパティ`}>
        <table className="s-table s-api-table">
          <caption className="s-sr-only">{name} のプロパティ</caption>
          <thead>
            <tr>
              <th scope="col">名前</th>
              <th scope="col">型</th>
              <th scope="col">既定値</th>
              <th scope="col">説明</th>
            </tr>
          </thead>
          <tbody>
            {def.props.map((prop) => (
              <tr key={prop.name}>
                <th scope="row">
                  <code className="s-api-name">{prop.name}</code>
                  {prop.optional ? null : <span className="s-required">必須</span>}
                </th>
                <td>
                  <code className="s-api-typecode">{prop.type}</code>
                </td>
                <td>{prop.defaultValue ? <code>{prop.defaultValue}</code> : <span aria-label="なし">—</span>}</td>
                <td>{prop.doc ? <InlineMd text={prop.doc} /> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {passthrough || inherited.length > 0 ? (
        <ul className="s-api-notes">
          {passthrough ? (
            <li>
              <code>data-*</code> はホスト要素へそのまま渡す（D-11）。<code>aria-*</code> などハイフン付きのほかの
              prop は警告して落とす。
            </li>
          ) : null}
          {inherited.map((e) => (
            <li key={e}>
              <code>{e}</code> を継承する。
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
