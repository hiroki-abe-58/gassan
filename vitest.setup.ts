/**
 * jsdom の穴埋め。
 *
 * ここで埋めているものは「jsdom に無い」だけで、実ブラウザでは本物が動く。
 * したがって、ここを厚くするほどテストの保証範囲は薄くなる。
 * 層1（top layer / inert / フォーカストラップ / :modal / @starting-style）は
 * jsdom では一切検証できない。その範囲は VERIFICATION.md に列挙し、
 * 実ブラウザでの手動確認に回す。
 */
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/* -------------------------------------------------------------------------- */
/* <dialog>                                                                   */
/* -------------------------------------------------------------------------- */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface DialogInternals {
  __gassanModal?: boolean;
}

if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype;

  if (typeof proto.showModal !== 'function') {
    proto.showModal = function showModal(this: HTMLDialogElement & DialogInternals) {
      if (this.open) return;
      this.setAttribute('open', '');
      this.__gassanModal = true;
      // ネイティブと同じく autofocus を優先し、無ければ最初のフォーカサブル。
      const target =
        this.querySelector<HTMLElement>('[autofocus]') ?? this.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus?.();
    };
  }

  if (typeof proto.show !== 'function') {
    proto.show = function show(this: HTMLDialogElement & DialogInternals) {
      if (this.open) return;
      this.setAttribute('open', '');
      this.__gassanModal = false;
    };
  }

  if (typeof proto.close !== 'function') {
    proto.close = function close(this: HTMLDialogElement & DialogInternals, returnValue?: string) {
      if (!this.open) return;
      this.removeAttribute('open');
      this.__gassanModal = false;
      if (returnValue !== undefined) this.returnValue = returnValue;
      // 実ブラウザでは task としてキューされる（＝非同期）。
      // ここを同期にするとテストは書きやすいが、実挙動と乖離する。
      // 非同期性そのものを扱う実装（dialog.open ガード）があるので、
      // あえて実ブラウザ寄りに queueMicrotask で流す。
      queueMicrotask(() => {
        this.dispatchEvent(new Event('close'));
      });
    };
  }
}

/* -------------------------------------------------------------------------- */
/* PointerEvent                                                               */
/* -------------------------------------------------------------------------- */

/**
 * jsdom は PointerEvent を持たない。
 * 無いままだと fireEvent.pointerDown が MouseEvent ですらない素の Event になり、
 * button も isPrimary も落ちる。つまり「右クリックでは閉じない」のような
 * 分岐がテストの側から到達不能になる。
 */
if (typeof window !== 'undefined' && typeof window.PointerEvent !== 'function') {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number;
    readonly isPrimary: boolean;
    readonly pointerType: string;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 1;
      this.isPrimary = params.isPrimary ?? true;
      this.pointerType = params.pointerType ?? 'mouse';
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0.5;
    }
  }
  (window as unknown as { PointerEvent: unknown }).PointerEvent = PointerEventPolyfill;
  (globalThis as unknown as { PointerEvent: unknown }).PointerEvent = PointerEventPolyfill;
}

/**
 * jsdom はポインタ捕捉 API そのものを実装していない（メソッドが存在しない）。
 *
 * 本物の捕捉を真似ることはできない。ここで足すのは「呼べる」ことだけで、
 * 捕捉した結果パネルの外の pointerup がパネルへ届くかどうかは
 * 実機側の検品に残る（VERIFICATION.md §3）。
 * スタブを置くのは、捕捉を要求したこと自体をテストから観測できるようにするため。
 */
if (typeof Element !== 'undefined' && typeof Element.prototype.setPointerCapture !== 'function') {
  const captured = new WeakMap<Element, Set<number>>();
  Element.prototype.setPointerCapture = function setPointerCapture(pointerId: number): void {
    const set = captured.get(this) ?? new Set<number>();
    set.add(pointerId);
    captured.set(this, set);
  };
  Element.prototype.releasePointerCapture = function releasePointerCapture(
    pointerId: number,
  ): void {
    captured.get(this)?.delete(pointerId);
  };
  Element.prototype.hasPointerCapture = function hasPointerCapture(pointerId: number): boolean {
    return captured.get(this)?.has(pointerId) ?? false;
  };
}

