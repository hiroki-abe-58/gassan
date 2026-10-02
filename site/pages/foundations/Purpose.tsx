import type { ReactNode } from 'react';

import { data } from '../../data';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../../ui/Guidelines';
import { MdTable } from '../../ui/Markdown';
import { PageHeader, Prose, Section } from '../../ui/Page';

const ALTERNATIVES: readonly { name: string; when: string; why: string }[] = [
  {
    name: 'ページ',
    when: '内容が主役で、戻ってくる前提がないとき',
    why: 'URL を持ち、共有も再読み込みもできる。モーダルに押し込むと、深いリンクと戻る操作を失う。',
  },
  {
    name: 'インライン展開（disclosure）',
    when: '今いる場所の補足を、その場で少し見せたいとき',
    why: '操作の流れを分岐させない。読み終えたら閉じる必要すらない。',
  },
  {
    name: 'ポップオーバー',
    when: '一時的な選択肢やメニュー',
    why: '背景を不活性にしない。押し間違えても、外側をクリックすれば何事もなく戻れる。',
  },
];

export function Purpose(): ReactNode {
  const definition = data.code['1-1#0']?.text.trim();
  const reasons = data.tables['1-1'];

  return (
    <>
      <PageHeader
        eyebrow="設計思想"
        title="モーダルの存在理由"
        lead="モーダルは「情報を表示する箱」ではない。この一点を外すと、それっぽいのに毎回どこか気持ち悪いものが出来る。"
      />

      {definition ? (
        <blockquote className="s-definition">
          <p>{definition}</p>
          <footer>modal.skill.md §1-1</footer>
        </blockquote>
      ) : null}

      <Section
        id="reasons"
        title="分岐させてよい理由は 4 つしかない"
        intro="モーダルは利用者の手を止めさせる。止めさせるだけの理由があるのは、次の 4 つの場面だけである。"
      >
        {reasons ? <MdTable table={reasons} caption="モーダルを使ってよい 4 つの理由" /> : null}
        <Prose>
          <p>
            NN/g は overlay の乱用を強く批判しつつ、lightbox だけは擁護している。理由は「文脈を失わせない」から。
            モーダルが他の手段を上回るのは、<strong>今いる場所を保ったまま</strong>何かをさせられる、この一点においてのみである。
          </p>
        </Prose>
      </Section>

      <Section id="alternatives" title="当てはまらないなら、別の器を使う" intro="モーダルは「置き場所に困った UI の避難所」ではない。">
        <ul className="s-cards s-cards-3">
          {ALTERNATIVES.map((alt) => (
            <li key={alt.name} className="s-card s-card-plain">
              <h3>{alt.name}</h3>
              <p className="s-card-when">{alt.when}</p>
              <p>{alt.why}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="guidelines" title="使いどころの見本">
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel
                  title="このメンバーを外しますか"
                  lines={1}
                  width={58}
                  buttons={[
                    { label: 'やめる', variant: 'tertiary' },
                    { label: '外す', variant: 'danger' },
                  ]}
                />
              </MockScreen>
            }
          >
            取り消せない操作の確認。背後の一覧が見えたままなので、誰を外そうとしているかを見失わない。
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen scrim={0.6}>
                <MockPanel title="設定" lines={7} width={80} buttons={[{ label: '保存', variant: 'primary' }]} />
              </MockScreen>
            }
          >
            置き場所に困った設定画面をモーダルに押し込まない。長く居座る作業はページにする。URL を持ち、戻るボタンが効く。
          </Guideline>
        </Guidelines>
      </Section>
    </>
  );
}
