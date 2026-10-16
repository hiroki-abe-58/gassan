import { useState, type CSSProperties, type ReactNode } from 'react';

import { Modal, Phrase, splitPhrases } from '@genelab/gassan';

import LineBreakModal from '../../demos/LineBreakModal';
import lineBreakSource from '../../demos/LineBreakModal.tsx?raw';
import { BreakCompare, ButtonSamples, type SampleButton } from '../../ui/BreakCompare';
import { CodeBlock } from '../../ui/Code';
import { Example } from '../../ui/Example';
import { Callout, PageHeader, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

const BUTTONS: readonly SampleButton[] = [
  { label: 'プロフィールを編集', variant: 'primary' },
  { label: '下書きとして保存する', variant: 'secondary' },
  { label: '利用規約に同意して続ける', variant: 'primary' },
  { label: '通知の設定を変更する', variant: 'tertiary' },
];

const BARS = [40, 62, 92, 80, 78];

/** 比べる見本。BreakCompare が左右に同じものを描く。 */
function Samples(): ReactNode {
  return (
    <div className="s-samples">
      <div className="s-sample">
        <p className="s-sample-label">ボタン</p>
        <ButtonSamples buttons={BUTTONS} />
      </div>
      <div className="s-sample">
        <p className="s-sample-label">タイトル</p>
        <p className="s-sample-box s-sample-title">
          <Phrase>第3四半期の売上レポートを共有する</Phrase>
        </p>
      </div>
      <div className="s-sample">
        <p className="s-sample-label">表</p>
        {/* 2 列の表は、ボタンと同じ幅では列が 1〜2 文字幅になる。器を広げて比べる */}
        <div className="s-sample-box" style={{ '--s-sample-scale': 1.8 } as CSSProperties}>
          <Modal.Table label="変更履歴の見本">
            <table>
              <thead>
                <tr>
                  <th scope="col">項目</th>
                  <th scope="col">変更内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>通知の設定</td>
                  <td>メールでの通知を停止しました</td>
                </tr>
                <tr>
                  <td>表示名</td>
                  <td>プロフィールを編集しました</td>
                </tr>
              </tbody>
            </table>
          </Modal.Table>
        </div>
      </div>
      <div className="s-sample">
        <p className="s-sample-label">グラフの要約</p>
        <div className="s-sample-box">
          <Modal.Chart label="月別の売上の推移" summary="3月が最大の120万円。4月以降は100万円前後で横ばい。">
            <span className="s-mock-bars">
              {BARS.map((h, i) => (
                <i key={i} style={{ height: `${String(h)}%` }} />
              ))}
            </span>
          </Modal.Chart>
        </div>
      </div>
    </div>
  );
}

function Splitter(): ReactNode {
  const [text, setText] = useState('本文を最後までお読みのうえ、更新後の利用規約に同意してください。');
  const phrases = splitPhrases(text);
  return (
    <div className="s-splitter">
      <label className="s-field">
        <span>試す文字列</span>
        <textarea rows={2} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <ol className="s-splitter-out" aria-label="文節に分けた結果">
        {phrases.map((p, i) => (
          <li key={i} className="s-phrase-chip">
            {p}
          </li>
        ))}
      </ol>
      <p className="s-splitter-note">
        <Phrase>
          {phrases.length > 1
            ? `${String(phrases.length)} 個の文節に分かれた。改行はこの切れ目でだけ起きる。`
            : 'かなを含まない文字列（英語・中国語）や、1 文節だけの文字列には手を出さない。'}
        </Phrase>
      </p>
    </div>
  );
}

const STEPS: readonly { title: string; body: string }[] = [
  { title: '語に分ける', body: 'ブラウザと Node が標準で持つ Intl.Segmenter で、語の境目を候補として取り出す。依存は増やさない。' },
  {
    title: '折ってよい位置だけ残す',
    body: 'ひらがなの後に漢字・カタカナ・英数字が始まる、句読点や閉じ括弧の後、といった文字種の規則で選ぶ。送り仮名・「お」「ご」・数と単位の中では折らない。',
  },
  { title: '切れ目に印を置く', body: '切れ目に <wbr aria-hidden="true"> を入れる。文字は 1 つも足さないので、コピーしても検索しても元のまま。' },
  { title: 'そこでだけ折る', body: '器に word-break: keep-all を掛け、文字の間では折らない。1 文節が器より長いときだけ、overflow-wrap: break-word で文字単位に折る。' },
];

export function LineBreak(): ReactNode {
  const [width, setWidth] = useState(8.5);

  return (
    <>
      <PageHeader
        eyebrow="スタイル"
        title="日本語の折り返し"
        lead="「プロフィールを編｜集」を、もう出さない。gassan は日本語の文字列を文節の切れ目でだけ改行する。ボタンにも、タイトルにも、表のセルにも、グラフの要約にも。"
        ids={['W-01', 'W-02', 'W-03', 'W-04', 'W-05']}
      />

      <Section
        id="compare"
        title="同じ幅で比べる"
        intro="左はブラウザに任せた場合、右が gassan。どちらも同じライブラリで、左だけ lineBreak を 'browser' に切り替えている。幅を動かして、どこで改行されるかを見てほしい。"
      >
        <label className="s-field s-width-control">
          <span>器の幅: {width.toFixed(1)}em</span>
          <input
            type="range"
            min={5}
            max={22}
            step={0.5}
            value={width}
            onChange={(event) => setWidth(Number(event.target.value))}
          />
        </label>
        <BreakCompare width={width}>
          <Samples />
        </BreakCompare>
      </Section>

      <Section id="modal" title="本物のモーダルで" intro="幅 360px のモーダル。チェックを外すとブラウザ任せに戻る。">
        <Example
          title="狭いモーダルの日本語"
          description="フッタのボタン、タイトル、表のセルを見比べる。読み上げられる名前は、どちらでも同じ。"
          code={lineBreakSource}
        >
          <LineBreakModal />
        </Example>
      </Section>

      <Section id="try" title="文字を入れて試す" intro="どこで文節に分かれるかを、その場で確かめられる。">
        <Splitter />
      </Section>

      <Section id="how" title="しくみ">
        <ol className="s-rules">
          {STEPS.map((step) => (
            <li key={step.title}>
              <h3>
                <Phrase>{step.title}</Phrase>
              </h3>
              <p>
                <Phrase>{step.body}</Phrase>
              </p>
            </li>
          ))}
        </ol>
        <CodeBlock
          lang="css"
          caption="src/styles.css"
          code={`.g-phrase {\n  word-break: keep-all;        /* 文字の間では折らない */\n  overflow-wrap: break-word;   /* 1 文節が器より長いときだけ文字単位で折る */\n  line-break: strict;          /* そのときも小書きのかな・長音符を行頭に置かない */\n}`}
        />
      </Section>

      <Section id="name" title="読み上げを汚さない" intro="改行の位置を変えても、スクリーンリーダーが読む名前とコピーされる文字列は変えない。">
        <Prose>
          <p>
            素の <code>&lt;wbr&gt;</code> は、Chrome のアクセシビリティツリーで空白として名前に混ざる。
            <code>&lt;button&gt;プロフィールを&lt;wbr&gt;編集&lt;/button&gt;</code> は「プロフィールを 編集」と読まれる。画面の文字（
            <code>innerText</code>）には空白が無いのに、である。3 つの方式を実ブラウザで測って選んだ。
          </p>
        </Prose>
        <div className="s-table-wrap" role="group" tabIndex={0} aria-label="方式の比較">
          <table className="s-table">
            <caption className="s-sr-only">改行の印の付け方と、その結果</caption>
            <thead>
              <tr>
                <th scope="col">方式</th>
                <th scope="col">読み上げの名前</th>
                <th scope="col">文節で折れるか</th>
                <th scope="col">長い文節</th>
              </tr>
            </thead>
            <tbody>
              <Phrase>
                <tr>
                  <th scope="row">
                    <code>&lt;wbr aria-hidden="true"&gt;</code> ＋ keep-all（採用）
                  </th>
                  <td>元のまま</td>
                  <td>折れる</td>
                  <td>はみ出さない</td>
                </tr>
                <tr>
                  <th scope="row">文節ごとの span に white-space: nowrap</th>
                  <td>元のまま</td>
                  <td>折れる</td>
                  <td>はみ出す</td>
                </tr>
                <tr>
                  <th scope="row">文節ごとの span に word-break: keep-all</th>
                  <td>元のまま</td>
                  <td>折れない（文字単位）</td>
                  <td>—</td>
                </tr>
                <tr>
                  <th scope="row">素の &lt;wbr&gt;</th>
                  <td>空白が混ざる</td>
                  <td>折れる</td>
                  <td>はみ出さない</td>
                </tr>
              </Phrase>
            </tbody>
          </table>
        </div>
        <Callout>
          ゼロ幅スペースは使わない。目に見えないのに文字としては残るので、コピーした文字列や検索、入力値との比較が静かに壊れる。
        </Callout>
      </Section>

      <Section id="use" title="使い方" intro="gassan の部品の中では、何も書かなくても文節で折れる。gassan の外の UI には Phrase で同じ折り返しを効かせられる。">
        <CodeBlock
          lang="tsx"
          code={`import { Phrase, GassanProvider } from '@genelab/gassan';\n\n// gassan の外のボタンや見出しにも効かせる\n<button><Phrase>プロフィールを編集</Phrase></button>\n\n// ブラウザ任せに戻す（既定は 'phrase'）\n<GassanProvider lineBreak="browser">…</GassanProvider>`}
        />
        <Prose>
          <p>
            かな（ひらがな・カタカナ）を含む文字列にだけ効く。中国語は文字単位の改行が正しく、英語は空白で折れるので、手を出さない。サーバーでもクライアントでも同じ位置に印を置くので、hydration はずれない。CSS の{' '}
            <code>word-break: auto-phrase</code> は同じ問題をブラウザ側で解く仕組みだが、対応するブラウザが限られ、改行の位置もブラウザごとに異なる。gassan はどのブラウザでも同じ位置で折る。
          </p>
        </Prose>
      </Section>

      <Section id="spec" title="折り返しの項目">
        <SpecTable ids={['W-01', 'W-02', 'W-03', 'W-04', 'W-05', 'W-06']} caption="折り返しの仕様" />
      </Section>
    </>
  );
}
