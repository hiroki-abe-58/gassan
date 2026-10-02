import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Modal, ModalHost, confirm, resetModalQueue } from '../src';
import { emitIntersection, emitResize, mockScrollMetrics, renderModal } from './utils';

/* ========================================================================== */
/* Title / T                                                                  */
/* ========================================================================== */

describe('title / T', () => {
  const titleText = () => document.querySelector<HTMLElement>('.g-title-text');

  it('溢れていないあいだは展開トグルを出さない', () => {
    renderModal();
    expect(screen.queryByRole('button', { name: 'タイトルの全文を表示' })).toBeNull();
  });

  it('溢れたら展開トグルが現れる', async () => {
    renderModal();
    const text = titleText();
    if (!text) throw new Error('title not rendered');
    mockScrollMetrics(text, { scrollHeight: 96, clientHeight: 40 });
    act(() => {
      emitResize(text);
    });
    expect(await screen.findByRole('button', { name: 'タイトルの全文を表示' })).toBeVisible();
  });

  it('展開すると aria-expanded が切り替わり、clamp が外れる', async () => {
    const user = userEvent.setup();
    renderModal();
    const text = titleText();
    if (!text) throw new Error('title not rendered');
    mockScrollMetrics(text, { scrollHeight: 96, clientHeight: 40 });
    act(() => {
      emitResize(text);
    });

    const toggle = await screen.findByRole('button', { name: 'タイトルの全文を表示' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(text).toHaveAttribute('data-clamped');

    await user.click(toggle);

    expect(screen.getByRole('button', { name: 'タイトルを折りたたむ' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(text).not.toHaveAttribute('data-clamped');
  });

  it('展開中は再測定しないのでトグルが消えない', async () => {
    const user = userEvent.setup();
    renderModal();
    const text = titleText();
    if (!text) throw new Error('title not rendered');
    mockScrollMetrics(text, { scrollHeight: 96, clientHeight: 40 });
    act(() => {
      emitResize(text);
    });
    await user.click(await screen.findByRole('button', { name: 'タイトルの全文を表示' }));

    // 展開後は clamp が外れるので「溢れていない」に見える。
    // そこで再測定するとトグルが消え、折りたたむ手段が失われる。T-07。
    mockScrollMetrics(text, { scrollHeight: 40, clientHeight: 40 });
    act(() => {
      emitResize(text);
    });
    expect(screen.getByRole('button', { name: 'タイトルを折りたたむ' })).toBeInTheDocument();
  });

  it('省略しても DOM のテキストは完全なまま保たれる', () => {
    const long = 'とても長いタイトルがここに入っていて一行には到底収まらない';
    const { dialog } = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>{long}</Modal.Title>
          </Modal.Header>
          <Modal.Body>本文</Modal.Body>
        </>
      ),
    });
    // 省略は CSS の line-clamp だけで行う。JS で文字列を切ると名前まで切れる。T-04。
    expect(titleText()).toHaveTextContent(long);
    expect(dialog()).toHaveAccessibleName(long);
  });

  it('title 属性は使わない', () => {
    renderModal();
    expect(titleText()).not.toHaveAttribute('title');
    // WCAG 1.4.13 を満たせず、タッチでは開けもしない。T-05。
    expect(document.querySelector('.g-title[title]')).toBeNull();
  });

  it('トグルの文言はダイアログ名に混入しない', async () => {
    const { dialog } = renderModal();
    const text = titleText();
    if (!text) throw new Error('title not rendered');
    mockScrollMetrics(text, { scrollHeight: 96, clientHeight: 40 });
    act(() => {
      emitResize(text);
    });
    await screen.findByRole('button', { name: 'タイトルの全文を表示' });
    expect(dialog()).toHaveAccessibleName('設定を変更します');
  });
});

/* ========================================================================== */
/* Body & read gate / B, G                                                    */
/* ========================================================================== */

const gateContent = (
  <>
    <Modal.Header>
      <Modal.Title>利用規約</Modal.Title>
    </Modal.Header>
    <Modal.Body readGate="read">
      <p>規約の本文がここに入る。</p>
      <Modal.Consent gate="terms">規約に同意します</Modal.Consent>
      <Modal.GateStatus />
    </Modal.Body>
    <Modal.Footer>
      <Modal.Button variant="primary" gate>
        同意して続ける
      </Modal.Button>
    </Modal.Footer>
  </>
);

function body(): HTMLElement {
  return screen.getByRole('group', { name: '本文' });
}
function primary(): HTMLElement {
  return screen.getByRole('button', { name: '同意して続ける' });
}

/**
 * ゲートの理由は常時可視のステータス行と、ボタンの aria-describedby 先の
 * 読み上げ専用テキストの2箇所に出る。これは意図した重複なので、
 * テストでは「可視側」を名指しで読む。
 */
function gateStatusText(): string {
  return document.querySelector('.g-gate-status')?.textContent ?? '';
}

describe('body / B', () => {
  it('スクロール領域はフォーカス可能で名前を持つ', () => {
    renderModal();
    expect(body()).toHaveAttribute('tabindex', '0');
  });

  it('スクロールできないうちは端の影を出さない', () => {
    renderModal();
    expect(body()).toHaveAttribute('data-at-start');
    expect(body()).toHaveAttribute('data-at-end');
  });

  it('スクロール可能になると末尾フラグが落ちる', () => {
    renderModal();
    const el = body();
    mockScrollMetrics(el, { scrollHeight: 1000, clientHeight: 200 });
    act(() => {
      emitResize(el);
    });
    expect(el).toHaveAttribute('data-at-start');
    expect(el).not.toHaveAttribute('data-at-end');
  });

  it('セクションは見出しと結ばれる', () => {
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Section title="通知">中身</Modal.Section>
        </Modal.Body>
      ),
      label: 'テスト',
    });
    expect(screen.getByRole('region', { name: '通知' })).toBeInTheDocument();
  });

  it('見出しの無いセクションは region を作らない', () => {
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Section>中身だけ</Modal.Section>
        </Modal.Body>
      ),
      label: 'テスト',
    });
    // 名前のない領域を支援技術に増やさない。
    expect(screen.queryByRole('region')).toBeNull();
  });
});

