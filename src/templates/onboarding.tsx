import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { Steps } from '../navigation';
import { FormError, runAction, type SubmitResult } from './form';
import { commonLabels, onboardingLabels } from './labels';
import { AuthLayout } from './layouts';
import { useTemplateLabels } from './site';

export interface OnboardingStep {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** 手順の中身（入力欄など）。値は利用側が持つ。 */
  content: ReactNode;
  /** 次へ進めるか確かめる。理由の文を返すと進まずに、その文を読み上げる。 */
  validate?: () => string | null | undefined;
  /** 「あとで設定する」で飛ばせる手順。 */
  optional?: boolean;
}

export interface OnboardingPageProps extends DataAttributes {
  steps: readonly OnboardingStep[];
  /** 最後の手順で「始める」を押したとき。失敗なら { error } を返す。 */
  onComplete: () => SubmitResult | Promise<SubmitResult>;
  /** 手順が変わったとき（何番目まで進んだかを保存するなど）。 */
  onStepChange?: (index: number) => void;
  /** 最初に開く手順の番号（0 から）。既定 0。 */
  defaultStep?: number;
  /** 器が広いときにカードの横に並べる面。 */
  aside?: ReactNode;
  className?: string;
}

const ONBOARDING_LABELS = { common: commonLabels, onboarding: onboardingLabels } as const;

/**
 * はじめの設定（登録した直後の手順）。P-16。
 *
 * カードの上に手順の進み具合（U-24）を置き、手順ごとに見出し・説明・中身・戻る / あとで / 次へを並べる。
 * 手順が変わったら見出しへフォーカスを移す（読み上げに切り替わりを伝える）。次へで validate が理由を返したら進まずに読み上げる。
 * 最後の手順の「始める」は送信の流れ（P-03）と同じく、処理の間は二度押しできず、失敗の文を割り込ませて読む。
 */
export function OnboardingPage({ steps, onComplete, onStepChange, defaultStep = 0, aside, className, ...rest }: OnboardingPageProps): ReactNode {
  const labels = useTemplateLabels(ONBOARDING_LABELS);
  const { common, onboarding } = labels;
  const [index, setIndex] = useState(Math.min(Math.max(defaultStep, 0), Math.max(steps.length - 1, 0)));
  const [error, setError] = useState<ReactNode>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const step = steps[index];
  const last = index === steps.length - 1;

  // 手順を動かしたときだけ見出しへフォーカスを移す（開いた直後は奪わない）
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus();
  }, [index]);

  const go = (next: number): void => {
    moved.current = true;
    setError(null);
    setIndex(next);
    onStepChange?.(next);
  };

  if (!step) return null;

  const next = async (): Promise<void> => {
    const reason = step.validate?.();
    if (reason) {
      setError(reason);
      return;
    }
    if (!last) {
      go(index + 1);
      return;
    }
    setError(await runAction(onComplete, common.submitFailed));
  };

  return (
    <AuthLayout
      {...domPassthrough(rest, 'OnboardingPage')}
      className={className ? `g-onboarding ${className}` : 'g-onboarding'}
      headingRef={headingRef}
      aside={aside}
      lead={<Steps label={onboarding.progress} items={steps.map((item) => ({ key: item.id, label: item.title }))} current={index} orientation="horizontal" />}
      title={step.title}
      description={step.description}
    >
      <FormError>{error}</FormError>
      <div className="g-onboarding-content">{step.content}</div>
      <div className="g-onboarding-actions">
        {index > 0 ? <Button onClick={() => go(index - 1)}>{onboarding.back}</Button> : null}
        {step.optional && !last ? (
          <Button variant="tertiary" onClick={() => go(index + 1)}>
            {onboarding.skip}
          </Button>
        ) : null}
        <Button variant="primary" onAction={next}>
          {last ? onboarding.finish : onboarding.next}
        </Button>
      </div>
    </AuthLayout>
  );
}
