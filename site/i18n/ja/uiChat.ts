export default {
  lead: '人どうしのチャットにも、AI との対話にも使う部品。メッセージの列・入力欄・入力中の印・質問の例。上を読んでいる間は位置を動かさず、日本語の変換中の Enter を送信と取り違えない。',
  team: {
    title: 'チームのチャット',
    intro: '自分のメッセージは右にアクセントの色で、相手のメッセージは左に置く。同じ人が続けて送ったメッセージは、顔と名前を繰り返さない。',
    exampleTitle: '佐藤さんとの会話',
    exampleDescription: '送ると「送信中」から「既読」に変わり、入力中の印のあとに返事が届く。上へスクロールしている間に届くと、「新しいメッセージ」のボタンで知らせる。',
  },
  assistant: {
    title: 'AI との対話',
    intro: 'AI の回答は吹き出しにせず、本文として幅いっぱいに出す。質問の例から始められ、回答を書いている間は止められる。',
    exampleTitle: 'AI アシスタント',
    exampleDescription: '質問の例を押すと、回答を流しながら書く。書いている間は、送信のボタンが「止める」になる。回答は書き終えてから読み上げる。',
  },
  behavior: {
    title: '読み続けられるための決まり',
    intro: 'チャットは、読んでいる途中で中身が増えていく。読む人の位置と読み上げを守るために、次のように振る舞う。',
    tableCaption: '会話の部品の決まり',
    head: { when: 'とき', then: 'どうするか' },
    rows: [
      { when: '新しいメッセージが届いた', then: 'いちばん下を見ていれば付いていく。上を読んでいれば位置を動かさず、「新しいメッセージ 3件」のボタンで知らせる' },
      { when: '前のメッセージを読み込んだ', then: '読んでいた所を保つ（上に足しても、見ている行は動かない）' },
      { when: '日本語を変換している', then: '変換中の Enter は確定に使い、送らない' },
      { when: 'タッチの端末で書いている', then: 'Enter は改行にする（画面のキーボードには Shift が無い）。送るのは送信のボタンで、キーの案内も出さない' },
      { when: 'AI が回答を書いている', then: 'aria-busy にして、書き終えてから読み上げる。送信のボタンは「止める」になる' },
      { when: '相手が入力している', then: '「佐藤さんが入力中」と言葉で伝え、列の外に置く（出入りのたびに読み上げない）' },
    ],
  },
  access: {
    title: '読み上げとキー',
    intro: '列は role="log" で、足したメッセージを読み上げる。メッセージは「名前 時刻」を名前に持つ article で、時刻は time 要素。',
    tableCaption: '会話の部品のキー操作',
    head: { key: 'キー', action: '動き' },
    rows: [
      { key: 'Tab', action: '列 → 入力欄 → 送信のボタン、の順に止まる。列では ↑↓ でスクロールできる' },
      { key: 'Enter', action: '送る（空の文は送らない）' },
      { key: 'Shift+Enter', action: '改行する' },
      { key: 'Ctrl+Enter / ⌘+Enter', action: 'sendOn="mod+enter" のときに送る（Enter は改行）' },
    ],
  },
  codeCaption: '使い方',
  code: "import { ChatComposer, ChatThread } from '@genelab/gassan';\n\n<ChatThread\n  label=\"佐藤さんとの会話\"\n  messages={messages}\n  currentUserId={me.id}\n  unreadFrom={firstUnreadId}\n  typing={typingUsers}\n/>\n<ChatComposer onSend={(text) => send(text)} placeholder=\"メッセージを入力\" />",
  a11yCaption: '会話の部品の振る舞い',
};
