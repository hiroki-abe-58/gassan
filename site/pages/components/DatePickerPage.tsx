import type { ReactNode } from 'react';

import { Modal, commonDateRanges, japaneseHolidays, useLabels } from '@genelab/gassan';

import type { PageProps } from '../../routes';
import BookingCalendar from '../../demos/BookingCalendar';
import bookingCalendarSource from '../../demos/BookingCalendar.tsx?raw';
import DateForm from '../../demos/DateForm';
import dateFormSource from '../../demos/DateForm.tsx?raw';
import RangeReport from '../../demos/RangeReport';
import rangeReportSource from '../../demos/RangeReport.tsx?raw';
import { useT } from '../../i18n';
import { ApiTable } from '../../ui/ApiTable';
import { CodeBlock } from '../../ui/Code';
import { ComponentPage } from '../../ui/ComponentPage';
import { DataTable } from '../../ui/DataTable';
import { Example } from '../../ui/Example';
import { Paras } from '../../ui/Markdown';
import { Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';
import { Specimens } from '../../ui/Specimens';

/** 端末の時刻での今日から days 日後（YYYY-MM-DD）。 */
function localISO(days = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('sv-SE');
}

/** 今年の祝日と休日。名前はサイトの言語の labels.holidays から引く（カレンダーと同じ出どころ）。 */
function HolidayTable(): ReactNode {
  const t = useT().datePicker.holidays;
  const labels = useLabels();
  const year = new Date().getFullYear();
  const format = new Intl.DateTimeFormat(labels.locale, { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' });
  return (
    <DataTable
      caption={t.tableCaption(year)}
      head={[t.head.date, t.head.name]}
      rows={japaneseHolidays(year).map((holiday) => [
        format.format(new Date(`${holiday.date}T00:00:00Z`)),
        labels.holidays?.(holiday.date) ?? holiday.name,
      ])}
    />
  );
}

/** よく使う期間は、サイトの言語の labels.rangePreset から作る。 */
function RangeSpecimen({ labelledBy }: { labelledBy: string }): ReactNode {
  const labels = useLabels();
  return <Modal.DateRangePicker aria-labelledby={labelledBy} presets={commonDateRanges(labels)} />;
}

export function DatePickerPage({ rest }: PageProps): ReactNode {
  const { nav, datePicker: t } = useT();
  const { items } = t.gallery;
  return (
    <ComponentPage
      path="/components/date-picker"
      rest={rest}
      title={nav.pages.datePicker}
      lead={t.lead}
      ids={['I-13', 'I-16', 'I-17', 'I-18', 'I-19', 'I-20', 'I-15']}
      overview={() => (
        <>
          <Section id="gallery" title={t.gallery.title} intro={t.gallery.intro}>
            <Specimens
              caption={t.gallery.title}
              items={[
                {
                  label: items.datePicker,
                  render: (id) => <Modal.DatePicker aria-labelledby={id} defaultValue={localISO()} />,
                },
                { label: items.rangePicker, render: (id) => <RangeSpecimen labelledBy={id} /> },
                {
                  label: items.limited,
                  render: (id) => <Modal.DatePicker aria-labelledby={id} min={localISO()} max={localISO(30)} />,
                },
                { label: items.timePicker, render: (id) => <Modal.TimePicker aria-labelledby={id} defaultValue="19:00" /> },
                {
                  label: items.time12,
                  render: (id) => <Modal.TimePicker aria-labelledby={id} defaultValue="19:00" hourCycle="h12" />,
                },
                {
                  label: items.businessHours,
                  render: (id) => <Modal.TimePicker aria-labelledby={id} step={15} min="10:00" max="18:00" />,
                },
                { label: items.date, render: (id) => <Modal.Input aria-labelledby={id} type="date" defaultValue={localISO()} /> },
                { label: items.time, render: (id) => <Modal.Input aria-labelledby={id} type="time" defaultValue="19:00" /> },
                { label: items.color, render: (id) => <Modal.Input aria-labelledby={id} type="color" defaultValue="#3346d3" /> },
              ]}
            />
          </Section>

          <Section id="inline" title={t.inline.title} intro={t.inline.intro}>
            <Example
              title={t.inline.exampleTitle}
              description={t.inline.exampleDescription}
              code={bookingCalendarSource}
              demo="bookingCalendar"
            >
              <BookingCalendar />
            </Example>
          </Section>

          <Section id="range" title={t.range.title} intro={t.range.intro}>
            <Example title={t.range.exampleTitle} description={t.range.exampleDescription} code={rangeReportSource} demo="rangeReport">
              <RangeReport />
            </Example>
            <Prose>
              <Paras items={t.range.body} />
            </Prose>
          </Section>

          <Section id="holidays" title={t.holidays.title} intro={t.holidays.intro}>
            <HolidayTable />
            <Prose>
              <Paras items={t.holidays.body} />
            </Prose>
            <CodeBlock lang="tsx" caption={t.holidays.codeCaption} code={t.holidays.code} />
          </Section>

          <Section id="time" title={t.time.title} intro={t.time.intro}>
            <Prose>
              <Paras items={t.time.body} />
            </Prose>
            <CodeBlock lang="tsx" caption={t.time.codeCaption} code={t.time.code} />
            <DataTable
              caption={t.time.keysCaption}
              head={[t.keys.head.key, t.keys.head.action]}
              rows={t.time.keys.map((row) => [<kbd key="key">{row.key}</kbd>, row.action])}
            />
          </Section>

          <Section id="modal" title={t.modal.title} intro={t.modal.intro}>
            <Example title={t.modal.exampleTitle} description={t.modal.exampleDescription} code={dateFormSource} demo="dateForm">
              <DateForm />
            </Example>
          </Section>

          <Section id="keys" title={t.keys.title}>
            <DataTable
              caption={t.keys.tableCaption}
              head={[t.keys.head.key, t.keys.head.action]}
              rows={t.keys.rows.map((row) => [<kbd key="key">{row.key}</kbd>, row.action])}
            />
            <Prose>
              <Paras items={[t.keys.note]} />
            </Prose>
          </Section>

          <Section id="native" title={t.native.title}>
            <Prose>
              <Paras items={t.native.body} />
            </Prose>
          </Section>
        </>
      )}
      api={() => (
        <>
          <ApiTable name="ModalDatePickerProps" title={t.apiCaption.datePicker} />
          <ApiTable name="ModalDateRangePickerProps" title={t.apiCaption.rangePicker} />
          <ApiTable name="ModalCalendarProps" title={t.apiCaption.calendar} />
          <ApiTable name="ModalRangeCalendarProps" title={t.apiCaption.rangeCalendar} />
          <ApiTable name="ModalTimePickerProps" title={t.apiCaption.timePicker} />
          <ApiTable name="CalendarOptions" />
          <ApiTable name="DateRange" />
          <ApiTable name="DateRangePreset" />
        </>
      )}
      a11y={() => (
        <SpecTable ids={['I-01', 'I-02', 'I-13', 'I-15', 'I-16', 'I-17', 'I-18', 'I-19', 'I-20', 'V-04']} caption={t.a11yCaption} />
      )}
    />
  );
}
