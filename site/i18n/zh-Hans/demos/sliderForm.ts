import type ja from '../../ja/demos/sliderForm';

export default {
  open: '搜索条件',
  title: '搜索条件',
  price: '价格区间',
  yen: '¥{0}',
  distance: '离车站的距离',
  km: '{0} km 以内',
  cancel: '取消',
  apply: '按此条件搜索',
  comments: {
    range: '双手柄是把两个 range 叠在一起。名称为“下限”“上限”，整组的名称用 legend（I-10）',
    format: 'formatValue 同时用于旁边的显示和 aria-valuetext',
  },
} satisfies typeof ja;
