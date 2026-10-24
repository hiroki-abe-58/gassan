import type { ReactNode } from 'react';

import { Badge, Button, DataTable, PageHeader, type DataTableColumn } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import MemberTable from '../../demos/MemberTable';
import memberTableSource from '../../demos/MemberTable.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { Example } from '../../ui/Example';
import { Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

const IDS = ['U-25', 'U-26', 'C-13'];

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'due';
}

export function UiDataPage({ rest }: PageProps): ReactNode {
  const { nav, uiData: t } = useT();
  const { labels: l, sample: s } = t;
  const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
  const invoices: Invoice[] = [
    { id: 'INV-2026-010', date: '2026-10-01', amount: 18000, status: 'due' },
    { id: 'INV-2026-009', date: '2026-09-01', amount: 18000, status: 'paid' },
    { id: 'INV-2026-008', date: '2026-08-01', amount: 15000, status: 'paid' },
    { id: 'INV-2026-007', date: '2026-07-01', amount: 15000, status: 'paid' },
  ];
  const invoiceColumns: DataTableColumn<Invoice>[] = [
    { key: 'id', header: s.number, cell: (invoice) => invoice.id },
    { key: 'date', header: s.date, cell: (invoice) => invoice.date, sortValue: (invoice) => invoice.date },
    { key: 'amount', header: s.amount, cell: (invoice) => yen.format(invoice.amount), sortValue: (invoice) => invoice.amount, align: 'end' },
    {
      key: 'status',
      header: s.status,
      cell: (invoice) => <Badge tone={invoice.status === 'paid' ? 'success' : 'warning'}>{invoice.status === 'paid' ? s.paid : s.due}</Badge>,
    },
  ];
  return (
    <ComponentPage
      path="/ui/data"
      rest={rest}
      title={nav.pages.uiData}
      lead={t.lead}
      eyebrow={nav.sections.ui}
      ids={IDS}
      overview={() => (
        <>
          <Section id="example" title={t.example.title} intro={t.example.intro}>
            <Example title={t.example.exampleTitle} description={t.example.exampleDescription} code={memberTableSource} demo="memberTable">
              <MemberTable />
            </Example>
          </Section>

          <Section id="page-header" title={t.pageHeader.title} intro={t.pageHeader.intro}>
            <Specimens
              caption={t.pageHeader.title}
              wide
              items={[
                {
                  label: l.full,
                  render: () => (
                    <PageHeader
                      headingLevel={2}
                      title={s.billing}
                      description={s.billingDescription}
                      breadcrumbs={[{ label: s.settings, href: '#/ui/data' }, { label: s.billing }]}
                      actions={
                        <>
                          <Button>{s.download}</Button>
                          <Button variant="primary">{s.changePlan}</Button>
                        </>
                      }
                    />
                  ),
                },
                {
                  label: l.narrow,
                  render: () => (
                    <div className="s-narrow">
                      <PageHeader
                        headingLevel={2}
                        title={s.billing}
                        description={s.billingDescription}
                        actions={<Button variant="primary">{s.changePlan}</Button>}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Section>

          <Section id="table" title={t.table.title} intro={t.table.intro}>
            <Specimens
              caption={t.table.title}
              wide
              items={[
                {
                  label: l.compact,
                  render: () => (
                    <DataTable
                      label={s.invoices}
                      columns={invoiceColumns}
                      rows={invoices}
                      getRowId={(invoice) => invoice.id}
                      defaultSort={{ key: 'date', direction: 'descending' }}
                      density="compact"
                    />
                  ),
                },
                {
                  label: l.loading,
                  render: () => <DataTable label={s.invoices} columns={invoiceColumns} rows={[]} getRowId={(invoice) => invoice.id} loading loadingRows={3} />,
                },
                { label: l.empty, render: () => <DataTable label={s.invoices} columns={invoiceColumns} rows={[]} getRowId={(invoice) => invoice.id} /> },
              ]}
            />
          </Section>

          <Section id="usage" title={t.codeCaption}>
            <CodeBlock lang="tsx" code={t.code} />
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="PageHeaderProps" title="PageHeader" />
          <ApiTable name="DataTableProps" title="DataTable" />
          <ApiTable name="DataTableColumn" />
          <ApiTable name="DataTableSort" />
        </>
      )}
      a11y={() => <SpecTable ids={[...IDS, 'B-13', 'D-13']} caption={t.a11yCaption} />}
    />
  );
}
