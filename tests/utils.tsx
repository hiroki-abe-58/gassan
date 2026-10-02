import { render, type RenderResult } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { vi } from 'vitest';

import { Modal } from '../src';
import type { CloseReason, ModalRootProps } from '../src';

/* -------------------------------------------------------------------------- */
/* observers                                                                  */
/* -------------------------------------------------------------------------- */

interface MockObserver {
  targets: Set<Element>;
  emit: (target: Element, isIntersecting: boolean) => void;
}
interface MockResize {
  targets: Set<Element>;
  emit: () => void;
}
interface Registry {
  intersection: Set<MockObserver>;
  resize: Set<MockResize>;
}

function registry(): Registry {
  return (globalThis as unknown as { __gassanObservers: Registry }).__gassanObservers;
}

/** テストから交差を起こす。観測されていなければ false。 */
export function emitIntersection(target: Element, isIntersecting: boolean): boolean {
  let hit = false;
  for (const observer of registry().intersection) {
    if (observer.targets.has(target)) {
      observer.emit(target, isIntersecting);
      hit = true;
    }
  }
  return hit;
}

export function emitResize(target?: Element): number {
  let count = 0;
  for (const observer of registry().resize) {
    if (!target || observer.targets.has(target)) {
      observer.emit();
      count += 1;
    }
  }
  return count;
}

/* -------------------------------------------------------------------------- */
/* layout                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * jsdom はレイアウトを持たず、scrollHeight も clientHeight も常に 0 を返す。
 * 「スクロールが必要な本文」を再現するには、ここを差し替えるしかない。
 */
export function mockScrollMetrics(
  el: Element,
  metrics: { scrollHeight: number; clientHeight: number; scrollTop?: number },
): { setScrollTop: (value: number) => void } {
  let top = metrics.scrollTop ?? 0;
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    get: () => metrics.scrollHeight,
  });
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    get: () => metrics.clientHeight,
  });
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => top,
    set: (value: number) => {
      top = value;
    },
  });
  return {
    setScrollTop: (value: number) => {
      top = value;
      el.dispatchEvent(new Event('scroll'));
    },
  };
}

/* -------------------------------------------------------------------------- */
/* render                                                                     */
/* -------------------------------------------------------------------------- */

export interface RenderModalOptions extends Partial<Omit<ModalRootProps, 'open' | 'onOpenChange'>> {
  children?: ReactNode;
  initialOpen?: boolean;
}

export interface RenderModalResult extends RenderResult {
  onOpenChange: ReturnType<typeof vi.fn>;
  dialog: () => HTMLDialogElement;
  panel: () => HTMLElement;
  scrim: () => HTMLElement;
  setOpen: (open: boolean) => void;
  trigger: () => HTMLButtonElement;
}

const defaultChildren = (
  <>
    <Modal.Header>
      <Modal.Controls end={<Modal.Close />} />
      <Modal.Title>設定を変更します</Modal.Title>
    </Modal.Header>
    <Modal.Body>本文のテキスト</Modal.Body>
    <Modal.Footer>
      <Modal.Button variant="primary">続ける</Modal.Button>
    </Modal.Footer>
  </>
);

export function renderModal(options: RenderModalOptions = {}): RenderModalResult {
  const { children, initialOpen = true, ...rootProps } = options;
  const onOpenChange = vi.fn();
  let external: ((open: boolean) => void) | null = null;

  function Harness(): ReactNode {
    const [open, setOpen] = useState(initialOpen);
    external = setOpen;
    return (
      <>
        <button type="button" data-testid="trigger" onClick={() => setOpen(true)}>
          開く
        </button>
        <Modal.Root
          {...rootProps}
          open={open}
          onOpenChange={(next: boolean, reason: CloseReason) => {
            onOpenChange(next, reason);
            setOpen(next);
          }}
        >
          {children ?? defaultChildren}
        </Modal.Root>
      </>
    );
  }

  const result = render(<Harness />);

  const query = <T extends Element>(selector: string): T => {
    const el = document.querySelector<T>(selector);
    if (!el) throw new Error(`not found: ${selector}`);
    return el;
  };

  return {
    ...result,
    onOpenChange,
    dialog: () => query<HTMLDialogElement>('dialog.g-dialog'),
    panel: () => query<HTMLElement>('.g-panel'),
    scrim: () => query<HTMLElement>('.g-scrim'),
    trigger: () => query<HTMLButtonElement>('[data-testid="trigger"]'),
    setOpen: (open: boolean) => external?.(open),
  };
}

/** ネイティブの Esc 相当。jsdom は Esc で cancel を発火しないので直接投げる。 */
export function pressEscape(dialog: HTMLDialogElement): Event {
  const event = new Event('cancel', { cancelable: true, bubbles: false });
  dialog.dispatchEvent(event);
  return event;
}
