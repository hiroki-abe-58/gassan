import type ja from '../ja/motion';

export default {
  lead: '進場與退場都只用 CSS 繪製，不使用 JS 動畫函式庫。JS 只負責一件事：「等退場可見之後再 close()」。',
  durations: {
    title: '時長',
    intro: '退場要比進場快。人可以等待「開啟」，卻等不了「關閉」。',
    in: '進場',
    out: '退場',
    replayClose: '關閉（120ms）',
    replayOpen: '開啟（180ms）',
  },
  easing: {
    title: '緩動',
    in: '進場（減速後停下）',
    out: '退場（加速後離開）',
  },
  exit: {
    title: '退場動畫與 overlay',
    body: [
      '用 CSS 繪製退場的關鍵是 `transition-behavior: allow-discrete` 與 `overlay` 這兩者。不過 `overlay` 還不屬於 Baseline。在不支援的瀏覽器中，呼叫 `close()` 的瞬間元素就會離開 top layer 並消失。',
      '因此 gassan 收到關閉請求時不呼叫 `close()`，而是加上 `data-exiting`，在 dialog 保持開啟的狀態下轉換到退場狀態，等待 `--g-dur-out` 之後才 `close()`。等待時間從 CSS 的 token 讀取，因此 JS 不必重複持有相同的數值（L-07）。',
    ],
  },
  reduced: {
    title: '減少動態效果的設定',
    callout:
      '在 `prefers-reduced-motion: reduce` 下，淡入淡出設為 1ms，而不是 0。設為 0 會破壞離散的轉換（`display` 與 `overlay`）（S-05）。退場的等待時間也會變成 0，但流程仍走同一段程式碼。',
    tableCaption: '動態效果的規格',
  },
} satisfies typeof ja;
