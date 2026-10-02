import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from '../src';
import type { CloseReason } from '../src';
import { pressEscape, renderModal } from './utils';

describe('lifecycle / L', () => {
  it('open=false のあいだ dialog は開かない', () => {
    const { dialog } = renderModal({ initialOpen: false });
    expect(dialog().open).toBe(false);
  });

  it('open=true になると showModal される', () => {
    const { dialog } = renderModal();
    expect(dialog().open).toBe(true);
  });

  it('閉じている間も DOM に残る（常時マウント）', () => {
    const { dialog } = renderModal({ initialOpen: false });
    // 条件マウントにすると、閉じるアニメーションが原理的に描けない。L-05。
    expect(dialog()).toBeInTheDocument();
  });

  it('× ボタンは理由 close-button で閉じる', async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderModal();
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, 'close-button');
  });

  it('Esc は cancel を止めて自前のルートに合流する', () => {
    const { dialog, onOpenChange } = renderModal({ kind: 'view' });
    let event!: Event;
    act(() => {
      event = pressEscape(dialog());
    });
    // preventDefault しないと、拒否したいときに止められない。L-09。
    expect(event.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false, 'esc');
  });

  it('dismiss.esc=false なら閉じず、無言にもしない', async () => {
    const { dialog, panel, onOpenChange } = renderModal({
      kind: 'view',
      dismiss: { esc: false },
    });
    act(() => {
      pressEscape(dialog());
    });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(panel()).toHaveAttribute('data-g-blocked');
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('閉じられません');
    });
  });

  it('kind=consent は Esc でも背景クリックでも閉じない', async () => {
    const user = userEvent.setup();
    const { dialog, scrim, onOpenChange } = renderModal({ kind: 'consent' });
    act(() => {
      pressEscape(dialog());
    });
    await user.click(scrim());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('onRequestClose が false を返すと閉じない', () => {
    const guard = vi.fn(() => false);
    const { dialog, onOpenChange } = renderModal({ kind: 'view', onRequestClose: guard });
    act(() => {
      pressEscape(dialog());
    });
    expect(guard).toHaveBeenCalledWith('esc');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('onRequestClose が Promise を返す場合は解決を待つ', async () => {
    const guard = vi.fn(() => Promise.resolve(true));
    const { dialog, onOpenChange } = renderModal({ kind: 'view', onRequestClose: guard });
    act(() => {
      pressEscape(dialog());
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false, 'esc');
    });
  });

  it('非同期ガードの解決前に連打しても二重に閉じない', async () => {
    const guard = vi.fn(() => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 20)));
    const { dialog, onOpenChange } = renderModal({ kind: 'view', onRequestClose: guard });
    act(() => {
      pressEscape(dialog());
      pressEscape(dialog());
      pressEscape(dialog());
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalled();
    });
    expect(guard).toHaveBeenCalledTimes(1);
  });

  it('外部から close() されたら programmatic として通知する', async () => {
    const { dialog, onOpenChange } = renderModal();
    act(() => {
      dialog().close();
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false, 'programmatic');
    });
  });

  it('returnValue 付きで閉じられたら submit として扱う', async () => {
    const { dialog, onOpenChange } = renderModal();
    act(() => {
      dialog().close('save');
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false, 'submit');
    });
  });

  it('開いたまま unmount しても例外を投げず、dialog を閉じる', () => {
    const { unmount, dialog } = renderModal();
    const el = dialog();
    expect(() => unmount()).not.toThrow();
    // cleanup は ref の切り離しより後に走る。last node を掴んでいないとここで閉じられない。
    expect(el.open).toBe(false);
  });

  it('routeKey が変わると route-change で閉じる', () => {
    const onOpenChange = vi.fn();
    function Harness({ routeKey }: { routeKey: string }): ReactNode {
      return (
        <Modal.Root open onOpenChange={onOpenChange} routeKey={routeKey} label="テスト">
          <Modal.Body>本文</Modal.Body>
        </Modal.Root>
      );
    }
    const { rerender } = render(<Harness routeKey="/a" />);
    expect(onOpenChange).not.toHaveBeenCalled();
    rerender(<Harness routeKey="/b" />);
    expect(onOpenChange).toHaveBeenCalledWith(false, 'route-change');
  });

  it('閉じ切ると onExited が一度だけ呼ばれる', async () => {
    const onExited = vi.fn();
    function Harness(): ReactNode {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(false)}>
            とじる
          </button>
          <Modal.Root open={open} onOpenChange={() => setOpen(false)} onExited={onExited} label="x">
            <Modal.Body>本文</Modal.Body>
          </Modal.Root>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'とじる' }));
    await waitFor(() => {
      expect(onExited).toHaveBeenCalledTimes(1);
    });
  });

  it('閉じて開き直すと内部状態がリセットされる', async () => {
    const user = userEvent.setup();
    const { setOpen } = renderModal({
      kind: 'view',
      children: (
        <>
          <Modal.Header>
            <Modal.Title>同意</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Consent gate="terms">同意します</Modal.Consent>
          </Modal.Body>
        </>
      ),
    });

    // 閉じている間の <dialog> の中身は display:none なので role では引けない。
    // これは jsdom の既定スタイルが実ブラウザと同じ挙動を持っているということ。
    const rawCheckbox = () => document.querySelector<HTMLInputElement>('.g-consent input');

    await user.click(screen.getByRole('checkbox'));
    expect(rawCheckbox()).toBeChecked();

    act(() => setOpen(false));
    await waitFor(() => {
      expect(rawCheckbox()).not.toBeChecked();
    });

    act(() => setOpen(true));
    // 前回のチェックが残っていると「同意した覚えがないのに進める」ことになる。
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
});

