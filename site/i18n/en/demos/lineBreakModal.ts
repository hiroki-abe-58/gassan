import type ja from '../../ja/demos/lineBreakModal';

/**
 * English needs no help from gassan (it already breaks at spaces), so the modal would look the same either way.
 * The demo keeps the Japanese sample so the difference stays visible; only the toggle, the button and the comment are English.
 * tests/site-i18n.test.ts exempts this demo from the leftover-kana check.
 */
export default {
  toggle: 'Break at phrase boundaries',
  open: 'Open a narrow modal',
  title: '第3四半期の店舗別売上レポートを共有する',
  description: '共有すると、閲覧権限のあるメンバー全員に通知が届きます。',
  tableLabel: '共有先',
  headTarget: '共有先',
  headRole: '権限',
  row1Target: '東北エリアの店舗責任者',
  row1Role: '閲覧とコメント',
  row2Target: '経営企画部のメンバー',
  row2Role: '閲覧のみ',
  draft: '下書きとして保存する',
  share: 'メンバーに共有して通知する',
  comments: {
    mode: "Just switch lineBreak. The default is 'phrase', so normally there is nothing to write",
  },
} satisfies typeof ja;
