import { useState, type ReactNode } from 'react';

import {
  KIND_DEFAULTS,
  Modal,
  type CloseReason,
  type ModalKind,
  type PlacementOption,
  type ScrimToken,
  type SizeToken,
} from '@genelab/gassan';

const KINDS: readonly ModalKind[] = ['confirm', 'form', 'view', 'consent', 'flow'];
const SIZES: readonly SizeToken[] = ['sm', 'md', 'lg', 'xl', 'full'];
const PLACEMENTS: readonly PlacementOption[] = ['auto', 'center', 'top', 'sheet'];
const SCRIMS: readonly ScrimToken[] = ['none', 'subtle', 'default', 'strong', 'immersive'];

/** select の 1 行。「kind の既定」を空文字で表す。 */
function Choice<T extends string>(props: {
  label: string;
  value: T | '';
  options: readonly T[];
  fallback?: string;
  onChange: (value: T | '') => void;
}): ReactNode {
  return (
    <label className="s-field">
      <span>{props.label}</span>
      <select value={props.value} onChange={(event) => props.onChange(event.target.value as T | '')}>
        {props.fallback ? <option value="">{props.fallback}</option> : null}
        {props.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Playground(): ReactNode {
  const [kind, setKind] = useState<ModalKind>('form');
  const [size, setSize] = useState<SizeToken>('md');
  const [placement, setPlacement] = useState<PlacementOption | ''>('');
  const [scrim, setScrim] = useState<ScrimToken | ''>('');
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<CloseReason[]>([]);

  const defaults = KIND_DEFAULTS[kind];

  return (
    <div className="s-playground">
      <div className="s-playground-controls">
        <Choice label="kind" value={kind} options={KINDS} onChange={(v) => v && setKind(v)} />
        <Choice label="size" value={size} options={SIZES} onChange={(v) => v && setSize(v)} />
        <Choice
          label="placement"
          value={placement}
          options={PLACEMENTS}
          fallback={`kind の既定（${defaults.placement}）`}
          onChange={setPlacement}
        />
        <Choice
          label="scrim"
          value={scrim}
          options={SCRIMS}
          fallback={`kind の既定（${defaults.scrim}）`}
          onChange={setScrim}
        />
      </div>

      <dl className="s-playground-defaults">
        <div>
          <dt>Esc で閉じる</dt>
          <dd>{defaults.dismiss.esc ? '閉じる' : '拒否して理由を読み上げる'}</dd>
        </div>
        <div>
          <dt>背景クリック</dt>
          <dd>{defaults.dismiss.backdrop ? '閉じる' : '拒否して理由を読み上げる'}</dd>
        </div>
      </dl>

      <div className="s-playground-run">
        <button type="button" className="s-btn" onClick={() => setOpen(true)}>
          この設定で開く
        </button>
        <output className="s-demo-log">
          {log.length > 0 ? `閉じた理由: ${log.join(' → ')}` : 'Esc・背景・× のどれで閉じたかを記録する'}
        </output>
      </div>

      <Modal.Root
        kind={kind}
        size={size}
        open={open}
        onOpenChange={(next, reason) => {
          setOpen(next);
          if (!next) setLog((prev) => [...prev.slice(-3), reason]);
        }}
        {...(placement ? { placement } : {})}
        {...(scrim ? { scrim } : {})}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{`kind="${kind}" / size="${size}"`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>
            Esc・背景クリック・× ボタンを試す。閉じない設定のときは、パネルが揺れて理由が読み上げられる。
          </Modal.Description>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="primary" closeOnClick="submit">
            完了
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </div>
  );
}
