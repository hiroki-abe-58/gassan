import { useEffect, useId, useRef, type ReactNode } from 'react';

import { warnOnce } from './internal/dom';
import { useLabels } from './labels';
import { domPassthrough, type DataAttributes } from './internal/passthrough';

export interface ModalChartProps extends DataAttributes {
  /** 図の名前。figcaption になり、図のアクセシブルネームとして配線される。 */
  label: ReactNode;
  /**
   * 主要な傾向のテキスト代替（「3月に売上が最大、以降は横ばい」など）。B-14。
   * 図の aria-describedby として配線され、画面にも常に表示される。
   */
  summary: ReactNode;
  /** 視覚チャート本体。SVG / canvas / 任意のチャートライブラリ。gassan は描画しない。 */
  children: ReactNode;
  /** 元データ（表・リストなど）。渡すと <details> で開閉できる。 */
  data?: ReactNode;
  /** 元データを開く disclosure の文言。既定は labels.chartData（「元データを表示」）。 */
  dataLabel?: ReactNode;
  /**
   * 視覚チャート自体がアクセシブルか（ツールチップをキーボードで辿れる等）。既定 false。
   * false のあいだ視覚チャートは aria-hidden になり、名前・要約・元データが唯一の経路になる。
   */
  visualAccessible?: boolean;
  id?: string;
  className?: string;
}

const FOCUSABLE_IN_VISUAL =
  'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

/**
 * グラフのためのヘッドレスな器。B-14。
 *
 * チャートライブラリは作らない。持つのは次の3つだけ。
 *  1. 名前（figcaption → aria-labelledby）
 *  2. 主要な傾向のテキスト（→ aria-describedby）
 *  3. 元データの開閉（ネイティブの <details>。JS もキーボード処理も書かない）
 *
 * 視覚チャートは既定で aria-hidden にする。canvas や SVG の多くは支援技術に
 * 意味のある構造を出さず、出しても「path path path…」のような雑音になるため。
 * チャート側が本当にアクセシブルなときだけ visualAccessible で開放する。
 */
export function ModalChart({
  label,
  summary,
  children,
  data,
  dataLabel,
  visualAccessible = false,
  id,
  className,
  ...rest
}: ModalChartProps): ReactNode {
  const labels = useLabels();
  const reactId = useId();
  const baseId = id ?? `gassan-chart-${reactId}`;
  const captionId = `${baseId}-caption`;
  const summaryId = `${baseId}-summary`;
  const visualRef = useRef<HTMLDivElement | null>(null);

  // aria-hidden の内側にフォーカスできる要素があると、
  // 「フォーカスは当たるのに何も読まれない」場所ができる。開発時に知らせる。
  useEffect(() => {
    if (visualAccessible) return;
    const visual = visualRef.current;
    if (!visual || typeof visual.querySelector !== 'function') return;
    if (visual.querySelector(FOCUSABLE_IN_VISUAL)) {
      warnOnce(
        `chart-focusable:${baseId}`,
        '<Modal.Chart> hides its visual from assistive technology, but it contains focusable ' +
          'elements. Pass visualAccessible if the chart is keyboard/screen-reader ready. (B-14)',
      );
    }
  });

  return (
    <figure
      {...domPassthrough(rest, 'Modal.Chart')}
      id={baseId}
      className={className ? `g-chart ${className}` : 'g-chart'}
      aria-labelledby={captionId}
      aria-describedby={summaryId}
    >
      <figcaption id={captionId} className="g-chart-caption">
        {label}
      </figcaption>
      <div
        ref={visualRef}
        className="g-chart-visual"
        aria-hidden={visualAccessible ? undefined : true}
      >
        {children}
      </div>
      <p id={summaryId} className="g-chart-summary">
        {summary}
      </p>
      {data !== undefined && data !== null && data !== false ? (
        <details className="g-chart-data">
          <summary>{dataLabel ?? labels.chartData}</summary>
          <div className="g-chart-data-body">{data}</div>
        </details>
      ) : null}
    </figure>
  );
}
