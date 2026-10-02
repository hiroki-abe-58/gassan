import { useState, type ReactNode } from 'react';

import {
  Modal,
  ModalHost,
  useModals,
  type CloseReason,
  type DetentToken,
} from '@genelab/kasane';

/* -------------------------------------------------------------------------- */
/* 1. 確認 — 破壊的な操作                                                      */
/* -------------------------------------------------------------------------- */

function DemoConfirm(): ReactNode {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState('—');

  return (
    <section className="card">
      <h2>1. 確認（confirm）</h2>
      <p>
        小さく、中央に、背景クリックでも Esc でも閉じられる。取り消せない操作なので
        primary は danger。
      </p>
      <div className="actions">
        <button type="button" className="trigger" onClick={() => setOpen(true)}>
          下書きを削除
        </button>
        <span className="result">{log}</span>
      </div>

      <Modal.Root
        kind="confirm"
        size="sm"
        open={open}
        onOpenChange={(next, reason) => {
          setOpen(next);
          if (!next) setLog(`closed: ${reason}`);
        }}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>下書きを削除しますか</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>
            削除すると元に戻せません。共同編集者の画面からも消えます。
          </Modal.Description>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            やめる
          </Modal.Button>
          <Modal.Button
            variant="danger"
            onAction={async () => {
              await new Promise((resolve) => setTimeout(resolve, 700));
              setLog('deleted');
            }}
            closeOnClick="submit"
          >
            削除する
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. フォーム                                                                 */
/* -------------------------------------------------------------------------- */

const GENRES = [
  { value: 'jazz', label: 'ジャズ' },
  { value: 'ambient', label: 'アンビエント' },
  { value: 'classic', label: 'クラシック' },
  { value: 'techno', label: 'テクノ' },
];

function DemoForm(): ReactNode {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [notify, setNotify] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && name.trim() === '' ? '表示名を入力してください' : undefined;

  return (
    <section className="card">
      <h2>2. フォーム（form）</h2>
      <p>
        背景クリックでは閉じない（入力が消えるため）。Esc は効くが、
        入力があるときは確認を挟む。幅が狭ければ自動でシートになる。
      </p>
      <div className="actions">
        <button type="button" className="trigger" onClick={() => setOpen(true)}>
          プロフィールを編集
        </button>
      </div>

      <Modal.Root
        kind="form"
        size="md"
        open={open}
        onOpenChange={setOpen}
        submitShortcut
        swipeToDismiss
        onRequestClose={(reason: CloseReason) => {
          // 何も書いていなければそのまま閉じる。書いてあれば引き止める。
          if (reason === 'close-button' || reason === 'submit') return true;
          if (name.trim() === '' && memo.trim() === '') return true;
          return window.confirm('入力中の内容が失われます。閉じますか？');
        }}
      >
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>プロフィールを編集</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Section title="基本">
            <Modal.Field label="表示名" required error={nameError} help="全角20文字まで">
              {(control) => (
                <input
                  {...control}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              )}
            </Modal.Field>

            <Modal.Field label="ひとこと">
              {(control) => (
                <textarea
                  {...control}
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                />
              )}
            </Modal.Field>
          </Modal.Section>

          <Modal.Section title="好み">
            <Modal.Chips label="ジャンル" options={GENRES} value={genres} onChange={setGenres} />
            <Modal.Switch checked={notify} onCheckedChange={setNotify}>
              新着があれば知らせる
            </Modal.Switch>
          </Modal.Section>

          <Modal.Section title="記録">
            <Modal.Table label="最近の変更">
              <table>
                <thead>
                  <tr>
                    <th scope="col">日付</th>
                    <th scope="col">項目</th>
                    <th scope="col">変更者</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2026-09-21</td>
                    <td>表示名</td>
                    <td>阿部</td>
                  </tr>
                  <tr>
                    <td>2026-08-02</td>
                    <td>ジャンル</td>
                    <td>阿部</td>
                  </tr>
                </tbody>
              </table>
            </Modal.Table>
          </Modal.Section>
        </Modal.Body>

        <Modal.Footer note="変更はすぐに反映されます">
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
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. 閲覧 — ギャラリー                                                        */
/* -------------------------------------------------------------------------- */

const SWATCHES = ['#3b4cca', '#c2410c', '#0f766e', '#7c3aed', '#be123c'];

function DemoView(): ReactNode {
  const [open, setOpen] = useState(false);

  const items = SWATCHES.map((color, index) => ({
    id: color,
    content: (
      <div className="swatch" style={{ background: color }}>
        {index + 1}
      </div>
    ),
  }));

  return (
    <section className="card">
      <h2>3. 閲覧（view）</h2>
      <p>
        画像を大きく見せる。scroll-snap のスライダーは矢印キーと Home / End で動き、
        位置は読み上げられる。
      </p>
      <div className="actions">
        <button type="button" className="trigger" onClick={() => setOpen(true)}>
          作品を見る
        </button>
      </div>

      <Modal.Root kind="view" size="lg" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>色の習作（5点）</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Gallery label="色の習作" items={items} />
          <Modal.Section title="解説">
            <p>
              スライダーの外枠はフォーカス可能な領域になっている。
              マウスを持たない人が横方向にたどり着けないスクロール領域を作らないため。
            </p>
          </Modal.Section>
        </Modal.Body>
      </Modal.Root>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. 同意 — 読了ゲート                                                        */
/* -------------------------------------------------------------------------- */

function DemoConsent(): ReactNode {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <section className="card">
      <h2>4. 同意（consent）</h2>
      <p>
        Esc でも背景でも閉じない。本文を最後まで読み、チェックを入れるまで
        primary は押せない。ただし disabled にはしないので、押せば理由が返ってくる。
      </p>
      <div className="actions">
        <button type="button" className="trigger" onClick={() => setOpen(true)}>
          規約を確認する
        </button>
        <span className="result">{done ? 'agreed' : '—'}</span>
      </div>

      <Modal.Root kind="consent" size="md" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Title>利用規約の更新</Modal.Title>
        </Modal.Header>

        <Modal.Body readGate="read">
          <div className="long-text">
            {Array.from({ length: 12 }, (_, index) => (
              <p key={index}>
                第{index + 1}条。ここには規約の本文が入る。最後まで読むと、下の同意
                チェックが意味を持つ。読まずに進めてしまう同意には、そもそも意味がない。
              </p>
            ))}
          </div>
          <Modal.Consent gate="terms">更新後の規約に同意します</Modal.Consent>
          <Modal.GateStatus />
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button
            variant="primary"
            gate
            onClick={() => {
              setDone(true);
              setOpen(false);
            }}
          >
            同意して続ける
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. フロー — 複数ステップ                                                    */
/* -------------------------------------------------------------------------- */

const STEPS = ['配送先', '支払い', '確認'] as const;

function DemoFlow(): ReactNode {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const label = STEPS[step] ?? STEPS[0];

  const reset = (): void => setStep(0);

  return (
    <section className="card">
      <h2>5. フロー（flow）</h2>
      <p>
        左に戻る、中央に現在地、右に閉じる。タイトルは別行にあるので、
        長くなってもコントロールとぶつからない。
      </p>
      <div className="actions">
        <button
          type="button"
          className="trigger"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          注文手続きへ
        </button>
      </div>

      <Modal.Root
        kind="flow"
        size="md"
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <Modal.Header>
          <Modal.Controls
            start={step > 0 ? <Modal.Back onClick={() => setStep((s) => s - 1)} /> : undefined}
            center={<Modal.Indicator current={step + 1} total={total} />}
            end={<Modal.Close />}
          />
          <Modal.Title>{`ご注文の手続き — ${label}`}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {step === 0 ? (
            <Modal.Field label="住所" required>
              {(control) => <input {...control} type="text" defaultValue="東京都杉並区" />}
            </Modal.Field>
          ) : null}
          {step === 1 ? (
            <Modal.Field label="カード番号" required help="数字のみ">
              {(control) => <input {...control} type="text" inputMode="numeric" />}
            </Modal.Field>
          ) : null}
          {step === 2 ? (
            <Modal.Alert tone="info">
              内容を確認して確定してください。確定後の変更はできません。
            </Modal.Alert>
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          {step > 0 ? (
            <Modal.Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              戻る
            </Modal.Button>
          ) : null}
          {step < total - 1 ? (
            <Modal.Button variant="primary" onClick={() => setStep((s) => s + 1)}>
              次へ
            </Modal.Button>
          ) : (
            <Modal.Button variant="primary" onClick={() => setOpen(false)}>
              確定する
            </Modal.Button>
          )}
        </Modal.Footer>
      </Modal.Root>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. 命令的 API                                                               */
/* -------------------------------------------------------------------------- */

function DemoImperative(): ReactNode {
  const modals = useModals();
  const [log, setLog] = useState('—');

  return (
    <section className="card">
      <h2>6. 命令的 API</h2>
      <p>
        await で結果を受け取る。同時に呼んでも1枚ずつ順に出る（2枚重なると、
        どちらに答えているのか分からなくなるため）。
      </p>
      <div className="actions">
        <button
          type="button"
          className="trigger"
          onClick={() => {
            void modals
              .confirm({ title: 'ログアウトしますか', tone: 'danger', confirmLabel: 'ログアウト' })
              .then((ok) => setLog(`confirm → ${String(ok)}`));
          }}
        >
          confirm を呼ぶ
        </button>
        <button
          type="button"
          className="trigger ghost"
          onClick={() => {
            void modals.confirm({ title: '1枚目' });
            void modals
              .confirm({ title: '2枚目', consent: '内容を理解しました' })
              .then((ok) => setLog(`2枚目 → ${String(ok)}`));
          }}
        >
          2枚まとめて呼ぶ
        </button>
        <span className="result">{log}</span>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. 部品の合成 — range / radio / file / date / time                          */
/* -------------------------------------------------------------------------- */

const SHIPPING = [
  { value: 'standard', label: '通常便（3〜5日）' },
  { value: 'express', label: 'お急ぎ便（翌日）' },
] as const;

function DemoControls(): ReactNode {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(40);
  const [shipping, setShipping] = useState<string>('standard');
  const [fileName, setFileName] = useState('');

  return (
    <section className="card">
      <h2>7. 部品の合成（Field / fieldset）</h2>
      <p>
        スライダーもラジオもファイルも日付も、モーダルは作り直さない。ネイティブの input を
        Modal.Field（単一の入力）と fieldset / legend（選択肢のグループ）で包むだけ。
      </p>
      <div className="actions">
        <button type="button" className="trigger" onClick={() => setOpen(true)}>
          配送の設定
        </button>
      </div>

      <Modal.Root kind="form" size="md" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>配送の設定</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Modal.Field label="通知音の大きさ" help={`現在 ${volume} / 100`}>
            {(control) => (
              <input
                {...control}
                type="range"
                min={0}
                max={100}
                step={5}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
              />
            )}
          </Modal.Field>

          {/* 選択肢のグループは label ではなく fieldset / legend で名前を付ける。 */}
          <fieldset className="demo-fieldset">
            <legend className="k-label">配送方法</legend>
            {SHIPPING.map((option) => (
              <label key={option.value} className="demo-choice">
                <input
                  type="radio"
                  name="shipping"
                  value={option.value}
                  checked={shipping === option.value}
                  onChange={() => setShipping(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          <Modal.Field label="受け取り日" required>
            {(control) => <input {...control} type="date" defaultValue="2026-10-02" />}
          </Modal.Field>

          <Modal.Field label="時間帯の開始" help="30分単位">
            {(control) => <input {...control} type="time" step={1800} defaultValue="14:00" />}
          </Modal.Field>

          <Modal.Field
            label="置き配の写真（任意）"
            help={fileName ? `選択中: ${fileName}` : 'JPEG / PNG、1枚まで'}
          >
            {(control) => (
              <input
                {...control}
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
              />
            )}
          </Modal.Field>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            やめる
          </Modal.Button>
          <Modal.Button variant="primary" onClick={() => setOpen(false)}>
            保存する
          </Modal.Button>
        </Modal.Footer>
      </Modal.Root>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 8. グラフ — Modal.Chart                                                      */
/* -------------------------------------------------------------------------- */

const MONTHLY = [
  { month: '1月', value: 62 },
  { month: '2月', value: 88 },
  { month: '3月', value: 120 },
  { month: '4月', value: 104 },
  { month: '5月', value: 101 },
] as const;

function MonthlyBars(): ReactNode {
  const max = Math.max(...MONTHLY.map((row) => row.value));
  const width = 36;
  const gap = 14;
  return (
    <svg
      className="demo-bars"
      viewBox={`0 0 ${MONTHLY.length * (width + gap)} 140`}
      preserveAspectRatio="xMidYMax meet"
    >
      {MONTHLY.map((row, index) => {
        const height = Math.round((row.value / max) * 110);
        const x = index * (width + gap) + gap / 2;
        return (
          <g key={row.month}>
            <rect x={x} y={120 - height} width={width} height={height} rx={4} />
            <text x={x + width / 2} y={136} textAnchor="middle">
              {row.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DemoChart(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <section className="card">
      <h2>8. グラフ（Modal.Chart）</h2>
      <p>
        チャートライブラリは同梱しない。持ち込んだ図に、名前・傾向の要約・元データの開閉を
        配線する。図そのものは既定で読み上げ対象から外れる。
      </p>
      <div className="actions">
        <button type="button" className="trigger" onClick={() => setOpen(true)}>
          月次レポート
        </button>
      </div>

      <Modal.Root kind="view" size="md" open={open} onOpenChange={setOpen}>
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>月次レポート（1〜5月）</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Chart
            label="月別の売上（万円）"
            summary="3月が最大の120万円。4月以降は100万円前後で横ばい。"
            data={
              <Modal.Table label="月別の売上の元データ">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">月</th>
                      <th scope="col">売上（万円）</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHLY.map((row) => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Modal.Table>
            }
          >
            <MonthlyBars />
          </Modal.Chart>
        </Modal.Body>
      </Modal.Root>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 9. シートと段 — 実機で触るための台                                          */
/* -------------------------------------------------------------------------- */

const STOPS = [
  { name: '渋谷', time: '10:02' },
  { name: '表参道', time: '10:05' },
  { name: '青山一丁目', time: '10:08' },
  { name: '永田町', time: '10:12' },
  { name: '飯田橋', time: '10:17' },
];

function DemoSheet(): ReactNode {
  const [open, setOpen] = useState(false);
  const [detent, setDetent] = useState<DetentToken>('half');

  return (
    <section className="card">
      <h2>9. シートと段（ディテント）</h2>
      <p>
        下から出て、peek / half / full の 3 段で止まる。つまみはドラッグだけの部品にしない。
        矢印キー・Home / End・クリックでも段を移れる。速い下フリックは閉じずに 1 段下げ、
        最下段からさらに投げたときだけ閉じる。
      </p>
      <div className="actions">
        <button type="button" className="trigger" onClick={() => setOpen(true)}>
          経路を見る
        </button>
        <span className="note">いまの段: {detent}</span>
      </div>

      <Modal.Root
        kind="view"
        placement="sheet"
        open={open}
        onOpenChange={setOpen}
        swipeToDismiss
        detents={['peek', 'half', 'full']}
        defaultDetent="half"
        onDetentChange={setDetent}
      >
        <Modal.Handle />
        <Modal.Header>
          <Modal.Controls end={<Modal.Close />} />
          <Modal.Title>渋谷 → 飯田橋</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Description>半蔵門線・有楽町線で 15 分。乗り換え 1 回。</Modal.Description>
          <Modal.Section title="停車駅">
            <ol className="stops">
              {STOPS.map((stop) => (
                <li key={stop.name}>
                  <span>{stop.name}</span>
                  <span>{stop.time}</span>
                </li>
              ))}
            </ol>
          </Modal.Section>
        </Modal.Body>
      </Modal.Root>
    </section>
  );
}
/* -------------------------------------------------------------------------- */

export function App(): ReactNode {
  return (
    <div className="wrap">
      <h1>kasane</h1>
      <p className="lead">
        ネイティブ &lt;dialog&gt; を土台にしたモーダルシェル。 フォーカストラップも Esc も inert
        もブラウザに任せ、情報構造とゲートに集中する。
      </p>

      <DemoConfirm />
      <DemoForm />
      <DemoView />
      <DemoConsent />
      <DemoFlow />
      <DemoImperative />
      <DemoControls />
      <DemoChart />
      <DemoSheet />

      <ModalHost />
    </div>
  );
}
