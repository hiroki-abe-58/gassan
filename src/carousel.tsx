import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import { prefersReducedMotion, warnDuplicateKeys } from './internal/dom';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useSnapTrack } from './internal/snap-track';
import { useEvent } from './internal/use-event';
import { useWidth } from './internal/use-width';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 自動で送る既定の間隔（ms）。読み終えるのに足りる長さにする（WCAG 2.2.2 の「5 秒を超えて動くもの」は止められること）。 */
const DEFAULT_INTERVAL = 6000;
/** スライドの間（px）。CSS の --g-carousel-gap と同じ値（minSlideWidth から枚数を決める計算に使う）。 */
const GAP = 16;

export interface CarouselItem {
  id: string;
  content: ReactNode;
  /** スライドの名前。既定は「5件中1件目」。見出しのあるスライドなら、その見出しと同じ語にする。 */
  label?: string;
}

export interface CarouselProps extends DataAttributes {
  /** カルーセルの名前（読み上げ）。「お知らせ」「導入事例」など。 */
  label: string;
  items: readonly CarouselItem[];
  /** 1 度に見せる枚数。既定 1。 */
  perView?: number;
  /** スライドの最小の幅（px）。渡すと、器の幅に収まるだけの枚数を 1 度に見せる（perView より優先。測れない間は perView）。 */
  minSlideWidth?: number;
  /** 自動で送る。true なら 6 秒ごと、数ならその ms ごと。既定 false。止めるボタンを先頭に置く。U-29。 */
  autoplay?: boolean | number;
  /** 端から反対の端へ回る。既定は autoplay のとき true。 */
  loop?: boolean;
  /** はじめに先頭に置くスライド。 */
  defaultIndex?: number;
  /** 先頭のスライドが変わったとき（はじめは呼ばない）。 */
  onIndexChange?: (index: number) => void;
  className?: string;
}

/**
 * カルーセル。U-28 / U-29（WAI-ARIA APG の carousel）。
 *
 * スライドは scroll-snap の横の列で、指やトラックパッドではそのまま送れる。前へ・次へ・点・自動再生は位置を指示するだけ
 * （useSnapTrack。モーダルのギャラリーと共有）。器は名前と「カルーセル」という役割の説明を持つ section、スライドは
 * 「5件中1件目」の名前と「スライド」という役割の説明を持つ group。自動で送るときは、止めるボタンを先頭に置き、
 * ポインタが乗っている間・フォーカスが中にある間・タブが隠れている間は止め（止めた所から続きを数える）、
 * 動きを減らす設定では止めた状態で始める。送っている間は位置の変化を読み上げない（aria-live を off にする）。
 */
