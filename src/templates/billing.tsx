import { useId, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Button, ButtonLink } from '../button';
import { DataTable, type DataTableColumn } from '../data-table';
import { Badge, Card, DescriptionList, type StatusTone } from '../display';
import { Banner, Progress } from '../feedback';
import { ModalButton, ModalFooter } from '../footer';
import { ModalDescription, ModalHeader, ModalTitle } from '../header';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { PageHeader } from '../page-header';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import { FormError, formatDate, runAction, type SubmitResult } from './form';
import { SiteButtonLink, useSite, useTimeZone } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

export type BillingStatus = 'active' | 'trialing' | 'past_due' | 'canceled';

export interface BillingPlan {
  name: string;
  /** 値段。null か省くと値段を出さない（「ご相談」のプラン）。 */
  price?: number | null;
  /** 既定 'month'。 */
  interval?: 'month' | 'year';
  /** 通貨（ISO 4217）。既定 'JPY'。 */
  currency?: string;
  /** 既定 'active'。 */
  status?: BillingStatus;
  /** 期間の終わり（Date か 'YYYY-MM-DD'）。有効なら次の更新日、試用中なら試用の終わり、解約済みなら使える最後の日。 */
  periodEnd?: Date | string;
}

export interface BillingUsage {
  label: string;
  used: number;
  limit: number;
  /** 数の見せ方（「82 GB」）。既定は言語に合わせた数の書式（「38,200」）。 */
  format?: (value: number) => string;
  key?: string;
}

export interface BillingPaymentMethod {
  /** カードの種類（「Visa」）。 */
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface BillingInvoice {
  id: string;
  number: string;
  date: Date | string;
  amount: number;
  /** 既定は plan の通貨。 */
  currency?: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  /** PDF の行き先。 */
  href?: string;
}

export interface BillingPageProps extends DataAttributes {
  plan: BillingPlan;
  usage?: readonly BillingUsage[];
  /** 登録した支払い方法（null は未登録）。 */
  paymentMethod?: BillingPaymentMethod | null;
  /** 支払い方法を登録・変更する（決済サービスの画面へ移るなど）。 */
  onUpdatePayment?: () => void | Promise<void>;
  billingEmail?: string;
  invoices?: readonly BillingInvoice[];
  /** 「プランを変える」の行き先。既定は SiteProvider の links.pricing。 */
  changePlanHref?: string;
  /** 渡すと「解約する」を出す（確かめてから呼ぶ）。 */
  onCancel?: () => SubmitResult | Promise<SubmitResult>;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

const STATUS_TONES: Record<BillingStatus, StatusTone> = { active: 'success', trialing: 'info', past_due: 'error', canceled: 'neutral' };
const INVOICE_TONES: Record<BillingInvoice['status'], StatusTone> = { paid: 'success', open: 'warning', void: 'neutral', uncollectible: 'error' };

/** 使っている量の色。8 割を超えたら注意、上限に届いたら失敗の色（色だけでなく数でも分かる）。 */
const usageTone = (used: number, limit: number): StatusTone | undefined => (used >= limit ? 'error' : used >= limit * 0.8 ? 'warning' : undefined);

/**
 * 料金と請求。P-15。AppShell の中に置く中身。
 *
 * 今のプラン（状態の言葉の印・値段は「月額 ￥1,500」と言葉で・次の更新日）・支払い方法（カードは下 4 桁だけ）・
 * 使っている量（8 割で注意、上限で失敗の色。数でも示す）・請求書の表（番号を行の見出しに、PDF のリンクは番号つきの名前）。
 * 支払いに失敗していれば、ページの上の知らせの帯で伝える。解約は、いつまで使えるかを示して確かめてから行う。
 */
export function BillingPage({
  plan,
  usage,
  paymentMethod,
  onUpdatePayment,
  billingEmail,
  invoices,
  changePlanHref,
  onCancel,
  title,
  description,
  className,
  ...rest
}: BillingPageProps): ReactNode {
  const { labels, links } = useSite();
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const { common, billing: b } = labels;
  const invoicesId = `${useId()}-invoices`;
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<ReactNode>(null);
  const [notice, setNotice] = useState<ReactNode>(null);
  const status = plan.status ?? 'active';
  const currency = plan.currency ?? 'JPY';
  const money = (amount: number, code = currency): string => new Intl.NumberFormat(labels.locale, { style: 'currency', currency: code }).format(amount);
  const count = (value: number): string => new Intl.NumberFormat(labels.locale).format(value);
  const periodEnd = plan.periodEnd ? formatDate(plan.periodEnd, labels.locale, timeZone) : null;
  const period =
    periodEnd === null ? null : status === 'trialing' ? b.trialEnds(periodEnd.text) : status === 'canceled' ? b.endsOn(periodEnd.text) : status === 'active' ? b.renews(periodEnd.text) : null;
  const planHref = changePlanHref ?? links.pricing;

  const invoiceColumns: DataTableColumn<BillingInvoice>[] = [
    { key: 'number', header: b.invoiceNumber, cell: (invoice) => invoice.number },
    {
      key: 'date',
      header: b.invoiceDate,
      cell: (invoice) => {
        const { text, iso } = formatDate(invoice.date, labels.locale, timeZone);
        return <time dateTime={iso}>{text}</time>;
      },
      sortValue: (invoice) => (invoice.date instanceof Date ? invoice.date : new Date(invoice.date)),
    },
    { key: 'amount', header: b.amount, cell: (invoice) => money(invoice.amount, invoice.currency), sortValue: (invoice) => invoice.amount, align: 'end' },
    { key: 'status', header: b.invoiceStatus, cell: (invoice) => <Badge tone={INVOICE_TONES[invoice.status]}>{b.invoiceStatuses[invoice.status]}</Badge> },
  ];

  return (
    <div {...domPassthrough(rest, 'BillingPage')} className={cx('g-billing', className)}>
      <PageHeader title={title ?? b.title} description={description ?? b.description} />
      {status === 'past_due' ? (
        <Banner
          tone="error"
          title={b.statuses.past_due}
          action={
            onUpdatePayment ? (
              <Button size="sm" onAction={onUpdatePayment}>
                {b.updatePayment}
              </Button>
            ) : undefined
          }
        >
          {b.pastDue}
        </Banner>
      ) : null}
      {notice ? (
        <Banner tone="success" live onDismiss={() => setNotice(null)}>
          {notice}
        </Banner>
      ) : null}
      <div className="g-billing-grid">
        <Card
          headingLevel={2}
          title={b.plan}
          actions={<Badge tone={STATUS_TONES[status]}>{b.statuses[status]}</Badge>}
          footer={
            planHref || (onCancel && status !== 'canceled') ? (
              <div className="g-billing-actions">
                {planHref ? (
                  <SiteButtonLink href={planHref} variant="primary">
                    {b.changePlan}
                  </SiteButtonLink>
                ) : null}
                {onCancel && status !== 'canceled' ? (
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      setCancelError(null);
                      setCanceling(true);
                    }}
                  >
                    {b.cancel}
                  </Button>
                ) : null}
              </div>
            ) : undefined
          }
        >
          <p className="g-billing-plan-name">{phrase(plan.name)}</p>
          {plan.price !== undefined && plan.price !== null ? <p className="g-billing-price">{b.price(money(plan.price), plan.interval ?? 'month')}</p> : null}
          {period && periodEnd ? (
            <p className="g-billing-period">
              <time dateTime={periodEnd.iso}>{phrase(period)}</time>
            </p>
          ) : null}
        </Card>

