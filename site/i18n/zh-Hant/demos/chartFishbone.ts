import type ja from '../../ja/demos/chartFishbone';

export default {
  label: '組裝不良的原因',
  effect: '組裝不良率超過 3%',
  description: '原因集中在材料與方法。先確認存放時的濕度與檢驗程序。',
  man: '人員',
  machine: '機器',
  method: '方法',
  material: '材料',
  measurement: '量測',
  environment: '環境',
  causes: {
    skill: '作業經驗不足',
    procedure: '未遵守作業程序',
    manual: '作業指導書過時',
    fatigue: '夜班疲勞',
    wear: '刀具磨損',
    sensor: '感測器偏移',
    order: '組裝順序不一致',
    inspection: '只靠目視檢驗',
    lot: '批次間的差異',
    storage: '存放方式',
    humidity: '濕度過高',
    gauge: '量規校正過期',
    sampling: '抽樣數過少',
    temperature: '室溫變化',
    dust: '灰塵',
  },
  comments: {
    sixM: '大骨是 6M（人員、機器、方法、材料、量測、環境）。依排列的順序，輪流分配到上、下、上…',
  },
} satisfies typeof ja;
