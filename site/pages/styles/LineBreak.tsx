import { useState, type CSSProperties, type ReactNode } from 'react';

import { Modal, Phrase, splitPhrases } from '@genelab/gassan';

import LineBreakModal from '../../demos/LineBreakModal';
import lineBreakSource from '../../demos/LineBreakModal.tsx?raw';
import { LANG_NAMES, useI18n, type Lang } from '../../i18n';
import { BreakCompare, ButtonSamples, type SampleButton } from '../../ui/BreakCompare';
import { CodeBlock } from '../../ui/Code';
import { Example } from '../../ui/Example';
import { md, Paras } from '../../ui/Markdown';
import { KeyPoint, PageHeader, Prose, Section } from '../../ui/Page';
import { SpecTable } from '../../ui/Spec';

/**
 * 言語ごとの見本。見本そのものが言語の例なので、サイトの言語では訳さない（サイトが英語でも中国語の見本は中国語）。
 * ボタンは「ブラウザ任せだと語の途中で割れる」長さのものを選んである。
 */
interface Sample {
  buttons: readonly SampleButton[];
  title: string;
  table: { head: [string, string]; rows: readonly [string, string][] };
  chart: { label: string; summary: string };
}

const SAMPLES: Record<Lang, Sample> = {
  ja: {
    buttons: [
      { label: 'プロフィールを編集', variant: 'primary' },
      { label: '下書きとして保存する', variant: 'secondary' },
      { label: '利用規約に同意して続ける', variant: 'primary' },
      { label: '通知の設定を変更する', variant: 'tertiary' },
    ],
    title: '第3四半期の売上レポートを共有する',
    table: {
      head: ['項目', '変更内容'],
      rows: [
        ['通知の設定', 'メールでの通知を停止しました'],
        ['表示名', 'プロフィールを編集しました'],
      ],
    },
    chart: { label: '月別の売上の推移', summary: '3月が最大の120万円。4月以降は100万円前後で横ばい。' },
  },
  'zh-Hans': {
    buttons: [
      { label: '编辑个人资料', variant: 'primary' },
      { label: '保存更改并关闭', variant: 'secondary' },
      { label: '同意用户协议并继续', variant: 'primary' },
      { label: '更改通知设置', variant: 'tertiary' },
    ],
    title: '共享第三季度的销售报告',
    table: {
      head: ['项目', '变更内容'],
      rows: [
        ['通知设置', '已停止电子邮件通知'],
        ['显示名称', '已编辑个人资料'],
      ],
    },
    chart: { label: '各月销售额的变化', summary: '3月最高，为120万元。4月以后稳定在100万元左右。' },
  },
  'zh-Hant': {
    buttons: [
      { label: '編輯個人資料', variant: 'primary' },
      { label: '儲存變更並關閉', variant: 'secondary' },
      { label: '同意使用者條款並繼續', variant: 'primary' },
      { label: '變更通知設定', variant: 'tertiary' },
    ],
    title: '分享第三季的銷售報告',
    table: {
      head: ['項目', '變更內容'],
      rows: [
        ['通知設定', '已停止電子郵件通知'],
        ['顯示名稱', '已編輯個人資料'],
      ],
    },
    chart: { label: '各月銷售額的變化', summary: '3月最高，為120萬元。4月以後維持在100萬元左右。' },
  },
  ko: {
    buttons: [
      { label: '프로필 편집', variant: 'primary' },
      { label: '변경 사항을 저장하고 닫기', variant: 'secondary' },
      { label: '이용약관에 동의하고 계속하기', variant: 'primary' },
      { label: '알림 설정 변경하기', variant: 'tertiary' },
    ],
    title: '3분기 매출 보고서를 공유하기',
    table: {
      head: ['항목', '변경 내용'],
      rows: [
        ['알림 설정', '이메일 알림을 중지했습니다'],
        ['표시 이름', '프로필을 편집했습니다'],
      ],
    },
    chart: { label: '월별 매출 추이', summary: '3월이 120만 원으로 가장 높았고, 4월 이후로는 100만 원 안팎에서 보합세입니다.' },
  },
  th: {
    buttons: [
      { label: 'แก้ไขโปรไฟล์', variant: 'primary' },
      { label: 'บันทึกการเปลี่ยนแปลงและปิด', variant: 'secondary' },
      { label: 'ยอมรับข้อกำหนดและดำเนินการต่อ', variant: 'primary' },
      { label: 'เปลี่ยนการตั้งค่าการแจ้งเตือน', variant: 'tertiary' },
    ],
    title: 'แชร์รายงานยอดขายไตรมาสที่ 3',
    table: {
      head: ['รายการ', 'การเปลี่ยนแปลง'],
      rows: [
        ['การแจ้งเตือน', 'หยุดการแจ้งเตือนทางอีเมลแล้ว'],
        ['ชื่อที่แสดง', 'แก้ไขโปรไฟล์แล้ว'],
      ],
    },
    chart: { label: 'ยอดขายรายเดือน', summary: 'เดือนมีนาคมสูงสุดที่ 1.2 ล้าน หลังเดือนเมษายนทรงตัวที่ประมาณ 1 ล้าน' },
  },
  en: {
    buttons: [
      { label: 'Edit profile', variant: 'primary' },
      { label: 'Save changes and close', variant: 'secondary' },
      { label: 'Agree to the terms and continue', variant: 'primary' },
      { label: 'Change notification settings', variant: 'tertiary' },
    ],
    title: 'Share the third-quarter sales report',
    table: {
      head: ['Item', 'Change'],
      rows: [
        ['Notifications', 'Turned off email notifications'],
        ['Display name', 'Edited the profile'],
      ],
    },
    chart: { label: 'Monthly sales', summary: 'Peaked at 1.2M in March, then flat at around 1M from April.' },
  },
};

