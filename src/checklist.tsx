import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';

import { IconButton } from './button';
import { Progress } from './feedback';
import { warnDuplicateKeys } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  done?: boolean;
  /** その手順へ進む操作（ボタンやリンク）。終えた手順には出さない。 */
  action?: ReactNode;
}

export interface ChecklistProps extends DataAttributes {
  /** 見出し（「はじめにやること」など）。 */
  title: string;
  description?: ReactNode;
  items: readonly ChecklistItem[];
  /** 渡すと、右上に閉じるボタンを出す。 */
  onDismiss?: () => void;
  /** 見出しの段。既定 2。 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * はじめのチェックリスト。U-33。登録した後に、使い始めるための手順を並べる。
 *
 * 見出しを名前にした region。見出しの下に「2 / 5 完了」の進み具合（U-06）を置き、手順は番号つきの並びにする。
 * 終えた手順は印をチェックに替えて文字を控えめにし、読み上げには「完了」「未完了」を添える（印と色だけに頼らない）。
 * 終えていない手順には、その手順へ進む操作を出す。操作を押して手順が終わり、操作が消えたら、次のまだの手順の操作へ
 * （無ければ見出しへ）フォーカスを移す（行き場を失わせない）。
 */
export function Checklist({ title, description, items, onDismiss, headingLevel = 2, className, ...rest }: ChecklistProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const headingId = `${useId()}-title`;
  const done = items.filter((item) => item.done).length;
  const Heading = `h${String(headingLevel)}` as 'h2' | 'h3' | 'h4';

  const ids = items.map((item) => item.id).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('Checklist', 'items[].id', ids.split('\u0000'));
  }, [ids]);

  // 最後にフォーカスのあった手順の操作。その手順が終わって操作が消えたら、フォーカスを次へ送る
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusedStep = useRef<string | null>(null);
  const doneKey = items.map((item) => (item.done ? '1' : '0')).join('');
  useLayoutEffect(() => {
    const step = items.find((item) => item.id === focusedStep.current);
    const section = sectionRef.current;
    if (!step?.done || !section || section.contains(document.activeElement)) return;
    focusedStep.current = null;
    const next = section.querySelector<HTMLElement>('.g-checklist-action :is(a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]))');
    (next ?? headingRef.current)?.focus();
    // items は doneKey で見ている（中身が同じ配列を作り直しただけでは動かさない）
  }, [doneKey]);

  return (
    <section ref={sectionRef} {...domPassthrough(rest, 'Checklist')} className={cx('g-checklist', className)} aria-labelledby={headingId}>
      <div className="g-checklist-head">
        <div className="g-checklist-heading">
          <Heading ref={headingRef} id={headingId} tabIndex={-1} className="g-checklist-title">
            {phrase(title)}
          </Heading>
          {description ? <p className="g-checklist-description">{phrase(description)}</p> : null}
        </div>
        {onDismiss ? (
          <IconButton label={labels.close} size="sm" onClick={onDismiss}>
            <Icon name="close" />
          </IconButton>
        ) : null}
      </div>
      <Progress
        className="g-checklist-progress"
        label={title}
        hideLabel
        size="sm"
        value={done}
        max={Math.max(items.length, 1)}
        valueText={(value) => labels.checklistProgress(value, items.length)}
      />
      <ol className="g-checklist-items">
        {items.map((item) => (
          <li key={item.id} className="g-checklist-item" data-done={item.done ? '' : undefined}>
            <span className="g-checklist-mark" aria-hidden="true">
              {item.done ? <Icon name="check" /> : null}
            </span>
            <div className="g-checklist-text">
              <p className="g-checklist-item-title">
                <span className="g-sr-only">{`${item.done ? labels.checklistDone : labels.checklistTodo} `}</span>
                {phrase(item.title)}
              </p>
              {item.description ? <p className="g-checklist-item-description">{phrase(item.description)}</p> : null}
            </div>
            {!item.done && item.action ? (
              <div
                className="g-checklist-action"
                onFocus={() => {
                  focusedStep.current = item.id;
                }}
              >
                {item.action}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
