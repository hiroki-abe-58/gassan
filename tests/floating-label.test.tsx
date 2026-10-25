/**
 * 浮くラベル（I-24）。
 *
 * ラベルが浮くか休むかは、styles.css の規則が入力欄のフォーカスと値（:focus・:placeholder-shown・:autofill）から決める。
 * ここではその規則のセレクタを styles.css から読み、jsdom の要素に当てて判定する。jsdom は :has() と :focus を
 * 判定できるが、:placeholder-shown は値を見ずに真を返すので、HTML の定義（プレースホルダがあり、値が空）どおりに
 * 属性で補ってから当てる。位置・大きさ・動き・テーマ・強制カラーは、ヘッドレス Chrome で確かめる（VERIFICATION.md）。
 */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { useState, type ReactNode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Field, Input, Modal, PasswordInput } from '../src';
import { renderModal } from './utils';

afterEach(() => {
  vi.restoreAllMocks();
});

const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** styles.css から、セレクタに part を含み、宣言が body に当てはまる規則のセレクタを取る。 */
function selectorOf(part: string, body: RegExp): string {
  for (const [, selector = '', declarations = ''] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (selector.includes(part) && body.test(declarations)) return selector.trim();
  }
  throw new Error(`styles.css に ${part} の規則が無い`);
}

/** ラベルを入力欄に重ねる規則 */
const LAYOUT = selectorOf('.g-float', /position:\s*absolute/);
/** ラベルを中央に休ませる規則 */
const REST = selectorOf(':placeholder-shown', /scale:\s*1;/);
/** 使えない間、枠とラベルを一緒に薄くする規則 */
const DIMMED = selectorOf('.g-float', /opacity:\s*0\.55/);
/** 後ろの飾りのぶん、ラベルを短くする規則 */
const END = selectorOf('.g-float', /--g-float-end:\s*2\.5rem/);

/** :placeholder-shown を HTML の定義（プレースホルダがあり、値が空）で補ってから、規則のセレクタを当てる。 */
function matches(element: Element, selector: string): boolean {
  for (const input of document.querySelectorAll('input')) {
    input.toggleAttribute('data-test-placeholder-shown', input.placeholder !== '' && input.value === '');
  }
  return element.matches(selector.replaceAll(':placeholder-shown', '[data-test-placeholder-shown]'));
}
const floats = (label: Element): boolean => matches(label, LAYOUT) && !matches(label, REST);
const rests = (label: Element): boolean => matches(label, LAYOUT) && matches(label, REST);
const labels = (): HTMLLabelElement[] => [...document.querySelectorAll<HTMLLabelElement>('.g-float > .g-label')];
const label = (index = 0): HTMLLabelElement => {
  const found = labels()[index];
  if (!found) throw new Error(`浮くラベルの ${String(index)} 番目が無い`);
  return found;
};

