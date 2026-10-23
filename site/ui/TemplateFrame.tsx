import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { Phrase, Segmented, Select } from '@genelab/gassan';

import { useT } from '../i18n';
import { to } from '../router';

export interface FrameVariant {
  /** プレビューの名前（#/preview/<name>）。 */
  name: string;
  label: string;
}

/** パソコンの形で見せるときの幅。テンプレートが横に並ぶ形（960px〜）に届く幅で描き、枠に合わせて縮める。 */
const DESKTOP = 1280;

/**
 * ページのテンプレートの見本。同じサイトを #/preview/<name> で iframe に読み込む。
 *
 * テンプレートは header / main / footer のランドマークと h1 を持つ 1 枚のページなので、ドキュメントのページの中に
 * 直に置くと、ランドマークと見出しが入れ子になる。iframe なら別の文書として読まれ、幅も iframe の幅で決まる
 * （テンプレートは器の幅で形を変えるので、幅を切り替えるとスマートフォンの形になる）。
 * パソコンの形は 1280px で描いて枠の幅まで縮める（ドキュメントの本文の幅のままだと、パソコンの形にならない）。
 * テーマは localStorage を通じて iframe の中にも届く（theme/store.ts の storage イベント）。
 */
export function TemplateFrame({ title, variants, height = 760 }: { title: string; variants: readonly FrameVariant[]; height?: number }): ReactNode {
  const t = useT().common.frame;
  const [width, setWidth] = useState('wide');
  const [current, setCurrent] = useState(variants[0]?.name ?? '');
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(DESKTOP);
  const src = to(`/preview/${current}`);
  const label = variants.find((variant) => variant.name === current)?.label ?? title;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setStageWidth(entry.contentRect.width);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(1, stageWidth / DESKTOP);
  // 枠が狭いと（スマートフォンでドキュメントを読むとき）、縮めたパソコンの形は読めない。枠の幅のまま描き、切り替えも出さない
  const roomy = scale >= 0.5;
  const shown = roomy ? width : 'wide';
  // 縮めた iframe の見た目の高さが height になるように、描く高さを伸ばす
  const scaled = roomy && width === 'wide' && scale < 1;
  const frameStyle: CSSProperties = scaled
    ? { inlineSize: `${String(DESKTOP)}px`, blockSize: `${String(height / scale)}px`, transform: `scale(${String(scale)})` }
    : { blockSize: `${String(height)}px` };

  return (
    <figure className="s-frame">
      <div className="s-frame-bar">
        <figcaption className="s-frame-title">
          <Phrase>{title}</Phrase>
        </figcaption>
        {variants.length > 1 ? (
          <Select
            aria-label={t.variant}
            className="s-frame-select"
            options={variants.map((variant) => ({ value: variant.name, label: variant.label }))}
            value={current}
            onValueChange={setCurrent}
          />
        ) : null}
        {roomy ? (
          <Segmented
            aria-label={t.width}
            value={width}
            onValueChange={setWidth}
            options={[
              { value: 'wide', label: t.wide },
              { value: 'phone', label: t.phone },
            ]}
          />
        ) : null}
        <a className="s-frame-open" href={src} target="_blank" rel="noreferrer">
          <Phrase>{t.open}</Phrase>
        </a>
      </div>
      <div ref={stageRef} className="s-frame-stage" data-width={shown} data-scaled={scaled || undefined} style={scaled ? { blockSize: `${String(height)}px` } : undefined}>
        <iframe key={current} src={src} title={label} loading="lazy" style={frameStyle} />
      </div>
    </figure>
  );
}
