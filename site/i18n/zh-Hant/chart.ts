import type ja from '../ja/chart';

export default {
  lead: '圖表的容器，用於你帶來的圖表（任何函式庫，或自己寫的 SVG、canvas）。為圖表接上名稱、趨勢摘要與原始資料的展開。因為單獨的 canvas 對朗讀而言資訊量為零。要用 gassan 繪製，請使用 UI 元件中的「圖表」（LineChart 等）。',
  report: {
    title: '名稱、摘要、原始資料',
    intro: 'label 與 summary 為必填。圖表本身預設為 aria-hidden，摘要與原始資料成為唯一的途徑。',
    exampleTitle: '月報',
    exampleDescription: '展開「顯示原始資料」，就能以表格讀到相同的數值。',
  },
  why: {
    title: '與繪圖元件的分工',
    body: [
      'gassan 繪製的圖表（UI 元件中的「圖表」）自帶名稱、摘要、原始資料表，以及用鍵盤逐一瀏覽資料點的朗讀。這個容器用於其他所有的圖表。有些圖 gassan 不繪製，例如地圖、網路圖與 3D；有時你也想用熟悉的繪圖函式庫。圖表用 SVG、canvas 或任何函式庫都可以。這個容器只承擔任何圖表都容易缺少的三件事：「名稱」「趨勢的文字替代」「抵達原始資料的途徑」。',
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