describe('scrim / S', () => {
  it('押下と解放がどちらもスクリムなら閉じる', async () => {
    const user = userEvent.setup();
    const { scrim, onOpenChange } = renderModal({ kind: 'view' });
    await user.click(scrim());
    expect(onOpenChange).toHaveBeenCalledWith(false, 'backdrop');
  });

  it('本文で押してスクリムで離した場合は閉じない', () => {
    const { panel, scrim, onOpenChange } = renderModal({ kind: 'view' });
    // テキスト選択がモーダルの外へ抜けた瞬間に閉じる、という事故を防ぐ。S-08。
    fireEvent.pointerDown(panel());
    fireEvent.pointerUp(scrim());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('スクリムで押して本文で離した場合も閉じない', () => {
    const { panel, scrim, onOpenChange } = renderModal({ kind: 'view' });
    fireEvent.pointerDown(scrim());
    fireEvent.pointerUp(panel());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('右クリックでは閉じない', () => {
    const { scrim, onOpenChange } = renderModal({ kind: 'view' });
    fireEvent.pointerDown(scrim(), { button: 2 });
    fireEvent.pointerUp(scrim(), { button: 2 });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('kind=form の既定では背景クリックで閉じない', async () => {
    const user = userEvent.setup();
    const { scrim, onOpenChange } = renderModal({ kind: 'form' });
    await user.click(scrim());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('スクリムは支援技術から隠す', () => {
    const { scrim } = renderModal();
    expect(scrim()).toHaveAttribute('aria-hidden', 'true');
  });

  it('既定のスクリムは 32% 相当のトークン（黒 60% ではない）', () => {
    const { dialog } = renderModal();
    expect(dialog()).toHaveAttribute('data-scrim', 'default');
  });

  it('kind=consent は強いスクリムを既定にする', () => {
    const { dialog } = renderModal({ kind: 'consent' });
    expect(dialog()).toHaveAttribute('data-scrim', 'strong');
  });
});

describe('focus and naming / K, A', () => {
  it('初期フォーカスは × ボタンではなくパネル本体', () => {
    const { panel } = renderModal();
    // showModal() の既定は「最初のフォーカサブル子孫」＝ × ボタン。
    // そこに合焦すると、読み上げの第一声が「閉じる」になる。K-03。
    expect(document.activeElement).toBe(panel());
  });

  it('initialFocus を指定するとそこに合焦する', () => {
    function Harness(): ReactNode {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <Modal.Root open onOpenChange={() => {}} initialFocus={ref} label="検索">
          <Modal.Body>
            <input ref={ref} data-testid="field" aria-label="キーワード" />
          </Modal.Body>
        </Modal.Root>
      );
    }
    render(<Harness />);
    expect(document.activeElement).toBe(screen.getByTestId('field'));
  });

  it('タイトルがダイアログのアクセシブルネームになる', () => {
    const { dialog } = renderModal();
    expect(dialog()).toHaveAccessibleName('設定を変更します');
  });

  it('タイトルが無い場合は label を使う', () => {
    const { dialog } = renderModal({
      label: 'クイック検索',
      children: <Modal.Body>本文</Modal.Body>,
    });
    expect(dialog()).toHaveAccessibleName('クイック検索');
  });

  it('Description は aria-describedby に自動で配線される', () => {
    const { dialog } = renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>確認</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Description>この操作は取り消せません。</Modal.Description>
          </Modal.Body>
        </>
      ),
    });
    expect(dialog()).toHaveAccessibleDescription('この操作は取り消せません。');
  });

  it('aria-modal は付けない（ネイティブの modal 状態と二重にしない）', () => {
    const { dialog } = renderModal();
    expect(dialog()).not.toHaveAttribute('aria-modal');
  });

  it('本文はキーボードで操作できる名前付きの領域である', () => {
    renderModal();
    const body = screen.getByRole('group', { name: '本文' });
    expect(body).toHaveAttribute('tabindex', '0');
  });

  it('ライブリージョンは常設され、開いた時点では空', () => {
    renderModal();
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('');
  });
});

describe('container attributes / C', () => {
  it('size と placement が data 属性に出る', () => {
    const { dialog } = renderModal({ size: 'lg', placement: 'top' });
    expect(dialog()).toHaveAttribute('data-size', 'lg');
    expect(dialog()).toHaveAttribute('data-placement', 'top');
  });

  it('placement=auto は解決済みの値だけを DOM に出す', () => {
    const { dialog } = renderModal({ placement: 'auto' });
    const value = dialog().getAttribute('data-placement');
    expect(['center', 'sheet']).toContain(value);
  });

  it('kind が data 属性に出る', () => {
    const { dialog } = renderModal({ kind: 'confirm' });
    expect(dialog()).toHaveAttribute('data-kind', 'confirm');
  });
});

describe('close reasons are exhaustive', () => {
  it('すべての理由が型として区別できる', () => {
    const reasons: CloseReason[] = [
      'esc',
      'backdrop',
      'close-button',
      'back-button',
      'submit',
      'programmatic',
      'swipe',
      'route-change',
    ];
    expect(new Set(reasons).size).toBe(8);
  });
});
