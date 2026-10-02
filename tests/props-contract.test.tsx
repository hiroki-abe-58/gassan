/**
 * props の契約（制御/非制御の混在・重複値・変化通知）。
 *
 * 監査の軸: 公開 API ごとに「制御／非制御」「非同期」「アンマウント」
 * 「動的 props」「空・重複・境界値」を突き合わせた結果、
 * F-08 / D-11 / D-13 / D-14 で実際に落ちた経路を固定する。
 *
 * どれも「主たる経路は動いているのに、脇の入力で静かに壊れる」種類で、
 * 利用側からは観測しにくい。だから観測できる形でここに置く。
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Modal } from '../src';
import type { DetentToken } from '../src';
import { duplicateValues, resetWarnings } from '../src/internal/dom';
import { renderModal } from './utils';

const noop = (): void => {};

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  resetWarnings();
  warn = vi.spyOn(console, 'warn').mockImplementation(noop);
});

afterEach(() => {
  warn.mockRestore();
});

function warnings(): string[] {
  return warn.mock.calls.map((call) => String(call[0]));
}

/* -------------------------------------------------------------------------- */
/* F-08  制御 loading と内部 pending の混在                                    */
/* -------------------------------------------------------------------------- */

describe('F-08 二重送信の防止は、制御 loading と併用しても効く', () => {
  function pendingButton(props: { loading?: boolean }): {
    action: ReturnType<typeof vi.fn>;
    button: () => HTMLElement;
  } {
    const action = vi.fn(() => new Promise<void>(() => {}));
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" loading={props.loading} onAction={action}>
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    return { action, button: () => screen.getByRole('button', { name: '送信' }) };
  }

  it('loading={false} を渡しても onAction は 1 回しか走らない', () => {
    // ?? だと loading={false} が内部 pending を上書きし、
    // onAction が解決するまでの間に何度でも押せてしまっていた。
    const { action, button } = pendingButton({ loading: false });
    fireEvent.click(button());
    fireEvent.click(button());
    fireEvent.click(button());
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('loading={false} でも onAction 中は aria-busy が立つ', () => {
    const { button } = pendingButton({ loading: false });
    fireEvent.click(button());
    expect(button()).toHaveAttribute('aria-busy', 'true');
  });

  it('loading を渡さなければ従来どおり内部 pending で防ぐ', () => {
    const { action, button } = pendingButton({});
    fireEvent.click(button());
    fireEvent.click(button());
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('loading={true} は onAction が無くても busy になる', () => {
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" loading>
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    expect(screen.getByRole('button', { name: '送信' })).toHaveAttribute('aria-busy', 'true');
  });

  it('onAction が reject しても pending は解け、再試行できる', async () => {
    const action = vi.fn(() => Promise.reject(new Error('boom')));
    const error = vi.spyOn(console, 'error').mockImplementation(noop);
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" onAction={action}>
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    const button = screen.getByRole('button', { name: '送信' });
    fireEvent.click(button);
    await waitFor(() => expect(button).not.toHaveAttribute('aria-busy'));
    fireEvent.click(button);
    expect(action).toHaveBeenCalledTimes(2);
    error.mockRestore();
  });
});

/* -------------------------------------------------------------------------- */
/* D-13  リスト props の識別子重複                                             */
/* -------------------------------------------------------------------------- */

describe('D-13 リスト props の識別子が重複したら名指しで警告する', () => {
  it('duplicateValues は重複だけを最初に現れた順で返す', () => {
    expect(duplicateValues(['a', 'b', 'a', 'c', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('duplicateValues は一意なら空を返す', () => {
    expect(duplicateValues(['a', 'b', 'c'])).toEqual([]);
    expect(duplicateValues([])).toEqual([]);
  });

  it('Modal.Gallery の items[].id 重複を警告する', () => {
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Gallery
            label="写真"
            items={[
              { id: 'a', content: <p>1</p> },
              { id: 'a', content: <p>2</p> },
            ]}
          />
        </Modal.Body>
      ),
    });
    expect(warnings().join('\n')).toContain('items[].id');
  });

  it('Modal.Chips の options[].value 重複を警告する', () => {
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Chips
            label="ジャンル"
            options={[
              { value: 'x', label: 'X' },
              { value: 'x', label: 'X2' },
            ]}
            value={[]}
            onChange={noop}
          />
        </Modal.Body>
      ),
    });
    expect(warnings().join('\n')).toContain('options[].value');
  });

  it('重複を黙って落とさない（渡した件数のまま描く）', () => {
    // 落として件数を合わせると「2 件渡したのに 1 件しか出ない」となり、
    // 原因に辿り着けない。描いたうえで名指しする。
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Chips
            label="ジャンル"
            options={[
              { value: 'x', label: 'X' },
              { value: 'x', label: 'X2' },
            ]}
            value={[]}
            onChange={noop}
          />
        </Modal.Body>
      ),
    });
    expect(screen.getByRole('button', { name: 'X' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'X2' })).toBeInTheDocument();
  });

  it('一意なら警告しない', () => {
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Gallery
            label="写真"
            items={[
              { id: 'a', content: <p>1</p> },
              { id: 'b', content: <p>2</p> },
            ]}
          />
          <Modal.Chips
            label="ジャンル"
            options={[
              { value: 'x', label: 'X' },
              { value: 'y', label: 'Y' },
            ]}
            value={[]}
            onChange={noop}
          />
        </Modal.Body>
      ),
    });
    expect(warnings().join('\n')).not.toContain('重複');
  });
});

