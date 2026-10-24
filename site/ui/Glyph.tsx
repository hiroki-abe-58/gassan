import type { ReactNode } from 'react';

/*
 * 見本のボタンに入れる印。gassan は印の部品を公開していない（利用者は自分の印を渡す）ので、サイトの側で持つ。
 * 20×20 の線画で、色は currentColor。飾りなので aria-hidden。
 */
const PATHS = {
  plus: 'M10 4.5v11M4.5 10h11',
  gear: 'M10 12.75a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM10 2.75v2M10 15.25v2M2.75 10h2M15.25 10h2M4.87 4.87l1.42 1.42M13.71 13.71l1.42 1.42M4.87 15.13l1.42-1.42M13.71 6.29l1.42-1.42',
  more: 'M5 10h.01M10 10h.01M15 10h.01',
  filter: 'M3.5 5h13M6 10h8M8.5 15h3',
  arrow: 'M4.5 10h11M11 5.5l4.5 4.5-4.5 4.5',
  bold: 'M6 4h5a3 3 0 0 1 0 6H6V4ZM6 10h6a3 3 0 0 1 0 6H6v-6Z',
  italic: 'M12.5 4h-5M12.5 16h-5M11 4 9 16',
  link: 'M8.5 11.5a3 3 0 0 0 4.24 0l2.5-2.5a3 3 0 0 0-4.24-4.24l-1 1M11.5 8.5a3 3 0 0 0-4.24 0l-2.5 2.5a3 3 0 0 0 4.24 4.24l1-1',
} as const;

export function Glyph({ name }: { name: keyof typeof PATHS }): ReactNode {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
