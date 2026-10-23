import { useId, useRef, type ReactNode, type SyntheticEvent } from 'react';

import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { usePhrase } from './phrase';

export interface AccordionItem {
  /** 識別子。 */
  value: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  /** details 要素の id（その項目へのリンク（#id）を作るとき）。 */
  id?: string;
}

export interface AccordionProps extends DataAttributes {
  items: readonly AccordionItem[];
  /** 既定 'multiple'（いくつでも開ける）。'single' は 1 つ開くとほかを閉じる。 */
  type?: 'single' | 'multiple';
  /** 最初に開いておく項目。 */
  defaultValue?: readonly string[];
  /** 開いている項目が変わったとき（開いている value の一覧）。 */
  onValueChange?: (value: string[]) => void;
  className?: string;
}

/**
 * 開け閉めできる項目の並び（よくある質問・設定の詳細）。U-18。
 *
 * ネイティブの details / summary で作る。開閉・Enter と Space・読み上げの「展開・折りたたみ」はブラウザが持ち、
 * ページ内検索で閉じた中身が見つかれば開く。'single' は details の name で 1 つだけ開き、
 * name を知らないブラウザでも JS で同じにする。開閉の動きは ::details-content を使えるブラウザでだけ付ける。
 */
export function Accordion({ items, type = 'multiple', defaultValue = [], onValueChange, className, ...rest }: AccordionProps): ReactNode {
  const phrase = usePhrase();
  const name = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const handleToggle = (event: SyntheticEvent<HTMLDetailsElement>): void => {
    const root = rootRef.current;
    if (!root) return;
    const details = [...root.children].filter((child): child is HTMLDetailsElement => child instanceof HTMLDetailsElement);
    if (type === 'single' && event.currentTarget.open) {
      for (const other of details) if (other !== event.currentTarget && other.open) other.open = false;
    }
    onValueChange?.(details.flatMap((element, index) => (element.open && items[index] ? [items[index].value] : [])));
  };

  return (
    <div {...domPassthrough(rest, 'Accordion')} ref={rootRef} className={className ? `g-accordion ${className}` : 'g-accordion'}>
      {items.map((item) => (
        <details
          key={item.value}
          id={item.id}
          className="g-accordion-item"
          name={type === 'single' ? name : undefined}
          open={defaultValue.includes(item.value) || undefined}
          onToggle={handleToggle}
        >
          <summary
            className="g-accordion-summary"
            aria-disabled={item.disabled ? true : undefined}
            onClick={(event) => {
              if (item.disabled) event.preventDefault();
            }}
          >
            <span className="g-accordion-title">{phrase(item.title)}</span>
            <Icon name="chevronDown" className="g-accordion-icon" />
          </summary>
          <div className="g-accordion-content">{phrase(item.content)}</div>
        </details>
      ))}
    </div>
  );
}
