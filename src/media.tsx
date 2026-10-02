import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import { prefersReducedMotion, warnDuplicateKeys, warnOnce } from './internal/dom';
import { useLabels } from './labels';
import { domPassthrough, type DataAttributes } from './internal/passthrough';

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

export interface ModalMediaProps extends DataAttributes {
  src: string;
  kind?: 'image' | 'video' | 'audio';
  /** 画像の代替テキスト。装飾なら空文字を明示する。B-08。 */
  alt?: string;
  /** "16 / 9" のような比率。指定すると読み込み前に場所を確保でき、揺れない。B-09。 */
  ratio?: string;
  poster?: string;
  caption?: ReactNode;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * 画像・動画・音声の最小ラッパ。
 *
 * autoplay は付けない。モーダルが開いた瞬間に音が出る体験は、
 * 「今これに集中してほしい」という意図を裏切る。B-11。
 */
export function ModalMedia({
  src,
  kind = 'image',
  alt,
  ratio,
  poster,
  caption,
  className,
  loading = 'lazy',
  ...rest
}: ModalMediaProps): ReactNode {
  useEffect(() => {
    if (kind === 'image' && alt === undefined) {
      warnOnce(
        `media-alt:${src}`,
        `<Modal.Media> image without alt: ${src}. Pass alt="" explicitly if decorative. (B-08)`,
      );
    }
  }, [kind, alt, src]);

  const style = ratio ? ({ '--g-ratio': ratio } as CSSProperties) : undefined;
  const classes = className ? `g-media ${className}` : 'g-media';

  let element: ReactNode;
  if (kind === 'video') {
    element = (
      <video className="g-media-el" src={src} poster={poster} controls preload="metadata" />
    );
  } else if (kind === 'audio') {
    element = <audio className="g-media-el g-media-audio" src={src} controls preload="metadata" />;
  } else {
    element = (
      <img className="g-media-el" src={src} alt={alt ?? ''} loading={loading} decoding="async" />
    );
  }

  if (!caption) {
    return (
      <div
        {...domPassthrough(rest, 'Modal.Media')}
        className={classes}
        data-kind={kind}
        style={style}
      >
        {element}
      </div>
    );
  }

  return (
    <figure
      {...domPassthrough(rest, 'Modal.Media')}
      className={classes}
      data-kind={kind}
      style={style}
    >
      {element}
      <figcaption className="g-media-caption">{caption}</figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Gallery                                                                    */
/* -------------------------------------------------------------------------- */

export interface ModalGalleryItem {
  id: string;
  content: ReactNode;
}

export interface ModalGalleryProps extends DataAttributes {
  label: string;
  items: readonly ModalGalleryItem[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
}

type IndexSource = 'init' | 'command' | 'scroll';

function clampIndex(value: number, length: number): number {
  if (length <= 0) return 0;
  if (value < 0) return 0;
  if (value > length - 1) return length - 1;
  return value;
}

/**
 * 画像・動画のスライダー。B-12。
 *
 * scroll-snap で実体を作り、ボタンとキーボードは「位置を指示するだけ」にする。
 * JS でトランスフォームを積むと、慣性スクロールと二重管理になって必ずずれる。
 *
 * index の変更元を持っているのは、
 * 指スクロール由来の index 更新に対してこちらから scrollTo を呼び返すと、
 * スクロールが自分自身と綱引きして震えるため。
 */
export function ModalGallery({
  label,
  items,
  initialIndex = 0,
  onIndexChange,
  className,
  ...rest
}: ModalGalleryProps): ReactNode {
  const labels = useLabels();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const total = items.length;

  const [state, setState] = useState<{ index: number; source: IndexSource }>(() => ({
    index: clampIndex(initialIndex, total),
    source: 'init',
  }));
  const index = clampIndex(state.index, total);

  const ids = items.map((item) => item.id).join('\u0000');
  useEffect(() => {
    warnDuplicateKeys('Modal.Gallery', 'items[].id', ids.split('\u0000'));
  }, [ids]);

  // 初回は「変わっていない」ので通知しない。
  // マウントしただけで onIndexChange(0) が飛ぶと、計測は幻の表示回数を数え、
  // setState を繋いだ利用側は初回に 1 回余分に描き直す。
  // 一方、items が縮んで index が切り詰められたのは「変わった」なので通知する。
  const notify = useRef(onIndexChange);
  notify.current = onIndexChange;
  const notified = useRef(index);
  useEffect(() => {
    if (notified.current === index) return;
    notified.current = index;
    notify.current?.(index);
  }, [index]);

  // 指示による移動のときだけスクロールを animate する。
  useEffect(() => {
    if (state.source === 'scroll') return;
    const track = trackRef.current;
    if (!track) return;
    const child = track.children.item(index) as HTMLElement | null;
    if (!child) return;
    const left = child.offsetLeft;
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({
        left,
        behavior: state.source === 'init' || prefersReducedMotion() ? 'auto' : 'smooth',
      });
    } else {
      track.scrollLeft = left;
    }
  }, [index, state.source]);

  const handleScroll = useCallback(() => {
    if (frameRef.current !== null) return;
    const raf =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(() => cb(0), 16) as unknown as number;
    frameRef.current = raf(() => {
      frameRef.current = null;
      const track = trackRef.current;
      if (!track) return;
      // 幅 0 は「0 だった」ではなく「測れない」（閉じた dialog の中など）。
      // ここで割り算すると位置が 0 に化け、ボタンやキーで進めた index を巻き戻す。§10-1 と同じ穴。
      const width = track.clientWidth;
      if (!width) return;
      const next = clampIndex(Math.round(track.scrollLeft / width), total);
      setState((previous) =>
        previous.index === next ? previous : { index: next, source: 'scroll' },
      );
    });
  }, [total]);

  useEffect(
    () => () => {
      if (frameRef.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [],
  );

  const go = useCallback(
    (next: number) => {
      setState({ index: clampIndex(next, total), source: 'command' });
    },
    [total],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          go(index + 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          go(index - 1);
          break;
        case 'Home':
          event.preventDefault();
          go(0);
          break;
        case 'End':
          event.preventDefault();
          go(total - 1);
          break;
        default:
          break;
      }
    },
    [go, index, total],
  );

  if (total === 0) return null;

  return (
    <div
      {...domPassthrough(rest, 'Modal.Gallery')}
      className={className ? `g-gallery ${className}` : 'g-gallery'}
    >
      <div
        className="g-gallery-track"
        ref={trackRef}
        // 横スクロール領域はキーボードでも動かせなければならない。B-02。
        tabIndex={0}
        role="group"
        aria-label={label}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="g-slide"
            role="group"
            aria-label={labels.galleryPosition(i + 1, total)}
            aria-current={i === index ? 'true' : undefined}
          >
            {item.content}
          </div>
        ))}
      </div>

      <div className="g-gallery-nav">
        <button
          type="button"
          className="g-iconbtn"
          aria-label={labels.previous}
          aria-disabled={index === 0 ? true : undefined}
          onClick={() => go(index - 1)}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M12.5 4.5 7 10l5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <p className="g-gallery-count">
          <span aria-hidden="true">
            {index + 1} / {total}
          </span>
          {/* 位置の変化は読み上げる。ただし視覚表現の「1 / 5」は読ませない。 */}
          <span className="g-sr-only" aria-live="polite">
            {labels.galleryPosition(index + 1, total)}
          </span>
        </p>

        <button
          type="button"
          className="g-iconbtn"
          aria-label={labels.next}
          aria-disabled={index === total - 1 ? true : undefined}
          onClick={() => go(index + 1)}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M7.5 4.5 13 10l-5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