export function Carousel({
  label,
  items,
  perView = 1,
  minSlideWidth,
  autoplay = false,
  loop,
  defaultIndex = 0,
  onIndexChange,
  className,
  ...rest
}: CarouselProps): ReactNode {
  const labels = useLabels();
  const phrase = usePhrase();
  const trackId = `${useId()}-track`;
  const rootRef = useRef<HTMLElement>(null);
  const width = useWidth(rootRef, 0);
  const total = items.length;
  const fitted = minSlideWidth && width > 0 ? Math.floor((width + GAP) / (minSlideWidth + GAP)) : perView;
  const shown = Math.max(1, Math.min(total, Math.floor(fitted)));
  const last = Math.max(0, total - shown);
  const { trackRef, index, go, onScroll } = useSnapTrack(last, defaultIndex);
  const interval = autoplay === true ? DEFAULT_INTERVAL : typeof autoplay === 'number' && autoplay > 0 ? autoplay : 0;
  const wraps = loop ?? interval > 0;

  const ids = items.map((item) => item.id).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('Carousel', 'items[].id', ids.split('\u0000'));
  }, [ids]);

  // 先頭のスライドが変わったら知らせる（はじめは変わっていないので呼ばない）
  const notify = useRef(onIndexChange);
  notify.current = onIndexChange;
  const notified = useRef(index);
  useEffect(() => {
    if (notified.current === index) return;
    notified.current = index;
    notify.current?.(index);
  }, [index]);

  /* ------------------------------------------------------------ 自動で送る */

  // サーバーでは止めた状態で描き、マウントしてから動きを減らす設定を見て始める（hydration で食い違わない）
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    setPlaying(interval > 0 && !prefersReducedMotion());
  }, [interval]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onVisibility = (): void => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  const running = interval > 0 && playing && !hovered && !focused && !hidden && last > 0;

  const next = (from: number): number => (from >= last ? (wraps ? 0 : last) : from + 1);
  const previous = (from: number): number => (from <= 0 ? (wraps ? last : 0) : from - 1);
  const advance = useEvent(() => {
    if (index >= last && !wraps) {
      setPlaying(false);
      return;
    }
    go(next(index));
  });

  // 残りの時間。止めた所から続きを数え、スライドが変わったら数え直す（点の線も同じ時間で伸びる）
  const remaining = useRef(interval);
  const startedAt = useRef(0);
  useEffect(() => {
    remaining.current = interval;
  }, [index, interval]);
  useEffect(() => {
    if (!running) return undefined;
    startedAt.current = Date.now();
    const timer = setTimeout(advance, Math.max(0, remaining.current));
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    };
  }, [running, index, advance]);

  /* ------------------------------------------------------------ 点 */

  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onDotKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, at: number): void => {
    // 横に並んだ点は、見た目の向きに合わせる（右から左の文書では ← が次）
    const rtl = typeof getComputedStyle === 'function' && getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    let to: number;
    if (event.key === forward) to = Math.min(last, at + 1);
    else if (event.key === backward) to = Math.max(0, at - 1);
    else if (event.key === 'Home') to = 0;
    else if (event.key === 'End') to = last;
    else return;
    event.preventDefault();
    go(to);
    dotRefs.current[to]?.focus();
  };

  if (total === 0) return null;

  const atStart = !wraps && index === 0;
  const atEnd = !wraps && index >= last;
  const position = labels.galleryPosition(index + 1, total);

  return (
    <section
      {...domPassthrough(rest, 'Carousel')}
      ref={rootRef}
      className={cx('g-carousel', className)}
      aria-roledescription={labels.carousel}
      aria-label={label}
      data-playing={interval > 0 && playing ? '' : undefined}
      data-paused={interval > 0 && playing && !running ? '' : undefined}
      style={{ '--g-carousel-per-view': shown, '--g-carousel-interval': `${String(interval)}ms` } as CSSProperties}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event: ReactFocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="g-carousel-viewport">
        {/* 止めるボタンは、Tab で最初に止まる所に置く（APG） */}
        {interval > 0 ? (
          <button
            type="button"
            className="g-carousel-rotation"
            aria-label={playing ? labels.stopRotation : labels.startRotation}
            onClick={() => setPlaying(!playing)}
          >
            <Icon name={playing ? 'pause' : 'play'} />
          </button>
        ) : null}
        {/* 送る器は Tab で止めない（前へ・次へと点で動かす。中のリンクやボタンには届く） */}
        <div id={trackId} ref={trackRef} className="g-carousel-track" tabIndex={-1} onScroll={onScroll}>
          {items.map((item, i) => (
            <div
              key={item.id}
              className="g-carousel-slide"
              role="group"
              aria-roledescription={labels.slide}
              aria-label={item.label ?? labels.galleryPosition(i + 1, total)}
              data-current={i >= index && i < index + shown ? '' : undefined}
            >
              {/* 中の素の要素の文字にも文節の折り返しを掛ける（W-05） */}
              {phrase(item.content)}
            </div>
          ))}
        </div>
      </div>
      {/* 前へ・次へは、スライドに重ねず下の列に置く（どの幅でも中身を隠さない） */}
      {last > 0 ? (
        <div className="g-carousel-controls">
          <button
            type="button"
            className="g-carousel-arrow"
            aria-label={labels.previous}
            aria-controls={trackId}
            aria-disabled={atStart ? true : undefined}
            onClick={() => {
              if (!atStart) go(previous(index));
            }}
          >
            <Icon name="chevronLeft" />
          </button>
          <div className="g-carousel-dots" role="group" aria-label={labels.slidePicker}>
            {Array.from({ length: last + 1 }, (_, i) => (
              <button
                key={`dot-${String(i)}`}
                ref={(node) => {
                  dotRefs.current[i] = node;
                }}
                type="button"
                className="g-carousel-dot"
                aria-label={labels.slideNumber(i + 1)}
                aria-current={i === index ? 'true' : undefined}
                tabIndex={i === index ? 0 : -1}
                onClick={() => go(i)}
                onKeyDown={(event) => onDotKeyDown(event, i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="g-carousel-arrow"
            aria-label={labels.next}
            aria-controls={trackId}
            aria-disabled={atEnd ? true : undefined}
            onClick={() => {
              if (!atEnd) go(next(index));
            }}
          >
            <Icon name="chevronRight" />
          </button>
        </div>
      ) : null}
      {/* 位置の変化を読み上げる。送っている間は読まない（APG。動くたびに読み上げると、ほかの読み上げを妨げる） */}
      <p className="g-sr-only" aria-live={running ? 'off' : 'polite'}>
        {position}
      </p>
    </section>
  );
}