describe('read gate / G', () => {
  it('開く前に読了が成立してしまわない', () => {
    // 閉じている間は clientHeight が 0。ここで「スクロール不要」と誤認すると、
    // 一度も開いていないのにゲートが開いてしまう。
    renderModal({ children: gateContent, initialOpen: true });
    expect(primary()).toHaveAttribute('aria-disabled', 'true');
  });

  it('そもそもスクロール不要な本文は読了扱いになる', async () => {
    renderModal({ children: gateContent });
    const el = body();
    mockScrollMetrics(el, { scrollHeight: 200, clientHeight: 200 });
    act(() => {
      emitResize(el);
    });
    // 読了は満たされたが、同意がまだなので押せない。
    await waitFor(() => {
      expect(gateStatusText()).toBe('内容に同意すると次へ進めます。');
    });
  });

  it('末尾センチネルが見えたら読了になる', async () => {
    renderModal({ children: gateContent });
    const el = body();
    mockScrollMetrics(el, { scrollHeight: 1000, clientHeight: 200 });
    act(() => {
      emitResize(el);
    });
    expect(gateStatusText()).toBe('本文を最後までお読みください。');

    const sentinel = document.querySelector('.g-sentinel');
    if (!sentinel) throw new Error('sentinel missing');
    act(() => {
      emitIntersection(sentinel, true);
    });

    await waitFor(() => {
      expect(gateStatusText()).toBe('内容に同意すると次へ進めます。');
    });
  });

  it('末尾マーカーへのフォーカス到達でも読了になる', async () => {
    // 仮想カーソルで読む利用者は scroll も交差も起こさない。G-03。
    renderModal({ children: gateContent });
    const el = body();
    mockScrollMetrics(el, { scrollHeight: 1000, clientHeight: 200 });
    act(() => {
      emitResize(el);
    });

    const marker = document.querySelector<HTMLElement>('.g-end-marker');
    if (!marker) throw new Error('marker missing');
    act(() => {
      marker.focus();
    });

    await waitFor(() => {
      expect(gateStatusText()).toBe('内容に同意すると次へ進めます。');
    });
  });

  it('一度満たした読了は取り消されない', async () => {
    renderModal({ children: gateContent });
    const el = body();
    mockScrollMetrics(el, { scrollHeight: 1000, clientHeight: 200 });
    act(() => {
      emitResize(el);
    });
    const sentinel = document.querySelector('.g-sentinel');
    if (!sentinel) throw new Error('sentinel missing');
    act(() => {
      emitIntersection(sentinel, true);
    });
    await waitFor(() => {
      expect(gateStatusText()).toBe('内容に同意すると次へ進めます。');
    });

    // 上に戻しても「読んでいない」には戻らない。G-09。
    act(() => {
      emitIntersection(sentinel, false);
      emitResize(el);
    });
    expect(gateStatusText()).toBe('内容に同意すると次へ進めます。');
  });
});