/* -------------------------------------------------------------------------- */
/* D-14  変化の通知は、変化したときだけ鳴らす                                   */
/* -------------------------------------------------------------------------- */

describe('D-14 変化の通知は変化したときだけ鳴る', () => {
  function gallery(
    onIndexChange: (index: number) => void,
    count = 3,
  ): { shrink: () => void } {
    function Harness(): ReactNode {
      const [items, setItems] = useState(
        Array.from({ length: count }, (_, i) => ({
          id: `i${String(i)}`,
          content: <p>{i}</p>,
        })),
      );
      return (
        <>
          <button type="button" onClick={() => setItems((prev) => prev.slice(0, 1))}>
            縮める
          </button>
          <Modal.Root open onOpenChange={noop}>
            <Modal.Body>
              <Modal.Gallery label="写真" items={items} onIndexChange={onIndexChange} />
            </Modal.Body>
          </Modal.Root>
        </>
      );
    }
    render(<Harness />);
    return { shrink: () => fireEvent.click(screen.getByRole('button', { name: '縮める' })) };
  }

  it('onIndexChange はマウントしただけでは鳴らない', () => {
    const onIndexChange = vi.fn();
    gallery(onIndexChange);
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it('位置が動いたら onIndexChange が鳴る', () => {
    const onIndexChange = vi.fn();
    gallery(onIndexChange);
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it('items が縮んで位置が切り詰められたら onIndexChange が鳴る', () => {
    const onIndexChange = vi.fn();
    const view = gallery(onIndexChange);
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    onIndexChange.mockClear();
    view.shrink();
    expect(onIndexChange).toHaveBeenCalledWith(0);
  });

  it('onDetentChange もマウントしただけでは鳴らない', () => {
    const onDetentChange = vi.fn();
    const detents: readonly DetentToken[] = ['peek', 'half', 'full'];
    render(
      <Modal.Root
        open
        onOpenChange={noop}
        placement="sheet"
        detents={detents}
        defaultDetent="half"
        onDetentChange={onDetentChange}
      >
        <Modal.Handle />
        <Modal.Body>本文</Modal.Body>
      </Modal.Root>,
    );
    expect(onDetentChange).not.toHaveBeenCalled();
  });

  it('同じ段に留まる操作では onDetentChange が鳴らない', () => {
    const onDetentChange = vi.fn();
    const detents: readonly DetentToken[] = ['peek', 'half', 'full'];
    render(
      <Modal.Root
        open
        onOpenChange={noop}
        placement="sheet"
        detents={detents}
        defaultDetent="full"
        onDetentChange={onDetentChange}
      >
        <Modal.Handle />
        <Modal.Body>本文</Modal.Body>
      </Modal.Root>,
    );
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' });
    expect(onDetentChange).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowDown' });
    expect(onDetentChange).toHaveBeenCalledWith('half');
  });
});

/* -------------------------------------------------------------------------- */
/* D-11  Modal.Button の例外と、その穴                                         */
/* -------------------------------------------------------------------------- */

describe('D-11 Modal.Button は生のまま通すが、予約名だけは守る', () => {
  it('予約みの data-* は無視して警告する', () => {
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" data-variant="hacked">
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    expect(screen.getByRole('button', { name: '送信' })).toHaveAttribute(
      'data-variant',
      'primary',
    );
    expect(warnings().join('\n')).toContain('data-variant');
  });

  it('予約外の data-* と aria-* はそのまま通す', () => {
    // Modal.Button だけは ButtonHTMLAttributes を受ける。
    // aria-label / form / name を正当に使う場面があるため。
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" data-testid="ok" aria-keyshortcuts="Enter">
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    const button = screen.getByTestId('ok');
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Enter');
    expect(warnings().join('\n')).not.toContain('data-testid');
  });
});

/* -------------------------------------------------------------------------- */
/* 境界値                                                                      */
/* -------------------------------------------------------------------------- */

describe('リスト props の境界値', () => {
  it('Modal.Gallery は items が空になっても落ちない', () => {
    function Harness(): ReactNode {
      const [items, setItems] = useState([{ id: 'a', content: <p>1</p> }]);
      return (
        <>
          <button type="button" onClick={() => setItems([])}>
            空に
          </button>
          <Modal.Root open onOpenChange={noop}>
            <Modal.Body>
              <Modal.Gallery label="写真" items={items} />
            </Modal.Body>
          </Modal.Root>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '空に' }));
    expect(screen.queryByRole('group', { name: '写真' })).toBeNull();
  });

  it('Modal.Chips は options が空でも落ちない', () => {
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Chips label="ジャンル" options={[]} value={[]} onChange={noop} />
        </Modal.Body>
      ),
    });
    expect(screen.getByRole('group', { name: 'ジャンル' })).toBeInTheDocument();
  });
});
