import type ja from '../../ja/demos/chartFishbone';

export default {
  label: '조립 불량의 요인',
  effect: '조립 불량률 3% 초과',
  description: '요인은 재료와 방법에 몰려 있다. 먼저 보관 습도와 검사 절차를 확인한다.',
  man: '사람',
  machine: '기계',
  method: '방법',
  material: '재료',
  measurement: '측정',
  environment: '환경',
  causes: {
    skill: '작업 경험 부족',
    procedure: '절차 미준수',
    manual: '오래된 작업 지침서',
    fatigue: '야간 근무 피로',
    wear: '칼날 마모',
    sensor: '센서 오차',
    order: '제각각인 조립 순서',
    inspection: '육안 검사뿐',
    lot: '로트 간 편차',
    storage: '보관 방법',
    humidity: '높은 습도',
    gauge: '게이지 교정 기한 만료',
    sampling: '샘플링 부족',
    temperature: '실온 변화',
    dust: '먼지',
  },
  comments: {
    sixM: '큰 뼈는 6M(사람·기계·방법·재료·측정·환경). 늘어놓은 순서대로 위·아래·위…로 나눠 배치한다',
  },
} satisfies typeof ja;
