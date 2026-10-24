import type ja from '../ja/uiFeedback';

export default {
  lead: '進度條、載入圖示、載入前的骨架屏、頁面上的通知橫幅。它們都會把「現在正在發生什麼」同時傳達給眼睛與朗讀。',
  progress: {
    title: '進度',
    intro: '讓 role="progressbar" 帶有名稱與值。值預設朗讀為百分比，也能用 valueText 寫成「12 / 20 GB」這樣的形式。值未知時，線條會持續流動。',
  },
  spinner: {
    title: '載入圖示',
    intro: '用於短暫的等待。以 role="status" 只朗讀一次「處理中」，圓環本身只是裝飾。在「減少動態效果」設定下，旋轉會變慢。',
  },
  skeleton: {
    title: '骨架屏',
    intro: '在載入前只顯示輪廓，減少內容出現時的跳動。它只是裝飾，所以不會被朗讀。正在載入這件事，以所在容器的 aria-busy 或載入圖示傳達。光澤流動的動畫，在「減少動態效果」設定下以及動態效果的等級為 none 時會停止。',
  },
  banner: {
    title: '通知橫幅',
    intro: '維護預告、付款失敗、試用期剩餘天數等與整個頁面相關的通知。以低調的底色與內文區隔，不用外框或左側粗線把它框起來。只有在之後才顯示時，才用 live 朗讀。',
  },
  labels: {
    value: '有值',
    custom: '改變值的寫法',
    small: '細（sm）',
    indeterminate: '值未知',
    sizes: '大小',
    text: '文字骨架',
    card: '卡片骨架',
  },
  sample: {
    upload: '上傳',
    storage: '儲存空間',
    storageText: (used: number, max: number): string => `${String(used)} / ${String(max)} GB`,
    sync: '同步',
    preparing: '正在準備匯出',
    maintenanceTitle: '維護公告',
    maintenance: '10月24日（六）2:00〜4:00 將暫停服務。',
    paymentTitle: '付款失敗',
    payment: '無法以登錄的信用卡完成付款。請更新信用卡資訊。',
    update: '更新信用卡',
    trial: '試用期還剩 5 天。',
    upgrade: '選擇方案',
    saved: '已儲存設定。',
  },
  code: "import { Progress, Spinner, Skeleton, Banner } from '@genelab/gassan';\n\n<Progress label=\"儲存空間\" value={12} max={20} valueText={(v, m) => `${v} / ${m} GB`} />\n\n<Spinner label=\"正在同步\" />\n\n<div aria-busy={loading}>{loading ? <Skeleton lines={3} /> : <Article />}</div>\n\n<Banner tone=\"error\" title=\"付款失敗\" action={<Button size=\"sm\">更新信用卡</Button>}>\n  無法以登錄的信用卡完成付款。\n</Banner>",
  codeCaption: '用法',
  a11yCaption: '進度與通知滿足的規格',
} satisfies typeof ja;
