import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

import { warnDuplicateKeys, warnOnce } from './internal/dom';
import { Icon } from './internal/icons';
import { useSnapTrack } from './internal/snap-track';
import { useLabels } from './labels';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { usePhrase } from './phrase';

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
  const phrase = usePhrase();
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
      <figcaption className="g-media-caption">{phrase(caption)}</figcaption>
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

/**
 * 画像・動画のスライダー。B-12。
 *
 * scroll-snap で実体を作り、ボタンとキーボードは「位置を指示するだけ」にする（useSnapTrack。カルーセルと共有）。
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
  const total = items.length;
  const { trackRef, index, go, onScroll } = useSnapTrack(total - 1, initialIndex);

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
        onScroll={onScroll}
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
          <Icon name="chevronLeft" />
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
          <Icon name="chevronRight" />
        </button>
      </div>
    </div>
  );
}
