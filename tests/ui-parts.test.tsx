/**
 * ページの上の部品（U-01〜U-16）と、フォーム部品の中立の名前。
 *
 * 見た目（トーンの地の色・押した手応え・骨組みの光）は CSS の不変条件として tokens.test.ts で、
 * 実際の描画はヘッドレス Chrome で確かめる。ここでは役割・名前・状態・受け渡しを見る。
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as gassan from '../src';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Banner,
  Button,
  ButtonLink,
  Card,
  CopyButton,
  DescriptionList,
  Divider,
  EmptyState,
  IconButton,
  Kbd,
  Progress,
  Skeleton,
  Spinner,
  Stat,
  Timeline,
} from '../src';
import * as buttons from '../src/button';
import * as display from '../src/display';
import * as feedback from '../src/feedback';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** クリップボードを差し替える（jsdom には無い）。 */
function mockClipboard(writeText: (text: string) => Promise<void>): void {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
}

describe('ボタン / U-01〜U-03', () => {
  it('Button は既定で secondary の button。onAction の間は押せず、名前を消さずに「処理中」を説明に足す', async () => {
    const user = userEvent.setup();
    let finish: () => void = () => undefined;
    const onAction = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(
      <Button variant="primary" size="sm" onAction={onAction}>
        保存
      </Button>,
    );
    const button = screen.getByRole('button', { name: '保存' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'sm');
    await user.click(button);
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAccessibleName('保存');
    expect(button).toHaveAccessibleDescription('処理中');
    await user.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish();
      await Promise.resolve();
    });
    expect(button).not.toHaveAttribute('aria-busy');
    render(<Button>既定</Button>);
    expect(screen.getByRole('button', { name: '既定' })).toHaveAttribute('data-variant', 'secondary');
  });

  it('ButtonLink はボタンの見た目のリンクで、役割はリンクのまま。印は文字の外に置く', () => {
    render(
      <ButtonLink href="/pricing" variant="primary" block iconEnd={<svg aria-hidden="true" data-testid="end" />}>
        料金を見る
      </ButtonLink>,
    );
    const link = screen.getByRole('link', { name: '料金を見る' });
    expect(link).toHaveAttribute('href', '/pricing');
    expect(link).toHaveClass('g-btn');
    expect(link).toHaveAttribute('data-block');
    expect(link.querySelector('.g-btn-label')?.contains(screen.getByTestId('end'))).toBe(false);
  });

  it('IconButton は label を読み上げ名にする（印だけのボタンに名前を付け忘れない）', () => {
    render(
      <IconButton label="設定を開く" variant="tonal" size="sm">
        <svg aria-hidden="true" />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: '設定を開く' });
    expect(button).toHaveAttribute('data-variant', 'tonal');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('CopyButton は写したら「コピーしました」を読み上げて印を替え、2 秒で戻す。写せなければそう伝える', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const writeText = vi.fn(() => Promise.resolve());
    mockClipboard(writeText);
    const onCopy = vi.fn();
    const onError = vi.fn();
    const { container } = render(<CopyButton value={() => 'https://example.com/invite/abc'} label="招待リンクをコピー" onCopy={onCopy} />);
    const button = screen.getByRole('button', { name: '招待リンクをコピー' });
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });
    expect(writeText).toHaveBeenCalledWith('https://example.com/invite/abc');
    expect(onCopy).toHaveBeenCalledWith('https://example.com/invite/abc');
    expect(screen.getByRole('status')).toHaveTextContent('コピーしました');
    expect(container.querySelector('.g-copy')).toHaveAttribute('data-state', 'copied');
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('status')).toHaveTextContent('');

    mockClipboard(() => Promise.reject(new Error('denied')));
    render(<CopyButton value="x" onError={onError} />);
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'コピー' })[0] as HTMLElement);
      await Promise.resolve();
    });
    expect(onError).toHaveBeenCalled();
    expect(screen.getAllByRole('status')[1]).toHaveTextContent('コピーできませんでした');
  });
});

