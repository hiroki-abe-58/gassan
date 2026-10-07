import type { ReactNode } from 'react';

import { data } from '../data';
import QuickStart from '../demos/QuickStart';
import quickStartSource from '../demos/QuickStart.tsx?raw';
import { to } from '../router';
import { CodeBlock } from '../ui/Code';
import { Example } from '../ui/Example';
import { Guideline, Guidelines, MockPanel, MockScreen } from '../ui/Guidelines';
import { MdTable } from '../ui/Markdown';
import { Callout, PageHeader, Prose, Section } from '../ui/Page';

export function GetStarted(): ReactNode {
  const support = data.tables['1-4'];
  const rules = data.code['9#0'];

  return (
    <>
      <PageHeader
        eyebrow="はじめに"
        title="はじめる"
        lead="入れて、kind を 1 つ選び、常時マウントする。覚えることはそれだけで、あとの決めごとは kind が引き受ける。"
        ids={['D-01', 'D-02', 'D-03']}
      />

      <Section id="install" title="インストール">
        <Prose>
          <p>
            npm で公開している（<code>@genelab/gassan</code>）。peer は React 18.2 以上（19 でも動く）。
          </p>
        </Prose>
        <CodeBlock code="npm install @genelab/gassan" lang="bash" caption="shell" />
        <CodeBlock
          code={`import { Modal } from '@genelab/gassan';\nimport '@genelab/gassan/styles.css';`}
          lang="tsx"
          caption="app.tsx"
        />
        <Callout>
          Next.js App Router では、配布物の先頭に <code>"use client"</code> が入っている。そのまま import してよい。
          ページ遷移で閉じたいときは <code>routeKey={'{usePathname()}'}</code> を渡す（L-13）。
        </Callout>
      </Section>

      <Section id="minimal" title="最小の例" intro="ヘッダ・本文・フッタの 3 行。名前は Modal.Title が、ラベルと説明の配線は Modal.Field が引き受ける。">
        <Example title="プロフィールを編集" code={quickStartSource}>
          <QuickStart />
        </Example>
      </Section>

      <Section id="always-mounted" title="モーダルは常時マウントする">
        <Prose>
          <p>
            閉じるアニメーションは「閉じた後も要素が居る」ことを前提にしている。条件付きでマウントすると、
            <code>open</code> が false になった瞬間に要素ごと消えるので、退出を描く対象が原理的に存在しない。
          </p>
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={<CodeVisual code={'<Modal.Root open={open} onOpenChange={setOpen}>\n  …\n</Modal.Root>'} />}
          >
            常にマウントし、<code>open</code> で開閉する。退出アニメ・フォーカス復帰・中身のリセットはライブラリが順に行う。
          </Guideline>
          <Guideline tone="dont" visual={<CodeVisual code={'{open && (\n  <Modal.Root open onOpenChange={setOpen}>…'} />}>
            <code>{'{open && <Modal.Root />}'}</code> と書かない。閉じた瞬間に消え、退出アニメが描けない（§5 の 3）。
          </Guideline>
        </Guidelines>
      </Section>

      <Section id="choose" title="kind を 1 つ選ぶ">
        <Prose>
          <p>
            <code>kind</code> は <code>confirm</code> / <code>form</code> / <code>view</code> / <code>consent</code> /{' '}
            <code>flow</code> の 5 つ。決めると、スクリム・Esc と背景クリックの可否・配置の既定が決まる。
            複数に当てはまるなら、それは分割すべき 2 つのモーダルである。
          </p>
        </Prose>
        <Guidelines>
          <Guideline
            tone="do"
            visual={
              <MockScreen>
                <MockPanel title="下書きを削除しますか" lines={1} width={56} buttons={[{ label: 'やめる', variant: 'tertiary' }, { label: '削除する', variant: 'danger' }]} />
              </MockScreen>
            }
          >
            1 つのモーダルに 1 つの目的。確認なら確認だけにする。
          </Guideline>
          <Guideline
            tone="dont"
            visual={
              <MockScreen>
                <MockPanel title="削除しますか？ あと設定も" lines={4} width={56} buttons={[{ label: '保存して削除', variant: 'primary' }]} />
              </MockScreen>
            }
          >
            確認とフォームを 1 枚に混ぜない。閉じ方の正解が 2 つになり、どちらかが必ず裏切られる。
          </Guideline>
        </Guidelines>
        <p className="s-more">
          <a href={to('/foundations/kinds')}>5 つの類型と意思決定マトリクス →</a>
        </p>
      </Section>

      <Section id="imperative" title="確認だけなら await で書ける">
        <Prose>
          <p>
            確認ダイアログを宣言的に書くと state が増える。<code>useModals().confirm()</code> は結果を Promise で返す。
            アプリのルートに <code>&lt;ModalHost /&gt;</code> を 1 つだけ置く。
          </p>
        </Prose>
        <CodeBlock
          code={`const modals = useModals();\nconst ok = await modals.confirm({ title: '削除しますか', tone: 'danger' });`}
          lang="tsx"
        />
      </Section>

      {support ? (
        <Section
          id="browsers"
          title="ブラウザ要件"
          intro="層 1 をブラウザに任せる以上、ブラウザの現況がそのまま前提になる。古い環境では「アニメーションしないモーダル」に劣化するだけで、開閉とアクセシビリティは保たれる。"
        >
          <MdTable table={support} caption="使っているプラットフォーム機能と対応状況" />
        </Section>
      ) : null}

      {rules ? (
        <Section
          id="ai"
          title="AI に書かせるとき"
          intro="Cursor / Claude Code / Copilot には、仕様書 §9 のこのブロックだけを渡す。2022 年以前の実装の癖（自作のフォーカストラップ、z-index: 9999、条件マウント）を先回りで止める。"
        >
          <CodeBlock code={rules.text} lang="text" caption="modal.skill.md §9" />
        </Section>
      ) : null}
    </>
  );
}

function CodeVisual({ code }: { code: string }): ReactNode {
  return <pre className="s-mock-code">{code}</pre>;
}
