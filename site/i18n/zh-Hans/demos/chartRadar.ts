import type ja from '../../ja/demos/chartRadar';

export default {
  label: '本公司与竞争对手的评价',
  description: '在易用性和客户支持上领先，在功能丰富度和外部集成上落后。',
  axis: '维度',
  ours: '本公司',
  rival: '竞争对手 A',
  axes: {
    features: '功能丰富度',
    ease: '易用性',
    price: '价格',
    support: '客户支持',
    integrations: '外部集成',
    security: '安全性',
  },
  comments: {
    max: '最外圈的值。5 级评分时设为 5，让各圈对应 1〜5',
  },
} satisfies typeof ja;
