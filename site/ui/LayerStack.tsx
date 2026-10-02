import type { CSSProperties, ReactNode } from 'react';

import { data } from '../data';

export interface LayerInfo {
  n: number;
  name: string;
  /** 何を担う層か（§1-2 の 1 つ目のブロック） */
  scope: string;
  /** 2026 年時点の正解（§1-2 の 2 つ目のブロック） */
  answer: string;
}

/** 仕様書 §1-2 の 2 つのコードブロックから、4 層の定義を読む。 */
function parseLayers(): LayerInfo[] {
  const scopeBlock = data.code['1-2#0']?.text ?? '';
  const answerBlock = data.code['1-2#1']?.text ?? '';
  const answers = new Map<number, string>();
  for (const m of answerBlock.matchAll(/^層(\d) → (.+)$/gm)) answers.set(Number(m[1]), (m[2] ?? '').trim());
  const layers = [...scopeBlock.matchAll(/^層(\d)\s+(\w+)\s*…\s*(.+)$/gm)].map((m) => ({
    n: Number(m[1]),
    name: m[2] ?? '',
    scope: (m[3] ?? '').trim(),
    answer: answers.get(Number(m[1])) ?? '',
  }));
  if (layers.length !== 4 && import.meta.env.DEV) throw new Error('§1-2 の 4 層を読めなかった');
  return layers;
}

export const LAYERS: readonly LayerInfo[] = parseLayers();

/** 誰がその層を担うか。図の札に出す短い名前。 */
const OWNER: Record<number, string> = {
  1: '<dialog>',
  2: 'CSS トークン',
  3: 'CSS Grid + dvh',
  4: 'gassan',
};

/**
 * 4 層の積み重ねの図。上ほど gassan の仕事で、いちばん下はブラウザが担う。
 * 図そのものは飾り。同じ内容を隣の文（または detailed の一覧）が運ぶ。
 */
export function LayerStack({ detailed = false }: { detailed?: boolean }): ReactNode {
  const top = [...LAYERS].sort((a, b) => b.n - a.n);
  return (
    <div className="s-stack" data-detailed={detailed ? '' : undefined}>
      <div className="s-stack-art" aria-hidden="true">
        {top.map((layer, i) => (
          <div key={layer.n} className="s-plane" data-layer={layer.n} style={{ '--i': i } as CSSProperties}>
            <span className="s-plane-face">
              {layer.n === 4 ? (
                <span className="s-plane-panel">
                  <i />
                  <i />
                  <i />
                  <b />
                </span>
              ) : null}
            </span>
            <span className="s-plane-tag">
              <span className="s-plane-num">層{layer.n}</span>
              <span className="s-plane-name">{layer.name}</span>
              <span className="s-plane-owner">{OWNER[layer.n]}</span>
            </span>
          </div>
        ))}
      </div>
      {detailed ? (
        <ol className="s-stack-list" reversed>
          {top.map((layer) => (
            <li key={layer.n} data-layer={layer.n}>
              <p className="s-stack-head">
                <span className="s-stack-num">層{layer.n}</span> {layer.name}
                <span className="s-stack-owner">{OWNER[layer.n]}</span>
              </p>
              <p className="s-stack-scope">{layer.scope}</p>
              <p className="s-stack-answer">{layer.answer}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
