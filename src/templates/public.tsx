import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';

import { Button } from '../button';
import { ModalSegmented } from '../choices';
import { Accordion } from '../disclosure';
import { Badge, type StatusTone } from '../display';
import { ModalField } from '../fields';
import { ModalInput, ModalSearchInput, ModalTextarea } from '../inputs';
import { Icon } from '../internal/icons';
import { domPassthrough } from '../internal/passthrough';
import { ScrollPane } from '../internal/scrollbars';
import { usePhrase } from '../phrase';
import { ModalSelect, normalizeForMatch } from '../select';
import {
  ConsentField,
  EMAIL_INPUT,
  ErrorSummary,
  FormError,
  formatDate,
  looksLikeEmail,
  useTemplateForm,
  type FormErrors,
  type SubmitResult,
} from './form';
import { changelogLabels, commonLabels, contactLabels, documentLabels, faqLabels, pricingLabels } from './labels';
import { WithSiteLayout, jumpTo, type PublicPage } from './site-layout';
import { SiteButtonLink, SiteLink, useSiteConfig, useTemplateLabels, useTimeZone } from './site';

/* -------------------------------------------------------------------------- */
/* DocumentPage                                                                */
/* -------------------------------------------------------------------------- */

export interface DocumentSection {
  /** 見出しの id。ページ内リンク（#id）の行き先になる。 */
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export interface DocumentPageProps extends PublicPage {
  title: ReactNode;
  sections: readonly DocumentSection[];
  /** 施行日（Date か 'YYYY-MM-DD'）。 */
  effective?: Date | string;
  /** 最終更新日。 */
  updated?: Date | string;
  intro?: ReactNode;
  /** 見出しの番号。'article' は「第 1 条」、'number' は「1.」。既定 'none'。 */
  numbering?: 'none' | 'number' | 'article';
  /** 目次を出すか。既定は節が 3 つ以上のとき。 */
  toc?: boolean;
  /** SiteLayout の案内で、いまのページとして示す行き先。 */
  current?: string;
}

const DOCUMENT_LABELS = { document: documentLabels } as const;

/**
 * 規約・プライバシーポリシー・特定商取引法に基づく表記などの文書。P-07。
 *
 * 見出し（h1）・施行日と更新日（time 要素）・目次（名前のある nav）・節（見出しに id。リンクで直接開ける）。
 * 器が広いときは目次を横に置いて付いてこさせ、本文の行の長さを読みやすい幅に抑える。印刷では目次と外枠を省く。
 */
export function DocumentPage({
  title,
  sections,
  effective,
  updated,
  intro,
  numbering = 'none',
  toc,
  current,
  layout = true,
  className,
  ...rest
}: DocumentPageProps): ReactNode {
  const labels = useTemplateLabels(DOCUMENT_LABELS);
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const tocId = `${useId()}-toc`;
  const showToc = toc ?? sections.length >= 3;
  const number = (index: number): string | null =>
    numbering === 'article' ? labels.document.article(index + 1) : numbering === 'number' ? `${String(index + 1)}.` : null;
  const heading = (section: DocumentSection, index: number): ReactNode => {
    const n = number(index);
    return n ? (
      <>
        <span className="g-doc-number">{n}</span> {phrase(section.title)}
      </>
    ) : (
      phrase(section.title)
    );
  };
  const meta = [
    effective ? { label: labels.document.effective, ...formatDate(effective, labels.locale, timeZone) } : null,
    updated ? { label: labels.document.updated, ...formatDate(updated, labels.locale, timeZone) } : null,
  ].filter((item): item is { label: string; text: string; iso: string } => item !== null);

  return (
    <WithSiteLayout layout={layout} current={current} className={className} data={domPassthrough(rest, 'DocumentPage')}>
      <article className="g-doc" data-toc={showToc ? '' : undefined}>
        <header className="g-doc-header">
          <h1 className="g-doc-title">{phrase(title)}</h1>
          {meta.length > 0 ? (
            <ul className="g-doc-meta">
              {meta.map((item) => (
                <li key={item.label}>
                  {phrase(item.label)} <time dateTime={item.iso}>{item.text}</time>
                </li>
              ))}
            </ul>
          ) : null}
          {intro ? <div className="g-doc-intro">{phrase(intro)}</div> : null}
        </header>
        {showToc ? (
          <nav className="g-doc-toc" aria-labelledby={tocId}>
            <h2 id={tocId} className="g-doc-toc-title">
              {phrase(labels.document.toc)}
            </h2>
            <ol>
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} onClick={(event) => jumpTo(event, section.id)}>
                    {heading(section, index)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="g-doc-body">
          {sections.map((section, index) => (
            <section key={section.id} className="g-doc-section" aria-labelledby={section.id}>
              <h2 id={section.id} className="g-doc-heading" tabIndex={-1}>
                {heading(section, index)}
              </h2>
              <div className="g-doc-content">{phrase(section.content)}</div>
            </section>
          ))}
        </div>
      </article>
    </WithSiteLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* FaqPage                                                                     */
/* -------------------------------------------------------------------------- */

export interface FaqItem {
  /** 項目の id。#id で開いた状態のページへ直接リンクできる。 */
  id: string;
  question: string;
  answer: ReactNode;
  /** まとまりの名前（「料金」「アカウント」）。渡すと見出しで分ける。 */
  category?: string;
  /** 絞り込みで当てる言葉（質問の文に無い言い方）。 */
  keywords?: readonly string[];
}

export interface FaqPageProps extends PublicPage {
  items: readonly FaqItem[];
  /** 絞り込みの欄を出すか。既定は項目が 6 つ以上のとき。 */
  search?: boolean;
}

/** まとまりごとの項目。まとまりの無い項目は、最後の「その他」にまとめる（全部無ければ 1 つ）。 */
function groupFaq(items: readonly FaqItem[], other: string): { name: string | null; items: FaqItem[] }[] {
  if (!items.some((item) => item.category)) return [{ name: null, items: [...items] }];
  const groups = new Map<string, FaqItem[]>();
  for (const item of items) {
    const name = item.category ?? other;
    groups.set(name, [...(groups.get(name) ?? []), item]);
  }
  return [...groups].map(([name, list]) => ({ name, items: list }));
}

const FAQ_LABELS = { faq: faqLabels } as const;

/** 質問の一覧（まとまりの見出しとアコーディオン）。FaqPage と PricingPage が使う。 */
function FaqList({ items, headingLevel }: { items: readonly FaqItem[]; headingLevel: 2 | 3 }): ReactNode {
  const labels = useTemplateLabels(FAQ_LABELS);
  const phrase = usePhrase();
  const base = useId();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <>
      {groupFaq(items, labels.faq.other).map((group, index) => {
        const accordion = <Accordion items={group.items.map((item) => ({ value: item.id, id: item.id, title: item.question, content: item.answer }))} />;
        if (!group.name) return <div key="all">{accordion}</div>;
        const headingId = `${base}-${String(index)}`;
        return (
          <section key={group.name} className="g-faq-group" aria-labelledby={headingId}>
            <Heading id={headingId} className="g-faq-group-title">
              {phrase(group.name)}
            </Heading>
            {accordion}
          </section>
        );
      })}
    </>
  );
}

/**
 * よくある質問。P-08。
 *
 * 質問の文と言葉で絞り込み（カタカナとひらがな・全角と半角・大文字と小文字を区別しない）、件数を読み上げる。
 * まとまりがあれば見出しで分ける。アドレスの #id の質問は開いた状態で出す。最後に問い合わせの道を置く。
 */
export function FaqPage({ items, search, title, description, layout = true, className, ...rest }: FaqPageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(FAQ_LABELS);
  const phrase = usePhrase();
  const [query, setQuery] = useState('');
  // アドレスの #id の質問を開いて見せる。描いた後に開く（サーバーの描画と食い違わないように）。
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!items.some((item) => item.id === id)) return;
    const target = document.getElementById(id);
    if (target instanceof HTMLDetailsElement) target.open = true;
    target?.scrollIntoView({ block: 'start' });
    // 開いた直後の 1 回だけ。項目が変わるたびに開き直さない。
  }, []);
  const showSearch = search ?? items.length >= 6;
  const needle = normalizeForMatch(query.trim());
  const shown = useMemo(
    () => (needle ? items.filter((item) => normalizeForMatch([item.question, ...(item.keywords ?? [])].join(' ')).includes(needle)) : items),
    [items, needle],
  );

  return (
    <WithSiteLayout layout={layout} current={links.faq} className={className} data={domPassthrough(rest, 'FaqPage')}>
      <div className="g-faq">
        <header className="g-public-header">
          <h1 className="g-public-title">{phrase(title ?? labels.faq.title)}</h1>
          <p className="g-public-description">{phrase(description ?? labels.faq.description)}</p>
          {showSearch ? (
            <div role="search" className="g-faq-search">
              <ModalSearchInput aria-label={labels.faq.search} placeholder={labels.faq.search} value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          ) : null}
        </header>
        {showSearch ? (
          <p className="g-faq-count" role="status">
            {needle ? phrase(labels.faq.results(shown.length)) : null}
          </p>
        ) : null}
        {shown.length > 0 ? <FaqList items={shown} headingLevel={2} /> : <p className="g-faq-empty">{phrase(labels.faq.noResults)}</p>}
        {links.contact ? (
          <aside className="g-faq-contact" aria-label={labels.faq.stillNeedHelp}>
            <p className="g-faq-contact-title">{phrase(labels.faq.stillNeedHelp)}</p>
            <SiteButtonLink href={links.contact}>{labels.faq.contact}</SiteButtonLink>
          </aside>
        ) : null}
      </div>
    </WithSiteLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* PricingPage                                                                 */
/* -------------------------------------------------------------------------- */

export interface PricingPlan {
  id: string;
  name: string;
  description?: ReactNode;
  /** 月払いの月額。null は値段を出さず「ご相談」にする。 */
  monthly: number | null;
  /** 年払いの年額。省略したプランは、年払いのときも月払いの値段を出す。 */
  yearly?: number;
  features: readonly ReactNode[];
  /** 申し込みのボタン。 */
  cta: { label: string; href: string };
  /** 推すプラン（「おすすめ」の印と、枠の強調）。 */
  recommended?: boolean;
  /** 値段の下の注記（「ユーザーあたり」）。 */
  note?: ReactNode;
}

export interface PricingComparisonRow {
  feature: ReactNode;
  /** プランの id ごとの値。true は「あり」、false は「なし」、ほかは文字で出す。 */
  values: Readonly<Record<string, boolean | ReactNode>>;
  key?: string;
}

export interface PricingPageProps extends PublicPage {
  plans: readonly PricingPlan[];
  /** 通貨（ISO 4217）。既定 'JPY'。 */
  currency?: string;
  /** 年払いの割引の表記（「2 か月分お得」）。年払いの選択肢に添える。 */
  yearlyNote?: string;
  defaultBilling?: 'monthly' | 'yearly';
  comparison?: readonly PricingComparisonRow[];
  faq?: readonly FaqItem[];
}

const PRICING_LABELS = { pricing: pricingLabels } as const;

/**
 * 料金プラン。P-09。
 *
 * 月払いと年払いを切り替え（年払いのプランがあるときだけ）、プランをカードで並べる。値段は Intl の通貨の書式で、
 * 読み上げは「月額 ¥1,200」と期間を言葉にする（「/ 月」の記号を読ませない）。推すプランは印の言葉と枠で示す（色だけにしない）。
 * 比べる表は見出しのセル（scope）を持ち、器が狭いときは表だけを横に送る。
 */
export function PricingPage({
  plans,
  currency = 'JPY',
  yearlyNote,
  defaultBilling = 'monthly',
  comparison,
  faq,
  title,
  description,
  layout = true,
  className,
  ...rest
}: PricingPageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(PRICING_LABELS);
  const phrase = usePhrase();
  const base = useId();
  const { pricing } = labels;
  const hasYearly = plans.some((plan) => plan.yearly !== undefined);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(hasYearly ? defaultBilling : 'monthly');
  // 小数の桁は通貨の決まり（円・ウォンは 0 桁、ドルは 2 桁、ディナールは 3 桁）に任せる。
  const money = new Intl.NumberFormat(labels.locale, { style: 'currency', currency });
  const compareId = `${base}-compare`;
  const faqId = `${base}-faq`;

  return (
    <WithSiteLayout layout={layout} current={links.pricing} className={className} data={domPassthrough(rest, 'PricingPage')}>
      <div className="g-pricing">
        <header className="g-public-header g-pricing-header">
          <h1 className="g-public-title">{phrase(title ?? pricing.title)}</h1>
          <p className="g-public-description">{phrase(description ?? pricing.description)}</p>
          {hasYearly ? (
            <ModalSegmented
              aria-label={pricing.billing}
              value={billing}
              onValueChange={(value) => setBilling(value === 'yearly' ? 'yearly' : 'monthly')}
              options={[
                { value: 'monthly', label: pricing.monthly },
                { value: 'yearly', label: yearlyNote ? `${pricing.yearly}（${yearlyNote}）` : pricing.yearly },
              ]}
            />
          ) : null}
        </header>
        <div className="g-plans">
          {plans.map((plan) => {
            const nameId = `${base}-${plan.id}`;
            const yearly = billing === 'yearly' && plan.yearly !== undefined;
            const perMonth = plan.monthly === null ? null : yearly ? (plan.yearly as number) / 12 : plan.monthly;
            const amount = perMonth === null ? null : money.format(perMonth);
            return (
              <article key={plan.id} className="g-plan" data-recommended={plan.recommended ? '' : undefined} aria-labelledby={nameId}>
                <div className="g-plan-header">
                  <h2 id={nameId} className="g-plan-name">
                    {phrase(plan.name)}
                  </h2>
                  {plan.recommended ? <Badge tone="accent">{pricing.recommended}</Badge> : null}
                </div>
                {plan.description ? <p className="g-plan-description">{phrase(plan.description)}</p> : null}
                <p className="g-plan-price">
                  {amount === null ? (
                    <span className="g-plan-amount">{phrase(pricing.custom)}</span>
                  ) : (
                    <>
                      <span className="g-plan-amount" aria-hidden="true">
                        {amount}
                      </span>
                      <span className="g-plan-period" aria-hidden="true">
                        {pricing.perMonth}
                      </span>
                      <span className="g-sr-only">{pricing.monthlyPrice(amount)}</span>
                    </>
                  )}
                </p>
                <p className="g-plan-note">
                  {yearly ? phrase(pricing.billedYearly(money.format(plan.yearly as number))) : plan.note ? phrase(plan.note) : null}
                </p>
                <SiteButtonLink href={plan.cta.href} variant={plan.recommended ? 'primary' : 'secondary'} block>
                  {plan.cta.label}
                </SiteButtonLink>
                <ul className="g-plan-features">
                  {plan.features.map((feature, index) => (
                    // 特徴は並べ替わらないので、位置を key にしてよい。
                    <li key={index}>
                      <Icon name="check" className="g-plan-check" />
                      <span>{phrase(feature)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        {comparison && comparison.length > 0 ? (
          // 名前のある領域は横に送る器の 1 つだけにする（見出しの section も region にすると、同じ名前が 2 つ並ぶ）。
          <div className="g-compare">
            <h2 id={compareId} className="g-public-subtitle">
              {phrase(pricing.compare)}
            </h2>
            {/* 器が狭いときは表だけを横に送る。キーボードでも送れるよう、名前のある領域にしてフォーカスを止める */}
            <ScrollPane className="g-compare-frame" viewportClassName="g-compare-scroll" axes={['x']} role="region" aria-labelledby={compareId} tabIndex={0}>
              <table className="g-compare-table">
                <thead>
                  <tr>
                    <th scope="col">{phrase(pricing.feature)}</th>
                    {plans.map((plan) => (
                      <th key={plan.id} scope="col">
                        {phrase(plan.name)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, index) => (
                    <tr key={row.key ?? (typeof row.feature === 'string' ? row.feature : String(index))}>
                      <th scope="row">{phrase(row.feature)}</th>
                      {plans.map((plan) => {
                        const value = row.values[plan.id];
                        return (
                          <td key={plan.id}>
                            {value === true ? (
                              <>
                                <Icon name="check" className="g-plan-check" />
                                <span className="g-sr-only">{pricing.included}</span>
                              </>
                            ) : value === false || value === undefined ? (
                              <>
                                <span aria-hidden="true">—</span>
                                <span className="g-sr-only">{pricing.notIncluded}</span>
                              </>
                            ) : (
                              phrase(value)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollPane>
          </div>
        ) : null}
        {faq && faq.length > 0 ? (
          <section className="g-pricing-faq" aria-labelledby={faqId}>
            <h2 id={faqId} className="g-public-subtitle">
              {phrase(pricing.faq)}
            </h2>
            <FaqList items={faq} headingLevel={3} />
          </section>
        ) : null}
      </div>
    </WithSiteLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* ContactPage                                                                 */
/* -------------------------------------------------------------------------- */

export interface ContactValues {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
  agree: boolean;
}

export interface ContactPageProps extends PublicPage {
  onSubmit: (values: ContactValues) => SubmitResult | Promise<SubmitResult>;
  /** お問い合わせの種類。既定は「製品について・料金・請求について・不具合の報告・その他」。 */
  topics?: readonly { value: string; label: string }[];
  /** 会社名の欄（任意）を出すか。既定 true。 */
  company?: boolean;
  /** 内容の最大の文字数。既定 2000。 */
  maxLength?: number;
  /** フォームの横に置く連絡先（メール・電話・受付時間など）。 */
  details?: ReactNode;
}

const CONTACT_LABELS = { common: commonLabels, contact: contactLabels } as const;

/**
 * お問い合わせ。P-10。
 *
 * 名前・メールアドレス・会社名（任意）・種類・内容（文字数を表示）・プライバシーポリシーへの同意。
 * 日本の問い合わせフォームの慣習どおり、必須と任意の印を出す。送ったら受付の画面に切り替え、見出しへフォーカスを移す。
 */
export function ContactPage({
  onSubmit,
  topics,
  company = true,
  maxLength = 2000,
  details,
  title,
  description,
  layout = true,
  className,
  ...rest
}: ContactPageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(CONTACT_LABELS);
  const phrase = usePhrase();
  const { common, contact } = labels;
  const [sentTo, setSentTo] = useState<string | null>(null);
  const options = topics ?? [
    { value: 'product', label: contact.topics.product },
    { value: 'billing', label: contact.topics.billing },
    { value: 'bug', label: contact.topics.bug },
    { value: 'other', label: contact.topics.other },
  ];
  const form = useTemplateForm<ContactValues>({
    initial: { name: '', email: '', company: '', topic: '', message: '', agree: false },
    validate: (values) => {
      const errors: FormErrors<ContactValues> = {};
      if (!values.name.trim()) errors.name = common.requiredField(common.name);
      if (!values.email.trim()) errors.email = common.requiredField(common.email);
      else if (!looksLikeEmail(values.email)) errors.email = common.invalidEmail;
      if (!values.topic) errors.topic = common.requiredField(contact.topic);
      if (!values.message.trim()) errors.message = common.requiredField(contact.message);
      if (!values.agree) errors.agree = contact.agreeRequired;
      return errors;
    },
    onSubmit,
    onSuccess: ({ email }) => setSentTo(email.trim()),
    submitFailed: common.submitFailed,
  });
  const [doneHeading, setDoneHeading] = useState<HTMLHeadingElement | null>(null);
  useEffect(() => {
    doneHeading?.focus();
  }, [doneHeading]);
  const privacy = links.privacy ? <SiteLink href={links.privacy}>{phrase(common.privacy)}</SiteLink> : phrase(common.privacy);
  const data = domPassthrough(rest, 'ContactPage');

  if (sentTo !== null) {
    return (
      <WithSiteLayout layout={layout} current={links.contact} className={className} data={data}>
        <div className="g-contact-done">
          <h1 ref={setDoneHeading} className="g-public-title" tabIndex={-1}>
            {phrase(contact.doneTitle)}
          </h1>
          <p className="g-public-description">{phrase(contact.doneDescription(sentTo))}</p>
          {links.home ? <SiteButtonLink href={links.home}>{common.home}</SiteButtonLink> : null}
        </div>
      </WithSiteLayout>
    );
  }

  return (
    <WithSiteLayout layout={layout} current={links.contact} className={className} data={data}>
      <div className="g-contact">
        <header className="g-public-header g-contact-intro">
          <h1 className="g-public-title">{phrase(title ?? contact.title)}</h1>
          <p className="g-public-description">{phrase(description ?? contact.description)}</p>
          {details ? <div className="g-contact-details">{details}</div> : null}
        </header>
        <form className="g-contact-form g-auth-form" noValidate onSubmit={form.handleSubmit}>
          <ErrorSummary title={common.errorSummary} items={form.summary} summaryRef={form.summaryRef} />
          <FormError>{form.formError}</FormError>
          <ModalField id={form.idOf('name')} label={common.name} required error={form.errors.name}>
            {(control) => <ModalInput {...control} name="name" autoComplete="name" value={form.values.name} onChange={(event) => form.set('name', event.target.value)} />}
          </ModalField>
          <ModalField id={form.idOf('email')} label={common.email} required error={form.errors.email}>
            {(control) => (
              <ModalInput
                {...control}
                {...EMAIL_INPUT}
                name="email"
                autoComplete="email"
                value={form.values.email}
                onChange={(event) => form.set('email', event.target.value)}
              />
            )}
          </ModalField>
          {company ? (
            <ModalField id={form.idOf('company')} label={contact.company}>
              {(control) => (
                <ModalInput {...control} name="company" autoComplete="organization" value={form.values.company} onChange={(event) => form.set('company', event.target.value)} />
              )}
            </ModalField>
          ) : null}
          <ModalField id={form.idOf('topic')} label={contact.topic} required error={form.errors.topic}>
            {(control) => (
              <ModalSelect
                {...control}
                name="topic"
                placeholder={contact.chooseTopic}
                options={options}
                value={form.values.topic || null}
                onValueChange={(value) => form.set('topic', value)}
              />
            )}
          </ModalField>
          <ModalField id={form.idOf('message')} label={contact.message} required error={form.errors.message}>
            {(control) => (
              <ModalTextarea {...control} name="message" rows={6} maxLength={maxLength} value={form.values.message} onChange={(event) => form.set('message', event.target.value)} />
            )}
          </ModalField>
          <ConsentField id={form.idOf('agree')} checked={form.values.agree} onCheckedChange={(checked) => form.set('agree', checked)} error={form.errors.agree}>
            {contact.agree(privacy)}
          </ConsentField>
          <Button type="submit" variant="primary" block loading={form.pending}>
            {contact.submit}
          </Button>
        </form>
      </div>
    </WithSiteLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* ChangelogPage                                                               */
/* -------------------------------------------------------------------------- */

export type ChangelogTag = 'new' | 'improved' | 'fixed' | 'security' | 'breaking';

export interface ChangelogEntry {
  /** 見出しの id（その更新へのリンク）。既定は version か日付から作る。 */
  id?: string;
  version?: string;
  /** Date か 'YYYY-MM-DD'。 */
  date: Date | string;
  title: ReactNode;
  tags?: readonly ChangelogTag[];
  content: ReactNode;
}

export interface ChangelogPageProps extends PublicPage {
  /** 新しい順に並べる。 */
  entries: readonly ChangelogEntry[];
  /** RSS / Atom のフィードの行き先。 */
  feedHref?: string;
}

const TAG_TONES: Record<ChangelogTag, StatusTone> = {
  new: 'accent',
  improved: 'info',
  fixed: 'success',
  security: 'warning',
  breaking: 'error',
};
const TAG_ORDER: readonly ChangelogTag[] = ['new', 'improved', 'fixed', 'security', 'breaking'];

const CHANGELOG_LABELS = { changelog: changelogLabels } as const;

/**
 * 更新履歴（リリースノート）。P-11。
 *
 * 更新ごとに見出し（h2）・日付（time 要素）・版・種類の印（言葉の印。色だけにしない）を持つ。
 * 使われている種類だけで絞り込める。器が広いときは日付と版を横の列に置く。
 */
export function ChangelogPage({ entries, feedHref, title, description, layout = true, className, ...rest }: ChangelogPageProps): ReactNode {
  const { links } = useSiteConfig();
  const labels = useTemplateLabels(CHANGELOG_LABELS);
  const timeZone = useTimeZone();
  const phrase = usePhrase();
  const base = useId();
  const { changelog } = labels;
  const present = TAG_ORDER.filter((tag) => entries.some((entry) => entry.tags?.includes(tag)));
  const [filter, setFilter] = useState<'all' | ChangelogTag>('all');
  const shown = filter === 'all' ? entries : entries.filter((entry) => entry.tags?.includes(filter));

  return (
    <WithSiteLayout layout={layout} current={links.changelog} className={className} data={domPassthrough(rest, 'ChangelogPage')}>
      <div className="g-changelog">
        <header className="g-public-header">
          <h1 className="g-public-title">{phrase(title ?? changelog.title)}</h1>
          <p className="g-public-description">{phrase(description ?? changelog.description)}</p>
          <div className="g-changelog-tools">
            {present.length > 1 ? (
              <ModalSegmented
                aria-label={changelog.filter}
                value={filter}
                onValueChange={(value) => setFilter(value as 'all' | ChangelogTag)}
                options={[{ value: 'all', label: changelog.all }, ...present.map((tag) => ({ value: tag, label: changelog.tags[tag] }))]}
              />
            ) : null}
            {feedHref ? (
              <SiteLink href={feedHref} className="g-auth-link">
                {phrase(changelog.subscribe)}
              </SiteLink>
            ) : null}
          </div>
        </header>
        <ol className="g-changes">
          {shown.map((entry) => {
            const { text, iso } = formatDate(entry.date, labels.locale, timeZone);
            // 既定の id は全体の中の位置で作る（絞り込んでも同じ更新は同じ id のまま）
            const id = entry.id ?? `${base}-${entry.version ?? iso}-${String(entries.indexOf(entry))}`;
            return (
              <li key={id} className="g-change">
                <article aria-labelledby={id}>
                  <div className="g-change-meta">
                    <time dateTime={iso}>{text}</time>
                    {entry.version ? <span className="g-change-version">{entry.version}</span> : null}
                  </div>
                  <div className="g-change-body">
                    <h2 id={id} className="g-change-title">
                      {phrase(entry.title)}
                    </h2>
                    {entry.tags && entry.tags.length > 0 ? (
                      <ul className="g-change-tags">
                        {entry.tags.map((tag) => (
                          <li key={tag}>
                            <Badge tone={TAG_TONES[tag]}>{changelog.tags[tag]}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="g-change-content">{phrase(entry.content)}</div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </WithSiteLayout>
  );
}
