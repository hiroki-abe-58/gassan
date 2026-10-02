import type { ReactNode } from 'react';

import { data } from '../../data';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';
import { SpecChips, SpecTable } from '../../ui/Spec';

const READ_GATE: readonly { who: string; signal: string }[] = [
  { who: 'マウス・タッチ・ホイール', signal: '本文末尾のセンチネルが画面に入った' },
  { who: 'キーボード・スクリーンリーダー', signal: '末尾のマーカー（「本文の終わりです」）にフォーカスが届いた' },
  { who: '大きな画面・短い本文', signal: 'そもそもスクロールが要らない高さだった（測れるときだけ判定する）' },
];

export function Accessibility(): ReactNode {
  const keyboard = data.categories.find((c) => c.letter === 'K')?.items.map((i) => i.id) ?? [];
  const assistive = data.categories.find((c) => c.letter === 'A')?.items.map((i) => i.id) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="設計思想"
        title="アクセシビリティ"
        lead="ブラウザがやることには手を出さず、ブラウザがやらないことは全部やる。gassan のアクセシビリティはこの 2 本立てでできている。"
      />

      <Section id="native" title="ブラウザに任せていること" intro="showModal() が担う。自作すると必ずどこかが漏れるので、書かないのが正解。">
        <SpecTable ids={['L-01', 'L-02', 'K-01', 'K-02', 'K-06', 'A-03', 'A-04']} caption="ネイティブに委譲している項目" />
        <Callout>
          <code>aria-modal</code> も付けない。<code>showModal()</code> の top layer と inert が同等以上の効果を持ち、
          二重に指定すると一部のスクリーンリーダーで挙動が不安定になる（A-03）。
        </Callout>
      </Section>

      <Section id="name" title="名前は欠けない">
        <Prose>
          <p>
            ダイアログの名前は <code>&lt;h2&gt;</code> の内側の <code>&lt;span&gt;</code> に <code>aria-labelledby</code> で向ける。
            長いタイトルの省略は CSS の <code>line-clamp</code> だけで行い、DOM の文字列は切らない。
            だから画面上は 2 行で切れていても、読み上げられる名前は常に完全である。
          </p>
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel
                  width={64}
                  title={
                    <>
                      <span className="s-mock-clamp">第3四半期 東北エリア 店舗別売上レポートの共有設定を変更する</span>
                      <span className="s-mock-toggle">全文を表示</span>
                    </>
                  }
                  lines={2}
                />
              </MockScreen>
            }
          >
            CSS で省略し、溢れたときだけ明示的なトグルを出す。トグルの文言は名前の span の外に置く（T-03 / T-08）。
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen>
                <MockPanel width={64} title="第3四半期 東北エリア 店舗別売…" lines={2}>
                  <span className="s-mock-tooltip">title 属性のツールチップ</span>
                </MockPanel>
              </MockScreen>
            }
          >
            <code>title.slice(0, 30) + '…'</code> と JS で切らない。名前ごと欠ける。続きを <code>title</code> 属性に逃がすのも、
            タッチで出ず WCAG 1.4.13 を満たさない（T-05）。
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="gate" title="押せない理由を、押して聞ける">
        <Prose>
          <p>
            条件を満たすまで押せないボタンに <code>disabled</code> は使わない。<code>disabled</code> はフォーカスを受け取らないので、
            キーボードやスクリーンリーダーの利用者は、なぜ進めないのかを確かめる手段そのものを失う。
            gassan は <code>aria-disabled="true"</code> にして、押されたら理由を読み上げ、詰まっている場所へ連れて行く。
          </p>
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel title="利用規約の更新" lines={2} width={60} buttons={[{ label: '同意して続ける', variant: 'gated' }]}>
                  <span className="s-mock-note">同意にチェックを入れてください</span>
                </MockPanel>
              </MockScreen>
            }
          >
            <code>aria-disabled</code> + 常に見える理由 + 押したときの読み上げと誘導（G-01 / G-07 / G-08）。
            見た目は専用トークンで 4.5:1 を保つ（G-10）。
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen>
                <MockPanel title="利用規約の更新" lines={2} width={60} buttons={[{ label: '同意して続ける', variant: 'disabled' }]} />
              </MockScreen>
            }
          >
            <code>disabled</code> と <code>opacity: .4</code> で済ませない。理由が分からず、文字も読めない。
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="read" title="読了は論理和で判定する" intro="スクロール位置だけで「読んだ」と判定すると、仮想カーソルで読む利用者は scroll イベントを起こさないので、永久に先へ進めない。">
        <ol className="s-or-list">
          {READ_GATE.map((row, i) => (
            <li key={row.who}>
              {i > 0 ? (
                <span className="s-or" aria-hidden="true">
                  OR
                </span>
              ) : null}
              <p className="s-or-who">{row.who}</p>
              <p className="s-or-signal">{row.signal}</p>
            </li>
          ))}
        </ol>
        <SpecChips ids={['G-03', 'G-04', 'G-05', 'G-06', 'G-09']} label="読了ゲートの仕様" />
      </Section>

      <Section id="focus" title="フォーカスの置き場所">
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel title="メンバーを招待" lines={3} width={62} buttons={[{ label: '招待する', variant: 'primary' }]}>
                  <span className="s-mock-focusring" />
                </MockPanel>
              </MockScreen>
            }
          >
            開いた直後のフォーカスはパネル本体（K-03）。スクリーンリーダーはタイトルから順に読み始められる。
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen align="top">
                <MockPanel title="メンバーを招待" lines={1} width={62}>
                  <span className="s-mock-input" />
                  <span className="s-mock-keyboard" />
                </MockPanel>
              </MockScreen>
            }
          >
            タッチ端末で最初の入力欄にフォーカスしない。仮想キーボードが跳ね上がり、本文が隠れる（K-04）。
            × ボタンに当てるのも、本文を読み飛ばさせるので避ける。
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="tables" title="キーボードと支援技術の項目">
        <SpecTable ids={keyboard} caption="キーボード／フォーカスの項目" />
        <SpecTable ids={assistive} caption="支援技術の項目" />
      </Section>

      <Section id="preferences" title="利用者の設定に従う">
        <SpecTable ids={['S-04', 'S-05', 'S-06', 'M-08', 'G-06']} caption="OS とブラウザの設定に追従する項目" />
      </Section>
    </>
  );
}
