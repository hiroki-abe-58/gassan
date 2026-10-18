import { useId, type ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

export interface Specimen {
  /** 状態の名前。見出しになり、部品の名前としても結ぶ（aria-labelledby）。 */
  label: string;
  render: (labelId: string) => ReactNode;
}

/** 本物の部品を状態ごとに並べる。見本なので、部品の名前は見出しの文字列から取る。 */
export function Specimens({ caption, items }: { caption: string; items: readonly Specimen[] }): ReactNode {
  const id = useId();
  return (
    <div className="s-specimens" role="group" aria-label={caption}>
      {items.map((item, index) => {
        const labelId = `${id}-${String(index)}`;
        return (
          <figure key={item.label} className="s-specimen">
            <figcaption className="s-specimen-label" id={labelId}>
              <Phrase>{item.label}</Phrase>
            </figcaption>
            <div className="s-specimen-stage">{item.render(labelId)}</div>
          </figure>
        );
      })}
    </div>
  );
}
