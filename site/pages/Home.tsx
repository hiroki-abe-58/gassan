import type { ReactNode } from 'react';

import { KIND_DEFAULTS, Phrase, type ModalKind } from '@genelab/gassan';

import { allItems, data } from '../data';
import KindConfirm from '../demos/KindConfirm';
import KindConsent from '../demos/KindConsent';
import KindFlow from '../demos/KindFlow';
import KindForm from '../demos/KindForm';
import KindView from '../demos/KindView';
import { useT } from '../i18n';
import { to } from '../router';
import { PRESETS } from '../theme/engine';
import { BreakCompare, ButtonSamples, type SampleButton } from '../ui/BreakCompare';
import { CodeBlock } from '../ui/Code';
import { MockPanel, MockScreen } from '../ui/Guidelines';
import { LayerStack } from '../ui/LayerStack';
import { md } from '../ui/Markdown';
import { Section, Stats } from '../ui/Page';
import { STATUS_ORDER, StatusBadge, useStatusLabel } from '../ui/Spec';
import { TemplateFrame } from '../ui/TemplateFrame';

/**
 * 言語の見本。サイトの言語に関わらず、この 3 つを並べる（訳さない。見本そのものが言語の例）。
 * 幅 9.5em では、ブラウザ任せだと 3 つとも語の途中で割れる。
 */
const LANGUAGE_BUTTONS: readonly SampleButton[] = [
  { label: '利用規約に同意して続ける', variant: 'primary', lang: 'ja' },
  { label: '取消订阅邮件通知', variant: 'secondary', lang: 'zh-Hans' },
  { label: '변경 사항을 저장하고 닫기', variant: 'secondary', lang: 'ko' },
];

const KIND_DEMOS: readonly { kind: ModalKind; Demo: () => ReactNode }[] = [
  { kind: 'confirm', Demo: KindConfirm },
  { kind: 'form', Demo: KindForm },
  { kind: 'view', Demo: KindView },
  { kind: 'consent', Demo: KindConsent },
  { kind: 'flow', Demo: KindFlow },
];

