/**
 * top layer のスタック登録簿。L-11 / L-12。
 *
 * ネイティブの top layer は積み重なるので、モーダルを2枚重ねるとスクリムも2枚重なり、
 * 背景が意図の倍暗くなる。ブラウザは「いま最前面がどれか」を CSS に教えてくれないので、
 * 自前で順序を持ち、最前面以外に data-k-covered を付けて下のスクリムを消す。
 */

const stack: HTMLDialogElement[] = [];
type Listener = (depth: number) => void;
const listeners = new Set<Listener>();

function sync(): void {
  const top = stack[stack.length - 1];
  for (const el of stack) {
    if (el === top) el.removeAttribute('data-k-covered');
    else el.setAttribute('data-k-covered', '');
  }
  for (const listener of listeners) listener(stack.length);
}

export function pushModal(el: HTMLDialogElement): void {
  const index = stack.indexOf(el);
  if (index !== -1) stack.splice(index, 1);
  stack.push(el);
  sync();
}

export function popModal(el: HTMLDialogElement): void {
  const index = stack.indexOf(el);
  if (index === -1) return;
  stack.splice(index, 1);
  el.removeAttribute('data-k-covered');
  sync();
}

export function isTopModal(el: HTMLDialogElement): boolean {
  return stack.length > 0 && stack[stack.length - 1] === el;
}

export function modalDepth(): number {
  return stack.length;
}

export function subscribeDepth(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** テスト用。 */
export function resetModalStack(): void {
  stack.length = 0;
  listeners.clear();
}
