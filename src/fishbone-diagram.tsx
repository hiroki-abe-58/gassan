import type { CSSProperties, ReactNode } from 'react';

import { Description, cx, useShell } from './internal/chart-parts';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';
import { usePhrase } from './phrase';

export interface FishboneCause {
  label: string;
  /** さらに細かい要因（孫骨）。 */
  causes?: readonly string[];
}

export interface FishboneCategory {
  /** 大骨を見分けるキー。既定は label。 */
  key?: string;
  /** 大骨の名前（人・機械・方法・材料・測定・環境の 6M など）。 */
  label: string;
  /** 小骨（要因）。文字か、孫骨を持つ要因。 */
  causes: readonly (string | FishboneCause)[];
}

export interface FishboneDiagramProps extends DataAttributes {
  /** 図の名前（読み上げ）。 */
  label: string;
  /** 特性（結果・問題。「不良率が 3% を超える」）。魚の頭に置く。 */
  effect: string;
  /** 大骨。並べた順に上・下・上…と振り分け、頭から遠い列から置く。 */
  categories: readonly FishboneCategory[];
  /** 図から読み取れること（「材料と方法に要因が集まる」）。図の下に出し、説明として読ませる。 */
  description?: ReactNode;
  className?: string;
}

/**
 * 大骨が要因の行を横切る始まり（列の幅に対する位置）。骨は大骨の名前の下（列の 55%）から、列の右端の背骨まで斜めに伸びる。
 * 要因の文字は骨の手前に置くので、始まりを右に寄せるほど、名前に近い行の文字の幅が広い（英語の長い語を途中で折らない）。
 */
const BONE_START = 0.55;

/** 行の真ん中で、大骨が列のどこを通るか（0〜1）。上の骨は名前（上）から背骨（下）へ、下の骨は背骨（上）から名前（下）へ。 */
const boneAt = (row: number, rows: number, top: boolean): number => {
  const f = (row + 0.5) / Math.max(1, rows);
  return top ? BONE_START + (1 - BONE_START) * f : 1 - (1 - BONE_START) * f;
};

/**
 * 特性要因図（フィッシュボーン図）。Q-19。
 * 中身は「特性」の段落と、大骨・小骨・孫骨の入れ子の一覧（ul）で、読み上げはこの順にたどる。線は飾り。
 * 広い器では、大骨を背骨の上と下に振り分けて斜めに描き、小骨を骨に向けて横に並べる。行の高さを決めて
 * （要因の文字は 2 行まで見せ、全文は読み上げに残す）、骨の通る位置を行ごとに計算で決めるので、要素の大きさを測らない。
 * 狭い器では、特性を先頭に置き、大骨を縦に並べる。
 */
export function FishboneDiagram({ label, effect, categories, description, className, ...rest }: FishboneDiagramProps): ReactNode {
  const labels = useLabels();
  const { descriptionId, groupProps } = useShell(label, description, labels.fishbone);
  const phrase = usePhrase();
  const columns = Math.max(1, Math.ceil(categories.length / 2));

  return (
    <div {...domPassthrough(rest, 'FishboneDiagram')} {...groupProps} className={cx('g-viz g-fishbone', className)}>
      <div className="g-fishbone-body" style={{ '--g-fish-columns': columns } as CSSProperties}>
        <p className="g-fishbone-effect">
          <span className="g-fishbone-head">
            <span className="g-sr-only">{`${labels.fishboneEffect}: `}</span>
            {phrase(effect)}
          </span>
        </p>
        {categories.length > 0 ? (
          <ul className="g-fishbone-bones" aria-label={labels.fishboneCauses}>
            {categories.map((category, index) => {
              const top = index % 2 === 0;
              const causes = category.causes.map((cause) => (typeof cause === 'string' ? { label: cause } : cause));
              const rows = causes.reduce((sum, cause) => sum + 1 + (cause.causes?.length ?? 0), 0);
              let row = 0;
              return (
                <li
                  key={category.key ?? category.label}
                  className="g-fishbone-bone"
                  data-side={top ? 'top' : 'bottom'}
                  // 頭（右）に近い列ほど後に並べた骨。最初の 2 本がいちばん左
                  style={{ '--g-fish-column': Math.floor(index / 2) + 1 } as CSSProperties}
                >
                  <span className="g-fishbone-category">{phrase(category.label)}</span>
                  <div className="g-fishbone-rib">
                    <svg className="g-fishbone-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                      <line x1={top ? BONE_START * 100 : 100} y1="0" x2={top ? 100 : BONE_START * 100} y2="100" />
                    </svg>
                    {causes.length > 0 ? (
                      <ul className="g-fishbone-causes">
                        {causes.map((cause) => {
                          const at = row;
                          row += 1 + (cause.causes?.length ?? 0);
                          return (
                            <li key={cause.label} className="g-fishbone-cause">
                              <span className="g-fishbone-cause-label" style={{ '--g-fish-x': boneAt(at, rows, top) } as CSSProperties}>
                                <span className="g-fishbone-text">{phrase(cause.label)}</span>
                              </span>
                              {cause.causes && cause.causes.length > 0 ? (
                                <ul className="g-fishbone-subcauses">
                                  {cause.causes.map((sub, k) => (
                                    <li key={sub} style={{ '--g-fish-x': boneAt(at + 1 + k, rows, top) } as CSSProperties}>
                                      <span className="g-fishbone-text">{phrase(sub)}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <Description id={descriptionId}>{description}</Description>
    </div>
  );
}
