import { useState, type ReactNode } from 'react';

import { Phrase, ScrollArea, Segmented, type ScrollbarVisibility } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ScrollActivity(): ReactNode {
  const t = useDemoText('scrollActivity');
  const [visibility, setVisibility] = useState<ScrollbarVisibility>('auto');

  return (
    <div className="s-scroll-demo">
      <Segmented
        aria-label={t.visibility}
        value={visibility}
        onValueChange={(value) => setVisibility(value as ScrollbarVisibility)}
        options={[
          { value: 'auto', label: t.modes.auto },
          { value: 'hover', label: t.modes.hover },
          { value: 'scroll', label: t.modes.scroll },
          { value: 'always', label: t.modes.always },
        ]}
      />
      {/* t:height */}
      <ScrollArea label={t.label} visibility={visibility} className="s-scroll-box">
        <ol className="s-scroll-list">
          {t.items.map((item, index) => (
            <li key={item}>
              <time>{`${String(9 + Math.floor(index / 4))}:${String((index % 4) * 15).padStart(2, '0')}`}</time>
              <span>
                <Phrase>{item}</Phrase>
              </span>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
}
