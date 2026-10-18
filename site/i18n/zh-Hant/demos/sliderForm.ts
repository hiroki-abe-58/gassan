import type ja from '../../ja/demos/sliderForm';

export default {
  open: '搜尋條件',
  title: '搜尋條件',
  price: '價格區間',
  yen: '¥{0}',
  distance: '與車站的距離',
  km: '{0} 公里以內',
  cancel: '取消',
  apply: '以此條件搜尋',
  comments: {
    range: '雙把手是把兩條 range 疊在一起。名稱為「下限」「上限」，群組的名稱由 legend 提供（I-10）',
    format: 'formatValue 同時用於旁邊的顯示與 aria-valuetext',
  },
} satisfies typeof ja;
