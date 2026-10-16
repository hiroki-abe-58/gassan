import type ja from '../ja/sheet';

export default {
  lead: 'placement="sheet" 會成為從下方升起的面板。傳入 detents 後，會停在 peek / half / full。把手不是裝飾，而是用鍵盤也能操作的控制項。',
  detents: {
    title: '停在檔位的底部面板',
    intro: '拖曳把手，或讓把手取得焦點後用 ↑ ↓ 切換檔位。目前的檔位可透過 onDetentChange 取得。',
    exampleTitle: '前往月山的路線',
    exampleDescription: '窄螢幕可以用手指，寬螢幕可以用鍵盤與點擊來試。',
  },
  rules: {
    title: '三條約定',
    items: [
      {
        title: '快速向下滑動不會關閉，而是降一檔',
        body: '既然有檔位，使用者滑動時的意圖是「縮小一點」。只有在最低一檔還繼續往下滑時才會關閉。',
      },
      {
        title: '把手不只能拖曳',
        body: '有檔位時它是 role="slider"，用方向鍵、Home / End 與點擊也能切換檔位。不剝奪無法拖曳的人的操作途徑。',
      },
      {
        title: '不指定檔位時，高度隨內容而定',
        body: '把手退化為裝飾（aria-hidden）。不讓無法操作的東西被當成控制項朗讀。',
      },
    ],
  },
  release: {
    title: '手指放開之後',
    body: [
      '比起拖曳本身的判定，手指放開後瀏覽器擅自引發的事更容易出錯。拖曳後緊接著合成的 click 讓檔位移動兩次、在面板外放開手指就卡住、回到同一檔位時高度設定消失——每一個都是實際踩過、修好，並用測試固定下來的（§10-13〜§10-15）。',
    ],
    callout:
      '目標檔位的判定被抽成 `resolveDetents` / `snapToDetent` 兩個純函式，可以單獨 import。這是為了讓沒有版面配置的測試環境也能驗證。',
  },
  api: {
    body: [
      '檔位本身透過 `Modal.Root` 的 `detents` / `defaultDetent` / `onDetentChange` / `swipeToDismiss` 指定（[Modal.Root 的 API](#/components/root/api)）。',
    ],
  },
  a11yCaption: '底部面板與行動裝置的規格',
} satisfies typeof ja;
