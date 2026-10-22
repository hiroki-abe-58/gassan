import { useSyncExternalStore } from 'react';

import type { ToastPosition } from '@genelab/gassan';

/*
 * サイトに 1 つ置いた <ToastHost /> の出す場所。トーストのページの「出す場所」で切り替える。
 * ホストは App.tsx にあり、ページはその子ではないので、小さな store で渡す。
 */
let position: ToastPosition = 'bottom-end';
const listeners = new Set<() => void>();

export function setToastPosition(next: ToastPosition): void {
  position = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useToastPosition(): ToastPosition {
  return useSyncExternalStore(subscribe, () => position, () => 'bottom-end');
}
