/* 一時的な調査用。確認が済んだら消す。 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from '../src';
import { renderModal } from './utils';

const noop = (): void => {};

describe('probe', () => {
  /* A. 制御 loading と内部 pending の混在 */
  it('A: loading={false} を渡しても onAction の二重送信は防がれる', async () => {
    const action = vi.fn(() => new Promise<void>(() => {}));
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" loading={false} onAction={action}>
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    const btn = screen.getByRole('button', { name: '送信' });
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('A2: loading={true} は内部 pending が無くても busy になる', () => {
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

  /* C. Gallery の id 重複 */
  it('C: Gallery の id 重複は開発時に警告する', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
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
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('id'));
    warn.mockRestore();
  });

  /* D. Gallery の初回通知 */
  it('D: onIndexChange はマウント時には呼ばれない', () => {
    const onIndexChange = vi.fn();
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Gallery
            label="写真"
            items={[
              { id: 'a', content: <p>1</p> },
              { id: 'b', content: <p>2</p> },
            ]}
            onIndexChange={onIndexChange}
          />
        </Modal.Body>
      ),
    });
    expect(onIndexChange).not.toHaveBeenCalled();
  });

  it('D2: 位置が動いたら onIndexChange が呼ばれる', () => {
    const onIndexChange = vi.fn();
    renderModal({
      children: (
        <Modal.Body>
          <Modal.Gallery
            label="写真"
            items={[
              { id: 'a', content: <p>1</p> },
              { id: 'b', content: <p>2</p> },
            ]}
            onIndexChange={onIndexChange}
          />
        </Modal.Body>
      ),
    });
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  /* E. Chips の value 重複 */
  it('E: Chips の option.value 重複は開発時に警告する', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
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
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('value'));
    warn.mockRestore();
  });

  /* F. Button の予約 data-* に警告が無い */
  it('F: Modal.Button の予約 data-* も警告する', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
    renderModal({
      children: (
        <Modal.Footer>
          <Modal.Button variant="primary" data-variant="hacked">
            送信
          </Modal.Button>
        </Modal.Footer>
      ),
    });
    expect(screen.getByRole('button', { name: '送信' })).toHaveAttribute('data-variant', 'primary');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('data-variant'));
    warn.mockRestore();
  });

  /* G. Gallery の items が空になったとき */
  it('G: items が空になっても落ちない', () => {
    function Harness(): React.ReactNode {
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

  /* H. onAction が reject しても pending が解ける */
  it('H: onAction が reject しても再度押せる', async () => {
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
    const btn = screen.getByRole('button', { name: '送信' });
    fireEvent.click(btn);
    await waitFor(() => expect(btn).not.toHaveAttribute('aria-busy'));
    fireEvent.click(btn);
    expect(action).toHaveBeenCalledTimes(2);
    error.mockRestore();
  });
});
