import { useState, type ReactNode, type RefObject } from 'react';

import { ModalBody } from '../body';
import { Button } from '../button';
import { Banner } from '../feedback';
import { ModalButton, ModalFooter } from '../footer';
import { ModalDescription, ModalHeader, ModalTitle } from '../header';
import { ModalSearchInput } from '../inputs';
import { useLabels } from '../labels';
import { ModalRoot } from '../root';
import { FormError, runAction, type SubmitResult } from './form';
import { commonLabels } from './labels';
import { useTemplateLabels } from './site';

/*
 * アプリの中のページ（メンバー・API キー・監査ログなど）が共有する部品。公開はしない。
 */

const COMMON_LABELS = { common: commonLabels } as const;

type NoticeState = { tone: 'success' | 'error'; text: ReactNode };

/**
 * ページの上の知らせの帯。結果を読み上げる（失敗は role="alert"、成功は role="status"）。
 * report は失敗の文があればそれを、無ければ成功の文を出す。show は成功の文をそのまま出す。
 */
export function useNotice(): { notice: ReactNode; report: (failure: ReactNode, success: ReactNode) => void; show: (text: ReactNode) => void } {
  const [state, setState] = useState<NoticeState | null>(null);
  return {
    notice: state ? (
      <Banner tone={state.tone} live onDismiss={() => setState(null)}>
        {state.text}
      </Banner>
    ) : null,
    report: (failure, success) => setState(failure ? { tone: 'error', text: failure } : { tone: 'success', text: success }),
    show: (text) => setState({ tone: 'success', text }),
  };
}

export interface ConfirmDialogProps {
  open: boolean;
  /** 閉じる（キャンセル・Esc・済んだ後）。 */
  onClose: () => void;
  title: ReactNode;
  description: ReactNode;
  /** 確かめるボタンの文。危険の色で出す。 */
  confirm: ReactNode;
  /** 確かめた操作。失敗の文を返すと窓の中に出し、閉じない。 */
  onConfirm: () => SubmitResult | Promise<SubmitResult>;
  /** 済んで閉じたとき（知らせを出すなど）。 */
  onDone: () => void;
  /** 済んだ後のフォーカス先。起点の行が消える操作（外す・無効にする）で渡す。キャンセルなら起点へ戻す。 */
  fallbackFocus?: RefObject<HTMLElement | null>;
}

/**
 * 取り消せない操作を確かめる窓（kind="confirm"）。失敗は窓の中に出し（role="alert"）、済んだら閉じて onDone を呼ぶ。
 */
export function ConfirmDialog({ open, onClose, title, description, confirm, onConfirm, onDone, fallbackFocus }: ConfirmDialogProps): ReactNode {
  const gassan = useLabels();
  const { common } = useTemplateLabels(COMMON_LABELS);
  const [error, setError] = useState<ReactNode>(null);
  const [done, setDone] = useState(false);
  // 開き直したら、前の失敗と「済んだ」を持ち越さない
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setError(null);
      setDone(false);
    }
  }
  return (
    <ModalRoot
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      kind="confirm"
      finalFocus={done ? fallbackFocus : undefined}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ModalDescription>{description}</ModalDescription>
        <FormError>{error}</FormError>
      </ModalBody>
      <ModalFooter>
        <ModalButton variant="tertiary" onClick={onClose}>
          {gassan.cancel}
        </ModalButton>
        <ModalButton
          variant="danger"
          onAction={async () => {
            const failure = await runAction(onConfirm, common.submitFailed);
            if (failure) {
              setError(failure);
              return;
            }
            setDone(true);
            onDone();
            onClose();
          }}
        >
          {confirm}
        </ModalButton>
      </ModalFooter>
    </ModalRoot>
  );
}

export interface SearchFormProps {
  /** いま絞り込んでいる言葉。外から変わったら（条件のクリアなど）欄も合わせる。 */
  value: string;
  /** 送ったとき（Enter か「検索」）。前後の空白は除いて渡す。 */
  onSubmit: (text: string) => void;
  /** 欄の名前（placeholder にも使う）。 */
  label: string;
  /** 渡すと form を role="search" の目印にする（名前はこの文）。ほかの絞り込みと一緒に目印の中へ置くなら渡さない。 */
  landmark?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}

/**
 * 探す欄と「検索」のボタン。打つたびではなく、送ったときに絞り込む（サーバーで探す一覧・日本語の変換・読み上げのため）。
 */
export function SearchForm({ value, onSubmit, label, landmark, inputRef }: SearchFormProps): ReactNode {
  const { common } = useTemplateLabels(COMMON_LABELS);
  const [draft, setDraft] = useState(value);
  const [last, setLast] = useState(value);
  if (value !== last) {
    setLast(value);
    setDraft(value);
  }
  return (
    <form
      className="g-search-form"
      role={landmark ? 'search' : undefined}
      aria-label={landmark}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(draft.trim());
      }}
    >
      <ModalSearchInput ref={inputRef} aria-label={label} placeholder={label} value={draft} onChange={(event) => setDraft(event.target.value)} />
      <Button type="submit">{common.search}</Button>
    </form>
  );
}
