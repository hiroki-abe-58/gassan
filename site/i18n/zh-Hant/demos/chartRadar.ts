import type ja from '../../ja/demos/chartRadar';

export default {
  label: '本公司與競爭對手的評比',
  description: '在易用性與支援上領先，在功能豐富度與外部整合上落後。',
  axis: '面向',
  ours: '本公司',
  rival: '競爭對手 A',
  axes: {
    features: '功能豐富度',
    ease: '易用性',
    price: '價格',
    support: '支援',
    integrations: '外部整合',
    security: '安全性',
  },
  comments: {
    max: '最外圈的值。若是 5 級評分就設為 5，讓各圈對應 1〜5',
  },
} satisfies typeof ja;
