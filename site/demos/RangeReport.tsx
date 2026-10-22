import { useState, type ReactNode } from 'react';

import { Modal, Phrase, commonDateRanges, useLabels, type DateRange } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function RangeReport(): ReactNode {
  const t = useDemoText('rangeReport');
  const labels = useLabels();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | null>(null);

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* t:presets */}
          <Modal.Field label={t.period} help={t.periodHelp} required>
            {(control) => (
              <Modal.DateRangePicker {...control} value={range} onValueChange={setRange} presets={commonDateRanges(labels)} />
            )}
          </Modal.Field>

          <Modal.Fieldset label={t.format}>
            <Modal.Segmented
              defaultValue="csv"
              options={[
                { value: 'csv', label: 'CSV' },
                { value: 'xlsx', label: 'Excel' },
                { value: 'pdf', label: 'PDF' },
              ]}
            />
          </Modal.Fieldset>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          <Modal.Button variant="primary" closeOnClick="submit">
            {t.submit}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
