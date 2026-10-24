import type { ReactNode } from 'react';

import { Phrase } from '@genelab/gassan';

import { allItems, data } from '../../data';
import { SPEC_LANG, useT } from '../../i18n';
import { to } from '../../router';
import { inline, md } from '../../ui/Markdown';
import { KeyPoint, PageHeader, Prose, Section, Stats } from '../../ui/Page';
import { STATUS_ORDER, StatusBadge } from '../../ui/Spec';

export function Verification(): ReactNode {
  const { nav, verification: t } = useT();
  const { meta, browserChecks } = data;
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    count: allItems.filter((i) => i.status === status).length,
  })).filter((e) => e.count > 0);
  const proven = byStatus.find((e) => e.status === '実装')?.count ?? 0;
  const weakMust = allItems.filter((i) => i.priority === 'M' && (i.status === '記述' || i.status === '未検証'));

  return (
    <>
      <PageHeader eyebrow={nav.sections.reference} title={nav.pages.verification} lead={t.lead} />

      <Stats
        items={[
          { value: meta.tests, label: t.stats.tests(meta.testFiles) },
          { value: meta.items, label: t.stats.items },
          { value: proven, label: t.stats.proven },
          { value: browserChecks.length, label: t.stats.device },
        ]}
      />

      <Section id="pipeline" title="npm run verify" intro={t.pipeline.intro}>
        <ol className="s-pipeline">
          {t.pipeline.steps.map((step) => (
            <li key={step.command}>
              <code>{step.command}</code>
              <span>
                <Phrase>{step.catches}</Phrase>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="status" title={t.status.title} intro={t.status.intro(meta.items)}>
        <ul className="s-status-legend s-status-legend-lg">
          {byStatus.map((e) => (
            <li key={e.status}>
              <StatusBadge status={e.status} /> {t.status.count(e.count)}
            </li>
          ))}
        </ul>
        {weakMust.length > 0 ? (
          <KeyPoint tone="caution">
            <p>{t.status.weakMust(weakMust.length)}</p>
            <p className="s-idlist">
              {weakMust.map((i) => (
                <a key={i.id} className="s-idref" href={to(`/spec/${i.id}`)}>
                  {i.id}
                </a>
              ))}
            </p>
          </KeyPoint>
        ) : null}
      </Section>

      <Section id="device" title={t.device.title} intro={t.device.intro}>
        <div className="s-table-wrap" role="group" tabIndex={0} aria-label={t.device.tableCaption}>
          <table className="s-table">
            <caption className="s-sr-only">{t.device.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{t.device.columns.id}</th>
                <th scope="col">{t.device.columns.item}</th>
                <th scope="col">{t.device.columns.how}</th>
                <th scope="col">{t.device.columns.diagnosis}</th>
              </tr>
            </thead>
            {/* 検品票の中身は VERIFICATION.md の原文 */}
            <tbody lang={SPEC_LANG}>
              <Phrase>
                {browserChecks.map((check) => (
                  <tr key={check.id}>
                    <th scope="row" className="s-nowrap">
                      {check.id}
                    </th>
                    <td>{inline(check.item, `${check.id}-i`)}</td>
                    <td>{inline(check.how, `${check.id}-h`)}</td>
                    <td>{inline(check.diagnosis, `${check.id}-d`)}</td>
                  </tr>
                ))}
              </Phrase>
            </tbody>
          </table>
        </div>
        <Prose>
          <p>{md(t.device.pending(browserChecks.length))}</p>
        </Prose>
      </Section>
    </>
  );
}
