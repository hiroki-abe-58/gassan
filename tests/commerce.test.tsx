/**
 * 購入と同意のテンプレート（P-32 注文の最終確認・P-33 Cookie と外部送信の同意・P-34 送信先の一覧・P-35 解約の手続き）。
 *
 * 形（右の列の金額・画面の下の帯）は templates.css なので、ヘッドレス Chrome で確かめる。ここでは見出しの並び
 * （特商法の表示事項）・金額の計算・同意の扱い・ボタンの重さ・手順の移り方とフォーカス・渡す値を見る。
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { CancelSubscriptionPage, CookieConsent, ExternalTransmissionList, OrderReviewPage, SiteProvider, type OrderReviewPageProps } from '../src';

const LINKS = { home: '/', privacy: '/privacy' };

function Site({ children }: { children: ReactNode }): ReactNode {
  return (
    <SiteProvider name="Atlas" links={LINKS}>
      {children}
    </SiteProvider>
  );
}

const renderInSite = (node: ReactNode) => render(<Site>{node}</Site>);

const ORDER: OrderReviewPageProps = {
  items: [
    { name: 'コーヒー豆 200g', options: '中煎り', quantity: 2, unit: '袋', price: 1200 },
    { name: 'ドリッパー', quantity: 1, price: 3000 },
  ],
  shippingFee: 0,
  fees: [{ label: '代金引換の手数料', amount: 330 }],
  discounts: [{ label: 'はじめてのクーポン', amount: 500 }],
  shippingAddress: ['佐藤 花', '〒100-0001 東京都千代田区千代田 1-1', '090-1234-5678'],
  delivery: { method: '宅配便', timing: 'ご注文から 2〜4 日でお届け' },
  payment: { method: '代金引換', timing: '商品のお受け取りのとき' },
  offerPeriod: '2026年11月30日 23:59 まで',
  cancellationPolicy: '商品の到着から 8 日以内なら、未開封のものに限り返品できます。送料はお客様の負担です。',
  subscription: { interval: '毎月', pricePerDelivery: 2400, howToCancel: '次のお届けの 7 日前までに、マイページから' },
  onSubmit: () => undefined,
};

describe('注文の最終確認 / P-32', () => {
  it('P-32 最終確認画面は特商法 12 条の 6 の表示事項を見出しのある節に並べ、まだ注文が確定していないことを伝える', () => {
    renderInSite(<OrderReviewPage {...ORDER} />);
    expect(screen.getByRole('heading', { level: 1, name: 'ご注文内容の確認' })).toBeInTheDocument();
    expect(document.querySelector('.g-page-header')).toHaveTextContent('まだ注文は確定していません。内容を確かめて「注文を確定する」を押してください。');
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'ご注文の商品',
      'お届け先',
      'お届けの方法と時期',
      'お支払いの方法と時期',
      'お申し込みの期間',
      '定期購入の条件',
      '返品・キャンセル',
      'お支払い金額',
    ]);
    // 分量（数量と単位）と、行の金額
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(within(rows[1] as HTMLElement).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['2 袋', '￥2,400']);
    expect(within(rows[2] as HTMLElement).getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['1 点', '￥3,000']);
    // 合計は 5,400 + 送料 0 + 手数料 330 − 割引 500。送料の 0 は「無料」と書く
    const summary = screen.getByRole('region', { name: 'お支払い金額' });
    expect(within(summary).getByText('無料')).toBeInTheDocument();
    expect(within(summary).getByText('-￥500')).toBeInTheDocument();
    expect(summary.querySelector('.g-order-total')).toHaveTextContent('合計（税込）￥5,230');
    // 定期購入は回数の約束が無ければそう書く
    expect(screen.getByRole('region', { name: '定期購入の条件' })).toHaveTextContent('お約束の回数なし（いつでも解約できます）');
    expect(screen.getByRole('button', { name: '注文を確定する' })).toHaveAttribute('type', 'submit');
  });

  it('P-32 同意の文を渡すと、チェックを入れるまで注文を確定しない。「変更」は欄の名前を含み、欄の種類を渡す', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onEdit = vi.fn();
    renderInSite(<OrderReviewPage {...ORDER} consent="利用規約に同意する" onSubmit={onSubmit} onEdit={onEdit} />);
    await user.click(screen.getByRole('button', { name: '注文を確定する' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: '利用規約に同意する' })).toHaveAccessibleDescription('注文の前に、同意の欄にチェックを入れてください');
    await user.click(screen.getByRole('checkbox', { name: '利用規約に同意する' }));
    await user.click(screen.getByRole('button', { name: '注文を確定する' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'お届け先を変更' }));
    expect(onEdit).toHaveBeenLastCalledWith('address');
    // 期間や返品の条件は変えられないので「変更」を出さない
    expect(screen.queryByRole('button', { name: '返品・キャンセルを変更' })).toBeNull();
  });
});

describe('Cookie と外部送信の同意 / P-33 P-34', () => {
  it('P-33 帯は選ぶまで出し、「すべて許可する」と「必要なものだけ」は同じ見た目。設定の窓は種類ごとのスイッチで選ぶ', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = renderInSite(<CookieConsent value={null} onChange={onChange} />);
    const banner = screen.getByRole('region', { name: 'Cookie と外部への送信' });
    expect(within(banner).getByRole('link', { name: '送信先の一覧' })).toHaveAttribute('href', '/privacy');
    const accept = within(banner).getByRole('button', { name: 'すべて許可する' });
    const reject = within(banner).getByRole('button', { name: '必要なものだけ' });
    expect(accept.dataset.variant).toBe(reject.dataset.variant);
    await user.click(reject);
    expect(onChange).toHaveBeenLastCalledWith({ functional: false, analytics: false, marketing: false });

    await user.click(within(banner).getByRole('button', { name: '設定を選ぶ' }));
    const dialog = screen.getByRole('dialog', { name: 'Cookie と外部送信の設定' });
    // 必要なものは「常に有効」で、スイッチを出さない
    expect(within(dialog).getAllByRole('switch').map((toggle) => toggle.textContent)).toEqual(['機能', '分析', '広告']);
    expect(within(dialog).getByText('常に有効')).toBeInTheDocument();
    const analytics = within(dialog).getByRole('switch', { name: '分析' });
    expect(analytics).toHaveAccessibleDescription('どのページがよく見られているかを集計して、サイトの改善に使います。');
    await user.click(analytics);
    await user.click(within(dialog).getByRole('button', { name: '選んだ設定を保存' }));
    expect(onChange).toHaveBeenLastCalledWith({ functional: false, analytics: true, marketing: false });

    // 選んだ後は帯を出さない
    rerender(
      <Site>
        <CookieConsent value={{ functional: false, analytics: true, marketing: false }} onChange={onChange} />
      </Site>,
    );
    expect(screen.queryByRole('region', { name: 'Cookie と外部への送信' })).toBeNull();
  });

  it('P-34 送信先の一覧は、送信先ごとに送る情報・目的・種類を並べ、リンクの名前に送信先を含める', () => {
    renderInSite(
      <ExternalTransmissionList
        items={[
          {
            recipient: 'Google LLC',
            service: 'Google Analytics',
            information: '閲覧したページの URL、端末と閲覧ソフトの種類、Cookie の識別子',
            purpose: 'サイトの利用の集計',
            category: 'analytics',
            policyHref: 'https://policies.google.com/privacy',
            optOutHref: 'https://tools.google.com/dlpage/gaoptout',
          },
        ]}
      />,
    );
    const list = screen.getByRole('list', { name: '外部へ送る情報と送信先' });
    const item = within(list).getByRole('listitem');
    expect(within(item).getByRole('heading', { level: 3 })).toHaveTextContent('Google LLCGoogle Analytics');
    const terms = within(item).getAllByRole('term').map((node) => node.textContent);
    const details = within(item).getAllByRole('definition').map((node) => node.textContent);
    expect(Object.fromEntries(terms.map((term, index) => [term, details[index]]))).toEqual({
      送る情報: '閲覧したページの URL、端末と閲覧ソフトの種類、Cookie の識別子',
      使う目的: 'サイトの利用の集計',
      種類: '分析',
    });
    expect(within(item).getByRole('link', { name: 'Google LLC のプライバシーポリシー' })).toHaveAttribute('href', 'https://policies.google.com/privacy');
    expect(within(item).getByRole('link', { name: 'Google LLC への送信を止める' })).toBeInTheDocument();
  });
});

describe('解約の手続き / P-35', () => {
  const REASONS = [
    { value: 'price', label: '料金が高い' },
    { value: 'unused', label: 'あまり使っていない' },
  ];
  const OFFERS = [{ id: 'pause', title: '1 か月だけ止める', description: '料金はかからず、データはそのまま残ります。', action: '1 か月止める' }];

  it('P-35 解約は理由（任意）→ 提案 → 確認の順に進み、答えなくても進める。提案の画面では解約に進む道を同じ重さで出す', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderInSite(
      <CancelSubscriptionPage
        plan={{ name: 'Pro', periodEnd: '2026-11-30' }}
        reasons={REASONS}
        offers={OFFERS}
        onAcceptOffer={vi.fn()}
        onCancel={onCancel}
        onKeep={vi.fn()}
        dataNotice="解約から 30 日後に、データを削除します。"
        exportHref="/settings/export"
      />,
    );
    expect(screen.getByRole('list', { name: '解約の手順' })).toBeInTheDocument();
    // 選択肢の束の名前は見出しを繰り返さない
    expect(screen.getByRole('group', { name: /^理由/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '次へ' }));
    const offerHeading = screen.getByRole('heading', { level: 2, name: '解約の前に、こんな方法もあります' });
    expect(offerHeading).toHaveFocus();
    // 提案を受けるボタンと、解約に進むボタン。提案の画面からも「解約しない」で抜けられる
    expect(screen.getByRole('button', { name: '1 か月止める' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '解約に進む' }).dataset.variant).toBe('primary');
    expect(screen.getByRole('button', { name: '解約しない' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '解約に進む' }));
    expect(screen.getByRole('heading', { level: 2, name: '解約しますか' })).toHaveFocus();
    expect(document.querySelector('.g-cancel-step')).toHaveTextContent('2026年11月30日 までは今のプランのまま使えます。');
    expect(screen.getByRole('link', { name: 'データを書き出す' })).toHaveAttribute('href', '/settings/export');
    await user.click(screen.getByRole('button', { name: '解約する' }));
    expect(onCancel).toHaveBeenCalledWith({});
    expect(screen.getByRole('heading', { level: 2, name: '解約しました' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('2026年11月30日 までは今のプランのまま使えます。確認のメールを送りました。');
  });

  it('P-35 提案を受けると解約せずに終わる。理由とひと言は答えたときだけ渡す', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onAcceptOffer = vi.fn();
    const { unmount } = renderInSite(
      <CancelSubscriptionPage plan={{ name: 'Pro', periodEnd: '2026-11-30' }} reasons={REASONS} offers={OFFERS} onAcceptOffer={onAcceptOffer} onCancel={onCancel} />,
    );
    await user.click(screen.getByRole('button', { name: '次へ' }));
    await user.click(screen.getByRole('button', { name: '1 か月止める' }));
    expect(onAcceptOffer).toHaveBeenCalledWith('pause');
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('解約はしていません。今のプランのまま使えます。');
    unmount();

    renderInSite(<CancelSubscriptionPage plan={{ name: 'Pro', periodEnd: '2026-11-30' }} reasons={REASONS} onCancel={onCancel} onKeep={vi.fn()} />);
    await user.click(screen.getByRole('radio', { name: '料金が高い' }));
    // 答えなくてよい欄なので「任意」の印を名前に含む
    await user.type(screen.getByRole('textbox', { name: /^ほかに伝えたいこと/ }), ' 年額なら続けたい ');
    await user.click(screen.getByRole('button', { name: '次へ' }));
    // どの画面からも「解約しない」で抜けられる
    expect(screen.getByRole('button', { name: '解約しない' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '解約する' }));
    expect(onCancel).toHaveBeenCalledWith({ reason: 'price', comment: '年額なら続けたい' });
  });
});

describe('購入と同意の data-* / D-11', () => {
  it('購入と同意のテンプレートは data-* を外側の要素へ渡す', () => {
    renderInSite(
      <>
        <OrderReviewPage {...ORDER} data-probe="order" />
        <CancelSubscriptionPage plan={{ name: 'Pro', periodEnd: '2026-11-30' }} onCancel={() => undefined} data-probe="cancel" />
        <CookieConsent value={null} onChange={() => undefined} data-probe="consent" />
        <ExternalTransmissionList items={[]} data-probe="transmissions" />
      </>,
    );
    expect([...document.querySelectorAll('[data-probe]')].map((node) => [node.getAttribute('data-probe'), node.className.split(' ')[0]])).toEqual([
      ['order', 'g-order-review'],
      ['cancel', 'g-cancel-flow'],
      ['consent', 'g-cookie-consent'],
      ['transmissions', 'g-transmissions'],
    ]);
  });
});
