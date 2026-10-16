import type ja from '../ja/kinds';

export default {
  lead: '動手之前，先從中選出你要做的是哪一種。類型一旦確定，遮罩、配置、關閉方式與頁尾的順序就由決策矩陣自動決定。',
  kinds: {
    title: '五種類型',
    intro: '若同時符合多種，那其實是該拆開的兩個模態視窗。',
    tableCaption: '模態視窗的五種類型',
  },
  live: {
    title: '實際操作看看',
    intro: '每一個都是真正的 gassan。在設定為不關閉的類型中按 Esc 或點擊背景，面板會晃動並朗讀理由。',
    confirm: {
      title: 'confirm — 確認',
      description: '小巧、置中。按 Esc 或點擊背景都能關閉。',
    },
    form: {
      title: 'form — 輸入',
      description: '點擊背景不會關閉。輸入到一半時會攔下來。',
    },
    view: {
      title: 'view — 檢視',
      description: '使用 immersive 遮罩的燈箱。可用方向鍵切換。',
    },
    consent: {
      title: 'consent — 同意',
      description: '在讀完並同意之前，無法按下 primary。按下會回報理由。',
    },
    flow: {
      title: 'flow — 流程',
      description: '返回、目前位置、關閉三個插槽。',
    },
  },
  scrim: {
    title: '遮罩',
    body: [
      '預設為黑色 32%、不加 blur。60〜80% 的黑色會扼殺後方的上下文，親手丟掉模態視窗唯一的優勢。依意圖區分的 4 個等級，以及允許使用 blur 的條件，整理在[遮罩](#/styles/scrim)頁面。',
    ],
  },
  placement: {
    title: '配置',
    tableCaption: '配置的條件',
    callout:
      '`placement="auto"` 會先由 JS（matchMedia）解析為 `center` 或 `sheet`，再交給 DOM。若用 CSS 媒體查詢分支，每種配置的 `@starting-style` 就得各寫一份，其中一份必定會腐壞。',
  },
  dismiss: {
    title: '可否關閉',
    intro: '○ 表示關閉，✕ 表示不關閉，△ 表示有條件（例如先插入未儲存的確認）。',
    tableCaption: '各類型的關閉方式',
    mockTitle: '服務條款更新',
    mockNote: '此對話框目前還無法關閉',
    do: '即使設定為不關閉，也要把 Esc 或點擊背景視為「想關閉」的明確意思表示。讓面板晃動，並以 `role="status"` 朗讀理由（L-10）。',
    dont: '不要默默忽略。如果什麼事都沒發生，使用者會以為壞掉了。',
  },
  footer: {
    title: '頁尾按鈕的順序',
    intro: 'DOM 順序 = 視覺順序 = Tab 順序 = 朗讀順序。窄螢幕上也不反轉。',
    orderTitle: '發布文章',
    cancel: '取消',
    draft: '儲存草稿',
    publish: '發布',
    orderDo: '窄螢幕上依 DOM 順序直向堆疊。若想把 primary 放在上方，要改的是 DOM 本身的順序，而不是 CSS。',
    orderDont:
      '不要用 `column-reverse` 或 `order` 只交換外觀。Tab 與朗讀的順序會和視覺相反（WCAG 1.3.2 / 2.4.3）。',
    dangerTitle: '刪除專案',
    dangerCancel: '先不要',
    dangerDelete: '刪除',
    dangerDo: '破壞性的操作，位置維持平常的 primary，只把顏色換成 danger（F-06）。',
    dangerDont: '不要同時改變顏色與位置。肌肉記憶會失準，反而造成誤操作。',
  },
  gates: {
    title: '啟用門控的選擇方式',
    intro: '可以製造「無法按下」狀態的條件很有限。禁止用時間讓人等待，也禁止只靠捲動位置判定。',
    tableCaption: '可以用於門控的條件',
    more: '[啟用門控的用法 →](#/components/gate)',
  },
} satisfies typeof ja;