        <Card
          headingLevel={2}
          title={b.payment}
          footer={
            onUpdatePayment ? (
              <div className="g-billing-actions">
                <Button onAction={onUpdatePayment}>{paymentMethod ? b.updatePayment : b.addPayment}</Button>
              </div>
            ) : undefined
          }
        >
          {paymentMethod ? (
            <div className="g-billing-card">
              {/* 見た目は「Visa •••• 4242」、読み上げは「Visa、末尾 4242」（点を読ませない） */}
              <p className="g-billing-card-number">
                <span aria-hidden="true">{`${paymentMethod.brand} •••• ${paymentMethod.last4}`}</span>
                <span className="g-sr-only">{b.card(paymentMethod.brand, paymentMethod.last4)}</span>
              </p>
              <p className="g-billing-card-expiry">
                {b.expires(String(paymentMethod.expMonth).padStart(2, '0'), String(paymentMethod.expYear).slice(-2))}
              </p>
            </div>
          ) : (
            <p className="g-billing-muted">{phrase(b.noPayment)}</p>
          )}
          {billingEmail ? <DescriptionList items={[{ key: 'email', term: b.billingEmail, details: billingEmail }]} /> : null}
        </Card>

        {usage && usage.length > 0 ? (
          <Card headingLevel={2} title={b.usage} className="g-billing-usage">
            <div className="g-billing-meters">
              {usage.map((item) => {
                const format = item.format ?? count;
                return (
                  <Progress
                    key={item.key ?? item.label}
                    label={item.label}
                    value={Math.min(item.used, item.limit)}
                    max={item.limit}
                    tone={usageTone(item.used, item.limit)}
                    valueText={() => `${format(item.used)} / ${format(item.limit)}`}
                  />
                );
              })}
            </div>
          </Card>
        ) : null}
      </div>

      {invoices ? (
        <section className="g-billing-invoices" aria-labelledby={invoicesId}>
          <h2 id={invoicesId} className="g-app-subtitle">
            {phrase(b.invoices)}
          </h2>
          <DataTable
            label={b.invoices}
            columns={invoiceColumns}
            rows={invoices}
            getRowId={(invoice) => invoice.id}
            defaultSort={{ key: 'date', direction: 'descending' }}
            density="compact"
            rowActions={(invoice) =>
              invoice.href ? (
                <ButtonLink href={invoice.href} variant="tertiary" size="sm" aria-label={b.downloadFor(invoice.number)}>
                  {b.download}
                </ButtonLink>
              ) : null
            }
            empty={phrase(b.noInvoices)}
          />
        </section>
      ) : null}

      {onCancel ? (
        <ModalRoot open={canceling} onOpenChange={setCanceling} kind="confirm">
          <ModalHeader>
            <ModalTitle>{b.cancelTitle}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {periodEnd ? <ModalDescription>{b.cancelDescription(periodEnd.text)}</ModalDescription> : null}
            <FormError>{cancelError}</FormError>
          </ModalBody>
          <ModalFooter>
            <ModalButton variant="tertiary" onClick={() => setCanceling(false)}>
              {b.keep}
            </ModalButton>
            <ModalButton
              variant="danger"
              onAction={async () => {
                const failure = await runAction(onCancel, common.submitFailed);
                if (failure) {
                  setCancelError(failure);
                  return;
                }
                setCanceling(false);
                setNotice(b.canceled);
              }}
            >
              {b.cancelConfirm}
            </ModalButton>
          </ModalFooter>
        </ModalRoot>
      ) : null}
    </div>
  );
}
