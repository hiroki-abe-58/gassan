export default {
  lead: '入場も退出も CSS だけで描く。JS のアニメーションライブラリは使わない。JS が担うのは「退出が見えるまで close() を待つ」ことだけ。',
  durations: {
    title: '時間',
    intro: '退出は入場より速く。人は「開く」を待てるが「閉じる」を待てない。',
    in: '入場',
    out: '退出',
    replayClose: '閉じる（120ms）',
    replayOpen: '開く（180ms）',
  },
  easing: {
    title: 'イージング',
    in: '入場（減速して止まる）',
    out: '退出（加速して去る）',
  },
  exit: {
    title: '退出アニメと overlay',
    body: [
      '退出を CSS で描く要は `transition-behavior: allow-discrete` と `overlay` の 2 つ。ただし `overlay` はまだ Baseline ではない。対応していないブラウザでは `close()` した瞬間に top layer から外れて消える。',
      'そこで gassan は、閉じる要求を受けたら `close()` を呼ばずに `data-exiting` を付け、dialog を開いたまま退出状態へ遷移させる。`--g-dur-out` だけ待ってから `close()` する。待ち時間は CSS のトークンから読むので、JS に同じ数値を二重に持たない（L-07）。',
    ],
  },
  reduced: {
    title: '動きを減らす設定',
    callout:
      '`prefers-reduced-motion: reduce` ではフェードを 1ms にする。0 にはしない。0 にすると discrete な遷移（`display` と `overlay`）が壊れる（S-05）。退出の待ち時間も 0 になるが、経路は同じコードを通す。',
    tableCaption: 'モーションの仕様',
  },
};
