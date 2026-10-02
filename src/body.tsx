import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useModalContext } from './context';
import { hasIntersectionObserver, hasResizeObserver } from './internal/dom';
import { useEvent } from './internal/use-event';
import { useGateRegistration } from './gate';
import { useLabels } from './labels';
import { domPassthrough, type DataAttributes } from './internal/passthrough';

export interface ModalBodyProps extends DataAttributes {
  /**
   * 空でもよい（構造コンテナの規約。D-12）。
   *
   * `children: ReactNode` を必須にしても、中身があることは保証できない。
   * `{null}` `{undefined}` `{false}` `{[]}` はすべて ReactNode なので型を通り、
   * 弾けるのは「実行時には undefined と同じ」コメントだけの書き方に限られる。
   * 保証にならない制約で書き方だけを縛ることになるため、構造コンテナ
   * （Root / Header / Body / Section / Footer）では任意にする。
   * 名前を持つ部品（Title / Button / Consent など）は、空だと
   * アクセシブルネームが消えるので必須のままにしてある。
   */
  children?: ReactNode;
  className?: string;
  /** スクロール領域のアクセシブルネーム。既定は labels.body。B-03。 */
  label?: string;
  /** 読了ゲートを登録する。G-03〜G-05。 */
  readGate?: string;
  readGateReason?: string;
  readGateOrder?: number;
}

/**
 * モーダル内で唯一のスクロール領域。B-01。
 *
 * 読了判定は次の論理和で行う。G-03。
 *   1. 末尾センチネルが可視になった（マウス／タッチ／ホイール）
 *   2. 末尾マーカーにフォーカスが到達した（キーボード／スクリーンリーダー）
 *   3. そもそもスクロールが要らない高さだった
 *
 * スクロール位置だけで判定すると、仮想カーソルで読む利用者は
 * scroll イベントを発生させないため、永久にボタンを押せなくなる。
 */
export function ModalBody({
  children,
  className,
  label,
  readGate,
  readGateReason,
  readGateOrder = 0,
  ...rest
}: ModalBodyProps): ReactNode {
  const labels = useLabels();
  const { ids, bodyRef, open, scrollBodyByPage } = useModalContext('Modal.Body');
  const innerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [read, setRead] = useState(false);

  /** 一度満たしたら戻さない。再描画で解除されると利用者が混乱する。G-09。 */
  const markRead = useEvent(() => setRead(true));

  const measure = useEvent(() => {
    const el = bodyRef.current;
    if (!el) return;
    // 閉じているあいだ（display:none）は scrollHeight も clientHeight も 0 を返す。
    // ここを測って「スクロール不要だから読み終えた」と判定すると、
    // 一度も開いていないのに読了ゲートが充足する。測定不能なら手を出さない。
    if (el.clientHeight === 0) return;
    const scrollable = el.scrollHeight - el.clientHeight > 1;
    setAtStart(el.scrollTop <= 1);
    setAtEnd(!scrollable || el.scrollHeight - el.clientHeight - el.scrollTop <= 1);
    if (!scrollable) markRead();
  });

  const handleScroll = useCallback(() => {
    if (frameRef.current !== null) return;
    const raf =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(() => cb(0), 16) as unknown as number;
    frameRef.current = raf(() => {
      frameRef.current = null;
      measure();
    });
  }, [measure]);

  useEffect(
    () => () => {
      if (frameRef.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
    },
    [],
  );

  // 開いた瞬間はまだレイアウトが無いことがある。open の変化でも測り直す。
  useEffect(() => {
    measure();
  }, [open, children, measure]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !hasResizeObserver()) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    if (innerRef.current) observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [bodyRef, measure]);

  useEffect(() => {
    if (!readGate) return;
    const sentinel = sentinelRef.current;
    const root = bodyRef.current;
    if (!sentinel || !root || !hasIntersectionObserver()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) markRead();
      },
      { root, threshold: 0.9 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [readGate, bodyRef, markRead]);

  useGateRegistration(
    readGate,
    read,
    readGateReason ?? labels.unreadReason,
    scrollBodyByPage,
    readGateOrder,
  );

  return (
    <div
      {...domPassthrough(rest, 'Modal.Body')}
      className={className ? `k-body ${className}` : 'k-body'}
      ref={bodyRef}
      id={ids.body}
      // スクロール領域はキーボードでも操作できなければならない。B-02。
      tabIndex={0}
      role="group"
      aria-label={label ?? labels.body}
      data-at-start={atStart ? '' : undefined}
      data-at-end={atEnd ? '' : undefined}
      onScroll={handleScroll}
    >
      <div className="k-body-inner" ref={innerRef}>
        {children}
        {readGate ? (
          <>
            {/* 交差観測用。視覚にも支援技術にも出さない。 */}
            <div ref={sentinelRef} className="k-sentinel" aria-hidden="true" />
            {/* フォーカス到達用。フォーカスされたときだけ可視になる。 */}
            <span className="k-end-marker" tabIndex={0} onFocus={markRead}>
              {labels.endOfContent}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export interface ModalSectionProps extends DataAttributes {
  title?: ReactNode;
  /** 空でもよい（構造コンテナの規約。D-12。Modal.Body の children を参照）。 */
  children?: ReactNode;
  className?: string;
  /** 見出しレベル。ダイアログ名が h2 なので既定は h3。B-04。 */
  level?: 3 | 4 | 5;
}

/**
 * 本文内のサブセクション。
 * 見出しを持つなら section 要素にし、aria-labelledby で結ぶ。
 * 見出しが無いのに section にすると、支援技術に「名前のない領域」が増える。
 */
export function ModalSection({
  title,
  children,
  className,
  level = 3,
  ...rest
}: ModalSectionProps): ReactNode {
  const reactId = useId();
  const headingId = `kasane-section-${reactId}`;
  const classes = className ? `k-section ${className}` : 'k-section';

  if (title === undefined || title === null || title === false) {
    return (
      <div {...domPassthrough(rest, 'Modal.Section')} className={classes}>
        {children}
      </div>
    );
  }

  const Heading = `h${level}` as 'h3' | 'h4' | 'h5';

  return (
    <section
      {...domPassthrough(rest, 'Modal.Section')}
      className={classes}
      aria-labelledby={headingId}
    >
      <Heading id={headingId} className="k-section-title">
        {title}
      </Heading>
      {children}
    </section>
  );
}
