import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';

import type { ControlAria } from './fields';
import { useControllable } from './internal/controllable';
import { Icon } from './internal/icons';
import { domPassthrough, type DataAttributes } from './internal/passthrough';
import { useLabels } from './labels';

/**
 * accept 属性の規則（「.pdf」「image/*」「application/json」）にファイルが合うか。
 * ドロップはネイティブの accept を通らないので、同じ規則をここで当てる。I-14。
 */
export function acceptsFile(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.split(',').some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

const sameFile = (a: File, b: File): boolean =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

export interface ModalFileDropProps extends ControlAria, DataAttributes {
  value?: readonly File[];
  defaultValue?: readonly File[];
  onValueChange?: (files: File[]) => void;
  /** accept に合わずに落としたファイル。Field の error で知らせるのに使う。 */
  onReject?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** 渡すとネイティブの form 送信にファイルが載る（DataTransfer のあるブラウザ）。 */
  name?: string;
  className?: string;
}

/**
 * ファイルの受け皿。I-14。
 *
 * 中身はネイティブの input type="file" を受け皿いっぱいに広げたもの。
 * 押す・Enter / Space で選ぶ・ラベルとの結び付きはブラウザが持つ。
 * ドロップされたファイルにも accept を当て、合わないものは onReject へ回す。
 * 選んだファイルは名前と大きさの一覧に出し、1 つずつ取り除ける。
 */
export function ModalFileDrop({
  value,
  defaultValue = [],
  onValueChange,
  onReject,
  accept,
  multiple = false,
  disabled = false,
  name,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  ...rest
}: ModalFileDropProps): ReactNode {
  const labels = useLabels();
  const [files, setFiles] = useControllable<readonly File[]>(value, defaultValue, (next) => onValueChange?.([...next]));
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const size = (bytes: number): string =>
    new Intl.NumberFormat(labels.locale, {
      style: 'unit',
      unit: bytes < 1_000_000 ? 'kilobyte' : 'megabyte',
      maximumFractionDigits: 1,
    }).format(bytes < 1_000_000 ? bytes / 1000 : bytes / 1_000_000);

  // 一覧と input の中身をそろえる。取り除いたファイルが form 送信に残らないように。
  useEffect(() => {
    const input = inputRef.current;
    if (!input || typeof DataTransfer !== 'function') return;
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
  }, [files]);

  const add = (incoming: File[]): void => {
    const accepted = incoming.filter((file) => acceptsFile(file, accept));
    const rejected = incoming.filter((file) => !accepted.includes(file));
    if (rejected.length > 0) onReject?.(rejected);
    if (accepted.length === 0) return;
    if (!multiple) {
      setFiles(accepted.slice(0, 1));
      return;
    }
    setFiles([...files, ...accepted.filter((file) => !files.some((known) => sameFile(known, file)))]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) add([...event.dataTransfer.files]);
  };

  return (
    <div
      {...domPassthrough(rest, 'Modal.FileDrop')}
      className={className ? `g-file ${className}` : 'g-file'}
      data-disabled={disabled ? '' : undefined}
    >
      <div
        className="g-dropzone"
        data-dragging={dragging ? '' : undefined}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="g-file-input"
          id={id}
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          onChange={(event) => add([...(event.target.files ?? [])])}
        />
        <Icon name="upload" className="g-dropzone-icon" />
        {/* 読み上げでは input そのものが「ファイルを選択」のボタンになるので、案内は重ねて読ませない。 */}
        <span className="g-dropzone-text" aria-hidden="true">
          {labels.dropFiles}
        </span>
        <span className="g-dropzone-button" aria-hidden="true">
          {labels.chooseFiles}
        </span>
      </div>
      {files.length > 0 ? (
        <ul className="g-file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${String(file.lastModified)}-${String(index)}`} className="g-file-item">
              <Icon name="file" />
              <span className="g-file-name">{file.name}</span>
              <span className="g-file-size">{size(file.size)}</span>
              <button
                type="button"
                className="g-input-action"
                aria-label={labels.removeFile(file.name)}
                disabled={disabled}
                onClick={() => {
                  setFiles(files.filter((_, i) => i !== index));
                  inputRef.current?.focus();
                }}
              >
                <Icon name="close" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