describe('印と人 / U-04・U-05・U-09', () => {
  it('Badge は語とトーンを持ち、点は飾り', () => {
    render(
      <Badge tone="success" dot>
        公開中
      </Badge>,
    );
    const badge = screen.getByText('公開中').closest('.g-badge') as HTMLElement;
    expect(badge).toHaveAttribute('data-tone', 'success');
    expect(badge.querySelector('.g-badge-dot')).toHaveAttribute('aria-hidden', 'true');
  });

  it('Avatar は名前を読み上げ名にし、画像は飾り。画像が無い・読めないときは頭文字を出す', () => {
    render(
      <>
        <Avatar name="Hiroki Abe" />
        <Avatar name="阿部 浩樹" src="/me.png" />
      </>,
    );
    expect(screen.getByRole('img', { name: 'Hiroki Abe' })).toHaveTextContent('HA');
    const withImage = screen.getByRole('img', { name: '阿部 浩樹' });
    const image = withImage.querySelector('img') as HTMLImageElement;
    expect(image).toHaveAttribute('alt', '');
    fireEvent.error(image);
    expect(withImage.querySelector('img')).toBeNull();
    expect(withImage).toHaveTextContent('阿');
  });

  it('AvatarGroup は max を超えた分を「+2」にまとめ、「ほか2人」と読み上げる', () => {
    render(
      <AvatarGroup label="担当者" max={2} size="sm">
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
        <Avatar name="D" />
      </AvatarGroup>,
    );
    const group = screen.getByRole('group', { name: '担当者' });
    expect(within(group).getAllByRole('img')).toHaveLength(3);
    expect(within(group).getByRole('img', { name: 'ほか2人' })).toHaveTextContent('+2');
  });

  it('Kbd は kbd 要素', () => {
    render(<Kbd>Esc</Kbd>);
    expect(screen.getByText('Esc').tagName).toBe('KBD');
  });
});

