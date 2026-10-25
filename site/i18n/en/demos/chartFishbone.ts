import type ja from '../../ja/demos/chartFishbone';

export default {
  label: 'Causes of assembly defects',
  effect: 'Assembly defect rate above 3%',
  description: 'The causes cluster around materials and methods. Check storage humidity and the inspection procedure first.',
  man: 'People',
  machine: 'Machines',
  method: 'Methods',
  material: 'Materials',
  measurement: 'Measurement',
  environment: 'Environment',
  causes: {
    skill: 'Little hands-on experience',
    procedure: 'Steps are skipped',
    manual: 'Outdated work instructions',
    fatigue: 'Night-shift fatigue',
    wear: 'Worn blades',
    sensor: 'Sensor drift',
    order: 'Inconsistent assembly order',
    inspection: 'Visual inspection only',
    lot: 'Variation between lots',
    storage: 'How parts are stored',
    humidity: 'High humidity',
    gauge: 'Gauges out of calibration',
    sampling: 'Too few samples',
    temperature: 'Room temperature swings',
    dust: 'Dust',
  },
  comments: {
    sixM: 'The main bones are the 6Ms (people, machines, methods, materials, measurement, environment), placed above, below, above… in order',
  },
} satisfies typeof ja;
