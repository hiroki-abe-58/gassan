import { useState, type ReactNode } from 'react';

import { Modal, Phrase } from '@genelab/gassan';
import { fmt, useDemoText } from '../i18n';

/** 水曜は定休日。 */
const closed = (date: string): boolean => new Date(`${date}T00:00:00Z`).getUTCDay() === 3;

/** 残りわずかの日（見本なので、日付の数で決めている）。 */
const fewLeft = (date: string): boolean => Number(date.slice(-2)) % 5 === 0;

export default function BookingCalendar(): ReactNode {
  const t = useDemoText('bookingCalendar');
  const [date, setDate] = useState<string | null>(null);
  // t:today
  const today = new Date().toLocaleDateString('sv-SE');

  return (
    <div className="s-demo-wide">
      {/* t:large */}
      <Modal.Calendar
        aria-label={t.label}
        size="lg"
        min={today}
        value={date}
        onValueChange={setDate}
        isDateDisabled={closed}
        marks={fewLeft}
      />
      <p className="s-demo-note">
        <Phrase>{date ? fmt(t.selected, date) : t.empty}</Phrase>
      </p>
    </div>
  );
}
