import type ja from '../ja/body';

export default {
  lead: '模態視窗中唯一的捲動區域。為了讓鍵盤也能閱讀，它可以取得焦點，並擁有名稱。讀完門控也加在這裡。',
  scroll: {
    title: '只有內文會捲動',
    intro: '頁首與頁尾固定不動。內文還沒捲到盡頭時，上下會出現陰影。',
    exampleTitle: '更新紀錄',
    exampleDescription: '用 Tab 讓焦點移到內文，即可用方向鍵、PageDown、Space 捲動。',
  },
  focusable: {
    title: '可取得焦點的捲動區域',
    body: [
      '除了 Firefox 之外，瀏覽器不會自動讓可捲動的元素取得焦點。沒有滑鼠的使用者無法抵達內文，也就無法閱讀。gassan 的內文具備 `tabIndex={0}` 與 `role="group"`，以及無障礙名稱。我們不製造沒有名稱的可聚焦元素（B-02 / B-03）。',
    ],
    mockTitle: '更新紀錄',
    do: '能用 Tab 進入內文，以按鍵閱讀。名稱透過 label 設定，例如「更新紀錄內文」。',
    dont: '不要只寫 `<div className="overflow-y-auto">` 了事。對鍵盤使用者來說，那會成為無法閱讀的區域。',
  },
  readGate: {
    title: '讀完門控',
    body: [
      '傳入 `readGate="read"` 後，內文是否讀完會註冊為一個具名的門控。判定是「看到末端」「焦點抵達末端」「本來就不需要捲動」三者的邏輯或，一旦滿足就不會撤銷。關閉期間尺寸為 0，所以不做判定（§10-1）。用法請見[啟用門控](#/components/gate)。',
    ],
  },
  a11yCaption: '內文滿足的規格',
} satisfies typeof ja;
