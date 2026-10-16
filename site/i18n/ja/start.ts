export default {
  lead: '入れて、kind を 1 つ選び、常時マウントする。覚えることはそれだけで、あとの決めごとは kind が引き受ける。',
  install: {
    title: 'インストール',
    body: ['npm で公開している（`@genelab/gassan`）。peer は React 18.2 以上（19 でも動く）。'],
    nextjs:
      'Next.js App Router では、配布物の先頭に `"use client"` が入っている。そのまま import してよい。ページ遷移で閉じたいときは `routeKey={usePathname()}` を渡す（L-13）。',
  },
  minimal: {
    title: '最小の例',
    intro: 'ヘッダ・本文・フッタの 3 行。名前は Modal.Title が、ラベルと説明の配線は Modal.Field が引き受ける。',
    exampleTitle: 'プロフィールを編集',
  },
  alwaysMounted: {
    title: 'モーダルは常時マウントする',
    body: [
      '閉じるアニメーションは「閉じた後も要素が居る」ことを前提にしている。条件付きでマウントすると、`open` が false になった瞬間に要素ごと消えるので、退出を描く対象が原理的に存在しない。',
    ],
    do: '常にマウントし、`open` で開閉する。退出アニメ・フォーカス復帰・中身のリセットはライブラリが順に行う。',
    dont: '`{open && <Modal.Root />}` と書かない。閉じた瞬間に消え、退出アニメが描けない（§5 の 3）。',
  },
  choose: {
    title: 'kind を 1 つ選ぶ',
    body: [
      '`kind` は `confirm` / `form` / `view` / `consent` / `flow` の 5 つ。決めると、スクリム・Esc と背景クリックの可否・配置の既定が決まる。複数に当てはまるなら、それは分割すべき 2 つのモーダルである。',
    ],
    doTitle: '下書きを削除しますか',
    doCancel: 'やめる',
    doDelete: '削除する',
    do: '1 つのモーダルに 1 つの目的。確認なら確認だけにする。',
    dontTitle: '削除しますか？ あと設定も',
    dontSave: '保存して削除',
    dont: '確認とフォームを 1 枚に混ぜない。閉じ方の正解が 2 つになり、どちらかが必ず裏切られる。',
    more: '5 つの類型と意思決定マトリクス →',
  },
  imperative: {
    title: '確認だけなら await で書ける',
    body: [
      '確認ダイアログを宣言的に書くと state が増える。`useModals().confirm()` は結果を Promise で返す。アプリのルートに `<ModalHost />` を 1 つだけ置く。',
    ],
    code: "const modals = useModals();\nconst ok = await modals.confirm({ title: '削除しますか', tone: 'danger' });",
  },
  browsers: {
    title: 'ブラウザ要件',
    intro:
      '層 1 をブラウザに任せる以上、ブラウザの現況がそのまま前提になる。古い環境では「アニメーションしないモーダル」に劣化するだけで、開閉とアクセシビリティは保たれる。',
    tableCaption: '使っているプラットフォーム機能と対応状況',
  },
  ai: {
    title: 'AI に書かせるとき',
    intro:
      'Cursor / Claude Code / Copilot には、仕様書 §9 のこのブロックだけを渡す。2022 年以前の実装の癖（自作のフォーカストラップ、z-index: 9999、条件マウント）を先回りで止める。',
  },
};
