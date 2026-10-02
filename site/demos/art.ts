/**
 * デモ用の絵。外部の画像に依存しないよう、SVG をその場で組み立てて data URI にする。
 * 稜線と月だけの抽象的な風景。
 */
export interface Scene {
  id: string;
  title: string;
  sky: [string, string];
  ridge: [string, string];
  moon: { x: number; y: number; r: number };
}

export const SCENES: readonly Scene[] = [
  { id: 'dawn', title: '夜明けの稜線', sky: ['#f6d6c4', '#9fb6e0'], ridge: ['#5a6a8f', '#2d3550'], moon: { x: 1180, y: 250, r: 70 } },
  { id: 'noon', title: '真昼の尾根', sky: ['#cfe7f4', '#7fb3d5'], ridge: ['#4f7a6a', '#24433a'], moon: { x: 360, y: 210, r: 54 } },
  { id: 'dusk', title: '夕暮れの山', sky: ['#f3b38a', '#6c4f8f'], ridge: ['#3f2d55', '#1d1430'], moon: { x: 1260, y: 330, r: 88 } },
  { id: 'night', title: '月夜の峰', sky: ['#1d2547', '#0a0d1c'], ridge: ['#28305a', '#0f1328'], moon: { x: 980, y: 220, r: 96 } },
  { id: 'snow', title: '雪の頂', sky: ['#eef2f7', '#b9c6d8'], ridge: ['#8b98ad', '#55627a'], moon: { x: 520, y: 260, r: 60 } },
];

export function sceneUri(scene: Scene): string {
  const { sky, ridge, moon } = scene;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
<defs>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
</defs>
<rect width="1600" height="900" fill="url(#s)"/>
<circle cx="${String(moon.x)}" cy="${String(moon.y)}" r="${String(moon.r)}" fill="#fffaf0" opacity=".85"/>
<path d="M0 640 L220 470 L380 560 L620 330 L860 560 L1040 450 L1260 600 L1600 420 L1600 900 L0 900Z" fill="${ridge[0]}"/>
<path d="M0 760 L300 600 L520 700 L760 560 L1020 720 L1300 620 L1600 740 L1600 900 L0 900Z" fill="${ridge[1]}"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