describe('浮くラベル / I-24', () => {
  it('初めは空でフォーカスが無いので、ラベルは入力欄の中央に休む。ラベルは本物の label で、入力欄の名前になる', () => {
    render(
      <Field label="メールまたは電話番号" labelPlacement="floating">
        {(control) => <Input {...control} autoComplete="username" />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: /^メールまたは電話番号/ });
    expect(label().tagName).toBe('LABEL');
    expect(label()).toHaveAttribute('for', input.id);
    expect(input).toHaveAttribute('placeholder', ' ');
    expect(document.querySelector('.g-field')).toHaveAttribute('data-label-placement', 'floating');
    expect(rests(label())).toBe(true);
  });

  it('フォーカスで浮き、空のまま外すと休む。打ってから外すと浮いたまま残り、フォーカス中に消しても浮いている', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field label="メールまたは電話番号" labelPlacement="floating">
          {(control) => <Input {...control} />}
        </Field>
        <button type="button">次へ</button>
      </>,
    );
    const input = screen.getByRole('textbox', { name: /^メールまたは電話番号/ });
    await user.click(input);
    expect(floats(label())).toBe(true);
    await user.tab();
    expect(rests(label())).toBe(true);
    await user.click(input);
    await user.keyboard('hana@example.com');
    await user.tab();
    expect(input).toHaveValue('hana@example.com');
    expect(floats(label())).toBe(true);
    await user.clear(input);
    expect(input).toHaveFocus();
    expect(floats(label())).toBe(true);
    await user.tab();
    expect(rests(label())).toBe(true);
    // 動きの間も名前は変わらない
    expect(screen.getByRole('textbox', { name: /^メールまたは電話番号/ })).toBe(input);
  });

  it('ラベルを押すと入力欄にフォーカスが移る。id を渡せば入力欄の id になり、ラベルの for もそれを指す', async () => {
    const user = userEvent.setup();
    render(
      <Field id="account" label="アカウント" labelPlacement="floating">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: /^アカウント/ });
    expect(input).toHaveAttribute('id', 'account');
    expect(label()).toHaveAttribute('for', 'account');
    await user.click(label());
    expect(input).toHaveFocus();
    expect(floats(label())).toBe(true);
  });

  it('制御された value が外から変わっても、見えている値に合わせて浮く・休む。利用側の onChange はそのまま呼ばれる', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled(): ReactNode {
      const [value, setValue] = useState('');
      return (
        <>
          <Field label="名前" labelPlacement="floating">
            {(control) => (
              <Input
                {...control}
                value={value}
                onChange={(event) => {
                  onChange(event.target.value);
                  setValue(event.target.value);
                }}
              />
            )}
          </Field>
          <button type="button" onClick={() => setValue('佐藤 葵')}>
            入れる
          </button>
          <button type="button" onClick={() => setValue('')}>
            空にする
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(rests(label())).toBe(true);
    await user.click(screen.getByRole('button', { name: '入れる' }));
    expect(screen.getByRole('textbox', { name: /^名前/ })).toHaveValue('佐藤 葵');
    expect(floats(label())).toBe(true);
    await user.click(screen.getByRole('button', { name: '空にする' }));
    expect(rests(label())).toBe(true);
    await user.type(screen.getByRole('textbox', { name: /^名前/ }), 'a');
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('非制御では defaultValue があれば初めから浮く。form.reset() で空や最初の値に戻ると、ラベルもそれに合わせる', async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="プロフィール">
        <Field label="表示名" labelPlacement="floating">
          {(control) => <Input {...control} name="name" defaultValue="佐藤 葵" />}
        </Field>
        <Field label="メモ" labelPlacement="floating">
          {(control) => <Input {...control} name="memo" />}
        </Field>
      </form>,
    );
    const name = screen.getByRole('textbox', { name: /^表示名/ });
    const memo = screen.getByRole('textbox', { name: /^メモ/ });
    expect(floats(label(0))).toBe(true);
    expect(rests(label(1))).toBe(true);
    await user.type(memo, '下書き');
    await user.clear(name);
    await user.click(document.body);
    expect(rests(label(0))).toBe(true);
    expect(floats(label(1))).toBe(true);
    act(() => screen.getByRole<HTMLFormElement>('form', { name: 'プロフィール' }).reset());
    expect(name).toHaveValue('佐藤 葵');
    expect(memo).toHaveValue('');
    expect(floats(label(0))).toBe(true);
    expect(rests(label(1))).toBe(true);
  });

  it('使えない欄は名前と値を保ち、枠とラベルを一緒に薄くする。読み取り専用の欄は、フォーカスと値でふつうに浮く', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field label="ワークスペースの URL" labelPlacement="floating">
          {(control) => <Input {...control} defaultValue="atlas-design" disabled />}
        </Field>
        <Field label="招待コード" labelPlacement="floating">
          {(control) => <Input {...control} readOnly />}
        </Field>
        <button type="button">次へ</button>
      </>,
    );
    const disabled = screen.getByRole('textbox', { name: /^ワークスペースの URL/ });
    expect(disabled).toBeDisabled();
    expect(floats(label(0))).toBe(true);
    expect(matches(label(0).parentElement as Element, DIMMED)).toBe(true);
    const readOnly = screen.getByRole('textbox', { name: /^招待コード/ });
    expect(rests(label(1))).toBe(true);
    expect(matches(label(1).parentElement as Element, DIMMED)).toBe(false);
    await user.click(readOnly);
    expect(floats(label(1))).toBe(true);
    await user.tab();
    expect(rests(label(1))).toBe(true);
  });

  it('パスワード: 表示を切り替えても名前と空白のプレースホルダは残り、ラベルは表示の切替の上に伸ばさない', async () => {
    const user = userEvent.setup();
    render(
      <Field label="パスワード" labelPlacement="floating">
        {(control) => <PasswordInput {...control} autoComplete="current-password" />}
      </Field>,
    );
    const input = label().control as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'password');
    expect(rests(label())).toBe(true);
    const toggle = screen.getByRole('button', { name: 'パスワードを表示' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('textbox', { name: /^パスワード/ })).toBe(input);
    expect(input).toHaveAttribute('placeholder', ' ');
    expect(matches(label().parentElement as Element, END)).toBe(true);
  });

  it('help と error は欄の下に置き、aria-describedby・aria-invalid・aria-required の配線は上のラベルと同じ。ライブリージョンは足さない', () => {
    render(
      <Field label="メールアドレス" labelPlacement="floating" required help="仕事用のアドレス" error="@ を含めてください">
        {(control) => <Input {...control} type="email" />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: /^メールアドレス/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAccessibleDescription('仕事用のアドレス @ を含めてください');
    const field = document.querySelector('.g-field') as HTMLElement;
    expect(field.querySelector(':scope > .g-float + .g-help + .g-error')).not.toBeNull();
    expect(field.querySelector('[role="alert"], [role="status"], [aria-live]')).toBeNull();
  });

  it('渡したプレースホルダはそのまま使い、ラベルが休んでいる間（フォーカスが無いとき）は見せない', () => {
    render(
      <Field label="メールアドレス" labelPlacement="floating">
        {(control) => <Input {...control} placeholder="aoi@example.com" />}
      </Field>,
    );
    expect(screen.getByRole('textbox', { name: /^メールアドレス/ })).toHaveAttribute('placeholder', 'aoi@example.com');
    expect(css).toMatch(/\.g-bare:not\(:focus\)::placeholder\s*\{\s*opacity:\s*0;/);
  });

  it('重ねられない部品（前に飾りのある Input、select など）は、上のラベルの形で出る', () => {
    render(
      <>
        <Field label="金額" labelPlacement="floating">
          {(control) => <Input {...control} start="¥" />}
        </Field>
        <Field label="国" labelPlacement="floating">
          {(control) => (
            <select {...control}>
              <option>日本</option>
            </select>
          )}
        </Field>
      </>,
    );
    expect(screen.getByRole('textbox', { name: /^金額/ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^国/ })).toBeInTheDocument();
    for (const each of labels()) expect(matches(each, LAYOUT)).toBe(false);
  });

  it('既定（labelPlacement を渡さないか "top"）は従来の形のまま。器も data-* も空白のプレースホルダも足さない', () => {
    render(
      <Field label="表示名">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const field = document.querySelector('.g-field') as HTMLElement;
    expect(field).not.toHaveAttribute('data-label-placement');
    expect(field.querySelector('.g-float')).toBeNull();
    expect(field.firstElementChild?.tagName).toBe('LABEL');
    expect(field.children[1]).toHaveClass('g-input');
    expect(screen.getByRole('textbox', { name: /^表示名/ })).not.toHaveAttribute('placeholder');
    const top = renderToString(
      <Field id="x" label="表示名" labelPlacement="top">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const omitted = renderToString(
      <Field id="x" label="表示名">
        {(control) => <Input {...control} />}
      </Field>,
    );
    expect(top).toBe(omitted);
  });

  it('サーバーで描いた形のまま hydration でき、初期値があれば最初の描画から浮いている', async () => {
    const app = (
      <Field id="name" label="表示名" labelPlacement="floating">
        {(control) => <Input {...control} defaultValue="佐藤 葵" />}
      </Field>
    );
    const html = renderToString(app);
    expect(html).toContain('data-label-placement="floating"');
    expect(html).toContain('placeholder=" "');
    expect(html).toContain('value="佐藤 葵"');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onRecoverableError = vi.fn();
    const root = await act(async () => hydrateRoot(container, app, { onRecoverableError }));
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(floats(label())).toBe(true);
    act(() => root.unmount());
    container.remove();
  });

  it('モーダルの中でも Modal.Field に同じ指定で使える', async () => {
    const user = userEvent.setup();
    renderModal({
      children: (
        <>
          <Modal.Header>
            <Modal.Title>サインイン</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Modal.Field label="パスワード" labelPlacement="floating">
              {(control) => <Modal.PasswordInput {...control} />}
            </Modal.Field>
          </Modal.Body>
        </>
      ),
    });
    const input = label().control as HTMLInputElement;
    expect(input.closest('dialog')).not.toBeNull();
    expect(rests(label())).toBe(true);
    await user.click(input);
    expect(floats(label())).toBe(true);
  });

  it('動きは位置と大きさだけで、時間は --g-dur-fast、曲線は行き過ぎない --g-ease-settle（expressive でもバネにしない）', () => {
    const body = css.slice(css.indexOf(`${LAYOUT} {`));
    const declarations = body.slice(0, body.indexOf('}'));
    expect(declarations).toMatch(/translate var\(--g-dur-fast\) var\(--g-ease-settle\)/);
    expect(declarations).toMatch(/scale var\(--g-dur-fast\) var\(--g-ease-settle\)/);
    expect(declarations).toMatch(/pointer-events:\s*none/);
    expect(declarations).not.toMatch(/--g-ease-move|--g-ease-spring/);
  });
});
