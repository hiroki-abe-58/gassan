import type ja from '../ja/root';

export default {
  lead: '負責第 1〜3 層的容器。把 top layer、焦點、Esc 交給 <dialog> 與 showModal()，放置遮罩、面板與即時區域，並把關閉請求連同理由匯集到單一路徑。',
  playground: {
    title: '由 kind 決定的事',
    intro: '變更 kind、size、placement、scrim 後開啟。在設定為不關閉時按 Esc 或點擊背景，面板會晃動並朗讀理由。',
    exampleTitle: 'Modal.Root 的 Playground',
  },
  reasons: {
    title: '關閉原因',
    intro: 'onOpenChange(false, reason) 一定會附帶理由。因此可以寫出「只有按 Esc 關閉時才儲存草稿」這類分支。',
    tableLabel: '關閉原因一覽',
    tableCaption: 'CloseReason 的 8 種',
    from: '來源',
    refuse: '可拒絕的途徑',
    rows: {
      esc: { from: 'Esc 鍵。一定攔下原生的 cancel，匯流到這裡', refuse: 'dismiss.esc / onRequestClose' },
      backdrop: { from: '按下遮罩。只有按下點與放開點都在遮罩上時才算', refuse: 'dismiss.backdrop / onRequestClose' },
      'close-button': { from: 'Modal.Close，或 closeOnClick="close-button" 的按鈕', refuse: 'onRequestClose' },
      'back-button': { from: 'closeOnBack 時的瀏覽器返回（只有最上層的一個會回應）', refuse: 'onRequestClose' },
      submit: { from: 'closeOnClick="submit" 的按鈕，或 <form method="dialog">', refuse: 'onRequestClose（經由按鈕時）' },
      programmatic: { from: '從外部呼叫了 dialog.close()', refuse: '—（已經關閉，只做善後）' },
      swipe: { from: '底部面板的向下快速滑動（swipeToDismiss）', refuse: 'dismiss.backdrop / onRequestClose' },
      'route-change': { from: 'routeKey 改變了（Next.js 的話傳入 usePathname()）', refuse: 'onRequestClose' },
    },
  },
  guard: {
    title: '攔下關閉',
    intro: '只要 onRequestClose 回傳 false（或解析為 false 的 Promise），就不會關閉。拒絕時不會默不作聲，而是晃動面板並朗讀理由。',
    exampleTitle: '攔下填到一半的表單',
    exampleDescription: '輸入一些內容後按 Esc 或 ×。上方會再疊上一層確認視窗。',
  },
  mount: {
    title: '常駐掛載與善後',
    body: [
      '模態視窗要一直繪製著，用 `open` 控制開關。收到關閉請求時，加上 `data-exiting` 繪製退場，等待 `--g-dur-out` 之後才 `close()`。內容重設（`resetOnClose`）、焦點復原、解除捲動鎖定與 `onExited`，全都在 `close()` 之後進行。',
    ],
    callout:
      '也可以巢狀使用（L-11）。為了不讓內側的 Esc 或 Cmd/Ctrl + Enter 傳到外側，事件只在「最近的 dialog 是自己時」才放行。疊了兩層，遮罩也只維持一層的濃度（L-12）。',
  },
  a11yBody: [
    '困住焦點、背景 inert 化、Esc、焦點復原由 `showModal()` 處理。Root 自己負責的是：名稱的關聯、一個即時區域、初始焦點的位置，以及把關閉途徑統一成一條。',
  ],
  a11yCaption: 'Modal.Root 滿足的規格',
} satisfies typeof ja;
