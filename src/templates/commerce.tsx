import { useId, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { ModalRadioGroup } from '../choices';
import { DescriptionList } from '../display';
import { ModalField, ModalFieldset } from '../fields';
import { ModalTextarea } from '../inputs';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { Steps } from '../navigation';
import { PageHeader } from '../page-header';
import { usePhrase } from '../phrase';
import { useFocusOnChange } from './auth-parts';
import { ConsentField, ErrorSummary, FormError, formatDate, runAction, useTemplateForm, type SubmitResult } from './form';
import { useSite } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/* -------------------------------------------------------------------------- */
/* OrderReviewPage                                                            */
/* -------------------------------------------------------------------------- */

export interface OrderItem {
  /** 行を見分けるキー。既定は name。 */
  key?: string;
  name: string;
  /** 選んだもの（「ブラック・M サイズ」）。 */
  options?: string;
  /** 数量（分量）。 */
  quantity: number;
  /** 数量の単位（「個」「冊」「か月」）。既定は labels.orderReview.unit。 */
  unit?: string;
  /** 単価（税込）。 */
  price: number;
}

export interface OrderAmount {
  label: string;
  /** 金額（税込）。割引も正の値で書く（引く向きは置き場所で決まる）。 */
  amount: number;
}

export interface OrderSubscription {
  /** お届けの間隔（「毎月」「2 か月ごと」）。 */
  interval: string;
  /** 各回の代金（税込）。 */
  pricePerDelivery: number;
  /** 約束の回数。省略すると、回数の約束は無い（いつでも解約できる）と示す。 */
  minimumCount?: number;
  /** 2 回目から代金が変わるなど、代金についての補足。 */
  priceNote?: ReactNode;
  /** 解約の方法と期限（「次のお届けの 7 日前までに、マイページから」）。 */
  howToCancel: ReactNode;
}

export type OrderReviewSection = 'items' | 'address' | 'delivery' | 'payment';

export interface OrderReviewPageProps extends DataAttributes {
  /** 注文する商品と数量（分量。特商法 12 条の 6 第 1 項 1 号）。 */
  items: readonly OrderItem[];
  /** 送料（税込）。0 なら「無料」と書く。 */
  shippingFee: number;
  /** 手数料（代金引換の手数料など）。 */
  fees?: readonly OrderAmount[];
  /** 割引（クーポン・ポイント）。 */
  discounts?: readonly OrderAmount[];
  /** お届け先（行ごと。名前・郵便番号と住所・電話番号）。 */
  shippingAddress: readonly string[];
  /** お届けの方法と時期（引渡しの時期。特商法 11 条 3 号）。 */
  delivery: { method: ReactNode; timing: ReactNode };
  /** お支払いの方法と時期（特商法 11 条 2 号）。 */
  payment: { method: ReactNode; timing: ReactNode };
  /** お申し込みの期間（期限のある販売のとき。特商法 11 条 4 号）。 */
  offerPeriod?: ReactNode;
  /** 返品・キャンセル（申込みの撤回と契約の解除。特商法 11 条 5 号）。リンクだけにせず、条件をここに書く。 */
  cancellationPolicy: ReactNode;
  /** 定期購入の条件（各回の代金・間隔・約束の回数・解約の方法）。 */
  subscription?: OrderSubscription;
  /** 注文の前に同意を求める文（「利用規約に同意する」。リンクを含めてよい）。渡すとチェックボックスを出す。 */
  consent?: ReactNode;
  /** 通貨（ISO 4217）。既定 'JPY'。 */
  currency?: string;
  /** 欄ごとの「変更」。渡すと、商品・お届け先・お届け・お支払いの欄に出す。 */
  onEdit?: (section: OrderReviewSection) => void;
  /** 注文を確定する。終わったら、利用側が完了のページへ移る。 */
  onSubmit: () => SubmitResult | Promise<SubmitResult>;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

/**
 * 注文の最終確認（最終確認画面）。P-32。
 *
 * 特商法 12 条の 6 が最終確認画面に求める表示事項（分量・代金と送料・支払の時期と方法・引渡しの時期・申込みの期間・
 * 申込みの撤回と解除）を、それぞれ見出しのある節にして 1 画面に並べる。説明は「まだ注文は確定していない」ことを伝え、
 * 確定のボタンは「注文を確定する」の名前にする（押すと申込みになることを誤認させない。同条 2 項）。
 * 合計は節に分けて税込みで書き、送料が 0 なら「無料」と言葉で示す。広い器では金額と確定のボタンを右の列に置く。
 */
export function OrderReviewPage({
  items,
  shippingFee,
  fees = [],
  discounts = [],
  shippingAddress,
  delivery,
  payment,
  offerPeriod,
  cancellationPolicy,
  subscription,
  consent,
  currency = 'JPY',
  onEdit,
  onSubmit,
  title,
  description,
  className,
  ...rest
}: OrderReviewPageProps): ReactNode {
  const { labels } = useSite();
  const phrase = usePhrase();
  const { common, orderReview: o } = labels;
  const ids = useId();
  const money = new Intl.NumberFormat(labels.locale, { style: 'currency', currency });
  const sum = (list: readonly OrderAmount[]): number => list.reduce((total, entry) => total + entry.amount, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal + shippingFee + sum(fees) - sum(discounts);
  const form = useTemplateForm<{ agree: boolean }>({
    initial: { agree: false },
    validate: ({ agree }) => (consent && !agree ? { agree: o.consentRequired } : {}),
    onSubmit: () => onSubmit(),
    submitFailed: common.submitFailed,
  });

  const section = (key: string, heading: string, body: ReactNode, editable?: OrderReviewSection): ReactNode => (
    <section className="g-order-section" aria-labelledby={`${ids}-${key}`}>
      <div className="g-order-section-head">
        <h2 id={`${ids}-${key}`} className="g-app-subtitle">
          {phrase(heading)}
        </h2>
        {editable && onEdit ? (
          <Button size="sm" variant="tertiary" aria-label={o.editFor(heading)} onClick={() => onEdit(editable)}>
            {o.edit}
          </Button>
        ) : null}
      </div>
      {body}
    </section>
  );
  const pair = (term: ReactNode, detail: ReactNode, key: string): ReactNode => (
    <div key={key}>
      <dt>{phrase(term)}</dt>
      <dd>{phrase(detail)}</dd>
    </div>
  );

  return (
    <div {...domPassthrough(rest, 'OrderReviewPage')} className={cx('g-order-review', className)}>
      <PageHeader title={title ?? o.title} description={description ?? o.description} />
      <div className="g-order-review-layout">
        <div className="g-order-review-main">
          {section(
            'items',
            o.items,
            <table className="g-order-items">
              <thead>
                <tr>
                  <th scope="col">{o.product}</th>
                  <th scope="col">{o.quantity}</th>
                  <th scope="col">{o.lineTotal}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.key ?? item.name}>
                    <th scope="row">
                      <span className="g-order-item-name">{phrase(item.name)}</span>
                      {item.options ? <span className="g-order-item-note">{phrase(item.options)}</span> : null}
                      <span className="g-order-item-note">{o.unitPrice(money.format(item.price))}</span>
                    </th>
                    <td className="g-order-number">{o.quantityOf(item.quantity, item.unit ?? o.unit)}</td>
                    <td className="g-order-number">{money.format(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>,
            'items',
          )}
          {section(
            'address',
            o.address,
            <address className="g-order-address">
              {shippingAddress.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>,
            'address',
          )}
          {section(
            'delivery',
            o.delivery,
            <DescriptionList
              items={[
                { term: o.method, details: delivery.method },
                { term: o.timing, details: delivery.timing },
              ]}
            />,
            'delivery',
          )}
          {section(
            'payment',
            o.payment,
            <DescriptionList
              items={[
                { term: o.method, details: payment.method },
                { term: o.timing, details: payment.timing },
              ]}
            />,
            'payment',
          )}
          {offerPeriod ? section('offer', o.offerPeriod, <p className="g-order-text">{phrase(offerPeriod)}</p>) : null}
          {subscription
            ? section(
                'subscription',
                o.subscription,
                <DescriptionList
                  items={[
                    { term: o.interval, details: subscription.interval },
                    {
                      term: o.pricePerDelivery,
                      details: subscription.priceNote ? (
                        <>
                          {money.format(subscription.pricePerDelivery)}
                          <span className="g-order-item-note">{phrase(subscription.priceNote)}</span>
                        </>
                      ) : (
                        money.format(subscription.pricePerDelivery)
                      ),
                    },
                    { term: o.minimumCount, details: subscription.minimumCount ? o.minimumCountOf(subscription.minimumCount) : o.noMinimum },
                    { term: o.howToCancel, details: subscription.howToCancel },
                  ]}
                />,
              )
            : null}
          {section('cancellation', o.cancellation, <div className="g-order-text">{phrase(cancellationPolicy)}</div>)}
        </div>
        <section className="g-order-summary" aria-labelledby={`${ids}-summary`}>
          <h2 id={`${ids}-summary`} className="g-app-subtitle">
            {o.summary}
          </h2>
          <dl className="g-order-amounts">
            {pair(o.subtotal, money.format(subtotal), 'subtotal')}
            {pair(o.shipping, shippingFee === 0 ? o.free : money.format(shippingFee), 'shipping')}
            {fees.map((fee) => pair(fee.label, money.format(fee.amount), `fee-${fee.label}`))}
            {discounts.map((discount) => pair(discount.label, money.format(-discount.amount), `discount-${discount.label}`))}
            <div className="g-order-total">
              <dt>{o.total}</dt>
              <dd>{money.format(total)}</dd>
            </div>
          </dl>
          <form className="g-order-submit" noValidate onSubmit={form.handleSubmit}>
            <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
            <FormError>{form.formError}</FormError>
            {consent ? (
              <ConsentField id={form.idOf('agree')} checked={form.values.agree} onCheckedChange={(checked) => form.set('agree', checked)} error={form.errors.agree}>
                {consent}
              </ConsentField>
            ) : null}
            <Button type="submit" variant="primary" block loading={form.pending}>
              {o.submit}
            </Button>
            <p className="g-order-submit-note">{phrase(o.submitNote)}</p>
          </form>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CancelSubscriptionPage                                                     */
/* -------------------------------------------------------------------------- */

export interface CancelReason {
  value: string;
  label: string;
}

export interface RetentionOffer {
  /** 提案を見分けるキー（onAcceptOffer に渡す）。 */
  id: string;
  title: string;
  description?: ReactNode;
  /** 提案を受けるボタンの文（「1 か月止める」）。 */
  action: string;
}

export interface CancelSubscriptionPageProps extends DataAttributes {
  /** 解約するプランの名前と、使える最後の日（YYYY-MM-DD）。 */
  plan: { name: string; periodEnd: string };
  /** 解約の理由の選択肢。渡すと最初に尋ねる（答えなくても進める）。 */
  reasons?: readonly CancelReason[];
  /** 引き止めの提案（一時停止・安いプランなど）。渡すと 1 度だけ出し、解約に進む道を同じ重さで出す。 */
  offers?: readonly RetentionOffer[];
  /** 解約の後のデータの扱い（「解約から 30 日後に削除します」）。 */
  dataNotice?: ReactNode;
  /** データを書き出すページ。渡すと確認の画面にリンクを出す。 */
  exportHref?: string;
  /** 解約する。理由とひと言（答えたときだけ）を受け取る。 */
  onCancel: (answer: { reason?: string; comment?: string }) => SubmitResult | Promise<SubmitResult>;
  /** 提案を受ける。 */
  onAcceptOffer?: (id: string) => SubmitResult | Promise<SubmitResult>;
  /** 「解約しない」。渡すと各画面にボタンを出す（設定のページへ戻るなど）。 */
  onKeep?: () => void;
  title?: ReactNode;
  className?: string;
}

type CancelStep = 'reason' | 'offer' | 'confirm';

/**
 * 解約の手続き。P-35。
 *
 * 理由（任意）→ 提案（任意・1 度だけ）→ 確認、の順に進み、どの画面からも「解約しない」で抜けられる。
 * 理由は答えなくても次へ進め、提案の画面では「解約に進む」を提案と同じ重さのボタンにする（引き止めで解約を妨げない）。
 * 確認の画面で、使える最後の日・その後に起きること・データの扱いと書き出しを示してから解約する。
 * 画面が替わるたびに見出しへフォーカスを移し、結果は role="status" で伝える。
 */
export function CancelSubscriptionPage({
  plan,
  reasons,
  offers,
  dataNotice,
  exportHref,
  onCancel,
  onAcceptOffer,
  onKeep,
  title,
  className,
  ...rest
}: CancelSubscriptionPageProps): ReactNode {
  const { labels } = useSite();
  const phrase = usePhrase();
  const { common, cancelSubscription: c } = labels;
  const ids = useId();
  const steps: CancelStep[] = [...(reasons?.length ? (['reason'] as const) : []), ...(offers?.length && onAcceptOffer ? (['offer'] as const) : []), 'confirm'];
  const [index, setIndex] = useState(0);
  const [outcome, setOutcome] = useState<'canceled' | 'kept' | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<ReactNode>(null);
  const [pending, setPending] = useState<string | null>(null);
  const step = steps[Math.min(index, steps.length - 1)] ?? 'confirm';
  const headingRef = useFocusOnChange(outcome ?? step);
  const until = formatDate(plan.periodEnd, labels.locale).text;
  const stepLabel: Record<CancelStep, string> = { reason: c.stepReason, offer: c.stepOffer, confirm: c.stepConfirm };

  const go = (next: number): void => {
    setError(null);
    setIndex(Math.min(Math.max(next, 0), steps.length - 1));
  };
  const act = async (key: string, run: () => SubmitResult | Promise<SubmitResult>, done: 'canceled' | 'kept'): Promise<void> => {
    setPending(key);
    const failure = await runAction(run, common.submitFailed);
    setPending(null);
    if (failure) setError(failure);
    else setOutcome(done);
  };
  const keep = onKeep ? (
    <Button variant="tertiary" onClick={onKeep}>
      {c.keep}
    </Button>
  ) : null;

  const heading = outcome === 'canceled' ? c.doneTitle : outcome === 'kept' ? c.keptTitle : step === 'reason' ? c.reasonTitle : step === 'offer' ? c.offerTitle : c.confirmTitle;

  return (
    <div {...domPassthrough(rest, 'CancelSubscriptionPage')} className={cx('g-cancel-flow', className)}>
      <PageHeader title={title ?? c.title} description={c.description(plan.name)} />
      {outcome === null && steps.length > 1 ? <Steps label={c.steps} items={steps.map((key) => ({ key, label: stepLabel[key] }))} current={index} /> : null}
      <section className="g-cancel-step" aria-labelledby={`${ids}-heading`}>
        <h2 ref={headingRef} id={`${ids}-heading`} className="g-app-subtitle" tabIndex={-1}>
          {phrase(heading)}
        </h2>
        <div className="g-live" role="status">
          {outcome === 'canceled' ? <p className="g-cancel-text">{phrase(c.doneDescription(until))}</p> : null}
          {outcome === 'kept' ? <p className="g-cancel-text">{phrase(c.keptDescription)}</p> : null}
        </div>
        {outcome === null ? <FormError>{error}</FormError> : null}

        {outcome === null && step === 'reason' && reasons ? (
          <>
            <p className="g-cancel-text">{phrase(c.reasonDescription)}</p>
            <ModalFieldset label={c.stepReason} className="g-cancel-reasons">
              <ModalRadioGroup name="reason" options={reasons} value={reason} onValueChange={setReason} />
            </ModalFieldset>
            <ModalField label={c.comment}>
              {(control) => <ModalTextarea {...control} name="comment" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} />}
            </ModalField>
            <div className="g-cancel-actions">
              <Button variant="primary" onClick={() => go(index + 1)}>
                {c.next}
              </Button>
              {keep}
            </div>
          </>
        ) : null}

        {outcome === null && step === 'offer' && offers && onAcceptOffer ? (
          <>
            <p className="g-cancel-text">{phrase(c.offerDescription)}</p>
            <ul className="g-cancel-offers">
              {offers.map((offer) => (
                <li key={offer.id} className="g-cancel-offer">
                  <h3 className="g-cancel-offer-title">{phrase(offer.title)}</h3>
                  {offer.description ? <p className="g-cancel-text">{phrase(offer.description)}</p> : null}
                  <Button loading={pending === offer.id} onClick={() => void act(offer.id, () => onAcceptOffer(offer.id), 'kept')}>
                    {offer.action}
                  </Button>
                </li>
              ))}
            </ul>
            <div className="g-cancel-actions">
              <Button variant="primary" onClick={() => go(index + 1)}>
                {c.continueCancel}
              </Button>
              {index > 0 ? <Button onClick={() => go(index - 1)}>{c.back}</Button> : null}
              {keep}
            </div>
          </>
        ) : null}

        {outcome === null && step === 'confirm' ? (
          <>
            <p className="g-cancel-text">
              {phrase(c.until(until))}
              {phrase(c.afterEnd)}
            </p>
            {dataNotice ? <p className="g-cancel-text">{phrase(dataNotice)}</p> : null}
            {exportHref ? (
              <p className="g-cancel-text">
                <a href={exportHref}>{c.export}</a>
              </p>
            ) : null}
            <div className="g-cancel-actions">
              <Button
                variant="danger"
                loading={pending === 'cancel'}
                onClick={() =>
                  void act(
                    'cancel',
                    () => onCancel({ ...(reason ? { reason } : {}), ...(comment.trim() ? { comment: comment.trim() } : {}) }),
                    'canceled',
                  )
                }
              >
                {c.confirm}
              </Button>
              {index > 0 ? <Button onClick={() => go(index - 1)}>{c.back}</Button> : null}
              {keep}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
