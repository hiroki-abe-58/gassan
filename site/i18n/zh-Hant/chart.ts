import type ja from '../ja/chart';

export default {
  lead: '圖表的容器，本身不繪製。為你帶來的圖表接上名稱、趨勢摘要與原始資料的展開。因為單獨的 canvas 對朗讀而言資訊量為零。',
  report: {
    title: '名稱、摘要、原始資料',
    intro: 'label 與 summary 為必填。圖表本身預設為 aria-hidden，摘要與原始資料成為唯一的途徑。',
    exampleTitle: '月報',
    exampleDescription: '展開「顯示原始資料」，就能以表格讀到相同的數值。',
  },
  why: {
    title: '為什麼不繪製',
    body: [
      '繪圖函式庫選擇眾多，最佳解依用途而異。若由 gassan 內建，選了其中一個的瞬間，就背叛了其他使用者。所以圖表用 SVG、canvas 或任何函式庫都可以。gassan 只承擔任何圖表都容易缺少的三件事：「名稱」「趨勢的文字替代」「抵達原始資料的途徑」。',
      '如果圖表本身就具備無障礙性，例如可以用鍵盤逐一瀏覽，就能用 `visualAccessible` 移除 `aria-hidden`。',
    ],
    mockTitle: '每月營收（萬日圓）',
    mockSummary: '3 月最高，為 120 萬日圓。4 月以後持平。',
    mockDisclosure: '顯示原始資料',
    do: '替圖表附上名稱與趨勢摘要，原始資料則能以表格展開。',
    dont: '不要只放一個 canvas 或 SVG 了事。對看不到的人來說，那等於「什麼都沒有」。',
  },
  a11yCaption: 'Modal.Chart 滿足的規格',
} satisfies typeof ja;