describe('gated button / G', () => {
  function setupSatisfiedRead(): void {
    const el = body();
    mockScrollMetrics(el, { scrollHeight: 200, clientHeight: 200 });
    act(() => {
      emitResize(el);
    });
  }

  it('未充足でも disabled にしない', () => {
    renderModal({ children: gateContent });
    const button = primary();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    // disabled はフォーカスを受け取らないので、理由を確かめる手段が消える。G-01。
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('disabled');
  });

  it('理由テキストはボタンの名前に混入しない', () => {
    renderModal({ children: gateContent });
    // 参照先が子孫にあるとアクセシブルネーム計算に合流してしまう。
    expect(primary()).toHaveAccessibleName('同意して続ける');
    expect(primary()).toHaveAccessibleDescription('本文を最後までお読みください。');
  });

  it('押しても onClick は呼ばれない', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>規約</Modal.Title>
          </Modal.Header>
          <Modal.Body readGate="read">本文</Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="primary" gate onClick={onClick}>
              続ける
            </Modal.Button>
          </Modal.Footer>
        </>
      ),
    });
    await user.click(screen.getByRole('button', { name: '続ける' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('押すと理由が読み上げられる', async () => {
    const user = userEvent.setup();
    renderModal({ children: gateContent });
    await user.click(primary());
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('本文を最後までお読みください。');
    });
  });

  it('押すと詰まっている場所へ連れて行く', async () => {
    const user = userEvent.setup();
    renderModal({ children: gateContent });
    setupSatisfiedRead();
    await waitFor(() => {
      expect(gateStatusText()).toBe('内容に同意すると次へ進めます。');
    });

    await user.click(primary());
    // 理由を言うだけでは足りない。詰まっている入力にフォーカスを移す。G-08。
    expect(document.activeElement).toBe(screen.getByRole('checkbox'));
  });

  it('すべて満たすと押せるようになる', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>利用規約</Modal.Title>
          </Modal.Header>
          <Modal.Body readGate="read">
            <Modal.Consent gate="terms">同意します</Modal.Consent>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Button variant="primary" gate onClick={onClick}>
              確定
            </Modal.Button>
          </Modal.Footer>
        </>
      ),
    });
    setupSatisfiedRead();
    await user.click(screen.getByRole('checkbox'));

    const button = screen.getByRole('button', { name: '確定' });
    await waitFor(() => {
      expect(button).not.toHaveAttribute('aria-disabled');
    });
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('未充足の理由は案内順（order）で先頭が選ばれる', () => {
    renderModal({ children: gateContent });
    // read(order 0) が terms(order 1) より先。
    expect(gateStatusText()).toBe('本文を最後までお読みください。');
    expect(gateStatusText()).not.toBe('内容に同意すると次へ進めます。');
  });

  it('ゲートを外すと登録が解除される', async () => {
    function Harness(): ReactNode {
      const [strict, setStrict] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setStrict(false)}>
            ゆるめる
          </button>
          <Modal.Root open onOpenChange={() => {}} label="テスト">
            <Modal.Body>
              {strict ? (
                <Modal.Gate name="extra" satisfied={false} reason="追加条件があります" />
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Modal.Button variant="primary" gate>
                実行
              </Modal.Button>
            </Modal.Footer>
          </Modal.Root>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole('button', { name: '実行' })).toHaveAttribute('aria-disabled', 'true');

    await user.click(screen.getByRole('button', { name: 'ゆるめる' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '実行' })).not.toHaveAttribute('aria-disabled');
    });
  });

  it('unavailable は本物の disabled にする', () => {
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" unavailable>
            権限がありません
          </Modal.Button>
        </Modal.Footer>
      ),
      label: 'テスト',
    });
    expect(screen.getByRole('button', { name: '権限がありません' })).toBeDisabled();
  });
});

/* ========================================================================== */
/* Footer button / F                                                          */
/* ========================================================================== */

