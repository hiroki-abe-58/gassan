import type { ReactNode } from 'react';

/**
 * 依存を増やさないためのインライン SVG。装飾なので aria-hidden。A-06。
 * 20×20 の線画で、色は currentColor に従う（塗りが要るものは CSS の fill で塗る）。
 */
export const ICONS = {
  chevronDown: 'm5 7.5 5 5 5-5',
  chevronLeft: 'M12.5 4.5 7 10l5.5 5.5',
  chevronRight: 'M7.5 4.5 13 10l-5.5 5.5',
  close: 'm5 5 10 10M15 5 5 15',
  check: 'm4.5 10.5 3.5 3.5 7.5-8',
  minus: 'M5 10h10',
  plus: 'M10 5v10M5 10h10',
  search: 'M8.75 14.5a5.75 5.75 0 1 0 0-11.5 5.75 5.75 0 0 0 0 11.5ZM13 13l3.5 3.5',
  eye: 'M2.5 10s2.75-5 7.5-5 7.5 5 7.5 5-2.75 5-7.5 5-7.5-5-7.5-5ZM10 12.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z',
  calendar: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h9A1.5 1.5 0 0 1 16 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5v-8ZM4 9h12M7.5 3.5v3M12.5 3.5v3',
  upload: 'M10 13V4M6.5 7.5 10 4l3.5 3.5M4 13.5v1A1.5 1.5 0 0 0 5.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-1',
  file: 'M11.5 3.5h-5A1.5 1.5 0 0 0 5 5v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 15 15V7l-3.5-3.5ZM11.5 3.5V7H15',
  star: 'm10 2.8 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L10 2.8Z',
} as const;

export function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }): ReactNode {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