export function Home(): ReactNode {
  const { home: t } = useT();
  const statusLabel = useStatusLabel();
  const { meta } = data;
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    count: allItems.filter((item) => item.status === status).length,
  })).filter((entry) => entry.count > 0);
  const yesNo = (allowed: boolean): string => (allowed ? t.kinds.closes : t.kinds.stays);

  const promises: readonly { key: string; title: string; body: string; href: string; visual: ReactNode }[] = [
    {
      key: 'gate',
      ...t.promises.gate,
      href: '/components/gate',
      visual: (
        <MockPanel
          title={t.promises.gate.mockTitle}
          lines={2}
          buttons={[{ label: t.promises.gate.mockButton, variant: 'gated' }]}
        >
          <span className="s-mock-note">{t.promises.gate.mockNote}</span>
        </MockPanel>
      ),
    },
    {
      key: 'clamp',
      ...t.promises.clamp,
      href: '/components/title',
      visual: (
        <MockPanel
          title={
            <>
              <span className="s-mock-clamp">{t.promises.clamp.mockTitle}</span>
              <span className="s-mock-toggle">{t.promises.clamp.mockToggle}</span>
            </>
          }
          lines={2}
        />
      ),
    },
    {
      key: 'reasons',
      ...t.promises.reasons,
      href: '/components/root',
      visual: (
        <span className="s-mock-reasons">
          {['esc', 'backdrop', 'close-button', 'back-button', 'submit', 'programmatic', 'swipe', 'route-change'].map(
            (reason) => (
              <code key={reason}>{reason}</code>
            ),
          )}
        </span>
      ),
    },
    {
      key: 'scrim',
      ...t.promises.scrim,
      href: '/styles/scrim',
      visual: (
        <span className="s-mock-scrims">
          {[0.2, 0.32, 0.5, 0.72].map((a) => (
            <span key={a} className="s-mock-scrim-swatch" style={{ background: `rgb(0 0 0 / ${String(a)})` }}>
              {Math.round(a * 100)}%
            </span>
          ))}
        </span>
      ),
    },
  ];

  /** 揃っているもの。分野ごとに、ドキュメントの入り口のページへつなぐ。 */
  const features: readonly { key: string; title: string; body: string; href: string }[] = [
    { key: 'modal', ...t.features.items.modal, href: '/foundations/kinds' },
    { key: 'forms', ...t.features.items.forms, href: '/components/field' },
    { key: 'ui', ...t.features.items.ui, href: '/ui/buttons' },
    { key: 'feedback', ...t.features.items.feedback, href: '/components/toast' },
    { key: 'templates', ...t.features.items.templates, href: '/templates/auth' },
    { key: 'app', ...t.features.items.app, href: '/templates/app-pages' },
    { key: 'motion', ...t.features.items.motion, href: '/styles/motion' },
    { key: 'a11y', ...t.features.items.a11y, href: '/foundations/accessibility' },
  ];

  const details: readonly { title: string; body: string; href: string }[] = [
    { ...t.languages.details.lineBreak, href: '/styles/line-break' },
    { title: t.languages.details.theme.title, body: t.languages.details.theme.body(PRESETS.length), href: '/styles/theme' },
    { ...t.languages.details.button, href: '/components/button' },
  ];

  return (
    <div className="s-home">
      <section className="s-hero" aria-labelledby="page-title">
        <div className="s-hero-copy">
          <p className="s-eyebrow">{t.eyebrow}</p>
          <h1 id="page-title" tabIndex={-1}>
            <Phrase>
              {t.heroTitle.map((line, i) => (
                <span key={i}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </Phrase>
          </h1>
          <p className="s-lead">
            <Phrase>{md(t.lead)}</Phrase>
          </p>
          <div className="s-hero-actions">
            <a className="s-btn s-btn-lg" href={to('/start')}>
              {t.start}
            </a>
            <a className="s-btn s-btn-lg s-btn-tonal" href={to('/templates/app')}>
              {t.templates}
            </a>
          </div>
        </div>
        <LayerStack />
      </section>

      <Stats
        items={[
          { value: meta.exports, label: t.stats.exports },
          { value: meta.items, label: t.stats.items },
          { value: meta.tests, label: t.stats.tests },
          { value: 0, label: t.stats.trap },
        ]}
      />

      <Section id="showcase" title={t.showcase.title} intro={t.showcase.intro}>
        <TemplateFrame
          title={t.showcase.frameTitle}
          height={720}
          variants={[
            { name: 'app-dashboard', label: t.showcase.variants.dashboard },
            { name: 'app-members', label: t.showcase.variants.members },
            { name: 'app-billing', label: t.showcase.variants.billing },
            { name: 'app-settings', label: t.showcase.variants.settings },
            { name: 'sign-in', label: t.showcase.variants.signIn },
            { name: 'pricing', label: t.showcase.variants.pricing },
          ]}
        />
      </Section>

      <Section id="features" title={t.features.title} intro={t.features.intro}>
        <ul className="s-cards s-cards-4 s-feature-cards">
          {features.map((feature) => (
            <li key={feature.key} className="s-card s-card-plain">
              <h3>
                <a href={to(feature.href)} className="s-card-link">
                  <Phrase>{feature.title}</Phrase>
                </a>
              </h3>
              <p>
                <Phrase>{feature.body}</Phrase>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="languages" title={t.languages.title} intro={t.languages.intro}>
        <BreakCompare width={9.5} browserNote={t.languages.browserNote} phraseNote={t.languages.phraseNote}>
          <ButtonSamples buttons={LANGUAGE_BUTTONS} />
        </BreakCompare>
        <ul className="s-cards s-cards-3 s-feature-cards">
          {details.map((detail) => (
            <li key={detail.href} className="s-card s-card-plain">
              <h3>
                <a href={to(detail.href)} className="s-card-link">
                  <Phrase>{detail.title}</Phrase>
                </a>
              </h3>
              <p>
                <Phrase>{detail.body}</Phrase>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="promises" title={t.promises.title} intro={t.promises.intro}>
        <ul className="s-cards s-cards-2">
          {promises.map((promise) => (
            <li key={promise.key} className="s-card">
              <div className="s-card-visual" aria-hidden="true">
                <MockScreen scrim={0.12}>{promise.visual}</MockScreen>
              </div>
              <h3>
                <a href={to(promise.href)} className="s-card-link">
                  <Phrase>{promise.title}</Phrase>
                </a>
              </h3>
              <p>
                <Phrase>{promise.body}</Phrase>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="kinds" title={t.kinds.title} intro={t.kinds.intro}>
        <ul className="s-kinds">
          {KIND_DEMOS.map(({ kind, Demo }) => {
            const defaults = KIND_DEFAULTS[kind];
            return (
              // li ごと Phrase で包む。中の Demo はコンポーネントなので潜らない（自分で折る）。
              <Phrase key={kind}>
                <li className="s-kind">
                  <p className="s-kind-name">
                    <code>{kind}</code>
                    <span>{t.kinds.items[kind].label}</span>
                  </p>
                  <p className="s-kind-use">{t.kinds.items[kind].use}</p>
                  <dl className="s-kind-defaults">
                    <div>
                      <dt>{t.kinds.scrim}</dt>
                      <dd>{defaults.scrim}</dd>
                    </div>
                    <div>
                      <dt>{t.kinds.esc}</dt>
                      <dd>{yesNo(defaults.dismiss.esc)}</dd>
                    </div>
                    <div>
                      <dt>{t.kinds.backdrop}</dt>
                      <dd>{yesNo(defaults.dismiss.backdrop)}</dd>
                    </div>
                  </dl>
                  <div className="s-kind-demo">
                    <Demo />
                  </div>
                </li>
              </Phrase>
            );
          })}
        </ul>
        <p className="s-more">
          <a href={to('/foundations/kinds')}>{t.kinds.more}</a>
        </p>
      </Section>

      <Section id="verified" title={t.verified.title} intro={t.verified.intro(meta.items)}>
        <div
          className="s-status-bar"
          role="img"
          aria-label={t.verified.bar(byStatus.map((e) => `${statusLabel(e.status)} ${t.verified.count(e.count)}`))}
        >
          {byStatus.map((entry) => (
            <span
              key={entry.status}
              className="s-status-seg"
              data-status={entry.status}
              style={{ flexGrow: entry.count }}
            />
          ))}
        </div>
        <ul className="s-status-legend">
          {byStatus.map((entry) => (
            <li key={entry.status}>
              <StatusBadge status={entry.status} /> {t.verified.count(entry.count)}
            </li>
          ))}
        </ul>
        <div className="s-home-links">
          <a className="s-btn s-btn-tonal" href={to('/spec')}>
            <Phrase>{t.verified.spec(meta.items)}</Phrase>
          </a>
          <a className="s-btn s-btn-text" href={to('/verification')}>
            <Phrase>{t.verified.verification}</Phrase>
          </a>
        </div>
      </Section>

      <Section id="install" title={t.install.title}>
        <CodeBlock code={`npm install @genelab/gassan`} lang="bash" caption={t.install.caption} />
        <CodeBlock code={t.install.css} lang="tsx" caption={t.install.cssCaption} />
        <p className="s-more">
          <a href={to('/start')}>{t.install.more}</a>
        </p>
      </Section>
    </div>
  );
}
