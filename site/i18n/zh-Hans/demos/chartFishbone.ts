import type ja from '../../ja/demos/chartFishbone';

export default {
  label: '装配不良的原因',
  effect: '装配不良率超过 3%',
  description: '原因集中在材料和方法上。先确认存放环境的湿度和检验步骤。',
  man: '人员',
  machine: '机器',
  method: '方法',
  material: '材料',
  measurement: '测量',
  environment: '环境',
  causes: {
    skill: '作业经验不足',
    procedure: '不按步骤操作',
    manual: '作业指导书过时',
    fatigue: '夜班疲劳',
    wear: '刀具磨损',
    sensor: '传感器偏移',
    order: '装配顺序不统一',
    inspection: '只靠目视检查',
    lot: '批次间差异',
    storage: '存放方式',
    humidity: '湿度高',
    gauge: '量具校准过期',
    sampling: '抽样太少',
    temperature: '室温变化',
    dust: '灰尘',
  },
  comments: {
    sixM: '大骨是 6M（人员、机器、方法、材料、测量、环境）。按排列顺序依次分到上、下、上……',
  },
} satisfies typeof ja;
