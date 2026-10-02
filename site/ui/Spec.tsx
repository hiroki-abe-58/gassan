import type { ReactNode } from 'react';

import { specItem, type Priority, type SpecItem } from '../data';
import { to } from '../router';
import { inline, InlineMd } from './Markdown';

/** 追跡表の状態ごとの意味。保証の強い順。 */
export const STATUS_ORDER = ['実装', '実機', '記述', '未検証', '委譲', '合成', 'ロードマップ'] as const;

const STATUS_TONE: Record<string, string> = {
  実装: 'proven',
  実機: 'device',
  記述: 'described',
  未検証: 'weak',
  委譲: 'native',
  合成: 'compose',
  ロードマップ: 'roadmap',
};

export function StatusBadge({ status }: { status: string }): ReactNode {
  return (
    <span className="s-status" data-tone={STATUS_TONE[status] ?? 'roadmap'}>
      {status}
    </span>
  );
}

const PRIORITY_LABEL: Record<Priority, string> = { M: '必須', S: '推奨', O: '任意' };

export function PriorityBadge({ priority }: { priority: Priority }): ReactNode {
  return (
    <span className="s-priority" data-priority={priority}>
      <span aria-hidden="true">{priority}</span>
      <span className="s-sr-only">{PRIORITY_LABEL[priority]}</span>
    </span>
  );
}

export function priorityLabel(priority: Priority): string {
  return PRIORITY_LABEL[priority];
}

/** 仕様 ID のチップ列。押すと仕様ページの該当行へ。 */
export function SpecChips({ ids, label }: { ids: readonly string[]; label: string }): ReactNode {
  const items = ids.map((id) => specItem(id)).filter((item): item is SpecItem => Boolean(item));
  return (
    <ul className="s-chips" aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>
          <a className="s-chip" href={to(`/spec/${item.id}`)}>
            <span className="s-chip-id">{item.id}</span>
            {/* リンクの中なので、リンクを生みうる inline() は通さず記号だけ落とす */}
            <span className="s-chip-name">{item.name.replace(/`/g, '')}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** 仕様の行をまとめて表にする。部品ページの「アクセシビリティ」タブで使う。 */
export function SpecTable({ ids, caption }: { ids: readonly string[]; caption: string }): ReactNode {
  const items = ids.map((id) => specItem(id)).filter((item): item is SpecItem => Boolean(item));
  return (
    <div className="s-table-wrap" role="group" tabIndex={0} aria-label={caption}>
      <table className="s-table s-spec-table">
        <caption className="s-sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">振る舞い</th>
            <th scope="col">度</th>
            <th scope="col">実装の要点</th>
            <th scope="col">状態</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <th scope="row">
                <a className="s-idref" href={to(`/spec/${item.id}`)}>
                  {item.id}
                </a>
              </th>
              <td>{inline(item.name, item.id)}</td>
              <td>
                <PriorityBadge priority={item.priority} />
              </td>
              <td>
                <InlineMd text={item.summary} />
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
