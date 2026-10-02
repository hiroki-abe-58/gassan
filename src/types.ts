/**
 * kasane — public types
 *
 * 設計の前提は modal.skill.md に準拠する。
 * 層1（top layer / focus / esc）はネイティブ <dialog> に委譲し、
 * このファイルは層2〜4（scrim / container / flow）の語彙だけを定義する。
 */

/**
 * 閉じた理由。L-08。
 * 「なぜ閉じたか」を呼び出し側が分岐できないと、
 * 「Esc で閉じたときだけ下書きを保存する」のような要求に応えられない。
 */
export type CloseReason =
  | 'esc'
  | 'backdrop'
  | 'close-button'
  | 'back-button'
  | 'submit'
  | 'programmatic'
  | 'swipe'
  | 'route-change';

/** S-01。単一値を持たず、意図別に4段階＋none。 */
export type ScrimToken = 'none' | 'subtle' | 'default' | 'strong' | 'immersive';

/** C-01。 */
export type SizeToken = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** 解決済みの配置。DOM に出るのは必ずこの3つのどれか。 */
export type PlacementToken = 'center' | 'top' | 'sheet';

/** 利用側が指定できる配置。'auto' は JS 側で解決してから DOM に流す（§3-2）。 */
export type PlacementOption = PlacementToken | 'auto';

/**
 * モーダルの5類型（§2）。
 * これを指定すると scrim と dismiss の既定が決まる。
 * 複数該当するなら、それは分割すべき2つのモーダルである。
 */
export type ModalKind = 'confirm' | 'form' | 'view' | 'consent' | 'flow';

/** dismiss の可否（§3-3）。false でも「無言で無視」はしない。 */
export interface DismissPolicy {
  /** Esc キー。既定は kind に従う。 */
  esc?: boolean;
  /** スクリムのクリック。既定は kind に従う。 */
  backdrop?: boolean;
}

/**
 * 名前付きゲートの1件。G-02。
 * satisfied=false のあいだ、このゲートを参照するボタンは aria-disabled になる。
 */
export interface GateEntry {
  /** 充足したか。G-09 により、一度 true になったら実装側で false に戻さない。 */
  satisfied: boolean;
  /** なぜ進めないのか。押下時にアナウンスされ、常時 aria-describedby でも参照される。G-07。 */
  reason: string;
  /** 詰まっている箇所へ利用者を連れて行く。G-08。 */
  focus?: () => void;
  /** 複数のゲートが同時に未充足のとき、どれを先に案内するか。小さいほど先。 */
  order?: number;
}

/** ボタンの階層。F-01。 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

/** ボタンが参照するゲート。true は「登録済みの全ゲート」。 */
export type GateSelector = boolean | readonly string[];

/** kind ごとの既定値（§3-1 / §3-3 の表をそのままコードに落としたもの）。 */
export const KIND_DEFAULTS: Record<
  ModalKind,
  { scrim: ScrimToken; dismiss: Required<DismissPolicy>; placement: PlacementOption }
> = {
  confirm: { scrim: 'default', dismiss: { esc: true, backdrop: true }, placement: 'center' },
  form: { scrim: 'default', dismiss: { esc: true, backdrop: false }, placement: 'auto' },
  view: { scrim: 'default', dismiss: { esc: true, backdrop: true }, placement: 'auto' },
  consent: { scrim: 'strong', dismiss: { esc: false, backdrop: false }, placement: 'center' },
  flow: { scrim: 'default', dismiss: { esc: true, backdrop: false }, placement: 'auto' },
};

/** 拒否時の既定文言。利用側で差し替えられる。 */
export const DEFAULT_BLOCKED_MESSAGE =
  'このダイアログはまだ閉じられません。内容を確認して操作を完了してください。';

/**
 * 「条件はあるが、それが何かまだ確定できない」ときの既定文言。G-12。
 *
 * 次の 2 つの場面で使う。どちらも「充足している」と断定してはいけない状態。
 *   1. `gate={['name']}` の name が未登録（タイプミス、または登録より前のレンダー）
 *   2. `gate={true}` で、登録が出揃う前（SSR と、マウント直後の最初のレンダー）
 *
 * 利用側は KasaneProvider の `unresolvedReason` で差し替えられる。
 */
export const DEFAULT_UNRESOLVED_GATE_MESSAGE =
  'この操作にはまだ満たしていない条件があります。';
