/**
 * iOS 向けの opt-in スクロールロック。M-06。
 *
 * 既定のロックは CSS の html:has(dialog.k-dialog:modal){overflow:hidden} で足りる。
 * ただし iOS Safari では overflow:hidden だけでは body のスクロールが止まらない場面があるため、
 * 必要なときだけ JS でスクロール位置を保存 → position:fixed → 復帰する手を用意しておく。
 *
 * 常時 ON にしないのは、この手法が「スクロール位置の復帰」という副作用を持ち、
 * ページ側のスクロール管理と喧嘩することがあるため。
 */

let depth = 0;
let savedScrollY = 0;
let saved: { position: string; top: string; left: string; right: string; width: string } | null =
  null;

export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  depth += 1;
  if (depth > 1) return;

  const body = document.body;
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  saved = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  document.documentElement.setAttribute('data-k-locked', '');
}

export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  if (depth === 0) return;
  depth -= 1;
  if (depth > 0) return;

  const body = document.body;
  if (saved) {
    body.style.position = saved.position;
    body.style.top = saved.top;
    body.style.left = saved.left;
    body.style.right = saved.right;
    body.style.width = saved.width;
    saved = null;
  }
  document.documentElement.removeAttribute('data-k-locked');
  if (typeof window.scrollTo === 'function') window.scrollTo(0, savedScrollY);
}

/** テスト用。 */
export function resetScrollLock(): void {
  depth = 0;
  saved = null;
  savedScrollY = 0;
  if (typeof document !== 'undefined') {
    document.documentElement.removeAttribute('data-k-locked');
  }
}