describe('button / F', () => {
  it('onAction 実行中は二重送信を握りつぶす', async () => {
    const user = userEvent.setup();
    let release!: () => void;
    const action = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );

    renderModal({
      label: 'テスト',
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" onAction={action}>
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });

    const button = screen.getByRole('button', { name: '送信' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-busy', 'true');

    await user.click(button);
    await user.click(button);
    expect(action).toHaveBeenCalledTimes(1);

    await act(async () => {
      release();
    });
    await waitFor(() => {
      expect(button).not.toHaveAttribute('aria-busy');
    });
  });

  it('処理中でもボタンの名前は保たれる', async () => {
    const user = userEvent.setup();
    renderModal({
      label: 'テスト',
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" onAction={() => new Promise<void>(() => {})}>
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    const button = screen.getByRole('button', { name: '送信' });
    await user.click(button);
    // 「送信 処理中」になってはいけない。状態は description 側で伝える。
    expect(button).toHaveAccessibleName('送信');
    expect(button).toHaveAccessibleDescription('処理中');
  });

  it('closeOnClick は理由つきで閉じる', async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal({
      label: 'テスト',
      children: (
        <Modal.Footer>
          <Modal.Button variant="tertiary" closeOnClick="close-button">
            やめる
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    await user.click(screen.getByRole('button', { name: 'やめる' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'close-button');
  });

  it('variant が data 属性に出る', () => {
    renderModal({
      label: 'テスト',
      children: (
        <Modal.Footer>
          <Modal.Button variant="danger">削除</Modal.Button>
        </Modal.Footer>
      ),
    });
    expect(screen.getByRole('button', { name: '削除' })).toHaveAttribute('data-variant', 'danger');
  });
});

/* ========================================================================== */
/* Media / gallery / fields                                                   */
/* ========================================================================== */

describe('gallery / B-12', () => {
  const items = [
    { id: 'a', content: <p>A</p> },
    { id: 'b', content: <p>B</p> },
    { id: 'c', content: <p>C</p> },
  ];

  function renderGallery(): void {
    renderModal({
      label: 'テスト',
      children: (
        <Modal.Body>
          <Modal.Gallery label="作品の写真" items={items} />
        </Modal.Body>
      ),
    });
  }

  it('各スライドが位置の名前を持つ', () => {
    renderGallery();
    expect(screen.getByRole('group', { name: '3件中1件目' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '3件中3件目' })).toBeInTheDocument();
  });

  it('次へで位置が進む', async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.click(screen.getByRole('button', { name: '次へ' }));
    expect(screen.getByRole('group', { name: '3件中2件目' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('矢印キーで移動できる', async () => {
    const user = userEvent.setup();
    renderGallery();
    const track = screen.getByRole('group', { name: '作品の写真' });
    track.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('group', { name: '3件中3件目' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('End / Home で端に飛ぶ', async () => {
    const user = userEvent.setup();
    renderGallery();
    const track = screen.getByRole('group', { name: '作品の写真' });
    track.focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('group', { name: '3件中3件目' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await user.keyboard('{Home}');
    expect(screen.getByRole('group', { name: '3件中1件目' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('端を越えない', async () => {
    const user = userEvent.setup();
    renderGallery();
    const previous = screen.getByRole('button', { name: '前へ' });
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    await user.click(previous);
    expect(screen.getByRole('group', { name: '3件中1件目' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('幅が測れない間（clientWidth 0）は、スクロール由来の再計算で位置を巻き戻さない', async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.click(screen.getByRole('button', { name: '次へ' }));
    // scrollTo → scroll → rAF の再計算が走り切るまで待つ。
    // 幅 0 を 1 とみなして割ると index が 0 に化け、押した「次へ」が取り消される。
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(screen.getByRole('group', { name: '3件中2件目' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});

describe('field / B-07', () => {
  it('help と error を aria で結ぶ', () => {
    renderModal({
      label: 'テスト',
      children: (
        <Modal.Body>
          <Modal.Field label="表示名" help="全角20文字まで" error="必須です" required>
            {(control) => <input type="text" {...control} />}
          </Modal.Field>
        </Modal.Body>
      ),
    });
    const input = screen.getByLabelText(/表示名/);
    expect(input).toHaveAccessibleDescription('全角20文字まで 必須です');
    expect(input).toBeInvalid();
    expect(input).toBeRequired();
  });

  it('エラーが無ければ invalid にしない', () => {
    renderModal({
      label: 'テスト',
      children: (
        <Modal.Body>
          <Modal.Field label="メモ">{(control) => <textarea {...control} />}</Modal.Field>
        </Modal.Body>
      ),
    });
    expect(screen.getByLabelText(/メモ/)).toBeValid();
  });
});

describe('chips and switch', () => {
  it('チップスは aria-pressed で状態を伝える', async () => {
    const user = userEvent.setup();
    function Harness(): ReactNode {
      const [value, setValue] = useState<string[]>([]);
      return (
        <Modal.Root open onOpenChange={() => {}} label="テスト">
          <Modal.Body>
            <Modal.Chips
              label="ジャンル"
              options={[
                { value: 'jazz', label: 'ジャズ' },
                { value: 'rock', label: 'ロック' },
              ]}
              value={value}
              onChange={setValue}
            />
          </Modal.Body>
        </Modal.Root>
      );
    }
    render(<Harness />);
    const chip = screen.getByRole('button', { name: 'ジャズ' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    await user.click(chip);
    // 装飾の +/× は aria-hidden なので、名前は状態で変わらない。
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(chip).toHaveAccessibleName('ジャズ');
  });

  it('スイッチは role=switch で状態を伝える', async () => {
    const user = userEvent.setup();
    function Harness(): ReactNode {
      const [on, setOn] = useState(false);
      return (
        <Modal.Root open onOpenChange={() => {}} label="テスト">
          <Modal.Body>
            <Modal.Switch checked={on} onCheckedChange={setOn}>
              通知を受け取る
            </Modal.Switch>
          </Modal.Body>
        </Modal.Root>
      );
    }
    render(<Harness />);
    const toggle = screen.getByRole('switch', { name: '通知を受け取る' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });
});

/* ========================================================================== */
/* Imperative API / L-14                                                      */
/* ========================================================================== */

describe('imperative confirm', () => {
  afterEach(() => {
    resetModalQueue();
  });

  it('OK で true を返す', async () => {
    const user = userEvent.setup();
    render(<ModalHost />);
    let promise!: Promise<boolean>;
    act(() => {
      promise = confirm({ title: '削除しますか' });
    });
    await screen.findByText('削除しますか');
    await user.click(screen.getByRole('button', { name: 'OK' }));
    await expect(promise).resolves.toBe(true);
  });

  it('キャンセルで false を返す', async () => {
    const user = userEvent.setup();
    render(<ModalHost />);
    let promise!: Promise<boolean>;
    act(() => {
      promise = confirm({ title: '破棄しますか' });
    });
    await screen.findByText('破棄しますか');
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));
    await expect(promise).resolves.toBe(false);
  });

  it('Esc で閉じても false として解決する', async () => {
    render(<ModalHost />);
    let promise!: Promise<boolean>;
    act(() => {
      promise = confirm({ title: '確認' });
    });
    await screen.findByText('確認');
    const dialog = document.querySelector('dialog');
    if (!dialog) throw new Error('dialog missing');
    act(() => {
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    await expect(promise).resolves.toBe(false);
  });

  it('2件同時に要求しても1枚ずつ順に出す', async () => {
    const user = userEvent.setup();
    render(<ModalHost />);
    let first!: Promise<boolean>;
    act(() => {
      first = confirm({ title: 'ひとつ目' });
      void confirm({ title: 'ふたつ目' });
    });

    expect(screen.getByText('ひとつ目')).toBeInTheDocument();
    // 2枚同時に出ると、どちらに答えているのか分からなくなる。L-14。
    expect(screen.queryByText('ふたつ目')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'OK' }));
    await expect(first).resolves.toBe(true);
    expect(await screen.findByText('ふたつ目')).toBeInTheDocument();
  });

  it('consent 付きはチェックするまで確定できない', async () => {
    const user = userEvent.setup();
    render(<ModalHost />);
    let promise!: Promise<boolean>;
    act(() => {
      promise = confirm({ title: '同意の確認', consent: '内容を理解しました' });
    });
    await screen.findByText('同意の確認');

    const ok = screen.getByRole('button', { name: 'OK' });
    expect(ok).toHaveAttribute('aria-disabled', 'true');

    await user.click(screen.getByRole('checkbox'));
    await waitFor(() => {
      expect(ok).not.toHaveAttribute('aria-disabled');
    });
    await user.click(ok);
    await expect(promise).resolves.toBe(true);
  });

  it('ホストが無いときは開発者に警告する', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    void confirm({ title: '宙に浮く確認' });
    // 判定は 1 ティック遅れる。子の effect から呼ばれた場合に
    // 「親の ModalHost がまだ登録されていないだけ」を誤報しないため。
    await act(async () => {});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ModalHost'));
    warn.mockRestore();
    resetModalQueue();
  });
});
