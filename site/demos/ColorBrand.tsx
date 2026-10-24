import { useState, type CSSProperties, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { useDemoText } from '../i18n';

// t:ink
function inkOn(hex: string): string {
  const channel = (at: number): number => {
    const value = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return luminance > 0.179 ? '#000000' : '#ffffff';
}

export default function ColorBrand(): ReactNode {
  const t = useDemoText('colorBrand');
  const [color, setColor] = useState('#3346d3');
  return (
    <div className="s-color-demo">
      <Modal.Field label={t.label} help={t.help}>
        {(control) => (
          <Modal.ColorPicker
            {...control}
            value={color}
            onValueChange={setColor}
            swatches={[
              { value: '#3346d3', label: t.blue },
              { value: '#1a7f5a', label: t.green },
              { value: '#d9730d', label: t.orange },
              { value: '#e5484d', label: t.red },
              { value: '#7c4dff', label: t.purple },
              { value: '#1f2430', label: t.charcoal },
            ]}
          />
        )}
      </Modal.Field>
      <figure className="s-color-sample">
        <figcaption>{t.previewCaption}</figcaption>
        <span className="s-color-sample-button" style={{ '--s-brand': color, '--s-brand-ink': inkOn(color) } as CSSProperties}>
          {t.preview}
        </span>
      </figure>
    </div>
  );
}
