export default {
  lead: 'ページや操作を、名前を打って探して実行する窓。⌘K（Windows などでは Ctrl+K）で画面の上に開き、キーだけで選べる。このサイトの右上の「検索」も、この部品でできている。',
  example: {
    title: '見本',
    intro: 'ページと操作を、まとまりに分けて並べる。「めんばー」と打てば「メンバー」に当たり、「invoice」のような別名でも探せる。使えない操作は薄く出し、キーで動くときは飛ばす。',
    exampleTitle: 'コマンドパレット',
    exampleDescription: '↑↓ で動いて Enter で選ぶ。当てはまった所は太字になり、当てはまった数を読み上げる。',
  },
  matching: {
    title: '探し方と並べ方',
    intro: '打った文字は、全角と半角・大文字と小文字・ひらがなとカタカナを区別せずに、名前・補足・別名と突き合わせる。並べる順は次のとおりで、同じなら渡した順のまま。',
    tableCaption: '並べる順',
    head: { rank: '順', rule: '当てはまり方', typed: '打った文字', hits: '当たる例' },
    rows: [
      { rank: '1', rule: '名前の頭', typed: 'めんばー', hits: 'メンバー・メンバーを招待' },
      { rank: '2', rule: '名前の中', typed: 'を', hits: 'メンバーを招待・データを書き出す' },
      { rank: '3', rule: '補足と別名', typed: 'invoice', hits: '料金と請求（別名に invoice）' },
    ],
  },
  site: {
    title: 'このサイトの検索',
    intro: '右上の「検索」（⌘K / Ctrl+K）で開く窓は、この部品そのもの。全ページの名前を、節ごとのまとまりで探せる。ページのアドレスの英語（「datepicker」「toast」など）でも当たる。',
  },
  codeCaption: '使い方',
  code: "import { CommandPalette } from '@genelab/gassan';\n\n// ⌘K / Ctrl+K で開く。開き閉じを自分で持つなら open と onOpenChange を渡す\n<CommandPalette\n  items={[\n    { id: 'members', group: 'ページ', label: 'メンバー', href: '/members', keywords: ['members'] },\n    { id: 'invite', group: '操作', label: 'メンバーを招待', shortcut: ['G', 'I'], onSelect: openInvite },\n  ]}\n/>",
  a11yCaption: 'コマンドパレットの振る舞い',
};
