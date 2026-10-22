import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { useControllable } from './internal/controllable';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/* -------------------------------------------------------------------------- */
/* Breadcrumbs                                                                */
/* -------------------------------------------------------------------------- */

export interface BreadcrumbItem {
  label: ReactNode;
  /** 行き先。最後の項目（今のページ）には要らない。 */
  href?: string;
}

export interface BreadcrumbsProps extends DataAttributes {
  items: readonly BreadcrumbItem[];
  /** nav の名前。既定 labels.breadcrumbs。 */
  label?: string;
  className?: string;
}

/**
 * 今のページまでの道筋。U-22。
 *
 * nav（名前は「パンくずリスト」）の中の順序のある一覧で、最後の項目が今のページ（aria-current="page"、リンクにしない）。
 * 区切りの印は飾りなので読ませない。狭い器では折り返す（項目を隠して辿れなくすることはしない）。
 */
export function Breadcrumbs({ items, label, className, ...rest }: BreadcrumbsProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  return (
    <nav {...domPassthrough(rest, 'Breadcrumbs')} aria-label={label ?? labels.breadcrumbs} className={cx('g-breadcrumbs', className)}>
      <ol className="g-breadcrumbs-list">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            // 項目は並べ替わらないので、位置を key にしてよい。
            <li key={index} className="g-breadcrumbs-item">
              {current || !item.href ? (
                <span className="g-breadcrumbs-text" aria-current={current ? 'page' : undefined}>
                  {phrase(item.label)}
                </span>
              ) : (
                <a className="g-breadcrumbs-link" href={item.href}>
                  {phrase(item.label)}
                </a>
              )}
              {current ? null : <Icon name="chevronRight" className="g-breadcrumbs-separator" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

export interface PaginationProps extends DataAttributes {
  /** 全部のページ数。 */
  count: number;
  page?: number;
  /** 既定 1。 */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** 渡すと各ページをリンクにする（URL でページを持つ一覧）。渡さなければボタン。 */
  getHref?: (page: number) => string;
  /** 今のページの両脇に出すページの数。既定 1。 */
  siblings?: number;
  /** nav の名前。既定 labels.pagination。1 画面に 2 つ置くなら、それぞれに名前を付ける。 */
  label?: string;
  className?: string;
}

type PageSlot = number | 'gap-start' | 'gap-end';

/**
 * 並べるページ。最初と最後のページ、今のページと両脇はいつも出し、間を「…」で詰める。
 * 項目の数は今のページによらず一定にする（ページを送るたびに幅が変わって、押そうとした所がずれないように）。
 * 「…」が 1 ページ分しか隠さないなら、そのページを出す（「1 … 3」でなく「1 2 3」）。
 */
function pageSlots(page: number, count: number, siblings: number): PageSlot[] {
  const slots = siblings * 2 + 5;
  if (count <= slots) return Array.from({ length: count }, (_, index) => index + 1);
  const first = Math.max(Math.min(page - siblings, count - siblings * 2 - 2), 3);
  const last = Math.min(Math.max(page + siblings, siblings * 2 + 3), count - 2);
  const middle = Array.from({ length: last - first + 1 }, (_, index) => first + index);
  return [1, first > 3 ? 'gap-start' : 2, ...middle, last < count - 2 ? 'gap-end' : count - 1, count];
}

/**
 * ページ送り。U-23。
 *
 * 今のページは aria-current="page"。各ページの名前は「3ページ目」（数字だけでは何の 3 か分からない）。
 * 端では「前へ」「次へ」を押せなくし、押せなくなったボタンにあったフォーカスは今のページへ移す（フォーカスを失わない）。
 * 器が狭い（360px 以下）ときは、ページの数字を畳んで「3 / 10」と前後だけにする。
 */
export function Pagination({
  count,
  page,
  defaultPage = 1,
  onPageChange,
  getHref,
  siblings = 1,
  label,
  className,
  ...rest
}: PaginationProps): ReactNode {
  const labels = useLabels();
  const navRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useControllable<number>(page, defaultPage, onPageChange);
  const total = Math.max(1, Math.floor(count));
  const at = Math.min(Math.max(1, current), total);
  /** 端へ送ったあと、押せなくなった「前へ」「次へ」から今のページへフォーカスを移す。 */
  const refocus = useRef(false);

  useLayoutEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
  }, [at]);

  const go = (target: number, fromEdgeControl: boolean): void => {
    if (target === at) return;
    refocus.current = fromEdgeControl && (target === 1 || target === total);
    setCurrent(target);
  };

  const control = (target: number, content: ReactNode, name: string, options: { current?: boolean; edge?: boolean; disabled?: boolean } = {}): ReactNode => {
    const common = {
      className: 'g-pagination-link',
      'aria-label': name,
      'aria-current': options.current ? ('page' as const) : undefined,
    };
    if (getHref) {
      // 押せない端のリンクは、行き先を持たない a にする（フォーカスも止まらない）。
      return options.disabled ? (
        <a {...common} aria-disabled="true">
          {content}
        </a>
      ) : (
        <a {...common} href={getHref(target)} onClick={() => go(target, options.edge === true)}>
          {content}
        </a>
      );
    }
    return (
      <button {...common} type="button" disabled={options.disabled} onClick={() => go(target, options.edge === true)}>
        {content}
      </button>
    );
  };

  return (
    <nav
      {...domPassthrough(rest, 'Pagination')}
      ref={navRef}
      aria-label={label ?? labels.pagination}
      className={cx('g-pagination', className)}
    >
      <ul className="g-pagination-list">
        <li className="g-pagination-step">
          {control(at - 1, <Icon name="chevronLeft" />, labels.previousPage, { edge: true, disabled: at <= 1 })}
        </li>
        {pageSlots(at, total, Math.max(0, Math.floor(siblings))).map((slot) =>
          typeof slot === 'number' ? (
            <li key={slot} className="g-pagination-page">
              {control(slot, slot, labels.pageNumber(slot), { current: slot === at })}
            </li>
          ) : (
            <li key={slot} className="g-pagination-gap" aria-hidden="true">
              …
            </li>
          ),
        )}
        {/* 狭い器でだけ見える「3 / 10」。数字のボタンを畳んだ代わりに、今どこかを伝える */}
        <li className="g-pagination-compact">
          {at} / {total}
        </li>
        <li className="g-pagination-step">
          {control(at + 1, <Icon name="chevronRight" />, labels.nextPage, { edge: true, disabled: at >= total })}
        </li>
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Steps                                                                      */
/* -------------------------------------------------------------------------- */

export interface StepItem {
  label: ReactNode;
  /** 補足（「5 分ほど」）。 */
  description?: ReactNode;
  key?: string;
}

export interface StepsProps extends DataAttributes {
  items: readonly StepItem[];
  /** 今の段（0 から）。それより前は完了、後は未着手。items.length にすると全部完了。 */
  current: number;
  /** 既定 'horizontal'。器が狭い（480px 以下）ときは縦に並ぶ。 */
  orientation?: 'horizontal' | 'vertical';
  /** 一覧の名前（「申し込みの手順」）。 */
  label?: string;
  className?: string;
}

/**
 * 手順のどこまで進んだか。U-24。
 *
 * 順序のある一覧で、今の段は aria-current="step"。各段の状態（完了・進行中・未着手）は文字でも添える
 * （色と印だけに頼らない）。番号の印は飾り（一覧の位置は支援技術が数える）。
 */
export function Steps({ items, current, orientation = 'horizontal', label, className, ...rest }: StepsProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  return (
    <ol {...domPassthrough(rest, 'Steps')} aria-label={label} className={cx('g-steps', className)} data-orientation={orientation}>
      {items.map((item, index) => {
        const state = index < current ? 'complete' : index === current ? 'current' : 'upcoming';
        return (
          <li
            key={item.key ?? (typeof item.label === 'string' ? item.label : String(index))}
            className="g-step"
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="g-step-marker" aria-hidden="true">
              {state === 'complete' ? <Icon name="check" /> : index + 1}
            </span>
            <span className="g-step-text">
              <span className="g-step-label">{phrase(item.label)}</span>
              {item.description ? <span className="g-step-description">{phrase(item.description)}</span> : null}
              <span className="g-sr-only">{labels.stepStatus(state)}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
