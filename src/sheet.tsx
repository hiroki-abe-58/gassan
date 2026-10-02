'use client';

import { forwardRef, useCallback, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useModalContext } from './context';
import { useLabels } from './labels';
import { domPassthrough, type DataAttributes } from './internal/passthrough';

export interface ModalHandleProps extends DataAttributes {
  /** つまみのアクセシブルネーム。既定は labels.sheetHandle。 */
  label?: string;
  className?: string;
}

/**
 * シートのつまみ。H-09 / M-03。
 *
 * 2 つの顔を持つ。
 *
 *   ディテント無し … ただの掴みどころ。aria-hidden。フォーカスは止まらない。
 *                    「ここを持てば動かせる」という視覚的な合図だけを出す。
 *   ディテント有り … role="slider" のボタン。段をキーボードで移せる。
 *
 * 段をドラッグでしか動かせないと、ポインタを細かく操作できない人が
 * 高さを変えられなくなる。つまみが実際の操作子になるのはそのため。
 *
 * center / top 配置では何も描かない。中央のダイアログに掴みどころを出しても
 * 動かせるものが無く、フォーカスだけが余計に 1 つ増える。
 */
export const ModalHandle = forwardRef<HTMLDivElement, ModalHandleProps>(function ModalHandle(
  { label, className, ...rest },
  ref,
) {
  const { placement, detents, detentIndex, setDetentIndex } = useModalContext('Modal.Handle');
  const labels = useLabels();

  const last = detents.length - 1;
  const interactive = detents.length >= 2;

  const move = useCallback(
    (next: number) => setDetentIndex(next, { silent: true }),
    [setDetentIndex],
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowRight':
        case 'PageUp':
          event.preventDefault();
          move(detentIndex + 1);
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'PageDown':
          event.preventDefault();
          move(detentIndex - 1);
          break;
        case 'Home':
          event.preventDefault();
          move(0);
          break;
        case 'End':
          event.preventDefault();
          move(last);
          break;
        default:
          break;
      }
    },
    [detentIndex, last, move],
  );

  // クリックでも 1 段ずつ上がり、最上段で最下段へ戻る。
  // ドラッグできない人のための経路なので、消してはいけない。
  const onClick = useCallback(() => {
    move(detentIndex >= last ? 0 : detentIndex + 1);
  }, [detentIndex, last, move]);

  if (placement !== 'sheet') return null;

  const classes = ['g-handle', className].filter(Boolean).join(' ');

  if (!interactive) {
    return (
      <div
        {...domPassthrough(rest, 'Modal.Handle')}
        ref={ref}
        className={classes}
        data-g-swipe-origin=""
        aria-hidden="true"
      >
        <span className="g-handle-bar" />
      </div>
    );
  }

  const token = detents[detentIndex] ?? detents[last];

  return (
    <div
      {...domPassthrough(rest, 'Modal.Handle')}
      ref={ref}
      className={classes}
      data-g-swipe-origin=""
    >
      <button
        type="button"
        className="g-handle-grip"
        role="slider"
        aria-label={label ?? labels.sheetHandle}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={detentIndex}
        aria-valuetext={token ? labels.detent(token) : undefined}
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        onClick={onClick}
      >
        <span className="g-handle-bar" />
      </button>
    </div>
  );
});