describe('進み具合と読み込み / U-06〜U-08', () => {
  it('Progress は名前と値（aria-valuenow / aria-valuetext）を持つ。値が無いときは indeterminate で、範囲の外は端へ寄せる', () => {
    render(
      <>
        <Progress label="アップロード" value={45} />
        <Progress label="保存容量" value={140} max={100} valueText={(value, max) => `${String(value)} / ${String(max)} GB`} />
        <Progress label="準備中" />
      </>,
    );
    const upload = screen.getByRole('progressbar', { name: 'アップロード' });
    expect(upload).toHaveAttribute('aria-valuenow', '45');
    expect(upload).toHaveAttribute('aria-valuetext', '45%');
    const storage = screen.getByRole('progressbar', { name: '保存容量' });
    expect(storage).toHaveAttribute('aria-valuenow', '100');
    expect(storage).toHaveAttribute('aria-valuetext', '100 / 100 GB');
    const pending = screen.getByRole('progressbar', { name: '準備中' });
    expect(pending).not.toHaveAttribute('aria-valuenow');
    expect(pending).toHaveAttribute('data-indeterminate');
  });

  it('Spinner は role="status" で「処理中」（または渡した語）を読み上げ、回る輪は飾り', () => {
    render(
      <>
        <Spinner />
        <Spinner label="同期しています" size="lg" />
      </>,
    );
    const [plain, custom] = screen.getAllByRole('status') as [HTMLElement, HTMLElement];
    expect(plain).toHaveTextContent('処理中');
    expect(custom).toHaveTextContent('同期しています');
    expect(custom.querySelector('.g-spinner-ring')).toHaveAttribute('aria-hidden', 'true');
  });

  it('Skeleton は飾り（aria-hidden）。text の lines は行を並べ、最後の行を短くする', () => {
    const { container } = render(
      <>
        <Skeleton lines={3} width={240} />
        <Skeleton shape="circle" />
      </>,
    );
    const lines = container.querySelector('.g-skeleton-lines') as HTMLElement;
    expect(lines).toHaveAttribute('aria-hidden', 'true');
    const bars = lines.querySelectorAll<HTMLElement>('.g-skeleton');
    expect(bars).toHaveLength(3);
    expect(bars[0]?.style.inlineSize).toBe('240px');
    expect(bars[2]?.style.inlineSize).toBe('62%');
    expect(container.querySelector('[data-shape="circle"]')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('区切りとまとまり / U-10〜U-15', () => {
  it('Divider は横なら hr、縦なら aria-orientation を持つ separator。語を添えたら separator にせず、語を読ませる', () => {
    render(
      <>
        <Divider />
        <Divider orientation="vertical" />
        <Divider label="または" />
      </>,
    );
    const separators = screen.getAllByRole('separator');
    expect(separators).toHaveLength(2);
    expect(separators[0]?.tagName).toBe('HR');
    expect(separators[1]).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByText('または').closest('[role="separator"]')).toBeNull();
  });

  it('Card は見出しを名前にした region。href を渡すと見出しがリンクになり、操作は別に押せる', () => {
    render(
      <Card title="請求" description="次回の請求は 11 月 1 日" href="/billing" actions={<button type="button">編集</button>}>
        カードの末尾 4242
      </Card>,
    );
    const region = screen.getByRole('region', { name: '請求' });
    expect(within(region).getByRole('heading', { level: 3, name: '請求' })).toBeInTheDocument();
    expect(within(region).getByRole('link', { name: '請求' })).toHaveAttribute('href', '/billing');
    expect(within(region).getByRole('button', { name: '編集' })).toBeInTheDocument();
    expect(region).toHaveAttribute('data-link');
  });

  it('Stat は名前と値の dl。差の色は良し悪しで決め（下がるのが良い数もある）、向きは矢印と符号でも示す', () => {
    const { container } = render(
      <>
        <Stat label="解約率" value="2.1%" delta="−0.4pt" trend="down" goodWhen="down" description="前月比" />
        <Stat label="売上" value="¥1,240,000" delta="+12%" trend="up" />
        <Stat label="応答時間" value="182ms" delta="−8%" trend="down" />
      </>,
    );
    const [churn, sales, latency] = container.querySelectorAll('dl.g-stat');
    expect(churn?.querySelector('dt')).toHaveTextContent('解約率');
    expect(churn?.querySelector('dd.g-stat-value')).toHaveTextContent('2.1%');
    expect(churn?.querySelector('.g-stat-delta')).toHaveAttribute('data-quality', 'good');
    expect(sales?.querySelector('.g-stat-delta')).toHaveAttribute('data-quality', 'good');
    expect(latency?.querySelector('.g-stat-delta')).toHaveAttribute('data-quality', 'bad');
    expect(churn?.querySelector('.g-stat-arrow')).toHaveAttribute('aria-hidden', 'true');
    expect(churn?.querySelector('.g-stat-delta')).toHaveTextContent('−0.4pt前月比');
  });

  it('EmptyState は何が無いかを見出しにし、次の一歩を添える（見出しの段は変えられる）', () => {
    render(
      <>
        <EmptyState title="まだプロジェクトがありません" description="最初のプロジェクトを作りましょう。" actions={<button type="button">作る</button>} />
        <EmptyState title="一致する結果がありません" headingLevel={3} />
      </>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'まだプロジェクトがありません' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: '一致する結果がありません' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '作る' })).toBeInTheDocument();
  });

  it('DescriptionList は dt / dd の組で書く', () => {
    const { container } = render(
      <DescriptionList
        layout="stacked"
        items={[
          { term: 'プラン', details: 'Pro' },
          { term: '請求先', details: 'billing@example.com' },
        ]}
      />,
    );
    const list = container.querySelector('dl.g-dl') as HTMLElement;
    expect(list).toHaveAttribute('data-layout', 'stacked');
    expect([...list.querySelectorAll('dt')].map((dt) => dt.textContent)).toEqual(['プラン', '請求先']);
    expect([...list.querySelectorAll('dd')].map((dd) => dd.textContent)).toEqual(['Pro', 'billing@example.com']);
  });

  it('Timeline は順序のある一覧で、日時は time 要素（機械が読む値と見せる値を分ける）', () => {
    render(
      <Timeline
        items={[
          { title: '注文を受け付けました', time: '2026-10-21T09:12', timeLabel: '10月21日 9:12', tone: 'success' },
          { title: '発送しました', time: '2026-10-22' },
        ]}
      />,
    );
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    const first = items[0]?.querySelector('time');
    expect(first).toHaveAttribute('datetime', '2026-10-21T09:12');
    expect(first).toHaveTextContent('10月21日 9:12');
    expect(items[1]?.querySelector('time')).toHaveTextContent('2026-10-22');
    expect(items[0]).toHaveAttribute('data-tone', 'success');
  });
});

describe('知らせの帯 / U-16', () => {
  it('Banner は既定では読み上げの領域にならず、live で後から出すときだけ status（error は alert）。× は「閉じる」', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <>
        <Banner title="メンテナンスのお知らせ">10月25日 2:00〜4:00 は停止します。</Banner>
        <Banner tone="error" live onDismiss={onDismiss}>
          支払いに失敗しました
        </Banner>
        <Banner tone="success" live>
          保存しました
        </Banner>
      </>,
    );
    expect(screen.getByText('メンテナンスのお知らせ').closest('.g-banner')).not.toHaveAttribute('role');
    expect(screen.getByRole('alert')).toHaveTextContent('支払いに失敗しました');
    expect(screen.getByRole('status')).toHaveTextContent('保存しました');
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('受け渡しと中立の名前', () => {
  it('ページの上の部品は 1 つ残らず data-* をホスト要素へ渡す', () => {
    const cases: Record<string, () => ReactNode> = {
      Button: () => <Button data-testid="probe">b</Button>,
      ButtonLink: () => (
        <ButtonLink href="#" data-testid="probe">
          l
        </ButtonLink>
      ),
      IconButton: () => (
        <IconButton label="i" data-testid="probe">
          <svg />
        </IconButton>
      ),
      CopyButton: () => <CopyButton value="v" data-testid="probe" />,
      Badge: () => <Badge data-testid="probe">b</Badge>,
      Avatar: () => <Avatar name="a" data-testid="probe" />,
      AvatarGroup: () => (
        <AvatarGroup data-testid="probe">
          <Avatar name="a" />
        </AvatarGroup>
      ),
      Kbd: () => <Kbd data-testid="probe">k</Kbd>,
      Divider: () => <Divider data-testid="probe" />,
      Card: () => <Card data-testid="probe">c</Card>,
      Stat: () => <Stat label="l" value="v" data-testid="probe" />,
      EmptyState: () => <EmptyState title="t" data-testid="probe" />,
      DescriptionList: () => <DescriptionList items={[]} data-testid="probe" />,
      Timeline: () => <Timeline items={[]} data-testid="probe" />,
      Progress: () => <Progress label="p" data-testid="probe" />,
      Spinner: () => <Spinner data-testid="probe" />,
      Skeleton: () => <Skeleton data-testid="probe" />,
      Banner: () => <Banner data-testid="probe">b</Banner>,
    };
    // 部品の一覧を手で書き漏らさないよう、3 つのモジュールが出している部品（大文字で始まる関数）と突き合わせる。
    const exported = [buttons, display, feedback]
      .flatMap((module) => Object.entries(module))
      .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function')
      .map(([name]) => name)
      .sort();
    expect(Object.keys(cases).sort()).toEqual(exported);
    for (const [name, renderCase] of Object.entries(cases)) {
      const { unmount } = render(<>{renderCase()}</>);
      expect(screen.queryByTestId('probe'), name).not.toBeNull();
      unmount();
    }
  });

  it('フォーム部品の中立の名前は、Modal の部品と同じものを指す', () => {
    const pairs: [unknown, unknown][] = [
      [gassan.Field, gassan.ModalField],
      [gassan.Fieldset, gassan.ModalFieldset],
      [gassan.Input, gassan.ModalInput],
      [gassan.PasswordInput, gassan.ModalPasswordInput],
      [gassan.SearchInput, gassan.ModalSearchInput],
      [gassan.Textarea, gassan.ModalTextarea],
      [gassan.NumberField, gassan.ModalNumberField],
      [gassan.CodeInput, gassan.ModalCodeInput],
      [gassan.Checkbox, gassan.ModalCheckbox],
      [gassan.RadioGroup, gassan.ModalRadioGroup],
      [gassan.Segmented, gassan.ModalSegmented],
      [gassan.Rating, gassan.ModalRating],
      [gassan.Slider, gassan.ModalSlider],
      [gassan.RangeSlider, gassan.ModalRangeSlider],
      [gassan.Select, gassan.ModalSelect],
      [gassan.Combobox, gassan.ModalCombobox],
      [gassan.DatePicker, gassan.ModalDatePicker],
      [gassan.DateRangePicker, gassan.ModalDateRangePicker],
      [gassan.Calendar, gassan.ModalCalendar],
      [gassan.RangeCalendar, gassan.ModalRangeCalendar],
      [gassan.TimePicker, gassan.ModalTimePicker],
      [gassan.FileDrop, gassan.ModalFileDrop],
      [gassan.Chips, gassan.ModalChips],
      [gassan.Switch, gassan.ModalSwitch],
      [gassan.Table, gassan.ModalTable],
      [gassan.Alert, gassan.ModalAlert],
      [gassan.Chart, gassan.ModalChart],
    ];
    for (const [neutral, modal] of pairs) expect(neutral).toBe(modal);
    expect(gassan.Input).toBe(gassan.Modal.Input);
  });
});
