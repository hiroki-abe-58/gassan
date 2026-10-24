/**
 * サイト全体で共有する文言（枠・ナビ・部品の見出し・テーマと言語の切り替え）。
 *
 * 文言の書式（全言語共通）:
 *   - 文中の `code` / **強調** / [リンク](#/path) はインライン Markdown で書き、md() で描く
 *   - サイト内リンクは #/path で書く。言語の頭（#/en/...）は描くときに付く
 *   - 数や名前を差し込む文は関数にする
 */
import type { CUSTOM_PRESET_ID, CheckId, PresetId, Tint } from '../../theme/engine';

export default {
  siteTitle: 'gassan — ネイティブ dialog のためのモーダルシェル',
  skipToMain: '本文へ移動',
  openMenu: 'メニューを開く',
  menu: 'メニュー',
  menuBody: 'サイト内のページ',
  siteNav: 'サイト内',
  home: 'ホーム',
  spec: '仕様',
  pager: '前後のページ',
  prev: '前へ',
  next: '次へ',
  footerCompliance: (version: string, updated: string): string => `[仕様書 v${version}（${updated}）](#/spec) に準拠`,
  footerGenerated: '表・件数・API はすべて仕様書と型定義からビルド時に生成している。手で書いた数値はない。',
  /** 日本語以外のページの頭に出す。日本語では出さないので空。 */
  originalNote: '',

  lang: {
    button: '言語',
    title: '表示する言語',
  },

  theme: {
    button: 'テーマ',
    close: '閉じる',
    scheme: '表示',
    schemes: { light: 'ライト', dark: 'ダーク', system: 'OS に合わせる' },
    background: '背景',
    tints: { neutral: '無彩色', soft: '淡い', strong: '濃い' } satisfies Record<Tint, string>,
    primary: 'プライマリカラー',
    presets: {
      default: '既定',
      magenta: '赤紫',
      red: '赤',
      salmon: 'サーモンピンク',
      vermilion: '赤寄りのオレンジ',
      amber: '黄色寄りのオレンジ',
      yellow: '黄色',
      'lime-yellow': 'ライムイエロー',
      lime: '黄緑',
      green: '緑',
      teal: 'ティール',
      blue: '青',
      indigo: '青紫',
      custom: '任意の色',
    } satisfies Record<PresetId | typeof CUSTOM_PRESET_ID, string>,
    pickCustom: '任意の色を選ぶ',
    summaryPass: (count: number, worst: string): string =>
      `文字と塗りの ${String(count)} 項目すべてが WCAG の基準を満たしている（いちばん厳しい組でも基準の ${worst} 倍）`,
    summaryFail: '基準を満たさない組がある',
    more: '選んだ色をどう調整しているか →',
    /** コントラストを確かめる組。キーは site/theme/engine.ts の CheckId。 */
    checks: {
      linkBg: 'リンク・選択中の文字（ページの背景）',
      linkSurface: 'リンク・選択中の文字（面）',
      linkSurface1: 'リンク・選択中の文字（一段沈んだ面）',
      linkSurface2: 'リンク・選択中の文字（二段沈んだ面）',
      linkSoft: 'リンク（淡い面の上）',
      onAccent: '塗りのボタンの文字',
      onSoft: '淡い面の文字（AAA を目標）',
      ink: '本文（いちばん比の小さい面）',
      ink2: '補足の文字（いちばん比の小さい面）',
      ink3: '控えめな文字（いちばん比の小さい面）',
      do: '「Do」の色の文字（いちばん比の小さい面）',
      dont: "「Don't」の色の文字（いちばん比の小さい面）",
      caution: '「Caution」の色の文字（いちばん比の小さい面）',
      gassanPrimary: 'モーダルの primary の文字',
      gassanGated: 'モーダルのゲート中の primary の文字',
      gassanBody: 'モーダルの本文',
      gassanMuted: 'モーダルの補足・tertiary',
      gassanDanger: 'モーダルのエラー文',
      focusRing: 'フォーカスリング（非テキスト）',
      fill: 'スイッチ・選択中のチップの塗り（非テキスト）',
    } satisfies Record<CheckId, string>,
  },

  code: {
    copy: 'コピー',
    copied: 'コピーしました',
    copiedStatus: 'コードをコピーしました',
    label: 'コード',
    labelOf: (caption: string): string => `${caption} のコード`,
  },

  example: {
    show: 'コードを見る',
    hide: 'コードを閉じる',
  },

  /** 要点（KeyPoint）。注意のときだけ、見出し語を色の付いた文字で添える。 */
  keyPoint: { caution: '注意' },

  component: {
    eyebrow: 'コンポーネント',
    tabs: 'このページの内容',
    overview: '概要',
    api: 'API',
    a11y: 'アクセシビリティ',
  },

  specChips: 'このページが扱う仕様',

  guideline: { do: 'Do', dont: "Don't", caution: 'Caution' },

  mock: { heading: '今月の売上' },

  specTable: {
    id: 'ID',
    behavior: '振る舞い',
    priority: '度',
    summary: '実装の要点',
    status: '状態',
  },
  priority: { M: '必須', S: '推奨', O: '任意' },
  /** 追跡表の状態の語彙。キーは docs/traceability.md の原文。 */
  status: {
    実装: '実装',
    実機: '実機',
    記述: '記述',
    未検証: '未検証',
    委譲: '委譲',
    合成: '合成',
    ロードマップ: 'ロードマップ',
  },

  api: {
    name: '名前',
    type: '型',
    default: '既定値',
    description: '説明',
    required: '必須',
    none: 'なし',
    propsOf: (name: string): string => `${name} のプロパティ`,
    passthrough:
      '`data-*` はホスト要素へそのまま渡す（D-11）。`aria-*` などハイフン付きのほかの prop は警告して落とす。',
    inherits: (name: string): string => `\`${name}\` を継承する。`,
  },

  table: '表',

  /** コントラストの見本に描く字。その言語の文字を 1 つ含める（字形で読みやすさが変わるので）。 */
  contrastSample: 'Aa あ',

  breakCompare: {
    browser: 'ブラウザ任せ',
    browserNote: '文字単位で折れる',
    phraseNote: '文節の切れ目で折れる',
  },

  layers: {
    layer: (n: number): string => `層${String(n)}`,
    tokens: 'CSS トークン',
  },

  notFound: {
    title: 'ページが見つからない',
    lead: 'リンクが古いか、アドレスが違っている。',
    back: 'ホームへ戻る',
  },
};
