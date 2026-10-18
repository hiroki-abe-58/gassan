import { useState, type ReactNode } from 'react';

import { Modal } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function ChoiceForm(): ReactNode {
  const t = useDemoText('choiceForm');
  const [open, setOpen] = useState(false);
  const [channels, setChannels] = useState<string[]>(['mail']);
  const [frequency, setFrequency] = useState('daily');
  const [look, setLook] = useState('auto');
  const [rating, setRating] = useState<number | null>(null);

  const CHANNELS = [
    { value: 'mail', label: t.mail },
    { value: 'push', label: t.push },
    { value: 'sms', label: t.sms },
  ];
  const all = channels.length === CHANNELS.length;

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        {t.open}
      </button>

      <Modal.Root kind="form" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* t:group */}
          <Modal.Fieldset label={t.channels} help={t.channelsHelp} required>
            {/* t:mixed */}
            <Modal.Checkbox
              checked={all}
              indeterminate={!all && channels.length > 0}
              onCheckedChange={(on) => setChannels(on ? CHANNELS.map((channel) => channel.value) : [])}
            >
              {t.all}
            </Modal.Checkbox>
            {CHANNELS.map((channel) => (
              <Modal.Checkbox
                key={channel.value}
                checked={channels.includes(channel.value)}
                onCheckedChange={(on) =>
                  setChannels(on ? [...channels, channel.value] : channels.filter((value) => value !== channel.value))
                }
              >
                {channel.label}
              </Modal.Checkbox>
            ))}
          </Modal.Fieldset>

          <Modal.Fieldset label={t.frequency}>
            <Modal.RadioGroup
              value={frequency}
              onValueChange={setFrequency}
              options={[
                { value: 'now', label: t.now, description: t.nowNote },
                { value: 'daily', label: t.daily, description: t.dailyNote },
              ]}
            />
          </Modal.Fieldset>

          <Modal.Fieldset label={t.theme}>
            <Modal.Segmented
              value={look}
              onValueChange={setLook}
              options={[
                { value: 'light', label: t.light },
                { value: 'dark', label: t.dark },
                { value: 'auto', label: t.auto },
              ]}
            />
          </Modal.Fieldset>

          <Modal.Fieldset label={t.rating}>
            <Modal.Rating value={rating} onValueChange={setRating} />
          </Modal.Fieldset>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          <Modal.Button variant="primary" closeOnClick="submit">
            {t.save}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
