import { createContext, useContext, type RefObject } from 'react';
import { useLabels } from './labels';
import type { DetentToken } from './internal/detent';
import { DEFAULT_UNRESOLVED_GATE_MESSAGE } from './types';
import type {
  CloseReason,
  GateEntry,
  GateSelector,
  PlacementToken,
  ScrimToken,
  SizeToken,
} from './types';

export interface ModalIds {
  dialog: string;
  title: string;
  description: string;
  body: string;
}

export interface ModalContextValue {
  open: boolean;
  ids: ModalIds;
  placement: PlacementToken;
  size: SizeToken;
  scrim: ScrimToken;
  /** すべての close をここに集約する。L-09。 */
  requestClose: (reason: CloseReason) => void;
  /** role=status への通知。A-05。同一文言でも必ず読み直される。 */
  announce: (message: string) => void;
  /**
   * 名前付きゲートを登録・解除する。
   *
   * instanceId は「同じ名前に複数の登録者がいる」場合の区別に使う。
   * 省略すると名前そのものが登録者 ID になり、従来どおり 1 名前 1 登録になる。
   * 省略可能なのは後方互換のため（この型は公開されている）。
   */
  registerGate: (name: string, entry: GateEntry | null, instanceId?: string) => void;
  /** タイトル／説明の有無を Root に伝え、aria-labelledby を出すか決める。A-01。 */
  setHasTitle: (present: boolean) => void;
  setHasDescription: (present: boolean) => void;
  panelRef: RefObject<HTMLDivElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  /** G-08。末尾まで飛ばさず、1画面ぶんだけ進める。 */
  scrollBodyByPage: () => void;
  /**
   * シートの止まる高さ。M-03 / H-09。
   * detents prop を渡していないときは空配列で、Modal.Handle はただの飾りになる。
   */
  detents: readonly DetentToken[];
  /** いまいる段の添字。detents が空なら 0。 */
  detentIndex: number;
  /**
   * 段を移す。範囲外は丸める。
   * silent を立てると live region へ流さない。role="slider" 側が
   * aria-valuetext で読み上げるので、キーボード操作では二重に言わせない。
   */
  setDetentIndex: (index: number, options?: { silent?: boolean }) => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(component: string): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error(
      `[gassan] <${component}> must be rendered inside <Modal.Root>. ` +
        'Wrap it, or use the imperative API (useModals).',
    );
  }
  return ctx;
}

/** ゲートだけを別 Context に切る。充足状態が変わってもボタンとステータス行しか再レンダーしない。 */
export interface GateContextValue {
  gates: ReadonlyMap<string, GateEntry>;
  /**
   * 登録が出揃ったか。G-12。
   *
   * ゲートは子の effect で登録される。サーバーでは effect が走らず、
   * クライアントでも最初のレンダーの時点ではまだ走っていない。
   * その窓では「登録簿が空」＝「条件が無い」ではなく「まだ分からない」であり、
   * `gate={true}` を通してしまうと fail-open になる。
   *
   * 省略時は true。Root の外（登録の仕組みそのものが無い）では、
   * 待つべき登録も存在しないため。
   */
  ready?: boolean;
}

const EMPTY_GATES: GateContextValue = { gates: new Map(), ready: true };

export const GateContext = createContext<GateContextValue>(EMPTY_GATES);

/**
 * 参照しているゲートのうち、未充足のものを案内順に返す。
 *
 * 未登録の名前は「未充足」として扱う（fail-closed）。
 * Body の中の Consent より Footer のボタンのほうが先にレンダーされるため、
 * 初回レンダーの一瞬だけ未登録になる。ここで通してしまうと、
 * 「開いた直後だけ押せてしまう」という最悪の競合が生まれる。
 *
 * 理由テキストは GassanLabels から取る。ここで文字列をベタ書きすると、
 * englishLabels を入れていても未登録ゲートのときだけ日本語が出る。
 */
export function useBlockers(selector: GateSelector | undefined): GateEntry[] {
  const { gates, ready } = useContext(GateContext);
  const labels = useLabels();
  return selectBlockers(gates, selector, {
    ready,
    unresolvedReason: labels.unresolvedReason,
  });
}

/** selectBlockers の第3引数。どちらも省略可で、省略時は 2 引数版と同じ挙動になる。 */
export interface SelectBlockersOptions {
  /**
   * 登録が出揃っているか。false のあいだ `gate={true}` は fail-closed。
   * 既定は true（公開関数なので、2 引数で呼ぶ既存コードの挙動を変えない）。
   */
  ready?: boolean;
  /** 条件が確定できないときの理由。既定は DEFAULT_UNRESOLVED_GATE_MESSAGE。 */
  unresolvedReason?: string;
}

/**
 * useMemo を挟まない純粋関数。
 *
 * ゲートは通常 0〜3 件なので、配列リテラルで渡されたときの参照不安定を
 * キー化して吸収するコストのほうが高くつく。
 * 純粋関数として切り出してあるので、React を起動せずに単体テストできる。
 */
export function selectBlockers(
  gates: ReadonlyMap<string, GateEntry>,
  selector: GateSelector | undefined,
  options?: SelectBlockersOptions,
): GateEntry[] {
  if (!selector) return [];
  const ready = options?.ready ?? true;
  const unresolvedReason = options?.unresolvedReason ?? DEFAULT_UNRESOLVED_GATE_MESSAGE;
  let entries: GateEntry[];
  if (selector === true) {
    entries = [...gates.values()];
  } else {
    // 同じ名前を 2 回書いても、理由は 1 回しか数えない。
    // 重複を残すと blockers.length が実際の条件数と食い違い、
    // 「残り2件」のような案内を出す利用側が嘘をつくことになる。
    const seen = new Set<string>();
    entries = [];
    for (const name of selector) {
      if (seen.has(name)) continue;
      seen.add(name);
      entries.push(
        gates.get(name) ?? {
          satisfied: false,
          reason: unresolvedReason,
          order: 0,
        },
      );
    }
  }

  const blockers = entries
    .filter((entry) => !entry.satisfied)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // 名前を並べた形（gate={['a','b']}）は、未登録でも 1 件ずつ合成されるので
  // この時点で既に fail-closed になっている。gate={[]} も「条件ゼロ」と
  // 確定しているので待たせない。
  // 残るのは gate={true} だけ。「登録簿が空」を「条件なし」と読んではいけない。
  if (selector === true && !ready && blockers.length === 0) {
    return [{ satisfied: false, reason: unresolvedReason, order: 0 }];
  }
  return blockers;
}
