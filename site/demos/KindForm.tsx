import { useState, type ReactNode } from 'react';

import { Modal, Phrase, useModals, type CloseReason } from '@genelab/gassan';
import { useDemoText } from '../i18n';

export default function KindForm(): ReactNode {
  const t = useDemoText('kindForm');
  const GENRES = [
    { value: 'jazz', label: t.jazz },
    { value: 'ambient', label: t.ambient },
    { value: 'classic', label: t.classic },
    { value: 'techno', label: t.techno },
  ];
  const modals = useModals();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [notify, setNotify] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const dirty = name !== '' || genres.length > 0;
  const nameError = submitted && name.trim() === '' ? t.nameRequired : undefined;

  // t:leaveGuard
  const guard = async (reason: CloseReason): Promise<boolean> => {
    if (!dirty || reason === 'submit') return true;
    return modals.confirm({
      title: t.discardTitle,
      tone: 'danger',
      confirmLabel: t.discard,
      cancelLabel: t.backToEdit,
    });
  };

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        <Phrase>{t.open}</Phrase>
      </button>

      <Modal.Root
        kind="form"
        open={open}
        onOpenChange={setOpen}
        onRequestClose={guard}
        onExited={() => {
          setName('');
          setGenres([]);
          setSubmitted(false);
        }}
        submitShortcut
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>{t.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label={t.name} required error={nameError} help={t.nameHelp}>
            {(control) => (
              <Modal.Input {...control} value={name} onChange={(event) => setName(event.target.value)} />
            )}
          </Modal.Field>
          <Modal.Chips label={t.genres} options={GENRES} value={genres} onChange={setGenres} />
          <Modal.Switch checked={notify} onCheckedChange={setNotify}>
            {t.notify}
          </Modal.Switch>
        </Modal.Body>

        <Modal.Footer note={t.shortcut}>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            {t.cancel}
          </Modal.Button>
          <Modal.Button
            variant="primary"
            onAction={async () => {
              setSubmitted(true);
              if (name.trim() === '') return;
              await new Promise((resolve) => setTimeout(resolve, 800));
              setOpen(false);
            }}
          >
            {t.save}
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
