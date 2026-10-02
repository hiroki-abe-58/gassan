import { useState, type ReactNode } from 'react';

import { Modal, useModals, type CloseReason } from '@genelab/gassan';

const GENRES = [
  { value: 'jazz', label: 'ジャズ' },
  { value: 'ambient', label: 'アンビエント' },
  { value: 'classic', label: 'クラシック' },
  { value: 'techno', label: 'テクノ' },
];

export default function KindForm(): ReactNode {
  const modals = useModals();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [notify, setNotify] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const dirty = name !== '' || genres.length > 0;
  const nameError = submitted && name.trim() === '' ? '表示名を入力してください' : undefined;

  // 書きかけなら引き止める。確認は命令的 API で、フォームの上にもう 1 枚重ねる。
  const guard = async (reason: CloseReason): Promise<boolean> => {
    if (!dirty || reason === 'submit') return true;
    return modals.confirm({
      title: '入力中の内容を破棄しますか',
      tone: 'danger',
      confirmLabel: '破棄する',
      cancelLabel: '編集に戻る',
    });
  };

  return (
    <>
      <button type="button" className="s-btn" onClick={() => setOpen(true)}>
        プロフィールを編集
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
          <Modal.Title>プロフィールを編集</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="表示名" required error={nameError} help="全角20文字まで">
            {(control) => (
              <input {...control} type="text" value={name} onChange={(event) => setName(event.target.value)} />
            )}
          </Modal.Field>
          <Modal.Chips label="好きなジャンル" options={GENRES} value={genres} onChange={setGenres} />
          <Modal.Switch checked={notify} onCheckedChange={setNotify}>
            新着があれば知らせる
          </Modal.Switch>
        </Modal.Body>

        <Modal.Footer note="⌘ / Ctrl + Enter でも保存できます">
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            キャンセル
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
            保存する
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </>
  );
}
