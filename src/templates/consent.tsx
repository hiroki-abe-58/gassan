import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { ModalBody } from '../body';
import { Button } from '../button';
import { DescriptionList } from '../display';
import { ModalSwitch } from '../fields';
import { ModalButton, ModalFooter } from '../footer';
import { ModalDescription, ModalHeader, ModalTitle } from '../header';
import { domPassthrough, type DataAttributes } from '../internal/passthrough';
import { usePhrase } from '../phrase';
import { ModalRoot } from '../root';
import { useSite } from './site';

const cx = (base: string, extra?: string): string => (extra ? `${base} ${extra}` : base);

/** 許可を選べる送信の種類。「必要なもの」は止められないので選ばせない。 */
export type ConsentCategory = 'functional' | 'analytics' | 'marketing';

export const CONSENT_CATEGORIES: readonly ConsentCategory[] = ['functional', 'analytics', 'marketing'];

/** 種類ごとの許可。 */
export type CookieConsentValue = Readonly<Record<ConsentCategory, boolean>>;

const every = (allowed: boolean): CookieConsentValue => ({ functional: allowed, analytics: allowed, marketing: allowed });

/* -------------------------------------------------------------------------- */
/* CookieConsent                                                              */
/* -------------------------------------------------------------------------- */

export interface CookieConsentProps extends DataAttributes {
  /** いまの許可。null（まだ選んでいない）なら、画面の下に帯を出す。保存は利用側（Cookie・localStorage・サーバー）。 */
  value: CookieConsentValue | null;
  onChange: (value: CookieConsentValue) => void;
  /** 選べる種類と並び。既定は機能・分析・広告。 */
  categories?: readonly ConsentCategory[];
  /** 送信先の一覧（外部送信の公表）のページ。既定は SiteProvider の links.privacy。 */
  policyHref?: string;
  /** 設定の窓を開く（ページの下の「Cookie の設定」から開き直す）。省略すると、帯の「設定を選ぶ」だけで開く。 */
  settingsOpen?: boolean;
  onSettingsOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Cookie と外部送信の同意。P-33。
 *
 * まだ選んでいない（value が null）あいだ、画面の下に帯を出す（モーダルにせず、ページを読みながら選べる。
 * popover="manual" で top layer に置くので、器の重なりの順に埋もれない）。「すべて許可する」と「必要なものだけ」は
 * 同じ見た目のボタンにして、片方へ誘導しない。「設定を選ぶ」で種類ごとのスイッチの窓を開く。
 * 必要なものは「常に有効」と文字で示し、スイッチを出さない。どの選び方でも onChange に種類ごとの許可を渡す。
 * 送信先の一覧（電気通信事業法 27 条の 12 の公表）へのリンクを帯と窓に置く。
 */
export function CookieConsent({
  value,
  onChange,
  categories = CONSENT_CATEGORIES,
  policyHref,
  settingsOpen,
  onSettingsOpenChange,
  className,
  ...rest
}: CookieConsentProps): ReactNode {
  const { labels, links } = useSite();
  const phrase = usePhrase();
  const k = labels.cookieConsent;
  const ids = useId();
  const bannerRef = useRef<HTMLElement>(null);
  const [ownOpen, setOwnOpen] = useState(false);
  const open = settingsOpen ?? ownOpen;
  const setOpen = (next: boolean): void => {
    setOwnOpen(next);
    onSettingsOpenChange?.(next);
  };
  const [draft, setDraft] = useState<CookieConsentValue>(value ?? every(false));
  const policy = policyHref ?? links.privacy;
  const choose = (next: CookieConsentValue): void => {
    onChange(next);
    setOpen(false);
  };
  const showBanner = value === null;

  // 帯は top layer に出す（popover を持たない古いブラウザでは、置いた場所にそのまま出す）
  useLayoutEffect(() => {
    const banner = bannerRef.current;
    if (!showBanner || !banner) return undefined;
    const top = typeof (banner.showPopover as unknown) === 'function';
    if (top) banner.showPopover();
    else banner.dataset.inline = '';
    return () => {
      if (top && banner.isConnected) banner.hidePopover();
    };
  }, [showBanner]);

  const policyLink = policy ? (
    <a className="g-cookie-policy" href={policy}>
      {phrase(k.policy)}
    </a>
  ) : null;

  return (
    <>
      {showBanner ? (
        <section
          {...domPassthrough(rest, 'CookieConsent')}
          ref={bannerRef}
          className={cx('g-cookie-consent', className)}
          aria-labelledby={`${ids}-title`}
          popover="manual"
        >
          <h2 id={`${ids}-title`} className="g-cookie-title">
            {phrase(k.title)}
          </h2>
          <p className="g-cookie-text">
            {phrase(k.description)} {policyLink}
          </p>
          <div className="g-cookie-actions">
            <Button onClick={() => choose(every(true))}>{k.acceptAll}</Button>
            <Button onClick={() => choose(every(false))}>{k.rejectAll}</Button>
            <Button
              variant="tertiary"
              onClick={() => {
                setDraft(every(false));
                setOpen(true);
              }}
            >
              {k.customize}
            </Button>
          </div>
        </section>
      ) : null}
      <ModalRoot
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(value ?? every(false));
          setOpen(next);
        }}
        kind="form"
      >
        <ModalHeader>
          <ModalTitle>{k.settingsTitle}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ModalDescription>
            {phrase(k.settingsDescription)} {policyLink}
          </ModalDescription>
          <ul className="g-cookie-categories">
            <li className="g-cookie-category">
              <div className="g-cookie-category-head">
                <span className="g-cookie-category-name">{phrase(k.categories.necessary)}</span>
                <span className="g-cookie-always">{k.alwaysOn}</span>
              </div>
              <p className="g-cookie-category-text">{phrase(k.descriptions.necessary)}</p>
            </li>
            {categories.map((category) => (
              <li key={category} className="g-cookie-category">
                <ModalSwitch
                  id={`${ids}-${category}`}
                  checked={draft[category]}
                  onCheckedChange={(checked) => setDraft((current) => ({ ...current, [category]: checked }))}
                  aria-describedby={`${ids}-${category}-text`}
                >
                  {k.categories[category]}
                </ModalSwitch>
                <p id={`${ids}-${category}-text`} className="g-cookie-category-text">
                  {phrase(k.descriptions[category])}
                </p>
              </li>
            ))}
          </ul>
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={() => choose(every(false))}>{k.rejectAll}</ModalButton>
          <ModalButton onClick={() => choose(every(true))}>{k.acceptAll}</ModalButton>
          <ModalButton variant="primary" onClick={() => choose(draft)}>
            {k.save}
          </ModalButton>
        </ModalFooter>
      </ModalRoot>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* ExternalTransmissionList                                                   */
/* -------------------------------------------------------------------------- */

export interface ExternalTransmission {
  /** 送信先（事業者の名前）。 */
  recipient: string;
  /** 送信先のサービスの名前（「Google Analytics」）。 */
  service?: string;
  /** 送る情報（「閲覧したページの URL、端末と閲覧ソフトの種類、Cookie の識別子」）。 */
  information: ReactNode;
  /** 送信先が使う目的。 */
  purpose: ReactNode;
  /** 同意の帯の種類（「必要なもの」なら 'necessary'）。 */
  category?: ConsentCategory | 'necessary';
  /** 送信先のプライバシーポリシー。 */
  policyHref?: string;
  /** 送信を止める（オプトアウトの）ページ。 */
  optOutHref?: string;
}

export interface ExternalTransmissionListProps extends DataAttributes {
  items: readonly ExternalTransmission[];
  /** 一覧の名前。既定 labels.externalTransmission.label。 */
  label?: string;
  className?: string;
}

/**
 * 外部送信の公表（送信先の一覧）。P-34。
 *
 * 電気通信事業法 27 条の 12 が公表を求める、送る情報・送信先・目的を、送信先ごとの項目に並べる（狭い器でも横に送らない）。
 * 項目の見出しは送信先とサービスの名前（h3。ページの節の中に置く）。種類は同意の帯と同じ名前で書き、
 * 送信先のプライバシーポリシーと送信を止めるページへのリンクは、送信先の名前を含む名前にする。
 */
export function ExternalTransmissionList({ items, label, className, ...rest }: ExternalTransmissionListProps): ReactNode {
  const { labels } = useSite();
  const phrase = usePhrase();
  const x = labels.externalTransmission;
  const names = labels.cookieConsent.categories;
  return (
    <ul {...domPassthrough(rest, 'ExternalTransmissionList')} className={cx('g-transmissions', className)} aria-label={label ?? x.label}>
      {items.map((item) => (
        <li key={`${item.recipient}-${item.service ?? ''}`} className="g-transmission">
          <h3 className="g-transmission-title">
            {phrase(item.recipient)}
            {item.service ? <span className="g-transmission-service">{phrase(item.service)}</span> : null}
          </h3>
          <DescriptionList
            items={[
              { term: x.information, details: item.information },
              { term: x.purpose, details: item.purpose },
              ...(item.category ? [{ term: x.category, details: names[item.category] }] : []),
            ]}
          />
          {item.policyHref || item.optOutHref ? (
            <p className="g-transmission-links">
              {item.policyHref ? <a href={item.policyHref}>{phrase(x.policyFor(item.recipient))}</a> : null}
              {item.optOutHref ? <a href={item.optOutHref}>{phrase(x.optOutFor(item.recipient))}</a> : null}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
