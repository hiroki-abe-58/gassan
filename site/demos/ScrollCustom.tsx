import type { CSSProperties, ReactNode } from 'react';

import { ScrollArea } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ScrollCustom(): ReactNode {
  const t = useDemoText('scrollCustom');
  // t:looks
  const looks: { label: string; style: CSSProperties }[] = [
    { label: t.looks.thin, style: { '--g-scrollbar-size': '3px', '--g-scrollbar-size-active': '6px' } as CSSProperties },
    { label: t.looks.standard, style: {} },
    {
      label: t.looks.thick,
      style: { '--g-scrollbar-size': '10px', '--g-scrollbar-size-active': '14px', '--g-scrollbar-hit': '18px', '--g-scrollbar-radius': '4px' } as CSSProperties,
    },
    {
      label: t.looks.accent,
      style: {
        '--g-scrollbar-thumb': 'var(--g-accent)',
        '--g-scrollbar-thumb-active': 'color-mix(in srgb, var(--g-accent) 80%, var(--g-fg))',
        '--g-scrollbar-track': 'color-mix(in srgb, var(--g-accent) 14%, transparent)',
      } as CSSProperties,
    },
  ];

  return (
    <div className="s-scroll-looks">
      {looks.map((look) => (
        <figure key={look.label} className="s-scroll-look">
          <figcaption>{look.label}</figcaption>
          {/* t:always */}
          <ScrollArea label={look.label} visibility="always" className="s-scroll-box s-scroll-box-small" style={look.style}>
            <ul className="s-scroll-list">
              {t.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </ScrollArea>
        </figure>
      ))}
    </div>
  );
}