/* -------------------------------------------------------------------------- */
/* scrolling                                                                  */
/* -------------------------------------------------------------------------- */

if (typeof Element !== 'undefined') {
  if (typeof Element.prototype.scrollTo !== 'function') {
    Element.prototype.scrollTo = function scrollTo(
      this: Element,
      x?: number | ScrollToOptions,
      y?: number,
    ) {
      if (typeof x === 'number') {
        this.scrollLeft = x;
        this.scrollTop = y ?? this.scrollTop;
      } else if (x) {
        if (typeof x.left === 'number') this.scrollLeft = x.left;
        if (typeof x.top === 'number') this.scrollTop = x.top;
      }
      this.dispatchEvent(new Event('scroll'));
    } as Element['scrollTo'];
  }

  if (typeof Element.prototype.scrollBy !== 'function') {
    Element.prototype.scrollBy = function scrollBy(
      this: Element,
      x?: number | ScrollToOptions,
      y?: number,
    ) {
      if (typeof x === 'number') {
        this.scrollLeft += x;
        this.scrollTop += y ?? 0;
      } else if (x) {
        if (typeof x.left === 'number') this.scrollLeft += x.left;
        if (typeof x.top === 'number') this.scrollTop += x.top;
      }
      this.dispatchEvent(new Event('scroll'));
    } as Element['scrollBy'];
  }
}

/* -------------------------------------------------------------------------- */
/* observers                                                                  */
/* -------------------------------------------------------------------------- */

export interface ObserverRegistry {
  intersection: Set<MockIntersectionObserver>;
  resize: Set<MockResizeObserver>;
}

export class MockIntersectionObserver {
  readonly targets = new Set<Element>();
  readonly root: Element | Document | null = null;
  readonly rootMargin = '0px';
  readonly thresholds: readonly number[] = [0];

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.root = (options?.root as Element | Document | null) ?? null;
    registry.intersection.add(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
  }
  unobserve(target: Element): void {
    this.targets.delete(target);
  }
  disconnect(): void {
    this.targets.clear();
    registry.intersection.delete(this);
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** テストから交差を起こす。 */
  emit(target: Element, isIntersecting: boolean): void {
    if (!this.targets.has(target)) return;
    const entry = {
      target,
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    } as unknown as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
  }
}

export class MockResizeObserver {
  readonly targets = new Set<Element>();

  constructor(private readonly callback: ResizeObserverCallback) {
    registry.resize.add(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
  }
  unobserve(target: Element): void {
    this.targets.delete(target);
  }
  disconnect(): void {
    this.targets.clear();
    registry.resize.delete(this);
  }

  /** テストからリサイズを起こす。 */
  emit(): void {
    const entries = [...this.targets].map(
      (target) => ({ target, contentRect: target.getBoundingClientRect() }) as ResizeObserverEntry,
    );
    this.callback(entries, this as unknown as ResizeObserver);
  }
}

export const registry: ObserverRegistry = {
  intersection: new Set(),
  resize: new Set(),
};

(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
  MockIntersectionObserver;
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = MockResizeObserver;
(globalThis as unknown as { __gassanObservers: ObserverRegistry }).__gassanObservers = registry;

/* -------------------------------------------------------------------------- */
/* matchMedia                                                                 */
/* -------------------------------------------------------------------------- */

export const mediaState: { matches: Record<string, boolean> } = { matches: {} };

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string): MediaQueryList => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const list: MediaQueryList = {
      get matches() {
        return mediaState.matches[query] ?? false;
      },
      media: query,
      onchange: null,
      addListener: (listener) => {
        if (listener) listeners.add(listener as (event: MediaQueryListEvent) => void);
      },
      removeListener: (listener) => {
        if (listener) listeners.delete(listener as (event: MediaQueryListEvent) => void);
      },
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.add(listener as (event: MediaQueryListEvent) => void);
      },
      removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      },
      dispatchEvent: () => false,
    } as MediaQueryList;
    return list;
  }) as typeof window.matchMedia;
}

/* -------------------------------------------------------------------------- */
/* lifecycle                                                                  */
/* -------------------------------------------------------------------------- */

beforeEach(() => {
  registry.intersection.clear();
  registry.resize.clear();
  mediaState.matches = {};
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-g-locked');
});