/** 見本の言語の並び。比べ甲斐のある順（gassan が手を入れる言語が先）。 */
const SAMPLE_LANGS: readonly Lang[] = ['ja', 'zh-Hans', 'zh-Hant', 'ko', 'th', 'en'];

/** 「試す」欄の初めの文。サイトの言語の文にする。英語とタイ語は分割の様子が見えないので日本語の文にする。 */
const TRY_TEXT: Record<Lang, string> = {
  ja: '本文を最後までお読みのうえ、更新後の利用規約に同意してください。',
  'zh-Hans': '请阅读全文后，同意更新后的用户协议。',
  'zh-Hant': '請閱讀全文後，同意更新後的使用者條款。',
  ko: '본문을 끝까지 읽은 후 변경된 이용약관에 동의해 주세요.',
  en: '本文を最後までお読みのうえ、更新後の利用規約に同意してください。',
  th: '本文を最後までお読みのうえ、更新後の利用規約に同意してください。',
};

const BARS = [40, 62, 92, 80, 78];

/** 比べる見本。BreakCompare が左右に同じものを描く。 */
function Samples({ sample }: { sample: Sample }): ReactNode {
  const { t } = useI18n();
  const labels = t.lineBreak.compare.labels;
  return (
    <div className="s-samples">
      <div className="s-sample">
        <p className="s-sample-label">{labels.buttons}</p>
        <ButtonSamples buttons={sample.buttons} />
      </div>
      <div className="s-sample">
        <p className="s-sample-label">{labels.title}</p>
        <p className="s-sample-box s-sample-title">
          <Phrase>{sample.title}</Phrase>
        </p>
      </div>
      <div className="s-sample">
        <p className="s-sample-label">{labels.table}</p>
        {/* 2 列の表は、ボタンと同じ幅では列が 1〜2 文字幅になる。器を広げて比べる */}
        <div className="s-sample-box" style={{ '--s-sample-scale': 1.8 } as CSSProperties}>
          <Modal.Table label={labels.tableLabel}>
            <table>
              <thead>
                <tr>
                  {sample.table.head.map((cell) => (
                    <th key={cell} scope="col">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sample.table.rows.map(([item, change]) => (
                  <tr key={item}>
                    <td>{item}</td>
                    <td>{change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Modal.Table>
        </div>
      </div>
      <div className="s-sample">
        <p className="s-sample-label">{labels.chart}</p>
        <div className="s-sample-box">
          <Modal.Chart label={sample.chart.label} summary={sample.chart.summary}>
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

const KANA = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const HANGUL = /\p{Script=Hangul}/u;
const HAN = /\p{Script=Han}/u;

function Splitter(): ReactNode {
  const { lang, t } = useI18n();
  const tt = t.lineBreak.try;
  const [text, setText] = useState(TRY_TEXT[lang]);
  const phrases = splitPhrases(text);
  // gassan と同じ判定（W-04）で、どの扱いになったかを添える
  const note = KANA.test(text) || (!HANGUL.test(text) && HAN.test(text))
    ? phrases.length > 1
      ? tt.split(phrases.length)
      : tt.single
    : HANGUL.test(text)
      ? tt.korean
      : tt.untouched;
  return (
    <div className="s-splitter">
      <label className="s-field">
        <span>{tt.input}</span>
        <Modal.Textarea rows={2} value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <ol className="s-splitter-out" aria-label={tt.resultLabel}>
        {phrases.map((p, i) => (
          <li key={i} className="s-phrase-chip">
            {p}
          </li>
        ))}
      </ol>
      <p className="s-splitter-note">
        <Phrase>{note}</Phrase>
      </p>
    </div>
  );
}

export function LineBreak(): ReactNode {
  const { lang, t } = useI18n();
  const tt = t.lineBreak;
  // 10em: 見本のどの言語でも、ブラウザ任せだと語の途中で割れ、gassan では切れ目に収まる幅
  const [width, setWidth] = useState(10);
  const [sampleLang, setSampleLang] = useState<Lang>(SAMPLE_LANGS.slice(0, 4).includes(lang) ? lang : 'ja');
  const notes = tt.compare.notes[sampleLang];
  const css = [
    '.g-phrase {',
    `  word-break: keep-all;        /* ${tt.how.cssComments.keepAll} */`,
    `  overflow-wrap: break-word;   /* ${tt.how.cssComments.breakWord} */`,
    `  line-break: strict;          /* ${tt.how.cssComments.strict} */`,
    '}',
  ].join('\n');
  const usage = [
    "import { Phrase, GassanProvider } from '@genelab/gassan';",
    '',
    `// ${tt.use.codeComments.outside}`,
    '<button><Phrase>プロフィールを編集</Phrase></button>',
    '',
    `// ${tt.use.codeComments.revert}`,
    '<GassanProvider lineBreak="browser">…</GassanProvider>',
  ].join('\n');

  return (
    <>
      <PageHeader
        eyebrow={t.nav.sections.styles}
        title={t.nav.pages.lineBreak}
        lead={tt.lead}
        ids={['W-01', 'W-02', 'W-03', 'W-04', 'W-05']}
      />

      <Section id="compare" title={tt.compare.title} intro={md(tt.compare.intro)}>
        <fieldset className="s-field s-sample-langs">
          <legend>{tt.compare.language}</legend>
          <Modal.Segmented
            value={sampleLang}
            onValueChange={(code) => setSampleLang(code as Lang)}
            options={SAMPLE_LANGS.map((code) => ({ value: code, label: <span lang={code}>{LANG_NAMES[code]}</span> }))}
          />
        </fieldset>
        <label className="s-field s-width-control">
          <span>{tt.compare.width(width.toFixed(1))}</span>
          <Modal.Slider min={4} max={22} step={0.5} value={width} onValueChange={setWidth} />
        </label>
        <BreakCompare width={width} lang={sampleLang} browserNote={notes.browser} phraseNote={notes.phrase}>
          <Samples sample={SAMPLES[sampleLang]} />
        </BreakCompare>
      </Section>

      <Section id="languages" title={tt.languages.title} intro={tt.languages.intro}>
        <div className="s-table-wrap" role="group" tabIndex={0} aria-label={tt.languages.caption}>
          <table className="s-table s-lang-table">
            <caption className="s-sr-only">{tt.languages.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{tt.languages.head.language}</th>
                <th scope="col">{tt.languages.head.browser}</th>
                <th scope="col">{tt.languages.head.gassan}</th>
                <th scope="col">{tt.languages.head.why}</th>
              </tr>
            </thead>
            <tbody>
              <Phrase>
                {tt.languages.rows.map((row) => (
                  <tr key={row.language}>
                    <th scope="row">{row.language}</th>
                    <td>{md(row.browser)}</td>
                    <td>{md(row.gassan)}</td>
                    <td>{md(row.why)}</td>
                  </tr>
                ))}
              </Phrase>
            </tbody>
          </table>
        </div>
        <Prose>
          <p>{md(tt.languages.note)}</p>
        </Prose>
      </Section>

      <Section id="modal" title={tt.modal.title} intro={tt.modal.intro}>
        <Example
          title={tt.modal.exampleTitle}
          description={tt.modal.exampleDescription}
          code={lineBreakSource}
          demo="lineBreakModal"
        >
          <LineBreakModal />
        </Example>
      </Section>

      <Section id="try" title={tt.try.title} intro={tt.try.intro}>
        {/* 言語を変えたら、初めの文もその言語に入れ替える */}
        <Splitter key={lang} />
      </Section>

      <Section id="how" title={tt.how.title}>
        <ol className="s-rules">
          {tt.how.steps.map((step) => (
            <li key={step.title}>
              <h3>
                <Phrase>{step.title}</Phrase>
              </h3>
              <p>
                <Phrase>{md(step.body)}</Phrase>
              </p>
            </li>
          ))}
        </ol>
        <CodeBlock lang="css" caption="src/styles.css" code={css} />
      </Section>

      <Section id="name" title={tt.name.title} intro={tt.name.intro}>
        <Prose>
          <Paras items={tt.name.body} />
        </Prose>
        <div className="s-table-wrap" role="group" tabIndex={0} aria-label={tt.name.tableLabel}>
          <table className="s-table">
            <caption className="s-sr-only">{tt.name.caption}</caption>
            <thead>
              <tr>
                <th scope="col">{tt.name.head.method}</th>
                <th scope="col">{tt.name.head.name}</th>
                <th scope="col">{tt.name.head.breaks}</th>
                <th scope="col">{tt.name.head.long}</th>
              </tr>
            </thead>
            <tbody>
              <Phrase>
                {tt.name.rows.map((row) => (
                  <tr key={row.method}>
                    <th scope="row">{md(row.method)}</th>
                    <td>{row.name}</td>
                    <td>{row.breaks}</td>
                    <td>{row.long}</td>
                  </tr>
                ))}
              </Phrase>
            </tbody>
          </table>
        </div>
        <KeyPoint>{tt.name.callout}</KeyPoint>
      </Section>

      <Section id="use" title={tt.use.title} intro={tt.use.intro}>
        <CodeBlock lang="tsx" code={usage} />
        <Prose>
          <Paras items={tt.use.body} />
        </Prose>
      </Section>

      <Section id="spec" title={tt.spec.title}>
        <SpecTable ids={['W-01', 'W-02', 'W-03', 'W-04', 'W-05', 'W-06']} caption={tt.spec.caption} />
      </Section>
    </>
  );
}
